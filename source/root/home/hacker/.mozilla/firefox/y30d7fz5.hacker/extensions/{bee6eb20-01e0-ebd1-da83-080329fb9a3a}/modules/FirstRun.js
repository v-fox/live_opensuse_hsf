var EXPORTED_SYMBOLS = ["FirstRun"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/Observer.js");
Cu.import("resource://flashVideoDownload/PrefManager.js");

var log;			// module
var Observer;		// module
var PrefManager;	// module

var FirstRun = new function() {
	this.FIRSTRUN_TOPIC = "fnvfox:firstRun";
	this.observer = null;

	this.init = function() {
		this.observer = new Observer();
	};

	this.setFirstRunEvent = function(event) {
		this.observer.register(this.FIRSTRUN_TOPIC, event);
	};

	this.checkIsFirstRun = function() {
		if (PrefManager.getPref(PrefManager.PREFS.OTHER.FIRSTRUN)) {
			this.observer.notifyTopic(this.FIRSTRUN_TOPIC);
			PrefManager.setPref(PrefManager.PREFS.OTHER.FIRSTRUN, false);
		};
	};

	this.init();
};