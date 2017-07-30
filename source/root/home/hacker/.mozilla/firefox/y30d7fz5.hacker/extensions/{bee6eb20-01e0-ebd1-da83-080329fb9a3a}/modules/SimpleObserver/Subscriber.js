var EXPORTED_SYMBOLS = ["Subscriber"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

// Subscriber class
var Subscriber = function(topic, callback) {
	this.init(topic, callback);
};	

Subscriber.prototype.init = function(topic, callback) {
	this.topic = topic;
	this.callback = callback;
};