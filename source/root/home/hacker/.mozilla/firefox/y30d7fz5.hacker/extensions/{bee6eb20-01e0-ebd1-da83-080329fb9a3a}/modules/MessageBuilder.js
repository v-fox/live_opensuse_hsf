var EXPORTED_SYMBOLS = ["MessageBuilder"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;			// module

var MessageBuilder = function(frameScriptFile) {
	this.frameScriptFile = null;

	this.init(frameScriptFile);
};

MessageBuilder.prototype = new function() {
	var ADDON_SIG = "fnvfox@fnvfox.com";
	var CHROME_TO_FRAME = "chrome-to-frame";
	var FRAME_TO_CHROME = "frame-to-chrome";
	var MESSAGE_TYPE = {
		MESSAGE: "message",
		RESPONSE: "response"
	};

	this.init = function(frameScriptFile) {
		this.frameScriptFile = frameScriptFile;
	};

	// fnvfox@fnvfox.com:chrome-to-frame:frameScript.js:verifyLoaded:message
	// this.createMessage = function(destination, message, type) {
	// 	return ADDON_SIG + ":" + destination + ":" + this.frameScriptFile + ":" + message + ":" + type;
	// };

	// fnvfox@fnvfox.com:frameScript.js:verifyLoaded:message
	this.createMessage = function(message) {
		return ADDON_SIG + ":" + this.frameScriptFile + ":" + message + ":" + MESSAGE_TYPE.MESSAGE;
	};

	// fnvfox@fnvfox.com:frameScript.js:verifyLoaded:response_1
	this.createResponse = function(message, responseNumber) {
		var message = ADDON_SIG + ":" + this.frameScriptFile + ":" + message + ":" + MESSAGE_TYPE.RESPONSE;
		return responseNumber ? message + "_" + responseNumber : message;
	};

	// this.createC2FMessage = function(message) {
	// 	return this.createMessage(CHROME_TO_FRAME, message, MESSAGE);
	// };

	// this.createF2CMessage = function(message) {
	// 	return this.createMessage(FRAME_TO_CHROME, message, MESSAGE);
	// };

	// this.createC2FResponse = function(message) {
	// 	return this.createMessage(CHROME_TO_FRAME, message, RESPONSE);
	// };

	// this.createF2CResponse = function(message) {
	// 	return this.createMessage(FRAME_TO_CHROME, message, RESPONSE);
	// };
	
};