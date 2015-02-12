var EXPORTED_SYMBOLS = ["YouTubeVideoFile"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");
Components.utils.import("resource://flashVideoDownload/classes/youtube/SigDec.js");

// YouTubeVideoFile Class - Inherits from MediaClass
var YouTubeVideoFile = function(fileType, doc, url, title, contentLength, icon, itag, s) {
	// returns if any of the parameters were not sent (used when creating a new object just to define prototype inheritance)
	//if (!fileType || !doc || !url || !title || !contentLength) return;	

	// public fields
	this.itag;
	
	this.base = MediaFile;
	this.base(fileType, doc, url, title, contentLength);
	
	// private methods
	this.adjustLabel = function(label) {
	    return MediaFile.trimLabel(label) + "[" + this.itag + "]" + " (...)" + "." + this.fileType;
	};
	
	// public methods	
	var isMediaFileExistsInList_Base = this.isMediaFileExistsInList;
	this.isMediaFileExistsInList = function(mediaFile) {
	    return isMediaFileExistsInList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	var addToMediaList_Base = this.addToMediaList;
	this.addToMediaList = function(mediaFile) {
	    if (!YouTubeVideoFile.isSupportedFileType(this.fileType)) { return; }	// will not add to list if the file type is not supported
	    if (mediaFile == null) { mediaFile = this; } 				// if was not sent as a parameter, then uses itself
	    if (this.doc.videoFilesList == null) { this.doc.videoFilesList = new Array(); }
	    if (this.isMediaFileExistsInList(mediaFile)) { return; } 			// will not add to list if the media file already exists
	    addToMediaList_Base(this.doc.videoFilesList, mediaFile);
	};
	
	var createMenuItem_Base = this.createMenuItem;
	this.createMenuItem = function(document, flashVideoDownload, isFormatsUnfiltered) {
	    var menuItem = createMenuItem_Base(
	    	document, 
	    	flashVideoDownload, 
	    	this, 
	    	isFormatsUnfiltered,
	    	YouTubeVideoFile.displayedFormats,
	    	YouTubeVideoFile.displayedQualities
	    );
	    menuItem.setAttribute("class", "menuitem-iconic");
	    
	    return menuItem;
	};
	
	// constructor initializations
	this.icon = icon;
	this.itag = itag;	
	this.label = this.adjustLabel(this.title);
	this.isFormatsFilterOn = true;
	this.isQualitiesFilterOn = true;
	this.docUrl = this.doc.baseURI;
	this.domain = this.getDomainNameFromUrl(this.docUrl);
	this.quality = itag;
	this.filename = MediaFile.replaceInvalidChars(this.title, "_");
	this.filename = MediaFile.addQualityTagToFilename(this.filename, this.quality);
	this.s = s;
};


// YouTubeVideoFile Class - static properties
YouTubeVideoFile.isYouTube = false;			// determines if the current url is of YouTube or not
YouTubeVideoFile.urlType = false;    
YouTubeVideoFile.ajaxVideoSourceRequest = null;				// will be used when trying to retrieve a video preview source from the channels page
YouTubeVideoFile.window = null;						// will hold a reference to the window which sent the request
YouTubeVideoFile.refreshRequestInterval = null					// will hold an interval for refreshing ajax requests for getting video sizes
YouTubeVideoFile.channelsVideoId = null;    
YouTubeVideoFile.videoPreviewDocs = new Array();
YouTubeVideoFile.clearVideoPreviewCacheTimer = null;
YouTubeVideoFile.displayedFormats = null;
YouTubeVideoFile.displayedQualities = null;
YouTubeVideoFile.embeddedVideos = null;
YouTubeVideoFile.YOUTUBE_URL_TYPE = { WATCH : 1, USER : 2, CHANNELS : 3, CHANNEL : 4 };
YouTubeVideoFile.isPlayerJSTabOpen = false;
YouTubeVideoFile.playerJSUrl = null;
YouTubeVideoFile.isCheckForAjaxVideo = false;

// YouTubeVideoFile Class - static methods
YouTubeVideoFile.init = function() { };

YouTubeVideoFile.checkIfYouTube = function(url) {
	var domain;
	var uri;
	
	// depends on the type of url sent
	if (url.host) {
	    domain = url.host;
	    uri = url.toString();
	}
	else if (url.domain) {	    
	    domain = url.domain;
	    uri = url.URL;
	}
	else { return; }
	
    if (domain.indexOf("youtube") != -1) {
	    YouTubeVideoFile.isYouTube = true;
	    
	    if (uri.indexOf("watch") != -1) {
			YouTubeVideoFile.urlType = YouTubeVideoFile.YOUTUBE_URL_TYPE.WATCH;
			return;
	    }
	    if (uri.indexOf("user") != -1) {
			YouTubeVideoFile.urlType = YouTubeVideoFile.YOUTUBE_URL_TYPE.USER;
			return;
	    }
	    if (uri.indexOf("channels") != -1) {
			YouTubeVideoFile.urlType = YouTubeVideoFile.YOUTUBE_URL_TYPE.CHANNELS;
			return;
	    }
	    if (uri.indexOf("channel/") != -1) {
			YouTubeVideoFile.urlType = YouTubeVideoFile.YOUTUBE_URL_TYPE.CHANNEL;
			return;
    	}	    		  
	    YouTubeVideoFile.urlType = false;
	} else { YouTubeVideoFile.isYouTube = false; }	            
};

YouTubeVideoFile.setDisplayedFormats = function(formats) { YouTubeVideoFile.displayedFormats = formats; };
YouTubeVideoFile.setDisplayedQualities = function(qualities) { YouTubeVideoFile.displayedQualities = qualities; };
YouTubeVideoFile.setEmbeddedVideos = function(embeddedVideos) { YouTubeVideoFile.embeddedVideos = embeddedVideos; };

// checks if the last checked domain is "YouTube" and if any of the urls are of the type of "WATCH", "USER", "CHANNEL"
YouTubeVideoFile.isYouTubeAndAvailableUrls = function() {
	if (YouTubeVideoFile.isYouTube &&
	    (YouTubeVideoFile.urlType == YouTubeVideoFile.YOUTUBE_URL_TYPE.WATCH)) {
	     //YouTubeVideoFile.urlType == YouTubeVideoFile.YOUTUBE_URL_TYPE.USER ||
	     //YouTubeVideoFile.urlType == YouTubeVideoFile.YOUTUBE_URL_TYPE.CHANNEL)) {		    
	    return true;
	}
	return false;		
};

YouTubeVideoFile.getChannelVideoPreviewId = function(doc) {
	try {
	    var embedded = doc.getElementsByTagName("embed");
	    for (var i in embedded) {
			if (embedded[i].getAttribute("id") == "video-player-flash" ||
			    embedded[i].getAttribute("id") == "video-player") {	// older firefox versions
				    var flashvars = embedded[i].getAttribute("flashvars");
				    params = flashvars.split("&");
				    for(var j in params) {
						var videoId = params[j].split("=");
						if (videoId[0] == "video_id") {
							// log("video id " + videoId[1]);
						    return videoId[1];
						}
			    }
			}
	    }
	    return false;
	} catch(ex) { return false; }
};

YouTubeVideoFile.getChannelVideoPreviewDocument = function(videoId, mainDoc, window, flashVideoDownload, attemptNum) {
	if (attemptNum >= 5) {
	    try { YouTubeVideoFile.ajaxVideoSourceRequest.abort(); } catch(ex) { MediaFile.log(ex); }
	    return;
	}
	//log("video id=" + videoId);
	//log("sending ajax request...");
	var requestTimeoutTimer = window.setTimeout(function() { YouTubeVideoFile.getChannelVideoPreviewDocument(videoId, mainDoc, window, flashVideoDownload, attemptNum + 1); }, 4000);
	try { YouTubeVideoFile.ajaxVideoSourceRequest.abort(); } catch(ex) { MediaFile.log(ex); }
	var url = "http://www.youtube.com/watch?v=" + videoId;
    YouTubeVideoFile.ajaxVideoSourceRequest = new window.XMLHttpRequest();
    YouTubeVideoFile.ajaxVideoSourceRequest.open('GET', url, true);
    YouTubeVideoFile.ajaxVideoSourceRequest.setRequestHeader('Cache-Control', 'no-cache');
    YouTubeVideoFile.ajaxVideoSourceRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
	//YouTubeVideoFile.ajaxVideoSourceRequest.responseType = "document";

	YouTubeVideoFile.ajaxVideoSourceRequest.onreadystatechange = function() {            
        try {
			if (this.readyState == 3) { }
            if (this.readyState == 4) {
                if (this.status == 200) {
					window.clearTimeout(requestTimeoutTimer);
					var startIndex = this.responseText.indexOf("<head>");
					var endIndex = this.responseText.indexOf("</body>") + 7;
					
					var innerHTML = this.responseText.substring(startIndex, endIndex);
					var doc = {
					    innerHTML 	: innerHTML,
					    videoId	: "",
					    URL		: url
					};
					
					YouTubeVideoFile.createMediaFiles(doc, true);	// overrides checks in createMediaFiles
					
					doc.videoId = videoId;	// stores the video id in the fetched document			
					YouTubeVideoFile.storeChannelsPreviewVideoInCache(doc, videoId);
					var displayedVideoId = YouTubeVideoFile.getChannelVideoPreviewId(mainDoc);
					if (!displayedVideoId) { displayedVideoId = YouTubeVideoFile.findVideoId(mainDoc); }
					//log("dis " + displayedVideoId);
					
					// making sure that the current displayed video is the one that was fetched from the ajax request and not a previous one
					// (requests can get delayed and received after the user flipped to a different video)
					if (displayedVideoId == videoId) {	
					    mainDoc.videoFilesList = doc.videoFilesList;			
					    flashVideoDownload.setStatusBar(mainDoc);		    
					}				
			    }
			}
		} catch(ex) { MediaFile.log(ex); }
	}
	try {
	    YouTubeVideoFile.ajaxVideoSourceRequest.send(null);
	} catch(ex) { MediaFile.log(ex); }
};

YouTubeVideoFile.HTMLParser = function(aHTMLString, doc) {
	var html = doc.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
    body = doc.createElementNS("http://www.w3.org/1999/xhtml", "body");
	html.documentElement.appendChild(body);
       
	body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
	    .getService(Components.interfaces.nsIScriptableUnescapeHTML)
	    .parseFragment(aHTMLString, false, null, body));

	return body;
};

// stores the document containing the requested video (from the "ajax" request) in the "cached preview videos" array
YouTubeVideoFile.storeChannelsPreviewVideoInCache = function(doc, previewVideoId) {
	if (!YouTubeVideoFile.isCachedChannelsPreviewVideo(previewVideoId)) {
	    YouTubeVideoFile.videoPreviewDocs.push(doc);
	}
};

// this method starts the process of getting the preview channel videos -
// either sends an "ajax" request or loads it from the "cached preview videos" array
YouTubeVideoFile.checkForChannelsPreviewVideos = function(mainDoc, window, flashVideoDownload) {
	if (!YouTubeVideoFile.clearVideoPreviewCacheTimer) {
	    YouTubeVideoFile.clearVideoPreviewCacheTimer = window.setInterval(function() { YouTubeVideoFile.clearPreviewVideoFromCache(window); }, 900000);	// 900000 = 15 mins
	}	
	var previewVideoId = YouTubeVideoFile.getChannelVideoPreviewId(mainDoc);
	if (!previewVideoId) { previewVideoId = YouTubeVideoFile.findVideoId(mainDoc); }
	// log(previewVideoId)
	//log("preview id " + previewVideoId);
	if (YouTubeVideoFile.channelsVideoId != previewVideoId && previewVideoId) {
	    YouTubeVideoFile.channelsVideoId = previewVideoId;
	    if (YouTubeVideoFile.isCachedChannelsPreviewVideo(previewVideoId)) {
			var loadedSuccessfully = YouTubeVideoFile.loadPreviewVideoFromCache(mainDoc, previewVideoId, flashVideoDownload);
			if (loadedSuccessfully) { return; }
	    }
	    YouTubeVideoFile.getChannelVideoPreviewDocument(previewVideoId, mainDoc, window, flashVideoDownload, 0);
	}
};

// checks if the video is stored in the "cached preview videos" array
YouTubeVideoFile.isCachedChannelsPreviewVideo = function(previewVideoId) {
	if (YouTubeVideoFile.videoPreviewDocs) {
	    for (var i in YouTubeVideoFile.videoPreviewDocs) {
			if (YouTubeVideoFile.videoPreviewDocs[i].videoId == previewVideoId) { return true; }
	    }  
	}
	return false;
};

// loads the videoFilesList from the "cached preview videos" array into the main document (where the preview is running on)
YouTubeVideoFile.loadPreviewVideoFromCache = function(mainDoc, previewVideoId, flashVideoDownload) {
	for (var i in YouTubeVideoFile.videoPreviewDocs) {
	    if (YouTubeVideoFile.videoPreviewDocs[i].videoId == previewVideoId) {
			mainDoc.videoFilesList = YouTubeVideoFile.videoPreviewDocs[i].videoFilesList;
			flashVideoDownload.setStatusBar(mainDoc);
			return true;
	    }
	}
	return false;
};

YouTubeVideoFile.clearPreviewVideoFromCache = function(window) {
	//log("running clearPreviewVideoFromCache...");
	if (YouTubeVideoFile.videoPreviewDocs.length == 0 && YouTubeVideoFile.clearVideoPreviewCacheTimer) {
	    //log("stopping timer");
	    //log(YouTubeVideoFile.clearVideoPreviewCacheTimer);
	    YouTubeVideoFile.channelsVideoId = null;
	    try {
			window.clearInterval(YouTubeVideoFile.clearVideoPreviewCacheTimer);
			YouTubeVideoFile.clearVideoPreviewCacheTimer = null;
	    } catch(ex) { MediaFile.log(ex); }	    
	    return;
	}
	YouTubeVideoFile.videoPreviewDocs = new Array();
	//log("clearing cache");
};

// YouTube embedded videos look up code /****** Start ******/
YouTubeVideoFile.findVideoId = function(doc) {
	var videoId;
	
	videoId = YouTubeVideoFile.findEmbedVideoId(doc);
	if (videoId && videoId.length == 11) { return videoId; }
	
	videoId = YouTubeVideoFile.findObjectVideoId(doc);
	if (videoId && videoId.length == 11) { return videoId; }
	
	if (YouTubeVideoFile.embeddedVideos.isEnhancedDetectionEnabled) {	    
	    videoId = YouTubeVideoFile.findHTML5VideoId(doc, "div");
	    if (videoId && videoId.length == 11) { return videoId; }
	}	
	
	videoId = YouTubeVideoFile.findHTML5VideoId(doc, "video");
	if (videoId && videoId.length == 11) { return videoId; }
	
	videoId = YouTubeVideoFile.findIframeVideoId(doc);
	if (videoId && videoId.length == 11) { return videoId; }
	
	return false;	
};

YouTubeVideoFile.findEmbedVideoId = function(doc) {
	try {
	    var startIndex;
	    var endIndex;
	    var embeds = doc.getElementsByTagName("embed");	    
	    var videoId;
	    var youTubeVideoIdMinChars = 10;
	    var youTubeVideoIdMaxChars = 12;	    	    
	    for (var i in embeds) {		
			var src = embeds[i].getAttribute("src");
			if (src.indexOf("www.youtube.com") != -1) {
			    startIndex = src.indexOf("/v/") + 3;
			    endIndex = src.indexOf("?");
			    if (endIndex == -1) { endIndex = src.indexOf("&"); }
			    videoId = endIndex == -1 ? src.substring(startIndex) : src.substring(startIndex, endIndex);
			    //log("inside embed : " + videoId);
			    if (videoId.length > youTubeVideoIdMinChars && videoId.length < youTubeVideoIdMaxChars) { return videoId; }
			}
			var flashvars = embeds[i].getAttribute("flashvars");
			flashvars = flashvars.split("&");
			for (var i in flashvars) {
			    if (flashvars[i].indexOf("video_id") != -1) {
					return flashvars[i].split("=")[1];
			    }
			}
	    }		    
	    return false;
	} catch(ex) { return false; }
};

YouTubeVideoFile.findObjectVideoId = function(doc) {
	try {
	    var startIndex;
	    var endIndex;
	    var objects = doc.getElementsByTagName("object");
	    var videoId;
	    var youTubeVideoIdMinChars = 10;
	    var youTubeVideoIdMaxChars = 12;	    
	    //log(objects);
	    for (var i in objects) {
			var data = objects[i].getAttribute("data");
			if (data.indexOf("www.youtube.com") != -1) {
			    startIndex = data.indexOf("/v/") + 3;
			    endIndex = data.indexOf("?");
			    if (endIndex == -1) { endIndex = data.indexOf("&"); }
			    videoId = endIndex == -1 ? data.substring(startIndex) : data.substring(startIndex, endIndex);
			    if (videoId.length > youTubeVideoIdMinChars && videoId.length < youTubeVideoIdMaxChars) { return videoId; }
			}
	    }		    
	    return false;
	} catch(ex) { return false; }	
};

YouTubeVideoFile.findIframeVideoId = function(doc) {
	var IFRAMES_MAX_LIMIT = 10;
	try {
	    var startIndex;
	    var endIndex;
	    var iframes = doc.getElementsByTagName("iframe");
	    if (iframes.length == 0) { return false; }	    
	    var videoId;
	    var youTubeVideoIdMinChars = 10;
	    var youTubeVideoIdMaxChars = 12;
	    for (var i in iframes) {
	    	if (typeof iframes[i] === "function" 
	    		|| typeof iframes[i] === "number" 
	    		|| typeof iframes[i] === "string") { continue; }
			try {
				var src = iframes[i].getAttribute("src"); 
			} 
			catch(ex) { 
				MediaFile.log(ex);
			}
			if (!src) { continue; }
			if (src.indexOf("www.youtube.com/embed/") != -1) {		    
			    startIndex = src.indexOf("embed/") + 6;
			    endIndex = src.indexOf("?");
			    if (endIndex == -1) { endIndex = src.indexOf("&"); }
			    videoId = endIndex == -1 ? src.substring(startIndex) : src.substring(startIndex, endIndex);
			    if (videoId.length > youTubeVideoIdMinChars && videoId.length < youTubeVideoIdMaxChars) { return videoId; }
			}
	    }
	    // recursion that checks inside all iframes elements
	    if (iframes.length > 0) {
			for (var i in iframes) {
				if (typeof iframes[i] === "function" 
	    			|| typeof iframes[i] === "number" 
	    			|| typeof iframes[i] === "string") { continue; }				
			    //if (i > IFRAMES_MAX_LIMIT) { continue; }
			    //log("checking iframes");
			    videoId = YouTubeVideoFile.findVideoId(iframes[i].contentDocument);
			    if (videoId) { return videoId; }
			}
    	}
    return false;
	} catch(ex) { return false; }
};

YouTubeVideoFile.findHTML5VideoId = function(doc, lookInElementName) {
	try {
	    var startIndex;
	    var endIndex;
	    var videos = doc.getElementsByTagName(lookInElementName);
	    //log(doc);
	    //log("Videos Are: ");
	    //log(videos);
	    var videoId;
	    var youTubeVideoIdMinChars = 10;
	    var youTubeVideoIdMaxChars = 12;	    	    
	    for (var i in videos) {
			var videoId = null;
			try { videoId = videos[i].getAttribute("data-youtube-id"); } catch(ex) { }
			if (videoId && videoId.length > youTubeVideoIdMinChars && videoId.length < youTubeVideoIdMaxChars) { return videoId; }		
	    }
	    
	    return false;
	} catch(ex) { return false; }		
};

// YouTube embedded videos look up code /****** End ******/

YouTubeVideoFile.getYouTubeFormat = function(format) {	
	var videoFormats = {
	    5:   { resolution: MediaFile.QUALITIES._144P,		fileType: MediaFile.FORMATS.FLV },
	    6:   { resolution: MediaFile.QUALITIES._270P,		fileType: MediaFile.FORMATS.FLV },
	    13:  { resolution: MediaFile.QUALITIES._144P,		fileType: MediaFile.FORMATS._3GP },
	    17:  { resolution: MediaFile.QUALITIES._144P,		fileType: MediaFile.FORMATS._3GP },
	    18:  { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.MP4 },
	    22:  { resolution: MediaFile.QUALITIES._720P,		fileType: MediaFile.FORMATS.MP4 },
	    34:  { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.FLV },
	    36:  { resolution: MediaFile.QUALITIES._240P,		fileType: MediaFile.FORMATS._3GP },
	    38:  { resolution: MediaFile.QUALITIES._3072P,		fileType: MediaFile.FORMATS.MP4 },
	    43:  { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.WEBM },
	    45:  { resolution: MediaFile.QUALITIES._720P,		fileType: MediaFile.FORMATS.WEBM },
	    82:  { resolution: MediaFile.QUALITIES._360P_3D,	fileType: MediaFile.FORMATS.MP4_3D },
	    83:  { resolution: MediaFile.QUALITIES._240P_3D,	fileType: MediaFile.FORMATS.MP4_3D },
	    84:  { resolution: MediaFile.QUALITIES._720P_3D,	fileType: MediaFile.FORMATS.MP4_3D },
	    85:  { resolution: MediaFile.QUALITIES._520P_3D,	fileType: MediaFile.FORMATS.MP4_3D },
	    100: { resolution: MediaFile.QUALITIES._360P_3D,	fileType: MediaFile.FORMATS.WEBM_3D },
	    102: { resolution: MediaFile.QUALITIES._720P_3D,	fileType: MediaFile.FORMATS.WEBM_3D },
	    120: { resolution: MediaFile.QUALITIES._720P,		fileType: MediaFile.FORMATS.FLV },
	    133: { resolution: MediaFile.QUALITIES._240P,		fileType: MediaFile.FORMATS.MP4 },
	    134: { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.MP4 },
	    136: { resolution: MediaFile.QUALITIES._720P,		fileType: MediaFile.FORMATS.MP4 },
	    139: { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.MP4 },
	    140: { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.MP4 },
	    141: { resolution: MediaFile.QUALITIES._360P,		fileType: MediaFile.FORMATS.MP4 },
	    160: { resolution: MediaFile.QUALITIES._144P,		fileType: MediaFile.FORMATS.MP4 }
	};
	if (videoFormats[format]) {
	    return videoFormats[format];
	}	
	else {
	    return {
			resolution	: "Unrecognized",
			fileType	: "Unrecognized"
	    };
	}
};

YouTubeVideoFile.getYouTubeVideosParams = function(doc, dataAsString) {
	// consts
	var URL = "url=";
	var QUALITY = "quality=";
	var FALLBACK_HOST = "fallback_host=";
	var TYPE = "type=";
	var ITAG = "itag=";
	var SIG = "sig=";
	var S = "s=";			
	var urls = null;
	var innerHTML = "";
    if (!dataAsString) {
   		try { innerHTML = doc.getElementsByTagName("html")[0].innerHTML; } catch(ex) { MediaFile.log(ex); innerHTML = doc.innerHTML; } 
    	try { var urls = innerHTML.match(/"url_encoded_fmt_stream_map": "([^"]*)"/)[1]; } catch(ex) { MediaFile.log(ex); return false; }
    }
    else {
        urls = /"url_encoded_fmt_stream_map"\s*:\s*"([^"]*)/.exec(dataAsString)[1];
    }
    urls = urls.split(",");	
    var videoParams = new Array();
	for (var i in urls) {   
	    urls[i] = unescape(urls[i]);
	    var params = urls[i].split("\\u0026");
	    for (var j in params) {
			if (params[j].indexOf(URL) != -1) 				{ var url = params[j].split(URL)[1]; }
			if (params[j].indexOf(QUALITY) != -1) 			{ var quality = params[j].split(QUALITY)[1]; }
			if (params[j].indexOf(FALLBACK_HOST) != -1) 	{ var fallbackHost = params[j].split(FALLBACK_HOST)[1]; }
			if (params[j].indexOf(TYPE) != -1) 				{ var fileType = params[j].split(TYPE)[1]; }
			if (params[j].indexOf(ITAG) != -1) 				{ var itag = parseInt(params[j].split(ITAG)[1]); }
			if (params[j].indexOf(SIG) != -1) 				{ var sig = params[j].split(SIG)[1]; }
			if (params[j].indexOf(S) != -1 && params[j].substring(0,2) == S) { var s = params[j].split(S)[1]; }
	    }
	    if (sig && url.indexOf("signature") == -1) { url += "&signature=" + sig; }
	    else { url += "&signature="; }	    
	    
	    videoParams.push({
			url 		: url, 		// "\u0026" is an "&"
			quality 	: quality,	// example, "large", "medium"
			fallbackHost 	: fallbackHost,	// example, "tc.v22.cache4.c.youtube.com"
			fileType 	: YouTubeVideoFile.getYouTubeFormat(itag).fileType,	// example, "video/x-flv"
			itag 		: YouTubeVideoFile.getYouTubeFormat(itag).resolution,	// example, "34", "43" (video quality - hd and such)
			s		: s ? s : ""
	    });	    
	}
	videoParams.innerHTML = innerHTML;	// will be used to get "s"
	//log(videoParams);
	return videoParams;
};


