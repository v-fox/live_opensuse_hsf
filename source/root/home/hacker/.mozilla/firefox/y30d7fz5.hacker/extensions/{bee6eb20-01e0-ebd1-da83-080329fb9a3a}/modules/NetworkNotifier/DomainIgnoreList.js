var EXPORTED_SYMBOLS = ["DomainIgnoreList"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/FileData/FileData.js");

var log;

var DomainIgnoreList = new function() {
	var FLASH_DOMAINS = [];
	var VIDEO_DOMAINS = ["youtube.com"];
	var ALL_DOMAINS = [];

	this.init = function() {};

	this.isDomainInList = function(fileData, ignoreList) {
		if (!fileData.DocDomain) { return false; }

		ignoreList = ignoreList || this.getIgnoreList(fileData);
        for (var i in ignoreList) {
            if (fileData.DocDomain.indexOf(ignoreList[i]) != -1) {
                return true;
            }
        }
        if (ignoreList === ALL_DOMAINS) { return false; }

        return this.isDomainInList(fileData, ALL_DOMAINS);
	};

	this.getIgnoreList = function(fileData) {
		if (fileData.Category === FileData.CATEGORY.FLASH) { 
			return FLASH_DOMAINS;
		}
		if (fileData.Category === FileData.CATEGORY.VIDEO) { 
			return VIDEO_DOMAINS;
		}
		return null;
	};

	this.init();
};