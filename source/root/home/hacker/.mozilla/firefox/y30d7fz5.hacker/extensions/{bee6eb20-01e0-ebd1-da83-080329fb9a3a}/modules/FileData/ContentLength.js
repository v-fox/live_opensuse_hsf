var EXPORTED_SYMBOLS = ["ContentLength"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

// contentLength must be in byts
var ContentLength = function(contentLength) {
	this.init(contentLength);
};

ContentLength.prototype = new function() {
	this.init = function(contentLength) {
		this.contentLength = parseInt(contentLength);
	};

	this.calculateFileSize = function(withSuffix) {
		var size;

		if (this.contentLength >= 1073741824) {
		    size = this.contentLength/1073741824;
		    size = Math.floor(size * 100) / 100;
		    if (withSuffix) { size += " GB"; }
		}
		else if (this.contentLength >= 1048576) {
		    size = this.contentLength/1048576;
		    size = Math.floor(size * 100) / 100;
		    if (withSuffix) { size += " MB"; }
		}
		else if (this.contentLength >= 1024) {
		    size = this.contentLength/1024;
		    size = Math.floor(size * 100) / 100;
		    if (withSuffix) { size += " KB"; }
		}
		else {
		    size = this.contentLength;
		    if (withSuffix) { size += " bytes"; }
		}
		return size;
	};

	this.toString = function() {
		return this.calculateFileSize(this.contentLength);
	};

	this.isEmpty = function() {
		return this.contentLength === -1 || this.contentLength === 0;
	};

	this.setContentLength = function(value) {
		this.contentLength = value;
	};
};