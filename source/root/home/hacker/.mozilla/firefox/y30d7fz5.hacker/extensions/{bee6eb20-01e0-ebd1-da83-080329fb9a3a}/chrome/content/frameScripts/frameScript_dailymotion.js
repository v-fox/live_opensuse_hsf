var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://flashVideoDownload/log.js");

var contentFrameScriptManager;
var VideoParams;
var FileData;
var FileLabel;
var XHR;
var contentFrameMessageManager = this;
var Q;
var document;

var DailymotionParser = function() {
	this.id = null;

	this.init();
};

DailymotionParser.prototype = new function() {
	// const VIDEO_FILE_LABEL = "{{videoTitle}} [{{quality}}].{{fileExt}} ({{fileSize}})"; // old label
	const VIDEO_FILE_LABEL = "{{videoTitle}}";
	const DOMAIN = "dailymotion.com";

	this.init = function() {
		this.loadModules();
		this.id = Math.round(Math.random()*1000000000);
		this.contentFrameScriptManager = new ContentFrameScriptManager(
			contentFrameMessageManager, 
			"frameScript_dailymotion.js",
			this.id
		);
	};

	// check if the domain is of Dailymotion
	this.isValidDomain = function() {
		return document && document.domain && document.domain.indexOf(DOMAIN) != -1;
	};

	// check if the url is a video url
	this.isValidUrl = function() {
		if (!document || !document.URL) { return false; }
		var splitUrl = document.URL.toLowerCase().split("/");
		return splitUrl[3] === "video";
	};

	this.loadModules = function() {
		var moduleContainer = {};
		Cu.import("resource://flashVideoDownload_frameScripts/ContentFrameScriptManager.js", moduleContainer);
		Cu.import("resource://flashVideoDownload_frameScripts/VideoParams.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/FileData/FileData.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/FileLabel.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/XHR/XHR.js", moduleContainer);
		Cu.import("resource://flashVideoDownload/Q.js", moduleContainer);
		ContentFrameScriptManager = moduleContainer.ContentFrameScriptManager;
		VideoParams = moduleContainer.VideoParams;
		FileData = moduleContainer.FileData;
		FileLabel = moduleContainer.FileLabel;
		XHR = moduleContainer.XHR;
		Q = moduleContainer.Q;
	};

	this.unloadModules = function() {
		this.contentFrameScriptManager.unloadModules();
		Cu.unload("resource://flashVideoDownload_frameScripts/ContentFrameScriptManager.js");
		Cu.unload("resource://flashVideoDownload_frameScripts/VideoParams.js");
		Cu.unload("resource://flashVideoDownload/FileData/FileData.js");
		Cu.unload("resource://flashVideoDownload/FileLabel.js");
		Cu.unload("resource://flashVideoDownload/XHR/XHR.js");
		Cu.unload("resource://flashVideoDownload/Q.js");
	};

	this.isValidVideoIdLength = function(videoId) {
		return videoId && 
				typeof videoId === "string" && 
				videoId.length >= 6 && 
				videoId.length <= 7;
	};

	// need to fix video id length - it can also be length = 6
	this.getVideoIdFromDoc = function() {
		var metas = document.getElementsByTagName("meta");
		for (var i in metas) {
		    if (!metas[i]["getAttribute"]) { continue; }
		    var propAttr = metas[i].getAttribute("property");
		    var name = metas[i].getAttribute("name");
		    var content = metas[i].getAttribute("content");
		    if (propAttr == "og:video") {
				var startIndex = content.indexOf("video/") + 6;
				var endIndex = content.indexOf("?", startIndex);
				if (endIndex === -1) {
					endIndex = content.indexOf("_", startIndex);
				}
				return content.substring(startIndex, endIndex);
		    }
		    if (propAttr == "og:url" 
		    	|| name == "twitter:app:url:googleplay") {
		    	var videoId = content.split("/")[4];
		    	if (this.isValidVideoIdLength(videoId)) { return videoId; }
		    }
		    if (propAttr == "al:ios:ur" 
		    	|| propAttr == "al:android:url" 
		    	|| name == "twitter:app:url:iphone"
		    	|| name == "twitter:app:url:ipad") {
		    	var videoId = content.split("/")[3];
		    	if (this.isValidVideoIdLength(videoId)) { return videoId; }
		    }
		    if (name == "twitter:player") {
		    	var videoId = content.split("/")[5];
		    	if (this.isValidVideoIdLength(videoId)) { return videoId; }
		    }
		}
		// check the document's URL
		var startIndex = document.URL.indexOf("video/") + 6;
		var endIndex = document.URL.indexOf("?", startIndex);
		if (endIndex === -1) {
			endIndex = document.URL.indexOf("_", startIndex);
		}
		var videoId = document.URL.substring(startIndex, endIndex);	
		if (videoId && this.isValidVideoIdLength(video)) { return videoId; }

		return false;
	};

	this.getMediaFiles = function() {
		var deferred = Q.defer();
		var videoId = this.getVideoIdFromDoc();
		// log(videoId);
		if (!videoId) { 
			deferred.reject(new Error("Couldn't find video id"));
			return deferred.promise;
		}
		// log(videoId);
		var url = "http://www.dailymotion.com/embed/video/" + videoId;
		// log(url);
        var xhr = new XHR();

        xhr.send("get", url)
        .then(function(xhr) {
        	// log(responseText);
        	try {
            	var videoParamsList = this.parseVideoUrls(xhr.responseText);
        	} catch(ex) { 
        		// log(ex);
        	}
            deferred.resolve(videoParamsList);
        }.bind(this), function(error) {
        	// log(error);
        });

		return deferred.promise;
	};

	this.parseVideoUrls = function(responseText) {
		var fileLabel = new FileLabel(VIDEO_FILE_LABEL, FileData.CATEGORY.VIDEO);
		var urlsPerQuality = responseText.match(/\"qualities\": *(\{.+\}),"reporting"/);
		if (!urlsPerQuality) {
			urlsPerQuality = responseText.match(/\"qualities\": *(\{.+\}),"sharing"/);
		}
		log(urlsPerQuality);
		urlsPerQuality = urlsPerQuality ? urlsPerQuality[1] : null;
		if (!urlsPerQuality) { return false; }

		urlsPerQuality = JSON.parse(urlsPerQuality);
		var videoParamsList = [];
		var fileDataList = [];
		for (var quality in urlsPerQuality) {
			var urlPerQuality = urlsPerQuality[quality];
			if (parseInt(quality)) {
				videoParamsList.push(new VideoParams({
					url 			: urlPerQuality[1].url,
					fileType 		: "mp4",
					contentType		: "mp4",
					quality 		: quality + "p",
					docTitle 		: document.title,
					docDomain 		: document.domain,
					docUrl 			: document.URL,
					contentLength 	: 0,
					category 		: FileData.CATEGORY.VIDEO,
					popupLabelFormatString : fileLabel.toString()
				}).JSONParse());

				// log(videoParamsList);
			}
		}
		
		return videoParamsList.length > 0 ? videoParamsList : false;
	};
};

var dailymotionParser = new DailymotionParser();
var main = function(event) { 
	document = event.target;
	if (!this.isValidDomain() || !this.isValidUrl()) { return; }
	// log("frame script - DOMContentLoaded");
	this.getMediaFiles().then(
		function(videoParamsList) {
			log(videoParamsList);
			this.contentFrameScriptManager.sendAsyncMessage({ videoParamsList: videoParamsList });
		}.bind(this),
		function(error) { 
			//log(error); 
		}
	);

}.bind(dailymotionParser);

dailymotionParser.contentFrameScriptManager.addEventListener("DOMContentLoaded", main);
dailymotionParser.contentFrameScriptManager.addEventListener("load", function(event) { 
	// log("frame script - load");
});

// dailymotionParser.contentFrameScriptManager.addEventListener("DOMWindowCreated", function(event) { 
// 	log("DOMWindowCreated");
// 	log(event);
// });

content.addEventListener("unload", function() { 
	// log("unloading framescript");
	// dailymotionParser.unloadModules();
}, false);