// two possible "doc"s can be received here -
//  1. a document object as fetched from the window
//  2. a document object (created manually) with 2 properties - 1. innerHTML fetched from an ajax request (usually from channels or from scanning websites that may contain youtube embeds)
//						 		    2. videoId
YouTubeVideoFile.createMediaFiles = function(doc, overrideChecks) {
	var isAjaxVideo = true;

	if (overrideChecks) { isAjaxVideo = false; }

	if (!YouTubeVideoFile.isCheckForAjaxVideo) { return; }
	YouTubeVideoFile.isCheckForAjaxVideo = false;

	MediaFile.log("is ajax video:");
	MediaFile.log(isAjaxVideo);
	YouTubeVideoFile.createMediaFilesByTypeOfRequest(isAjaxVideo, doc, function(doc, responseText) {
		var title = YouTubeVideoFile.getDocTitle(doc);
		var icon = MediaFile.getWebsiteIcon(doc);
		MediaFile.log(responseText);		
		var youTubeVideoParams = YouTubeVideoFile.getYouTubeVideosParams(doc, responseText);	// responseText is used for ajax calls
		MediaFile.log(youTubeVideoParams);
		for (var i = 0; i < youTubeVideoParams.length; i++) {
            var fileType 	= youTubeVideoParams[i].fileType;
            var url 		= youTubeVideoParams[i].url;
		    var itag 		= youTubeVideoParams[i].itag;
		    var s 			= youTubeVideoParams[i].s;		    
		    var mediaFile = new YouTubeVideoFile(fileType, doc, url, title, 0, icon, itag, s);
		    mediaFile.addToMediaList(mediaFile);
		}
			
		try {
			MediaFile.log("yo yo momo");
		    if (doc.videoFilesList[0].s) {
	    		i = i || 0;
		    	// var sigDec = new SigDec();
		    	SigDec.init(youTubeVideoParams, responseText, doc);
		    	SigDec.decipher(doc.videoFilesList, function() {
		    		MediaFile.log("done");
		    		MediaFile.log(doc.videoFilesList);
		    	});		    
		    }
		} catch(ex) { MediaFile.log(ex); }			
	});		
};

