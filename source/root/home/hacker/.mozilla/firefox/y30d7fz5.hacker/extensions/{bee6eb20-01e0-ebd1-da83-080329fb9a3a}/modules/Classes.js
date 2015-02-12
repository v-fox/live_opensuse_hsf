var EXPORTED_SYMBOLS = ["Classes"];

var Classes = new function() {
	// consts
	var DEBUG;	// will be set through "overlay.js"

	// private fields
	var win = null;

	// private methods
	var log = function(logInfo) {
		if (win && DEBUG) { win.console.log(logInfo); }
	};
	
	// fields
    this.main = null;	// Classes.main - a reference to "flashVideoDownload" - should be passed set as a reference from "overlay.js"
    
/**************************************************************************************************/    
    this.setWindow = function(window) {
    	win = window;
    	if (this.MediaFile) { this.MediaFile.setWindow(window); }
    };

    this.setDebugOn = function(isOn) {
    	DEBUG = isOn;
    	if (this.MediaFile) { this.MediaFile.setDebugOn(isOn); }
    };

    this.init = function() {
	    Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js", this);
	    Components.utils.import("resource://flashVideoDownload/classes/VideoFile.js", this);
	    Components.utils.import("resource://flashVideoDownload/classes/FlashFile.js", this);
	    Components.utils.import("resource://flashVideoDownload/classes/YouTubeVideoFile.js", this);
	    Components.utils.import("resource://flashVideoDownload/classes/DailymotionVideoFile.js", this);
	    Components.utils.import("resource://flashVideoDownload/classes/MetacafeVideoFile.js", this);
	    Components.utils.import("resource://flashVideoDownload/classes/BreakVideoFile.js", this);
    };
};

Classes.init();