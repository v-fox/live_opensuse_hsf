var EXPORTED_SYMBOLS = ["Sandbox"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

// modules
var log;
var WM;

var Sandbox = function(playerJSRaw) {
	var self = this;
	
	this.win = null;
	this.data = null;
	this.sandbox = null;
	this.playerJSRaw = null;
	this.playerJSMod = null
	this.sigFunctions = null;

	this.init = function(playerJSRaw) {
		this.loadModules();
		this.win = WM.getWin();
		if (!playerJSRaw) {
			throw "fnvfox 'playerJSRaw' undefined";
		}
		this.playerJSRaw = playerJSRaw;

		this.createSigFunctions();
		this.setPlayerJSMod();
		this.setSandbox();
		log(this);
		this.evalInSandbox();
	};

	this.loadModules = function() {
		Cu.import("resource://flashVideoDownload/WM.js");
	};

	this.getSandbox = function() { return this.sandbox; }

	this.setSandbox = function() {
		var options = { sandboxPrototype: this.win };
		this.sandbox = new Components.utils.Sandbox(this.win, options);
		log(this.sandbox);
	};

	this.createGetSigFunc = function() {
		var sigMainFuncName = this.getSigMainFuncName() || null;
		if (!sigMainFuncName) { return ""; }
		return 'getSig = function(sig) { return ' + sigMainFuncName + '(sig); };';
	};

	this.getLastIndexOfYtPlayer = function() {
		return this.playerJSRaw.lastIndexOf('})(_yt_player);');
	};

	this.setPlayerJSMod = function() {
		var getSigFunc = this.createGetSigFunc();
		var ytPlayerIndex = this.getLastIndexOfYtPlayer();
		if (ytPlayerIndex === -1) { 
			this.playerJSMod = null;
			return;
		}
		this.playerJSMod = this.stringSplice(this.playerJSRaw, ytPlayerIndex, 0, getSigFunc);
	};

	this.evalInSandbox = function() {
		if (this.playerJSMod === null) { 
			throw "fnxfox error - playerJSMod not found, probably index not found";
		}
		Components.utils.evalInSandbox(this.playerJSMod, this.sandbox);
	};

	this.createSigFunctions = function() {
		this.sigFunctions = [];
		this.sigFunctions.push(function(playerJS) {
			return /c *&& *\( *[a-zA-Z_$].signature *= *([^(^ ]*)/.exec(playerJS);
		});

		this.sigFunctions.push(function(playerJS) {
			return /c\s*&&\s*[a-zA-Z_$].set\("signature"\s*,\s*([^(^ ]*)/.exec(playerJS);
		});
	};

	this.stringSplice = function(srcStr, idx, rem, strToInsert) {
	    return (srcStr.slice(0, idx) + strToInsert + srcStr.slice(idx + Math.abs(rem)));
	};	

	this.getSigMainFuncName = function() {
		var funcName = null;
		for (var i in this.sigFunctions) {
			funcName = this.sigFunctions[i](this.playerJSRaw);
			if (funcName) { return funcName[1]; }
		}
		return null;
	};

	// this.getRearrangedPlayerJS = function(playerJSContent) {		
	// 	playerJSContent = playerJSContent.replace(/(\r\n|\n|\r)/gm,"");	// removes new lines
	// 	return /\(function\(\) *\{(.*) *\} *\) *\( *\) *;/.exec(playerJSContent)[1];
	// };	

	this.init(playerJSRaw);
};