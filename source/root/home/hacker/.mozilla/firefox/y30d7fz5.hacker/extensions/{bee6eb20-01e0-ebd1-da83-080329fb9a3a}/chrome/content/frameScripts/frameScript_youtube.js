var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://flashVideoDownload/log.js");

// modules
var contentFrameScriptManager;
var FileData;
var XHR;
var contentFrameMessageManager = this;
var Q;

// YouTube modules
var Utils;
var Parser;

// other
var document;

var YouTubeParser = function() {
	this.id = null;
	this.prevUrl = null;
	this.currentUrl = null;

	this.init();
};

YouTubeParser.prototype = new function() {
	const DOMAIN = "youtube.com";
	const MAP_URL = "http://youtube.com/watch?v={{videoId}}&spf=navigate";

	this.init = function() {
		this.loadModules();
		this.loadYouTubeModules();
		this.id = Math.round(Math.random()*1000000000);
		this.contentFrameScriptManager = new ContentFrameScriptManager(
			contentFrameMessageManager, 
			"frameScript_youtube.js",
			this.id
		);
	};

	// check if the url is a video url
	this.isWatchUrl = function(url) {
		var splitUrl = url.toLowerCase().split("/");
		return splitUrl[3].match(/\bwatch/) != null ? true : false;
	};

	this.isYouTubeUrl = function(domain) {
		return domain.indexOf("youtube") != -1;
	};

	this.isNewWatchUrl = function(url) {
		return !this.PrevWatchUrl || this.PrevWatchUrl !== url;
	};

	this.getVideoIdFromUrl = function(url) {
	    var urlParamsStr = url.substring(url.indexOf("?") + 1);
	    var urlParams = urlParamsStr.split("&");
	    for (var i in urlParams) {
	        if (urlParams[i].indexOf("v=") != -1) {             
	            return urlParams[i].split("=")[1];
	        }
	    }
	    return false;
	};

	this.clearPrevWatchUrl = function() { this.PrevWatchUrl = null; };

	Object.defineProperty(this, "PrevWatchUrl", { 
		get: function() { return this.prevWatchUrl; },
		set: function(value) { this.prevWatchUrl = value; }
	});

	Object.defineProperty(this, "CurrentWatchUrl", { 
		get: function() { return this.currentWatchUrl; },
		set: function(value) { this.currentWatchUrl = value; }
	});

	this.isAjaxVideoLoad = function() {
		if (this.isYouTubeUrl(this.CurrentWatchUrl) && this.isYouTubeUrl(this.PrevWatchUrl)) {
			return true;
		}
		return false;
	};

	this.loadModules = function() {
		var moduleContainer = {};
		Cu.import("resource://flashVideoDownload_frameScripts/ContentFrameScriptManager.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/FileData/FileData.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/XHR/XHR.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/Q.js", moduleContainer);
		ContentFrameScriptManager = moduleContainer.ContentFrameScriptManager;
		FileData = moduleContainer.FileData;
		XHR = moduleContainer.XHR;
		Q = moduleContainer.Q;
	};

	this.unloadModules = function() {
		this.contentFrameScriptManager.unloadModules();
		Cu.unload("resource://flashVideoDownload_frameScripts/ContentFrameScriptManager.js");
		Cu.unload("resource://flashVideoDownload/FileData/FileData.js");
		Cu.unload("resource://flashVideoDownload/XHR/XHR.js");
		Cu.unload("resource://flashVideoDownload/Q.js");
	};

	this.loadYouTubeModules = function() {
		var moduleContainer = {};
		Cu.import("resource://flashVideoDownload_frameScripts/YouTube/Parser.js", moduleContainer);
		Cu.import("resource://flashVideoDownload_frameScripts/YouTube/Utils.js", moduleContainer);

		Utils = moduleContainer.Utils;
		Parser = moduleContainer.Parser;
	};

	this.setContents = function(content) {
		Utils.setContent(content);
		Parser.setContent(content);
	};

	this.getMapUrl = function(videoId) {
		return MAP_URL.replace("{{videoId}}", videoId);
	};

	this.getMediaFiles = function(url) {
		var deferred = Q.defer();
		var videoId = this.getVideoIdFromUrl(url);
		if (!videoId) { 
			deferred.reject(new Error("Couldn't find video id"));
			return deferred.promise;
		}
		// log(videoId);
		var mapUrl = this.getMapUrl(videoId);
		// log(mapUrl);
        var xhr = new XHR();
        xhr.send("get", mapUrl)
        .then(function(xhr) {
        	// log(xhr);
        	// log(xhr.responseText);
        	// log(Parser);
        	try {
	        	var videoParamsList = Parser.getVideosParamsList(xhr.responseText);
	        	deferred.resolve(videoParamsList);
	        	// log(videoParamsList);
        	} catch(ex) { 
        		log(ex);
        	}
        }.bind(this), function(error) {
        	// log(error);
        });

		return deferred.promise;
	};
};

var youTubeParser = new YouTubeParser();

var domContentLoaded = function(event) {
	document = event.target;
}.bind(youTubeParser);

var main = function(event) {
	this.setContents(content);
	// log(content);
	var url = event.url;
	var domain = event.domain;
	var isSameDoc = event.isSameDoc;
	// log("frame script youtube - onLocationChange");
	// log("prev: " + this.PrevWatchUrl);
	// log(url);
	// log(event);
	if (!isSameDoc) { this.clearPrevWatchUrl(); }
	if (this.isYouTubeUrl(domain)) {
		// log("youtube url");
		if (this.isWatchUrl(url) && this.isNewWatchUrl(url)) {
			this.PrevWatchUrl = url;
			// log("watch url");

			this.getMediaFiles(url).then(
				function(videoParamsList) {
					// log(videoParamsList);
					this.contentFrameScriptManager.sendAsyncMessage({ videoParamsList: videoParamsList });
				}.bind(this),
				function(error) { 
					// log(error); 
				}
			);
		};
	}
}.bind(youTubeParser);

youTubeParser.contentFrameScriptManager.addEventListener("DOMContentLoaded", domContentLoaded);
youTubeParser.contentFrameScriptManager.addEventListener("onLocationChange", main);

youTubeParser.contentFrameScriptManager.addEventListener("load", function() {});

content.addEventListener("unload", function() { 
	// log("unloading framescript");
	// youTubeParser.unloadModules();
}, false);