// type of request - means, either from the first loaded document or from the JSON object.
// the JSON object is gotten from an ajax call made to a special url - same url youtube gets their JSON object
// (the JSON object is used if the new videos are gotten from an ajax call - "the red loading bar")
YouTubeVideoFile.createMediaFilesByTypeOfRequest = function(isAjaxVideo, doc, callback) {
	if (!isAjaxVideo) {
		// log("fetching - no ajax");
		callback(doc); 
		return;
	}
	// log("fetching - yes ajax");
	var videoId = YouTubeVideoFile.getVideoIdFromUrl(doc.baseURI);
	YouTubeVideoFile.getAjaxNavigatedVideosFile(videoId, doc, callback);
	// log(videoId);
};

YouTubeVideoFile.getAjaxNavigatedVideosFile = function(videoId, doc, callback) {
	// log("getAjaxNavigatedVideosFile");
    url = "http://youtube.com/watch?v=" + videoId + "&spf=navigate";
    ajaxRequest = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
    ajaxRequest.open('GET', url, true);
    ajaxRequest.setRequestHeader('Cache-Control', 'no-cache');
    ajaxRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
    
    ajaxRequest.onreadystatechange = function() {            
        try {
            if (this.readyState == 4 && this.status == 200) {
            	doc.videoFilesList = new Array();
                callback(doc, this.responseText);                      
            }
        } 
        catch(ex) { MediaFile.log(ex); }
    }
    ajaxRequest.send(null);
};

