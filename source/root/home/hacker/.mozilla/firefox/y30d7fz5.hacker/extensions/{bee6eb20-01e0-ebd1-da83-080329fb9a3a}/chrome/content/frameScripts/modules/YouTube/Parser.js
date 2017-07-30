var EXPORTED_SYMBOLS = ["Parser"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var VideoParams;
var FileData;
var FileLabel;

var content;

var Parser = new function() {
	// const VIDEO_FILE_LABEL = "{{videoTitle}} [{{quality}}].{{fileExt}} ({{fileSize}})"; // old label
	const VIDEO_FILE_LABEL = "{{videoTitle}}";
	const VIDEO_FILENAME_LABEL = "{{videoTitle}} [{{quality}}].{{fileExt}}";

	const URL = "url=";
	const QUALITY = "quality=";
	const FALLBACK_HOST = "fallback_host=";
	const TYPE = "type=";
	const ITAG = "itag=";
	const SIG = "sig=";
	const S = "s=";

	var FORMATS = {
		MP4 	: "mp4",
		FLV 	: "flv",
		WEBM	: "webm",
		_3GP	: "3gp",
		WEBM_3D	: "3d.webm",
		MP4_3D	: "3d.mp4",
		F4V		: "f4v"
	};

	var QUALITIES = {
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
	};

	this.videoDefinitions = null;

	this.init = function() {
		this.loadModules();
		this.setVideoDefinitions();
	};

	this.setContent = function(_content) {
		content = _content;
	};

	this.loadModules = function() {
		Cu.import("resource://flashVideoDownload_frameScripts/VideoParams.js");
		Cu.import("resource://flashVideoDownload/FileData/FileData.js");
		Cu.import("resource://flashVideoDownload/FileLabel.js");
	};

	this.setVideoDefinitions = function() {
		// example - 
		// 5:   { 
		// 	qualityKey: "_144P",
		// 	formatKey: "FLV",
		// 	format: null,	// gets defined dynamically
		// 	quality: null	// gets defined dynamically
		// }
		this.videoDefinitions = {
		    5:   { qualityKey: "_144P", 	formatKey: "FLV" },
		    6:   { qualityKey: "_270P", 	formatKey: "FLV" },
		    13:  { qualityKey: "_144P", 	formatKey: "_3GP" },
		    17:  { qualityKey: "_144P", 	formatKey: "_3GP" },
		    18:  { qualityKey: "_360P", 	formatKey: "MP4" },
		    22:  { qualityKey: "_720P", 	formatKey: "MP4" },
		    34:  { qualityKey: "_360P", 	formatKey: "FLV" },
		    36:  { qualityKey: "_240P", 	formatKey: "_3GP" },
		    38:  { qualityKey: "_3072P", 	formatKey: "MP4" },
		    43:  { qualityKey: "_360P", 	formatKey: "WEBM" },
		    45:  { qualityKey: "_720P", 	formatKey: "WEBM" },
		    82:  { qualityKey: "_360P_3D", 	formatKey: "MP4_3D" },
		    83:  { qualityKey: "_240P_3D", 	formatKey: "MP4_3D" },
		    84:  { qualityKey: "_720P_3D", 	formatKey: "MP4_3D" },
		    85:  { qualityKey: "_520P_3D", 	formatKey: "MP4_3D" },
		    100: { qualityKey: "_360P_3D", 	formatKey: "WEBM_3D" },
		    102: { qualityKey: "_720P_3D", 	formatKey: "WEBM_3D" },
		    120: { qualityKey: "_720P", 	formatKey: "FLV" },
		    133: { qualityKey: "_240P", 	formatKey: "MP4" },
		    134: { qualityKey: "_360P", 	formatKey: "MP4" },
		    136: { qualityKey: "_720P", 	formatKey: "MP4" },
		    139: { qualityKey: "_360P", 	formatKey: "MP4" },
		    140: { qualityKey: "_360P", 	formatKey: "MP4" },
		    141: { qualityKey: "_360P", 	formatKey: "MP4" },
		    160: { qualityKey: "_144P", 	formatKey: "MP4" }
		};

		for (var i in this.videoDefinitions) {
			var qualityKey = this.videoDefinitions[i].qualityKey;
			var formatKey = this.videoDefinitions[i].formatKey;
			this.videoDefinitions[i].resolution = QUALITIES[qualityKey];
			this.videoDefinitions[i].fileType = FORMATS[formatKey];
		}
	};

	this.getVideoDefinition = function(itag) {
		var unrecognized = {
			resolution	: "Unrecognized",
			fileType	: "Unrecognized"
	    };

		return this.videoDefinitions[itag] || unrecognized;
	};

	this.hasSig = function(url) {
		return url.indexOf("signature") !== -1;
	};

	this.adjustSig = function(url, sig) {
		if (sig) { return url += "&signature=" + sig; }
		return url + "&signature=";
	};

	this.isSigOk = function(s) {
		return s === null;
	};

	this.getPlayerJSUrl = function(data) {
		if (!data) { return null; }
		var swfcfg = this.getVideoSwfcfg(data);
		if (swfcfg.hasOwnProperty("assets")
			&& swfcfg.assets.hasOwnProperty("js")) {
			return "https:\/\/youtube.com\/" + swfcfg.assets.js;
		}
		return null;
	};

	this.getVideoSwfcfg = function(data) {
		if (!data) { return null; }
		data = JSON.parse(data);
		if (data instanceof Array) {
			for (var i in data) {
				if (data[i].hasOwnProperty("data")
					&& data[i].data.hasOwnProperty("swfcfg")) {
					return data[i].data.swfcfg;
				}
			}
		}
		return null;
	};

	this.getVideoArgs = function(data) {
		if (!data) { return null; }
		var swfcfg = this.getVideoSwfcfg(data);
		if (swfcfg.hasOwnProperty("args")) {
			return swfcfg.args;
		}
		return null;
	};

	this.getVideoTitle = function(videoArgs) {
		if (!videoArgs || !videoArgs.hasOwnProperty("title")) { return null; }

		return videoArgs.title;
	};

	this.getVideosParamsList = function(data) {
		// log(data);
		var playerJSUrl = this.getPlayerJSUrl(data);
		log(playerJSUrl);
		var videoArgs = this.getVideoArgs(data);
		var title = this.getVideoTitle(videoArgs);
		var popupLabelFormat = new FileLabel(VIDEO_FILE_LABEL, FileData.CATEGORY.VIDEO);	// to be displayed in the popup
		var downloadWindowFilenameFormat = new FileLabel(VIDEO_FILENAME_LABEL, FileData.CATEGORY.VIDEO);	// to be saved/downloaded - the actual filename
		// log(downloadWindowFilenameFormat);

		var urls = /"url_encoded_fmt_stream_map"\s*:\s*"([^"]*)/.exec(data)[1];
	    urls = urls.split(",");	
	    // log(urls);
	    var videoParamsList = [];
		for (var i in urls) {
			let url = quality = fallbackHost = fileType = itag = sig = s = null;
			// log(url);
		    urls[i] = unescape(urls[i]);
		    var params = urls[i].split("\\u0026");
		    for (var j in params) {
		    	url 			= params[j].indexOf(URL) != -1 ? params[j].split(URL)[1] : url;
		    	quality 		= params[j].indexOf(QUALITY) != -1 ? params[j].split(QUALITY)[1] : quality;
		    	fallbackHost 	= params[j].indexOf(FALLBACK_HOST) != -1 ? params[j].split(FALLBACK_HOST)[1] : fallbackHost;
		    	fileType 		= params[j].indexOf(TYPE) != -1 ? params[j].split(TYPE)[1] : fileType;
		    	itag 			= params[j].indexOf(ITAG) != -1 ? parseInt(params[j].split(ITAG)[1]) : itag;
		    	sig 			= params[j].indexOf(SIG) != -1 ? params[j].split(SIG)[1] : sig;
		    	s 				= params[j].indexOf(S) != -1 && params[j].substring(0,2) == S ? params[j].split(S)[1] : s;
		    }

		    if (!this.hasSig(url)) {
		    	url = this.adjustSig(url, sig);
		    }

		    var videoDefinition = this.getVideoDefinition(itag);
		    videoParamsList.push(new VideoParams({
		    	isYouTube 		: true,
				url 			: url, 								// "\u0026" is an "&"
				quality 		: quality,							// example, "large", "medium"
				fallbackHost 	: fallbackHost,						// example, "tc.v22.cache4.c.youtube.com"
				fileType 		: videoDefinition.fileType,					// example, "video/x-flv"
				fileExt 		: videoDefinition.fileType,
				itag 			: videoDefinition.resolution,				// example, "34", "43" (video quality - hd and such)
				formatKey	 	: videoDefinition.formatKey,
				qualityKey	 	: videoDefinition.qualityKey,
				s				: s,
				isSigOk 		: this.isSigOk(s),
				playerJSUrl 	: playerJSUrl,
				docTitle 		: title,
				docUrl 			: content.location.href,
				docDomain 		: content.location.host,
				category 		: FileData.CATEGORY.VIDEO,
				popupLabelFormatString: popupLabelFormat.toString(),					// converts it to a format string
				downloadWindowFilenameFormatString: downloadWindowFilenameFormat.toString()	// converts it to a format string
				// isUseLabelAsFilename : true
		    }).JSONParse());
		    // log("sig ok " + this.isSigOk(s));
		}

		videoParamsList.sort(function(a, b) {
			if (parseInt(a.itag) < parseInt(b.itag)) { return -1; }
			else if (parseInt(a.itag) > parseInt(b.itag)) { return 1; }
			else if (a.fileType === FORMATS.FLV) { return 1; }	// flv is bigger than 3gp
			else if (a.fileType === FORMATS.WEBM) { return 1; } // webm is bigger than mp4 (usually)
			else { return 0; }
		});

		// log(videoParamsList);

		return videoParamsList;
	};

	this.init();
};