var EXPORTED_SYMBOLS = ["DebugSettings"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

var DebugSettings = new function() {
	const IS_DEBUG_ON = false;
	const MIN_SEVERITY_LEVEL = 2;	// 3 - very severe; 2 - severe; 1 - not severe
	const DEFAULT_SEVERITY_LEVEL = 2;	// the default severity level that's required for the error to get logged in the console

	Object.defineProperty(this, "IsDebugOn", { 
		get: function() { return IS_DEBUG_ON; }
	});

	Object.defineProperty(this, "MinSeverityLevel", { 
		get: function() { return MIN_SEVERITY_LEVEL; }
	});

	Object.defineProperty(this, "DefaultSeverityLevel", { 
		get: function() { return DEFAULT_SEVERITY_LEVEL; }
	});
};