YouTubeVideoFile.getVideoIdFromUrl = function(url) {
    var urlParamsStr = url.substring(url.indexOf("?") + 1);
    var urlParams = urlParamsStr.split("&");
    for (var i in urlParams) {
        if (urlParams[i].indexOf("v=") != -1) {             
            return urlParams[i].split("=")[1];
        }
    }
    return false;
};   

YouTubeVideoFile.getDocTitle = function(doc) {
	var title = doc.title;	// for doc object 1
	if (!title) {		// for doc object 2
	    var innerHTML = doc.innerHTML;
	    var startIndex = innerHTML.indexOf("<title>") + 7;
	    var endIndex = innerHTML.indexOf("</title>");
	    title = innerHTML.substring(startIndex, endIndex);
	    title = YouTubeVideoFile.convertStringWithEntitiesToHTML(title);
	    
	    return title
	}
	return title;
};

// converts a string with HTML encoded entities and decodes them, returing a regular string
YouTubeVideoFile.convertStringWithEntitiesToHTML = function(strToConvert) {
	var converter = Components.classes['@mozilla.org/widget/htmlformatconverter;1'].createInstance(Components.interfaces.nsIFormatConverter);
	var supportsString = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
	var destinationObject = { value : null };
	supportsString.data = strToConvert;

	try {
	    converter.convert('text/html', supportsString, supportsString.toString().length, 'text/unicode', destinationObject, {});
	} catch(ex) { MediaFile.log(ex); }
	if (destinationObject.value) {
	    destinationObject = destinationObject.value.QueryInterface(Components.interfaces.nsISupportsString);
	    strToConvert = destinationObject.toString();
	}	    
	return strToConvert;	
};

// YouTubeVideoFile Class - static methods
YouTubeVideoFile.supportedFileTypes = [
	MediaFile.FORMATS.MP4,
	MediaFile.FORMATS.MP4_3D,
	MediaFile.FORMATS.FLV,
	MediaFile.FORMATS.WEBM,
	MediaFile.FORMATS.WEBM_3D,
	MediaFile.FORMATS._3GP
];

YouTubeVideoFile.isSupportedFileType = function(fileType) {
	return MediaFile.isSupportedFileType(fileType, YouTubeVideoFile.supportedFileTypes);
};

YouTubeVideoFile.init();