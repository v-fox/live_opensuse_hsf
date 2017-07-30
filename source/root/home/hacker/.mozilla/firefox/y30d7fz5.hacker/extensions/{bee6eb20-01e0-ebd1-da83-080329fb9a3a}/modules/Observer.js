var EXPORTED_SYMBOLS = ["Observer"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

var Observer = function(params) {
	this.topic = null;
	this.callback = null;
	this.observerService = null;	

	this.init(params);
};

Observer.prototype = new function() {
	this.init = function(params) {
		if (params) {
			this.topic = params.topic || null;
			this.callback = params.callback || null;
		}
		this.observerService = Cc["@mozilla.org/observer-service;1"]
	  		.getService(Ci.nsIObserverService);
	};

	this.observe = function(subject, topic, data) {
		if (this.topic == topic) {
			this.callback(data, subject);
		}
	};

	this.register = function(topic, callback) {
		this.callback = callback || this.callback;
		this.topic = topic || this.topic;
		
		this.observerService.addObserver(this, this.topic, false);
	};

	this.unregister = function() {
		this.observerService.removeObserver(this, this.topic);
	};

	this.notify = function(subject, topic, data) {
		Cc["@mozilla.org/observer-service;1"]
			.getService(Ci.nsIObserverService)
			.notifyObservers(subject, topic, data);
	};

	this.notifyTopic = function(topic) {
		Cc["@mozilla.org/observer-service;1"]
			.getService(Ci.nsIObserverService)
			.notifyObservers(null, topic, null);
	};
};