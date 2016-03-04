var EXPORTED_SYMBOLS = ["SigDec"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");	// for logging purposes only

var SigDec = new function(videoParams, dataAsJSON, doc) {
	var self = this;

	this.videoParams = null;
	this.isJSON = null;
	this.doc = null;
	this.win = null;
	this.data = null;
	this.sandbox = null;
	this.playerJSUrl = null;
	this.sigFunctions = null;

	this.init = function(videoParams, dataAsJSON, doc) {
		this.createSigFunctions();
		this.videoParams = videoParams;
		this.doc = doc;
		this.win = this.getWin();
		MediaFile.log("l22");
		MediaFile.log(this.win);
		// this.setSandbox();
		if (!videoParams.innerHTML && dataAsJSON) { 
			this.isJSON = true;
			this.data = this.getParsedJSON(dataAsJSON);
		}
		else { this.isJSON = false; }
	};

	this.setSandbox = function() {		
		var options = { sandboxPrototype: this.win };
		// if (this.sandbox && this.sandbox.hasOwnProperty("getSig")) { return; }
		this.sandbox = new Components.utils.Sandbox(this.win, options);
		// set dummy globals - to prevent yt code from throwing exceptions
    	// this.sandbox.window = this.win;
    	// this.sandbox.document = this.win.document;
    	// this.sandbox.document.body = this.sandbox.document.body || this.win.document.createElement("body");
    	// this.sandbox.navigator = this.win.navigator;
    	// this.sandbox.console = this.win.console;
    	// get deciphered sig function
    	// this.sandbox.getSig = null;
	};

	this.getParsedJSON = function(dataAsJSON) {
		return this.win.JSON.parse(dataAsJSON);
	};

	this.getPlayerJSUrl = function() {
		if (!this.videoParams) { return false; }
		if (this.isJSON) {
			return this.getPlayerJSUrlFromJSON();
		}
		return this.getPlayerJSUrlFromInnerHTML();
	};

	this.getPlayerJSUrlFromJSON = function() {
		if (!this.data) { return false; }
		return "http:" + this.data[1].data.swfcfg.assets.js;
	};

	this.getPlayerJSUrlFromInnerHTML = function() {
		var assets = /"assets" *: *([^}]*})/.exec(this.videoParams);
		if (!assets) { return false; }
		assets = JSON.parse(assets[1]);
		return assets.js;
	};

	this.isPlayerJSUrlsEqual = function(newPlayerJSUrl) {
		return this.playerJSUrl === newPlayerJSUrl;
	};

	this.decipher = function(videoFilesList, callback) {
		var playerJSUrl = this.getPlayerJSUrl();
		if (this.sandbox && this.sandbox.hasOwnProperty("getSig") && this.isPlayerJSUrlsEqual(playerJSUrl)) {
			for (var i in videoFilesList) {
				var decSig = this.sandbox.getSig(videoFilesList[i].s);
				videoFilesList[i].url += decSig;
			}
			MediaFile.log("decipher 1");
			callback();
		} else {
			MediaFile.log("decipher 2");
			this.playerJSUrl = playerJSUrl;
			this.setSandbox();
			this.getPlayerJSViaAjax(videoFilesList, callback);
		}
	};

	this.getPlayerJSViaAjax = function(videoFilesList, callback) {
	    var url = this.playerJSUrl;
	    // url = "http://localhost/test.js";
	    var ajaxRequest = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest);
	    ajaxRequest.open('GET', url, true);
	    MediaFile.log("url is:1");MediaFile.log(url);
	    ajaxRequest.setRequestHeader('Cache-Control', 'no-cache');
	    ajaxRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
	    
	    ajaxRequest.onreadystatechange = function() {
	        try {
	            if (this.readyState == 4 && this.status == 200) {
	            	// var rearranged = self.getRearrangedPlayerJS(this.responseText);
	            	// rearranged += 'sigResult = yq("F85F85138516DC69AABF3831BE8FA1170A70AD7848E5.B209456073058D5842AA68CC31B92655A7F6F4A8");';	            	
	            	// self.writeToFile(rearranged);
	            	MediaFile.log(this.responseText);
	            	var sigMainFuncName = self.getSigMainFuncName(this.responseText);
	            	// var strToInsert = 'sigResult = ' + sigMainFuncName + '("' + sig + '");';
	            	var strToInsert = 'getSig = function(sig) { return ' + sigMainFuncName + '(sig); };';
	            	var idx = this.responseText.lastIndexOf('})(_yt_player);');
	            	var rearranged = self.stringSplice(this.responseText, idx, 0, strToInsert);
	            	Components.utils.evalInSandbox(rearranged, self.sandbox);
	            	// MediaFile.log(this.responseText);
	            	// MediaFile.log(self.getSigMainFuncName(this.responseText));
	            	// MediaFile.log(self.sandbox);
	            	// MediaFile.log("86");
	            	// MediaFile.log(self.sandbox.sigResult);
	            	// MediaFile.log("indeside getPlayer: " + self.sandbox.getSig(sig));
	            	MediaFile.log(videoFilesList);
					for (var i in videoFilesList) {
						var decSig = self.sandbox.getSig(videoFilesList[i].s);
						videoFilesList[i].url += decSig;
					}
					callback();
	            	// callback(self.sandbox.getSig(sig));
	            }
	        } 
	        catch(ex) { MediaFile.log(ex); }
	    }
	    ajaxRequest.send(null);		
	};

	this.createSigFunctions = function() {
		this.sigFunctions = [];
		this.sigFunctions.push(function(playerJSContent) {
			return /c *&& *\( *[a-zA-Z_$].signature *= *([^(^ ]*)/.exec(playerJSContent);
		});

		this.sigFunctions.push(function(playerJSContent) {
			return /c\s*&&\s*[a-zA-Z_$].set\("signature"\s*,\s*([^(^ ]*)/.exec(playerJSContent);
		});
	};

	this.stringSplice = function(srcStr, idx, rem, strToInsert) {
	    return (srcStr.slice(0, idx) + strToInsert + srcStr.slice(idx + Math.abs(rem)));
	};	

	this.getSigMainFuncName = function(playerJSContent) {
		var funcName = null;
		for (var i in this.sigFunctions) {
			funcName = this.sigFunctions[i](playerJSContent);
			if (funcName) { return funcName[1]; }
		}
	};

	this.getRearrangedPlayerJS = function(playerJSContent) {		
		playerJSContent = playerJSContent.replace(/(\r\n|\n|\r)/gm,"");	// removes new lines
		return /\(function\(\) *\{(.*) *\} *\) *\( *\) *;/.exec(playerJSContent)[1];
	};	

	this.getWin = function() {
		return Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow(null);
	};

	// this.init(videoParams, dataAsJSON, doc);
};