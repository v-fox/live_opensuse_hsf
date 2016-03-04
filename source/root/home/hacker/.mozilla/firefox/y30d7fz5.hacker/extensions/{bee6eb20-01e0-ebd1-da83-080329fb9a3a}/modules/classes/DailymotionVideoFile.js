var EXPORTED_SYMBOLS = ["DailymotionVideoFile"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");

// DailymotionVideoFile Class - Inherits from MediaClass
var DailymotionVideoFile = function(fileType, doc, url, title, contentLength, icon, quality) {
	this.base = MediaFile;
	this.base(fileType, doc, url, title, contentLength);
	
	// private methods
	var isMediaFileExistsInList_Base = this.isMediaFileExistsInList;
	this.isMediaFileExistsInList = function(mediaFile) {
	    return isMediaFileExistsInList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	this.getLabel = function() {
	    return MediaFile.trimLabel(this.title) + " [" + quality + "p]" + " (...)" + "." + this.fileType;
	};
	
	// public methods
	var addToMediaList_Base = this.addToMediaList;
	this.addToMediaList = function(mediaFile) {
	    if (!DailymotionVideoFile.isSupportedFileType(this.fileType)) { return }; 	// will not add to list if the file type is not supported
	    if (mediaFile == null) { mediaFile = this; } 				// if was not sent as a parameter, then uses itself
	    if (this.doc.videoFilesList == null) { this.doc.videoFilesList = new Array(); }
	    if (this.isMediaFileExistsInList(mediaFile)) { return }; 			// will not add to list if the media file already exists
	    addToMediaList_Base(this.doc.videoFilesList, mediaFile);
	    MediaFile.log(this.doc.videoFilesList);
	};
	
	var createMenuItem_Base = this.createMenuItem;
	this.createMenuItem = function(document, flashVideoDownload) {
	    var menuItem = createMenuItem_Base(document, flashVideoDownload, this);
	    menuItem.setAttribute("class", "menuitem-iconic");
	    
	    return menuItem;
	};
	
	this.icon = icon;
	this.label = this.getLabel();
	this.docUrl = this.doc.URL;
	this.domain = this.getDomainNameFromUrl(this.docUrl);
	this.quality = quality + "p";
	this.filename = MediaFile.replaceInvalidChars(this.title, "_");
	this.filename = MediaFile.addQualityTagToFilename(this.filename, this.quality);	
};

// DailymotionVideoFile Class - static methods
DailymotionVideoFile.ajaxRequest = null;

DailymotionVideoFile.getVideoDocumentViaAjax = function(videoId, callback) {
	try { DailymotionVideoFile.ajaxRequest.abort(); } catch(ex) { }  // aborts old requests            
	DailymotionVideoFile.ajaxRequest = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
	DailymotionVideoFile.ajaxRequest.open('GET', "http://www.dailymotion.com/embed/video/" + videoId, true);
	DailymotionVideoFile.ajaxRequest.setRequestHeader('Cache-Control', 'no-cache');
	DailymotionVideoFile.ajaxRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
	DailymotionVideoFile.ajaxRequest.onreadystatechange = function() {
	    try {
			if (this.readyState == 4) {
			    if (this.status == 200) {
					callback(this.responseText);
					// MediaFile.log(this.responseText);
			    }
			}
	    } catch (ex) { }
	}
	try {
	    DailymotionVideoFile.ajaxRequest.send(null);
	} catch(ex) { }               
};

DailymotionVideoFile.setVideoFilesList = function(responseText, doc) {
	var urlsPerQuality = responseText.match(/\"qualities\": *(\{.+\}),"reporting"/);
	if (!urlsPerQuality) {
		urlsPerQuality = responseText.match(/\"qualities\": *(\{.+\}),"sharing"/);
	}
	urlsPerQuality = urlsPerQuality ? urlsPerQuality[1] : null;
	if (!urlsPerQuality) { return false; }

	urlsPerQuality = JSON.parse(urlsPerQuality);
	var paramsList = [];
	var icon = MediaFile.getWebsiteIcon(doc);
	for (var quality in urlsPerQuality) {
		var urlPerQuality = urlsPerQuality[quality];
		if (parseInt(quality)) {
			paramsList.push({
				url: urlPerQuality[0].url,
				fileType: "mp4",
				doc: doc,
				title: doc.title,
				icon: icon,
				quality: quality,
				contentLength: 0
			});
		}
	}

	return paramsList.length > 0 ? paramsList : false;
};

DailymotionVideoFile.getVideoIdFromDoc = function(doc) {
	var metas = doc.getElementsByTagName("meta");
	for (var i in metas) {
	    if (!metas[i]["getAttribute"]) { continue; }
	    var propAttr = metas[i].getAttribute("property");
	    var name = metas[i].getAttribute("name");
	    var content = metas[i].getAttribute("content");
	    if (content && propAttr == "og:video") {
			var startIndex = content.indexOf("video/") + 6;
			var endIndex = content.indexOf("?", startIndex);
			if (endIndex === -1) {
				endIndex = content.indexOf("_", startIndex);
			}
			// if (endIndex === -1) {
			// 	endIndex = startIndex + 7;
			// }
			return content.substring(startIndex, endIndex);
	    }
	    if (content && (propAttr == "og:url" 
	    	|| name == "twitter:app:url:googleplay")) {
	    	var videoId = content.split("/")[4];
	    	if (videoId.length == 7 || videoId.length == 6) { return videoId; }
	    }
	    if (content && (propAttr == "al:ios:ur" 
	    	|| propAttr == "al:android:url" 
	    	|| name == "twitter:app:url:iphone"
	    	|| name == "twitter:app:url:ipad")) {
	    	var videoId = content.split("/")[3];
	    	if (videoId.length == 7 || videoId.length == 6) { return videoId; }
	    }
	    if (content && name == "twitter:player") {
	    	var videoId = content.split("/")[5];
	    	if (videoId.length == 7 || videoId.length == 6) { return videoId; }
	    }
	}
	// check the document's URL
	var startIndex = doc.URL.indexOf("video/") + 6;
	var endIndex = doc.URL.indexOf("?", startIndex);
	if (endIndex === -1) {
		endIndex = doc.URL.indexOf("_", startIndex);
	}
	var videoId = doc.URL.substring(startIndex, endIndex);	
	if (videoId && (videoId.length == 7 || videoId.length == 6)) { return videoId; }

	return false;
};   

DailymotionVideoFile.createMediaFiles = function(doc) {
	// MediaFile.log("DailymotionVideoFile createMediaFiles");
	if (doc.videoFilesList.length > 0) { return false; }	
	var videoId = DailymotionVideoFile.getVideoIdFromDoc(doc);
	MediaFile.log(videoId);
	DailymotionVideoFile.getVideoDocumentViaAjax(videoId, function(responseText){
		MediaFile.log("DailymotionVideoFile getVideoDocumentViaAjax callback");
	    var params = DailymotionVideoFile.setVideoFilesList(responseText, doc);
	    MediaFile.log(params);
	    if (params.length == 0) { return; }
	    
	    for (var i in params) {
			var mediaFile = new DailymotionVideoFile(params[i].fileType, params[i].doc, params[i].url, params[i].title, params[i].contentLength, params[i].icon, params[i].quality);	    
			mediaFile.addToMediaList(mediaFile);
	    }
	});
	
	return true;
};

// DailymotionVideoFile.QUALITIES = {
//     H264_512x384    : "url",
//     H264_320x240    : "ld_url",
//     H264_848x480    : "hq_url",
//     H264_1280x720   : "hd_url",
//     H264_1280x720_2 : "hd720_url",
//     H264_1920x1080  : "hd1080_url"
// };

// DailymotionVideoFile.RESOLUTIONS = {
//     H264_320x240       : "240",
// 	H264_512x384       : "380",
//     H264_848x480       : "480",
//     H264_1280x720      : "720",
//     H264_1280x720_2    : "720",
//     H264_1920x1080     : "1080"
// };      

DailymotionVideoFile.isDailymotion = function(doc) {
	return (doc && doc.domain && doc.domain.indexOf("dailymotion.com") != -1); 
};

DailymotionVideoFile.supportedFileTypes = [MediaFile.FORMATS.MP4, MediaFile.FORMATS.FLV];	// supports any given file type

DailymotionVideoFile.isSupportedFileType = function(fileType) {
	return MediaFile.isSupportedFileType(fileType, DailymotionVideoFile.supportedFileTypes);
};