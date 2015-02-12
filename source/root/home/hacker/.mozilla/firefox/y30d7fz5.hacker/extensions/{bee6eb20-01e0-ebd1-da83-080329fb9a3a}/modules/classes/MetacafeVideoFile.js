var EXPORTED_SYMBOLS = ["MetacafeVideoFile"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");

// MetacafeVideoFile Class - Inherits from MediaClass
var MetacafeVideoFile = function(fileType, doc, url, title, contentLength, icon, quality) {
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
	    if (!MetacafeVideoFile.isSupportedFileType(this.fileType)) { return }; 	// will not add to list if the file type is not supported
	    if (mediaFile == null) { mediaFile = this; } 				// if was not sent as a parameter, then uses itself
	    if (this.doc.videoFilesList == null) { this.doc.videoFilesList = new Array(); }
	    if (this.isMediaFileExistsInList(mediaFile)) { return }; 			// will not add to list if the media file already exists
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

MetacafeVideoFile.getMetacafeVideosParams = function(doc) {
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
	MetacafeVideoFile.addFormatObject(flashvars, MetacafeVideoFile.QUALITIES.LD, data);
	MetacafeVideoFile.addFormatObject(flashvars, MetacafeVideoFile.QUALITIES.HD, data);
	
	var params = new Array();
	var icon = MediaFile.getWebsiteIcon(doc);
	
	for (var i in data) {	    
	    params.push({
			url : data[i].url,
			fileType : MetacafeVideoFile.getFileType(data[i].url),
			doc : doc,
			contentLength : 0,
			title : doc.title,
			icon : icon,
			quality : data[i].quality
	    });    
	}
	// another fail check - while the above check of 'paramElements' is a good check, this method may still return empty objects
	// (it may fail getting the formats correctly) - it's important to negate that.
	if (params.length > 0) { return params; }
	
	return false;
};

// pushes to the data array an object with 2 properties: url and quality = "hd"
MetacafeVideoFile.addFormatObject = function(flashvars, quality, data) {
	// gets the url from the "flashvars" string (without parameters)
	flashvars = unescape(flashvars);
	var highDefinitionMP4Vars = flashvars.split(quality)[1];
	if (highDefinitionMP4Vars == undefined) { return; }	// if no hd quality exists for that video
	
	var mediaURL = highDefinitionMP4Vars.split("mediaURL")[1];
	var http = mediaURL.split("\"")[2];
	
	// gets the "gda" key parameter
	var key__gda__ = mediaURL.split("__gda__")[1];
	key__gda__ = key__gda__.split("&")[0];
	key__gda__ = key__gda__.split("\"")[4];
	
	// concats the url with the gda parameter
	var completeURL = http + "?__gda__=" + key__gda__;
	completeURL = MediaFile.replaceInvalidChars(completeURL, "", ["\\"]);
	
	data.push({
	    url : completeURL,
	    quality : MetacafeVideoFile.getVideoResolution(quality)
	});
};

MetacafeVideoFile.getFileType = function(url) {
	url = url.split("?")[0];
	var fileType = url.substring(url.length - 3);
	
	return fileType;
};

MetacafeVideoFile.createMediaFiles = function(doc) {	
	if (doc.videoFilesList.length > 0) { return false; }
	
	var params = MetacafeVideoFile.getMetacafeVideosParams(doc);	
	if (!params) { return false; }	// failed to get params (page not loaded yet perhaps)	
	
	for (var i in params) {
	    var mediaFile = new MetacafeVideoFile(params[i].fileType, params[i].doc, params[i].url, params[i].title, params[i].contentLength, params[i].icon, params[i].quality);	    
	    mediaFile.addToMediaList(mediaFile);
	}		
	return true;
};

MetacafeVideoFile.QUALITIES = {
	LD 		: "MP4",
	HD 		: "highDefinitionMP4"
}

MetacafeVideoFile.getVideoResolution = function(quality) {	
	var formats = {
	    "MP4" 		: "360p",
	    "highDefinitionMP4"	: "720p"
	}
	
	if (formats[quality]) {
	    return formats[quality];
	}
	
	return "???";
};

MetacafeVideoFile.isMetacafe = function(doc) { return (doc && doc.domain && doc.domain.indexOf("metacafe.com") != -1); }

// MetacafeVideoFile Class - static methods
MetacafeVideoFile.supportedFileTypes = [MediaFile.FORMATS.MP4];

MetacafeVideoFile.isSupportedFileType = function(fileType) {	
	return MediaFile.isSupportedFileType(fileType, MetacafeVideoFile.supportedFileTypes);
};