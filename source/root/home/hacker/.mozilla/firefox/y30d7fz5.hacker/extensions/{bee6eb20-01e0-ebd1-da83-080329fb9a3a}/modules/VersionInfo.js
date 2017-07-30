var EXPORTED_SYMBOLS = ["VersionInfo"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;    // module

var VersionInfo = new function() {
	this.version = null;
	this.versionChecker = null;

    this.init = function() {
        this.setVersion();
        this.setVersionChecker();
    };    

    this.setVersion = function() {
        var appInfo = Cc["@mozilla.org/xre/app-info;1"]
            .getService(Ci.nsIXULAppInfo);
        this.version = appInfo.version;
    };

    this.setVersionChecker = function() {
        this.versionChecker = Cc["@mozilla.org/xpcom/version-comparator;1"]
            .getService(Ci.nsIVersionComparator);    	
    };

    this.getVersion = function() {
    	return this.version;
    };

    this.isVersionBiggerOrEqual = function(compareToVersion) {
        return this.versionChecker.compare(this.version, compareToVersion) >= 0;
    };

    this.hasAddonBar = function() {        
        return this.isVersionBiggerOrEqual("4") && !this.isVersionBiggerOrEqual("29");
    };

    this.hasStatusBar = function() {        
        return !this.isVersionBiggerOrEqual("4");
    };

    this.isVersion4 = function() {
        return this.isVersionBiggerOrEqual("4");
    };

    this.isVersion29 = function() {
        return this.isVersionBiggerOrEqual("29");
    };

    this.init();
};