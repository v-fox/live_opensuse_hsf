var EXPORTED_SYMBOLS = ["YouTubeDec"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

// modules
var log;
var Q;
var XHR;
var Sandbox;

var YouTubeDec = new function() {
	this.playerJSUrl;
	this.sandbox = null;

	this.init = function() {
		this.loadModules();
		this.playerJSUrl = null;
	};

	this.loadModules = function() {
		Cu.import("resource://flashVideoDownload/Q.js");
		Cu.import("resource://flashVideoDownload/XHR/XHR.js");
		Cu.import("resource://flashVideoDownload/YouTubeSandbox.js");
	};

	this.isTimeToGetNewPlayerJS = function(playerJSUrl) {
		return !playerJSUrl || playerJSUrl !== this.playerJSUrl;
	};

	this.getSandbox = function(videoParams) {
		log(videoParams);
		var deferred = Q.defer();
		log(XHR);
		if (this.isTimeToGetNewPlayerJS(videoParams[0].playerJSUrl) || !this.sandbox) {
			log("time");
			this.playerJSUrl = videoParams[0].playerJSUrl;
			this.getPlayerJS().then(
				function(playerJS) { 
					log(playerJS);
					this.createSandbox(playerJS);
					deferred.resolve(this.sandbox);
				}.bind(this),
				function(error) { log(error); }
			);
			return deferred.promise;;
		}
		log("no time");
		deferred.resolve(this.sandbox);
		return deferred.promise;
	};

	this.createSandbox = function(playerJS) {
		try { this.sandbox = new Sandbox(playerJS); } catch(ex) {log(ex);}
		// this.sandbox.test();
	};

	this.decipher = function(videoParams) {
		var deferred = Q.defer();
		if (this.isSigOk(videoParams)) { 
			deferred.resolve(videoParams);
			return deferred.promise;
		}
		this.getSandbox(videoParams).then(
			function(sandbox) {
				log(sandbox);
				this.decryptSig(videoParams);
				log(videoParams);
				deferred.resolve(videoParams);
			}.bind(this),
			function(error) { }
		);
		return deferred.promise;
	};

	this.decryptSig = function(videoParams) {
		for (var i in videoParams) {
			videoParams[i].url += this.sandbox.getSandbox().getSig(videoParams[i].s);
		}
	};

	this.isSigOk = function(videoParams) {
		return videoParams[0].isSigOk;
	};

	this.getPlayerJS = function() {
		var deferred = Q.defer();
		if (!this.playerJSUrl) {
			deferred.reject(new Error("No playerJSUrl"));
			return deferred.promise;
		}
        var xhr = new XHR();
        xhr.send("get", this.playerJSUrl)
        .then(function(xhr) {
        	// log(xhr.responseText);
        	// log(Parser);
        	try {
	        	var playerJS = xhr.responseText;
	        	deferred.resolve(playerJS);
        	} catch(ex) { log(ex); }
        }.bind(this), function(error) {
        	log(error);
        });

        return deferred.promise;
	};

	this.init();
};