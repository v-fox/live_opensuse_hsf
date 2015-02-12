var EXPORTED_SYMBOLS = ["BreakVideoFile"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");

// BreakVideoFile Class - Inherits from MediaClass
var BreakVideoFile = function(fileType, doc, url, title, contentLength, icon, quality) {
	this.base = MediaFile;
	this.base(fileType, doc, url, title, contentLength);
	
	// private methods
	var isMediaFileExistsInList_Base = this.isMediaFileExistsInList;
	this.isMediaFileExistsInList = function(mediaFile) {
	    return isMediaFileExistsInList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	this.getLabel = function() {
	    return MediaFile.trimLabel(this.title) + " [" + quality + "]" + " (...)" + "." + this.fileType;
	};
	
	// public methods
	var addToMediaList_Base = this.addToMediaList;
	this.addToMediaList = function(mediaFile) {
	    if (!breakFileClass.isSupportedFileType(this.fileType)) { return }; 	// will not add to list if the file type is not supported
	    if (mediaFile == null) { mediaFile = this; } 							// if was not sent as a parameter, then uses itself
	    if (this.doc.videoFilesList == null) { this.doc.videoFilesList = new Array(); }
	    if (this.isMediaFileExistsInList(mediaFile)) { return; }				// will not add to list if the media file already exists
	    addToMediaList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	var createMenuItem_Base = this.createMenuItem;
	this.createMenuItem = function(document, flashVideoDownload) {
	    var menuItem = createMenuItem_Base(document, flashVideoDownload, this);
	    menuItem.setAttribute("class", "menuitem-iconic");
	    
	    return menuItem;
	};
	
	this.icon = icon;
	this.label = this.getLabel();
	this.docUrl = doc.URL;
	this.domain = this.getDomainNameFromUrl(this.docUrl);
	this.quality = quality;
	this.filename = MediaFile.replaceInvalidChars(this.title, "_");
	this.filename = MediaFile.addQualityTagToFilename(this.filename, this.quality);	
}


BreakVideoFile.isYouTubeEmbeded = function(doc) {
	return doc.getElementById("youtubePlayer");
};

BreakVideoFile.getBreakVideosParams = function(doc) {	
	if (breakFileClass.isYouTubeEmbeded(doc)) { return false; }
	
	var paramElements = doc.getElementsByTagName("param");
	if (paramElements == undefined) { return false; }
	var flashvars = "";
	
	// finds the right param
	for (var i in paramElements) {
	    try {
			if (paramElements[i].getAttribute("name") == "flashvars") {
			    flashvars = paramElements[i].getAttribute("value");
			    break;
			}
	    } catch (ex) { }
	}
	var data = new Array();	// will hold the different quality urls objects (hdQuality object and ldQuality object)
	var videoLink = flashvars.split("videoPath=")[1];
	videoLink = videoLink.split("&callForInfo")[0];
	
	var basicLink = videoLink.split("&icon=")[0];
	basicLink = basicLink.replace(".flv", "");

	var code = "?" + videoLink.split("&icon=")[1];
	data.push({
	    url : basicLink + ".flv" + code,
	    fileType : "flv",
	    quality : "360p"
	});

	if (BreakVideoFile.hasHdFormat(flashvars) == "true") {
	    var strLen = basicLink.length;
	    var tmpString = basicLink.slice(0, strLen-1);
	    data.push({
			url : tmpString + "2.mp4" + code,
			fileType : "mp4",
			quality : "480p"		
	    });
	    
	    data.push({
			url : tmpString + "3.mp4" + code,
			fileType : "mp4",
			quality : "720p"		
	    });
	}
	
	var params = new Array();
	var icon = MediaFile.getWebsiteIcon(doc);
	
	for (var i in data) {
	    params.push({
		url : data[i].url,
		fileType : data[i].fileType,
		doc : doc,
		contentLength : 0,
		title : doc.title,
		icon : icon,
		quality : data[i].quality
	    });    
	}
	
	return params;
};  

BreakVideoFile.hasHdFormat = function(flashvars) {
	var callForInfo = flashvars.split("callForInfo=")[1];
	callForInfo = callForInfo.split("&iContentID")[0];
	return callForInfo;
}; 

BreakVideoFile.createMediaFiles = function(doc) {
	if (doc.videoFilesList.length > 0) { return false; }
	
	var params = BreakVideoFile.getBreakVideosParams(doc);	
	if (!params) { return false; }	// failed to get params (page not loaded yet perhaps)	
	
	for (var i in params) {
	    var mediaFile = new BreakVideoFile(params[i].fileType, params[i].doc, params[i].url, params[i].title, params[i].contentLength, params[i].icon, params[i].quality);	    
	    mediaFile.addToMediaList(mediaFile);
	}
	
	doc.videoFilesListAdded = true;	
	return true;
};

BreakVideoFile.isBreak = function(doc) { return (doc && doc.domain && doc.domain.indexOf("break.com") != -1); }

// DailymotionVideoFile Class - static methods
BreakVideoFile.supportedFileTypes = [MediaFile.FORMATS.MP4, MediaFile.FORMATS.FLV];

BreakVideoFile.isSupportedFileType = function(fileType) {	
	return MediaFile.isSupportedFileType(fileType, BreakVideoFile.supportedFileTypes);
};