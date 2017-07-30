var EXPORTED_SYMBOLS = ["URLVerifier"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var URLVerifier = new function() {
	this.init = function() {};

	this.isHttpUrl = function(url) {
		return url.trim().match("^https?:\/\/") === null ? false : true;
	};

	this.init();
};