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
			    }
			}
	    } catch (ex) { }
	}
	try {
	    DailymotionVideoFile.ajaxRequest.send(null);
	} catch(ex) { }               
};

DailymotionVideoFile.setVideoFilesList = function(responseText, doc) {
	var info = /var *info *= *(.*),/.exec(responseText);
	var links = DailymotionVideoFile.getVideoLinks(info);
	if (!links) { return false; }
	var icon = MediaFile.getWebsiteIcon(doc);
	
	var params = new Array();
	for (var i in links) {
	    params.push({
			url : links[i].url,
			fileType : links[i].fileType,
			doc : doc,
			contentLength : 0,
			title : doc.title,
			icon : icon,
			quality : links[i].resolution	    
	    });
	}
	return params;
};

DailymotionVideoFile.getVideoLinks = function(info) {
	if (!info) { return false; }
	
	var links = new Array();
	
	info = JSON.parse(info[1]);            
	var url = null;            
	for (var i in DailymotionVideoFile.QUALITIES) {                
	    url = info["stream_h264_" + DailymotionVideoFile.QUALITIES[i]];
	    if (url != null) {                    
			links.push({
			    url         : url,
			    quality     : i,     // key
			    fileType    : "mp4",
			    resolution  : DailymotionVideoFile.RESOLUTIONS[i]                        
			});
	    }
	}
	return links;  
};   

DailymotionVideoFile.getVideoIdFromDoc = function(doc) {
	var metas = doc.getElementsByTagName("meta");            
	var propAttr;
	for (var i in metas) {
	    if (!metas[i]["getAttribute"]) { continue; }
	    propAttr = metas[i].getAttribute("property");
	    if (propAttr == "og:video") {
			var content = metas[i].getAttribute("content");
			var startIndex = content.indexOf("video/") + 6;
			var endIndex = content.indexOf("?", startIndex);
			return content.substring(startIndex, endIndex);
	    }
	}
	return false;
};   

DailymotionVideoFile.createMediaFiles = function(doc) {
	// MediaFile.log("DailymotionVideoFile createMediaFiles");
	if (doc.videoFilesList.length > 0) { return false; }	
	var videoId = DailymotionVideoFile.getVideoIdFromDoc(doc);
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

DailymotionVideoFile.QUALITIES = {
    H264_512x384    : "url",
    H264_320x240    : "ld_url",
    H264_848x480    : "hq_url",
    H264_1280x720   : "hd_url",
    H264_1280x720_2 : "hd720_url",
    H264_1920x1080  : "hd1080_url"
};

DailymotionVideoFile.RESOLUTIONS = {
    H264_320x240       : "240",
	H264_512x384       : "380",
    H264_848x480       : "480",
    H264_1280x720      : "720",
    H264_1280x720_2    : "720",
    H264_1920x1080     : "1080"
};      

DailymotionVideoFile.isDailymotion = function(doc) {
	return (doc && doc.domain && doc.domain.indexOf("dailymotion.com") != -1); 
};

DailymotionVideoFile.supportedFileTypes = [MediaFile.FORMATS.MP4, MediaFile.FORMATS.FLV];	// supports any given file type

DailymotionVideoFile.isSupportedFileType = function(fileType) {
	return MediaFile.isSupportedFileType(fileType, DailymotionVideoFile.supportedFileTypes);
};