var EXPORTED_SYMBOLS = ["StackTrace"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/StackTrace/StackTraceLine.js");

var StackTraceLine; // module

var StackTrace = new function() {
	this.TRACE_LEVEL = {
		TOP_ONLY: "top",
		BOTTOM_ONLY: "bottom",
		ALL: "all"
	};

	this.rearrangeStackTrace = function(stackTrace, traceLevel, isRemoveTopOfStackLine) {
		traceLevel = traceLevel || this.TRACE_LEVEL.ALL;
		// log(stackTrace);
		stackTrace = stackTrace.split("\n");
		if (isRemoveTopOfStackLine) { stackTrace.splice(0,1); } // the top of the stack is this file - no need to display it
		var rearrangedStackTrace = [];
		for (var i in stackTrace) {
			if (!stackTrace[i]) { continue; }
			rearrangedStackTrace.push(new StackTraceLine(stackTrace[i]));
		}

		var numOfWhitespacesNeeded = this.getNumOfWhitespacesNeeded(rearrangedStackTrace);
		for (var i in rearrangedStackTrace) {
			var numOfWhitespaces = numOfWhitespacesNeeded - rearrangedStackTrace[i].getFunctionNameLength();
			rearrangedStackTrace[i].setWhitespaces(numOfWhitespaces);
		}
		// log(rearrangedStackTrace);
		if (traceLevel === this.TRACE_LEVEL.TOP_ONLY) {
			return rearrangedStackTrace[0].toString();
		}
		if (traceLevel === this.TRACE_LEVEL.BOTTOM_ONLY) {
			return rearrangedStackTrace[rearrangedStackTrace.length-1].toString();
		}
		if (traceLevel === this.TRACE_LEVEL.ALL) {
			return rearrangedStackTrace.join("\r\n");
		}

		return "";
	};

	this.getNumOfWhitespacesNeeded = function(stackTraceLineList) {
		var WHITESPACES = 5;
		var longest = 0;
		for (var i in stackTraceLineList) {
			var functionNameLength = stackTraceLineList[i].getFunctionNameLength();
			if (functionNameLength > longest) {
				longest = functionNameLength;
			}
		}
		return longest + WHITESPACES;
	};
};

function log(logInfo) {
	if (this.hasOwnProperty("console")) {
		console.log(logInfo);
		return; 
	}
	var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
		.getService(Ci.nsIWindowMediator)
		.getMostRecentWindow(null);
	wm.console.log(logInfo);
};