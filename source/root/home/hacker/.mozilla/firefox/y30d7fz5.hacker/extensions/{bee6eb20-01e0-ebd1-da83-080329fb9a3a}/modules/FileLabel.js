var EXPORTED_SYMBOLS = ["FileLabel"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

var FileLabel = function(format, category) {
	this.category = null;
	this.format = null;

	this.init(format, category);
};

FileLabel.prototype = {
	CATEGORY: {
		VIDEO: "video",
		FLASH: "flash"
	},

	init: function(format, category) {
		if (!category) {
			var isSuccessfulConversion = this.toFormatAndCategory(format);
			if (isSuccessfulConversion) { return; }
		}
		this.format = format;
		this.category = category;
	},

	toString: function() {
		var str = null;
		if (typeof this.format === "string") {
			str = encodeURIComponent(this.format) + "::" + this.category;
		}
		return str;
	},

	toFormatAndCategory: function(format) {
		if (format.indexOf("::") === -1) { return false; }
		this.format = decodeURIComponent(format.split("::")[0]);
		this.category = format.split("::")[1];

		return true;
	},

	get Format() { return this.format; },
	get Category() { return this.category; }
};