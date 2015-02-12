var EXPORTED_SYMBOLS = ["VideoFile"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");

// VideoFile Class - Inherits from MediaClass
var VideoFile = function(fileType, doc, url, title, contentLength, docUrl) {
	// returns if any of the parameters were not sent (used when creating a new object just to define prototype inheritance, such as "this.YouTubeVideoFile.prototype = new this.VideoFile;")
	//if (!fileType || !doc || !url || !title || !contentLength) return;

	this.base = MediaFile;
	this.base(fileType, doc, url, title, contentLength);	

	// constructor
	this.init = function(fileType, doc, url, title, contentLength, docUrl) {
		this.icon = MediaFile.getWebsiteIcon(this.doc);
		this.label = this.adjustLabel(title);
		this.labelNoFileSize = this.label;
		this.filename = MediaFile.replaceInvalidChars(this.label, "_");
		this.label = this.addBlankFileSizeToLabel(this.label);
		this.addFileSizeToLabel();
		this.docUrl = docUrl;
		this.domain = this.getDomainNameFromUrl(this.docUrl);		
	};
	
	// private methods
	this.adjustLabel = function(label) {
	    return MediaFile.trimLabel(label) + "." + this.fileType;	    
	};
	
	this.addBlankFileSizeToLabel = function(label) {
	    if (!contentLength) { return label + " (...)"; }
	    return label;
	};

	var isMediaFileExistsInList_Base = this.isMediaFileExistsInList;
	this.isMediaFileExistsInList = function(mediaFile) {
	    return isMediaFileExistsInList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	// public methods
	var addToMediaList_Base = this.addToMediaList;
	this.addToMediaList = function(mediaFile) {
	    if (!VideoFile.isSupportedFileType(this.fileType)) { return; } 	// will not add to list if the file type is not supported
	    if (mediaFile == null) { mediaFile = this; } 			// if was not sent as a parameter, then uses itself
	    if (this.doc.videoFilesList == null) { this.doc.videoFilesList = new Array(); }
	    if (this.isMediaFileExistsInList(mediaFile)) { return; }		// will not add to list if the media file already exists
	    addToMediaList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	var createMenuItem_Base = this.createMenuItem;
	this.createMenuItem = function(document, flashVideoDownload) {
	    var menuItem = createMenuItem_Base(document, flashVideoDownload, this);
	    menuItem.setAttribute("class", "menuitem-iconic");
	    
	    return menuItem;
	};
	
	var addFileSizeToLabel_Base = this.addFileSizeToLabel;

	// consturctor call
	this.init(fileType, doc, url, title, contentLength, docUrl);
};

// VideoFile Class - static methods
VideoFile.supportedFileTypes = [this.MediaFile.FORMATS.MP4, this.MediaFile.FORMATS.FLV, this.MediaFile.FORMATS.WEBM, this.MediaFile.FORMATS.WEBM_3D, this.MediaFile.FORMATS.MP4_3D, this.MediaFile.FORMATS.F4V];
VideoFile.ajaxHeadersRequest = [null, null, null, null, null];	// used to open ajax requests in order to get the content length of each video file

VideoFile.isSupportedFileType = function(fileType) {
	return MediaFile.isSupportedFileType(fileType, VideoFile.supportedFileTypes);
};

VideoFile.ajaxRequest = null;
VideoFile.getVideosFileSizes = function(doc, flashVideoDownload, numOfAjaxRequests) {
	if (VideoFile.hasVideosFileSizes(doc)) { return; }	// videos already have their content length updated	
	
	var numOfVideos = doc.videoFilesList.length;
	
	for (var i in VideoFile.ajaxHeadersRequest) {
	    if (VideoFile.ajaxHeadersRequest[i]) {
			VideoFile.ajaxHeadersRequest[i].abort();
			VideoFile.ajaxHeadersRequest[i].requestAborted = true;
	    }
	}
	if (!numOfAjaxRequests) {
	    numOfAjaxRequests = VideoFile.ajaxHeadersRequest.length-1; // the last request is reserved for any remaining vidoes
	}
	var numOfVideosPerRequest = Math.floor(numOfVideos / numOfAjaxRequests);	// 3/4 = 0
	var remainingVidoes = numOfVideos % numOfAjaxRequests;
	
	// number of videos is smaller than number of requests, so it sets the number of videos per request to 1 and uses only the amount of requests required (meaning, number of vidoes = number of requets)
	if (numOfVideosPerRequest == 0) {
	    numOfVideosPerRequest = 1;
	    remainingVidoes = 0;
	    numOfAjaxRequests = numOfVideos;
	}
	
	var lastElementIndex = numOfAjaxRequests;
	
	for (var i = 0; i < numOfAjaxRequests; i++) {	
	   VideoFile.getYouTubePageResponseHeaders(VideoFile.ajaxHeadersRequest[i], doc, i*numOfVideosPerRequest, numOfVideosPerRequest, flashVideoDownload);
	}
	
	if (remainingVidoes != 0) {
	    VideoFile.getYouTubePageResponseHeaders(VideoFile.ajaxHeadersRequest[lastElementIndex], doc, lastElementIndex * numOfVideosPerRequest, remainingVidoes, flashVideoDownload);
	}
};

VideoFile.getYouTubePageResponseHeaders = function(ajaxRequest, doc, videoFilesListIndex, numOfVideos, flashVideoDownload) {
    var mediaFile = videoFilesListIndex ? doc.videoFilesList[videoFilesListIndex] : doc.videoFilesList[0];
    if (!mediaFile) { return; }
    var url = mediaFile.url;
    var index = videoFilesListIndex ? videoFilesListIndex : 0;
	var num = numOfVideos == null ? doc.videoFilesList.length-1 : numOfVideos-1;
    
    if (mediaFile.contentLength) {
        if (index < doc.videoFilesList.length-1 && num) {
            VideoFile.getYouTubePageResponseHeaders(ajaxRequest, doc, index+1, num, flashVideoDownload);
        }
    	return;
    }

    ajaxRequest = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);	
    ajaxRequest.open('HEAD', url, true);
    ajaxRequest.setRequestHeader('Cache-Control', 'no-cache');
    ajaxRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;  	

    ajaxRequest.onreadystatechange = function() {            
        try {
			if (this.readyState == 3) {
				var contentType = ajaxRequest.getResponseHeader("Content-Type");	
				var contentLength = ajaxRequest.getResponseHeader("Content-Length");
				var fileType = MediaFile.getFileType(contentType, url);	    
			    mediaFile.contentLength = contentLength;
			    var size = MediaFile.calculateFileSize(mediaFile.contentLength, true);
			    mediaFile.label = mediaFile.label.replace("(...)", "(" + size + ")");
			    mediaFile.fileSize = size;			    
			    flashVideoDownload.setStatusBar(doc);
				ajaxRequest.abort();
			}
			if (this.readyState == 4) {		    
			    if (this.status == 200) {
					var contentType = ajaxRequest.getResponseHeader("Content-Type");
					var contentLength = ajaxRequest.getResponseHeader("Content-Length");
					var fileType = MediaFile.getFileType(contentType, url);					
				    mediaFile.contentLength = contentLength;
				    var size = MediaFile.calculateFileSize(mediaFile.contentLength, true);			    
				    mediaFile.label = mediaFile.label.replace("(...)", "(" + size + ")");
				    mediaFile.fileSize = size;
				    flashVideoDownload.setStatusBar(doc);					
					if (index < doc.videoFilesList.length-1 && num && !ajaxRequest.requestAborted) {
					    VideoFile.getYouTubePageResponseHeaders(ajaxRequest, doc, index+1, num, flashVideoDownload);			    
					}
					else if (ajaxRequest.requestAborted) {
					    ajaxRequest.requestAborted = false;
					}
			    }		    
			}
        } 
        catch (e) { }
    }
    ajaxRequest.send(null);
};

// returns true if all videos in the document has content length in them, else, returns false
VideoFile.hasVideosFileSizes = function(doc) {
	if (doc.videoFilesList) {
	    for (var i in doc.videoFilesList) {
			if (!doc.videoFilesList[i].contentLength) {
			    return false;	// no content length in one of the videos
			}
	    }
	    return true;		// content length found in all videos
	}
	return false;			// failed to find "videoFilesList" in document
};