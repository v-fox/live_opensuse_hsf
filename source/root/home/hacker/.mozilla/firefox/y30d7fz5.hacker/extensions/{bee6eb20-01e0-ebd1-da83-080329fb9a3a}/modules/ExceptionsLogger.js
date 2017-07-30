var EXPORTED_SYMBOLS = ["ExceptionsLogger"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/DebugSettings.js");
Cu.import("resource://flashVideoDownload/StackTrace/StackTrace.js");

var log;			// module
var DebugSettings;	// module
var StackTrace; 	// module

var ExceptionsLogger = new function() {
	const DEFAULT_SEVERITY_LEVEL_FOR_LOGS = 2;	// the default severity level a logged message gets if not defined otherwise

	this.minSeverityLevel = null; // 3 - very severe; 2 - severe; 1 - not severe

	this.init = function() {
		this.setMinSeverityLevel(DebugSettings.ExceptionsLoggerMinSeverityLevel);	// will only log errors with severe level 2
	};

	// re-throws any caught exceptions with the add-on's special message
	// this.throw = function(filename, exceptionMessage) {
	// 	if (!DebugSettings.IsDebugOn) { return; }
	// 	log("'fnvfox' exception thrown in '" + filename + "', exception message: " + exceptionMessage);
	// };

	// logs problematic issues with the add-on's special message
	// this.log = function(filename, issueMessage) {
	// 	if (!DebugSettings.IsDebugOn) { return; }
	// 	log("'fnvfox' issue in '" + filename + "'\r\nissue message: " + issueMessage);
	// };

	this.error = function(filename, errorMessage, severityLevel, isIncludeErrorObj) {
		if (!DebugSettings.IsDebugOn) { return; }

		severityLevel = severityLevel || DEFAULT_SEVERITY_LEVEL_FOR_LOGS;
		if (severityLevel < this.minSeverityLevel) { return; }
		var error = new Error(errorMessage);
		log("'fnvfox' error in: '" + filename + "'\r\nError message: " + errorMessage + "\r\nStack trace:\r\n" + StackTrace.rearrangeStackTrace(error.stack));
		if (isIncludeErrorObj) { log(error); }
	};

	this.setMinSeverityLevel = function(value) {
		this.minSeverityLevel = value;
	};

	this.init();
};