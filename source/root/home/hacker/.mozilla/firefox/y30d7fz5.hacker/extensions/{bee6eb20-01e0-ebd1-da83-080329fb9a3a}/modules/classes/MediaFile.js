var EXPORTED_SYMBOLS = ["MediaFile"];

var MediaFile = function(fileType, doc, url, title, contentLength) {
	// public fields
	this.title = null;				// website's title
	this.label = null;		// the media file name (label) to be shown to the user in the context menu
	this.labelNoFileSize = null; // the label without the filesize attached to it
	this.domain = null;
	this.href = null;
	this.fileType = null;		// the file type (mp4, flv, webm, etc...)
	this.contentType = null;
	this.contentLength = null;
	this.url = null;	// the file's url (where it can be downloaded from)
	this.doc = null;	// the owner document
	this.icon = null;
	this.filename = null;
	this.fileSize = null;		// the file size in bytes/kb/mb/gb - calculated from the contentLength
	this.docUrl = null;		// the document's url (the web page's url)
	this.win = null;
	
	// public methods
	this.init = function(title, fileType, url, doc, contentLength) {
		// constructor initializations
		this.title = title || null;
		this.fileType = fileType || null;
		this.url = url || null;
		this.doc = doc || null;
		this.contentLength = contentLength || null;
	};

	this.adjustLabel = function(label) { };		// abstract - should be implemented in derived classes
	
	this.addFileSizeToLabel = function() {
	    if (this.contentLength && this.contentLength > 0) {
			var size = MediaFile.calculateFileSize(this.contentLength, true);
			this.label += " (" + size + ")";
			this.fileSize = size;
	    }
	};
	
	this.addToMediaList = function(mediaList, mediaFile) {
	    if (mediaList == null) { mediaList = new Array(); }
	    for (var i = 0; i < mediaList.length; i++) {
			if (mediaList[i].url == mediaFile.url) { return; }
	    }
	    mediaList.push(mediaFile);
	};
	
	this.isMediaFileExistsInList = function(mediaList, mediaFile) {
	    for (var i = 0; i < mediaList.length; i++) {
			if (mediaList[i].url == mediaFile.url) { return true; }		    
	    }
	    return false;
	};
	
	this.createMenuItem = function(document, flashVideoDownload, mediaFile, isOverrideFormatsAndQualitiesFilter, displayedFormats, displayedQualities) {
	    var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem");
	    	    
	    menuitem.setAttribute("filename", mediaFile.filename);
	    menuitem.setAttribute("type",  mediaFile.fileType);
	    menuitem.setAttribute("label", mediaFile.label);
	    menuitem.setAttribute("url",   mediaFile.url);
	    menuitem.setAttribute("tooltiptext", mediaFile.url);
	    menuitem.setAttribute("context", "flashVideoDownloadFileContextMenu");
	    menuitem.setAttribute("image",  mediaFile.icon);

	    var isDisplayedQuality = true;
	    var isDisplayedFormat = true;

	    if (mediaFile.itag && displayedQualities) {
	    	isDisplayedQuality = displayedQualities[mediaFile.itag];
	    }
	    if (displayedFormats) {
	    	isDisplayedFormat = displayedFormats[mediaFile.fileType];
	    }
	    	    
	    if (!isOverrideFormatsAndQualitiesFilter && mediaFile.isFormatsFilterOn && mediaFile.isQualitiesFilterOn) {
			if (!isDisplayedFormat || !isDisplayedQuality) {
			    menuitem.setAttribute("hidden", "true");
			}
	    }
	    
	    menuitem.addEventListener("click", function(e) {		
			var t = e.currentTarget;
			if (e.button == 0) {		// left mouse button clicked
			    flashVideoDownload.downloadFile(t.getAttribute("filename"), t.getAttribute("url"), t.getAttribute("type"));
			}
			if (e.button == 2) {
			    // right mouse click todo		    
			}
	    },false);
	
	    return menuitem;
	};
	
	this.getDomainNameFromUrl = function(url) {	    
	    var hasHttp = url.toLowerCase().indexOf("http") != -1;
	    var slashIndex;
	    if (hasHttp) { slashIndex = 2; }
	    else { slashIndex = 0; }
	    
	    return url.split("/")[slashIndex];
	};

	// consturctor call
	this.init(title, fileType, url, doc, contentLength);
};

MediaFile.DEBUG = false;
MediaFile.win = null;

// MediaFile class - static methods        
MediaFile.FORMATS = {
	MP4 	: "mp4",
	FLV 	: "flv",
	WEBM	: "webm",
	_3GP	: "3gp",
	WEBM_3D	: "3d.webm",
	MP4_3D	: "3d.mp4",
	SWF		: "swf",
	F4V		: "f4v"
}

