var EXPORTED_SYMBOLS = ["Utils"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var content;

var Utils = new function() {
	// consts
	const URL_TYPE = { 
		WATCH: 		1, 
		USER: 		2, 
		CHANNELS: 	3, 
		CHANNEL: 	4
	};

	this.setContent = function(_content) {
		content = _content;
	};

	this.getUrlType = function(url) {
	    if (url.indexOf("watch") != -1) {
			return URL_TYPE.WATCH;
	    }
	    if (url.indexOf("user") != -1) {
			return URL_TYPE.USER;
	    }
	    if (url.indexOf("channels") != -1) {
			return URL_TYPE.CHANNELS;
	    }
	    if (url.indexOf("channel/") != -1) {
			return URL_TYPE.CHANNEL;
    	}
	    return null;
	};
};