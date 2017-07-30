var EXPORTED_SYMBOLS = ["ContentFrameScriptManager"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/MessageBuilder.js");

var MessageBuilder;	// module

var ContentFrameScriptManager = function(contentFrameMM, frameScriptFilename, frameScriptId) {
	this.frameScriptId = null;
	this.eventListeners = null;
	this.masterEventListenersWrappers = null;
	this.messageBuilder = null;
	this.mm = null; // Content Frame Message Manager
	this.firstRun = true;

	this.init(contentFrameMM, frameScriptFilename, frameScriptId);
};

ContentFrameScriptManager.EVENT_TYPE = {
	WINDOW_LOAD: "load",
	DOCUMENT_DOM_CONTENT_LOADED: "DOMContentLoaded",
	DOM_WINDOW_CREATED: "DOMWindowCreated",
	ON_LOCATION_CHANGE: "onLocationChange"
};

ContentFrameScriptManager.prototype = new function() {
	this.EVENT_TYPE = ContentFrameScriptManager.EVENT_TYPE;

	this.init = function(contentFrameMM, frameScriptFilename, frameScriptId) {
		this.frameScriptId = frameScriptId || null;
		this.mm = contentFrameMM;
		// log("running init");
		// this.loadModules();
		this.initEventListeners();
		this.initMasterEventListenersWrappers();
		this.messageBuilder = new MessageBuilder(frameScriptFilename);
		// this.console.log(this.messageBuilder);
		this.setVerifyLoadedMessaging();
		this.setOnLocationChangeMessaging();
		this.setAllEventListeners();
	};	

	this.initEventListeners = function() {
		this.eventListeners = {
			load: [],
			DOMContentLoaded: [],
			DOMWindowCreated: [],
			onLocationChange: []
		};
	};

	this.initMasterEventListenersWrappers = function() {
		this.masterEventListenersWrappers = {
			load: function(event) {
				for (var i in this.eventListeners.load) {
					var func = this.eventListeners.load[i];
					if (typeof func === "function") { func(event); }
				}
			}.bind(this),
			DOMContentLoaded: function(event) {
				for (var i in this.eventListeners.DOMContentLoaded) {
					var func = this.eventListeners.DOMContentLoaded[i];
					if (typeof func === "function") { func(event); }
				}
			}.bind(this),
			DOMWindowCreated: function(event) {
				for (var i in this.eventListeners.DOMWindowCreated) {
					var func = this.eventListeners.DOMWindowCreated[i];
					if (typeof func === "function") { func(event); }
				}
			}.bind(this),
			onLocationChange: function(event) {
				for (var i in this.eventListeners.onLocationChange) {
					var func = this.eventListeners.onLocationChange[i];
					if (typeof func === "function") { func(event); }
				}				
			}.bind(this)
		};
	};

	this.loadModules = function() {
		var moduleContainer = {};
		Cu.import("resource://flashVideoDownload/MessageBuilder.js", moduleContainer);
		MessageBuilder = moduleContainer.MessageBuilder;
	};

	this.unloadModules = function() {
		Cu.unload("resource://flashVideoDownload/MessageBuilder.js");
	};

	this.setAllEventListeners = function(message) {
		var messageDataUrl = message ? message.data.url : null;
		this.setDOMContentLoadedEventListener();
		this.setWindowLoadEventListener();
		this.setDOMWindowCreatedEventListener(messageDataUrl, false);		
	};

	this.setVerifyLoadedMessaging = function() {
		// log("running test");
		var verifyLoadedListener = function(message) { 
			this.mm.sendAsyncMessage(
				this.messageBuilder.createResponse("verifyLoaded"), { 
					msg: "frameScript successfully loaded"
				}
			);
			this.mm.removeMessageListener(message.name, verifyLoadedListener);
		};
		this.mm.addMessageListener(this.messageBuilder.createMessage("verifyLoaded"), verifyLoadedListener.bind(this));
	};

	this.setOnLocationChangeMessaging = function() {
		this.mm.addMessageListener(this.messageBuilder.createMessage("onLocationChange"), function(message) {
			if (this.firstRun) {
				this.firstRun = false;
				return;
			}
			// var messageDataUrl = message ? message.data.url : null;
			// var messageDataDomain = message ? message.data.domain : null;
			// log("frame script onLocationChange");
			// log(this);
			this.masterEventListenersWrappers.onLocationChange(message.data || {});
			this.setAllEventListeners(message);
		}.bind(this));
	};

	this.setWindowLoadEventListener = function() {
		this.mm.content.removeEventListener(
			"load",
			this.masterEventListenersWrappers.load
		);
		this.mm.content.addEventListener(
			"load", 
			this.masterEventListenersWrappers.load, 
			false
		);
	};

	this.setDOMContentLoadedEventListener = function() {
		this.mm.content.document.removeEventListener(
			"DOMContentLoaded",
			this.masterEventListenersWrappers.DOMContentLoaded
		);
		this.mm.content.document.addEventListener(
			"DOMContentLoaded", 
			this.masterEventListenersWrappers.DOMContentLoaded, 
			false
		);
	};

	this.setDOMWindowCreatedEventListener = function(onLocationChangeUrl, includeIframes) {
		// didn't implement "includeIframes" functionality
		this.mm.removeEventListener(
			"DOMWindowCreated",
			this.masterEventListenersWrappers.DOMWindowCreated
		);
		this.mm.addEventListener(
			"DOMWindowCreated", 
			this.masterEventListenersWrappers.DOMWindowCreated, 
			false
		);
	};

	this.addEventListener = function(eventType, func) {
		if (eventType === this.EVENT_TYPE.WINDOW_LOAD) {
			this.eventListeners.load.push(func);
		} else if (eventType === this.EVENT_TYPE.DOCUMENT_DOM_CONTENT_LOADED) {
			this.eventListeners.DOMContentLoaded.push(func);
		} else if (eventType === this.EVENT_TYPE.DOM_WINDOW_CREATED) {
			this.eventListeners.DOMWindowCreated.push(func);
		} else if (eventType === this.EVENT_TYPE.ON_LOCATION_CHANGE) {
			this.eventListeners.onLocationChange.push(func);
		}
	};

	this.sendAsyncMessage = function(data) {
		this.mm.sendAsyncMessage(this.messageBuilder.createMessage("frameScriptMessage"), data);
	};

	this.sendAsyncResponse = function(data, responseNumber) {
		this.mm.sendAsyncMessage(this.messageBuilder.createResponse("frameScriptMessage", responseNumber), data);
	};
};