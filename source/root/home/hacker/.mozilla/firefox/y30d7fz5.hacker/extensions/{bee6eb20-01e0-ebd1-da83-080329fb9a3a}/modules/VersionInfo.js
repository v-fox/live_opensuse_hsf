var EXPORTED_SYMBOLS = ["VersionInfo"];

var VersionInfo = new function() {
	this.version = null;
	this.versionChecker = null;

    this.setVersion = function() {
        var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
            .getService(Components.interfaces.nsIXULAppInfo);
        this.version = appInfo.version;
    };

    this.setVersionChecker = function() {
        this.versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
            .getService(Components.interfaces.nsIVersionComparator);    	
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

    this.init = function() {
    	this.setVersion();
    	this.setVersionChecker();
    };    
}

VersionInfo.init();