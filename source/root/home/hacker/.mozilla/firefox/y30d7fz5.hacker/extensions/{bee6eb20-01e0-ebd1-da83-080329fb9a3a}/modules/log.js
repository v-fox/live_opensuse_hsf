var EXPORTED_SYMBOLS = ["log", "logt", "logtr", "err"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://flashVideoDownload/WM.js");
Cu.import("resource://flashVideoDownload/DebugSettings.js");
Cu.import("resource://flashVideoDownload/StackTrace/StackTrace.js");

var WM;				// module
var DebugSettings;	// module
var StackTrace;		// module

var log = console.log;

var logtr = function(message) {
	logt(message, StackTrace.TRACE_LEVEL.ALL);
};

var logt = function(message, traceLevel) {
	var WHITESPACES = 10;
	if (!DebugSettings.IsDebugOn) { return; }

	traceLevel = traceLevel || StackTrace.TRACE_LEVEL.TOP_ONLY;

	var error = new Error(message);
	var stackTrace = StackTrace.rearrangeStackTrace(error.stack, traceLevel, true);
	if (traceLevel === StackTrace.TRACE_LEVEL.TOP_ONLY) {
		stackTrace = addWhitespacesToBeginningOfString(stackTrace, WHITESPACES);
	}
	if (traceLevel === StackTrace.TRACE_LEVEL.ALL) {
		stackTrace = "\r\n" + stackTrace;
	}
	log(message, stackTrace);
};

var err = function(message, severityLevel, traceLevel, isIncludeErrorObj) {
	if (!DebugSettings.IsDebugOn) { return; }

	severityLevel = severityLevel || DebugSettings.DefaultSeverityLevel;
	traceLevel = traceLevel || StackTrace.TRACE_LEVEL.ALL;
	if (severityLevel < DebugSettings.MinSeverityLevel) { return; }

	log(message);
	var error = message;
	var isRemoveTopOfStackLine = true;
	if (!message.hasOwnProperty("message")) { // not an error object
		error = new Error(message);
		// log(message);
	} else {
		message = message.message; // an "Error" object
		isRemoveTopOfStackLine = false;
	}

	// log(error);
	var formattedMessage = formatErrorMessage(message, error, traceLevel);
	log(formattedMessage);
	if (isIncludeErrorObj) { log(error); }
};

var formatErrorMessage = function(message, error, traceLevel, isRemoveTopOfStackLine) {
	var formattedMessage = [];
	formattedMessage.push("'fnvfox' Error!\r\n");
	formattedMessage.push(message);
	formattedMessage.push("\r\n\r\n");
	formattedMessage.push(StackTrace.rearrangeStackTrace(error.stack, traceLevel, isRemoveTopOfStackLine));

	return formattedMessage;
};

var addWhitespacesToBeginningOfString = function(message, numOfWhitespaces) {
	var whitespaces = "";
	for (var i = 0; i < numOfWhitespaces; i++) {
		whitespaces += "\u0020";
	}

	return whitespaces + message;
};

// disables all functions
if (!DebugSettings.IsDebugOn) {
	var disabled = function() {};
	log = disabled;
	logt = disabled;
	logtr = disabled;
	err = disabled;
	formatErrorMessage = disabled;
	addWhitespacesToBeginningOfString = disabled;
}