MediaFile.QUALITIES = {
	_144P 		: "144p",
	_240P 		: "240p",
	_270P 		: "270p",
	_360P 		: "360p",
	_520P 		: "520p",
	_720P 		: "720p",
	_3072P 		: "3072p",
	_240P_3D 	: "240p 3D",
	_360P_3D 	: "360p 3D",
	_520P_3D	: "520p 3D",
	_720P_3D 	: "720p 3D"
}

MediaFile.setWindow = function(window) {
	MediaFile.win = window;
};

MediaFile.setDebugOn = function(isOn) {
	MediaFile.DEBUG = isOn;
};

MediaFile.log = function(logInfo) {
	if (MediaFile.win && MediaFile.DEBUG) {
		MediaFile.win.console.log(logInfo);
	}
};

MediaFile.calculateFileSize = function(valueInBytes, withSuffix) {
	var size;
	if (valueInBytes >= 1073741824) {
	    size = valueInBytes/1073741824;
	    size = Math.floor(size * 100) / 100;
	    if (withSuffix) { size += " GB"; }
	}
	else if (valueInBytes >= 1048576) {
	    size = valueInBytes/1048576;
	    size = Math.floor(size * 100) / 100;
	    if (withSuffix) { size += " MB"; }
	}
	else if (valueInBytes >= 1024) {
	    size = valueInBytes/1024;
	    size = Math.floor(size * 100) / 100;
	    if (withSuffix) { size += " KB"; }
	}
	else {
	    size = valueInBytes;
	    if (withSuffix) { size += " bytes"; }
	}
	return size;
};

MediaFile.isSupportedFileType = function(fileType, supportedFileTypes) {
	if (supportedFileTypes == null) { return true; }	// if no supported file types were sent, will return true
    
	for (var i=0; i < supportedFileTypes.length; i++) {
		if (fileType.toLowerCase() == supportedFileTypes[i]) { return true; }
	}
	return false;
};

MediaFile.getFileType = function(contentType, url) {
    if (contentType=="application/x-shockwave-flash") {
        return MediaFile.FORMATS.SWF;
    }
    
    if (contentType == "video/webm" || contentType == "video/x-webm") {
        return MediaFile.FORMATS.WEBM;
    }

    if (contentType == "video/3gpp" ||
        contentType == "video/3gpp2" ||
        contentType == "video/3gp") {
        return MediaFile.FORMATS._3GP;
    }

    if ((contentType=="video/x-flv") || (contentType=="video/flv")) {
        return MediaFile.FORMATS.FLV;
    } else {
        var urlExt = url.substr(url.lastIndexOf(".")+1, 3);  
        if (urlExt=="flv") {
            return MediaFile.FORMATS.FLV;
        }
    }
    if (contentType=="video/mp4") {
        return MediaFile.FORMATS.MP4;
    }
	if (contentType == "video/f4v") {
	    return MediaFile.FORMATS.F4V;
	}

    return "";
};

MediaFile.trimLabel = function(label) {
	return label.substr(0, 50);
};

MediaFile.getFlashIcon = function() { return "chrome://flashvideodownload/skin/icons/flash_icon.png"; };

MediaFile.getWebsiteIcon = function(doc) {
	var favIcon = "";
	try { var linkEl = doc.getElementsByTagName("link"); } catch(ex) { }
	if (linkEl) {
	    for (var i = 0; i < linkEl.length; i++) {
			if (linkEl[i].getAttribute("rel")) {
			    if (linkEl[i].getAttribute("rel").toLowerCase() == "shortcut icon") {
					favIcon = linkEl[i].href
					return favIcon;
			    }
			}
    	}
	} else { // in case "doc" is a string, the following will extract the fav icon link
	    var innerHTML = doc.innerHTML;
	    var startIndex = innerHTML.indexOf("<link rel=\"shortcut icon\"");
	    var endIndex = innerHTML.indexOf("<link", startIndex + 1);	    
	    linkEl = innerHTML.substring(startIndex, endIndex);
	    startIndex = linkEl.indexOf("href=\"") + 6;
	    endIndex = linkEl.indexOf(".ico") + 4;
	    favIcon = linkEl.substring(startIndex, endIndex);
	}
	return favIcon;
};

MediaFile.replaceInvalidChars = function(filename, replaceWith, invalidChars) {
	if (!invalidChars) { invalidChars = ["\/", "\\", "\"", ":", "*", "?", "<", ">", "|"]; }
	for (var i = 0; i < filename.length; i++) {
	    for (var j = 0; j < invalidChars.length; j++) {
			if (filename[i] == invalidChars[j]) {
			    filename = filename.replace(invalidChars[j], replaceWith);
			}
	    }
	}
	return filename;
};

MediaFile.addQualityTagToFilename = function(filename, quality) {
	return filename + " [" + quality + "]";
};