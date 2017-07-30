var EXPORTED_SYMBOLS = ["StackTraceLine"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

var StackTraceLine = function(rawTraceLine) {
	this.functionName = null;
	this.filename = null;
	this.lineNumber = null;
	this.columnNumber = null;
	this.whitespaces = null;

	this.init(rawTraceLine);
};

StackTraceLine.prototype.init = function(rawTraceLine) {
	this.generate(rawTraceLine);
};

StackTraceLine.prototype.toString = function() {
	var str = this.functionName + "{{whitespaces}}" + this.filename + ":" + this.lineNumber;
	if (!this.whitespaces) { return str; }

	return str.replace("{{whitespaces}}", this.whitespaces);
};

StackTraceLine.prototype.toStringWithColumn = function() {
	return this.functionName + "{{whitespaces}}" + this.filename + ":" + this.lineNumber + "(" + this.columnNumber + ")";
};

StackTraceLine.prototype.generate = function(rawTraceLine) {
	rawTraceLine = this.cleanRawTraceLine(rawTraceLine);

	this.functionName = "{global}";
	var pos = rawTraceLine.indexOf("@");
	if (pos > 0 ) { 
		this.functionName = rawTraceLine.substr(0, pos);
	}
	pos = rawTraceLine.lastIndexOf("/") + 1;
	var filename = rawTraceLine.substr(pos);
	filename = filename.split(":");
	this.filename = filename[0];
	this.lineNumber = filename[1];
	this.columnNumber = filename[2];
};

StackTraceLine.prototype.getFunctionNameLength = function() {
	return this.functionName.length;
};

StackTraceLine.prototype.cleanRawTraceLine = function(rawTraceLine) {
	// rawTraceLine = rawTraceLine.replace("prototype</", "prototype<");
	// rawTraceLine = rawTraceLine.replace("prototype<", "prototype");
	rawTraceLine = rawTraceLine.replace("flashVideoDownload</", "");
	rawTraceLine = rawTraceLine.replace("flashVideoDownload<", "");
	return rawTraceLine.replace("EventListener.handleEvent", "Event");	
};

StackTraceLine.prototype.setWhitespaces = function(numOfWhitespaces) {
	this.whitespaces = "";
	for (var i = 0; i < numOfWhitespaces; i++) {
		this.whitespaces += "\u0020";
	}
};