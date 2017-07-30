var EXPORTED_SYMBOLS = ["ChromeFrameScriptManager"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/WM.js");
Cu.import("resource://flashVideoDownload/MessageBuilder.js");
Cu.import("resource://flashVideoDownload/URLVerifier.js");

var log;			// module
var WM;				// module
var MessageBuilder; // module
var URLVerifier; 	// module

var ChromeFrameScriptManager = function(params) {
	this.tabsListener = null;
	this.window = null;
	this.frameScripts = null;

	this.init(params);
};

ChromeFrameScriptManager.prototype = new function() {
	var FRAME_SCRIPTS_BASE_URL = "chrome://flashVideoDownload/content/frameScripts/";

	this.init = function(params) {
		this.window = params.window;
		this.frameScripts = [];

		this.loadFFModules();
		this.setTabsListener();
	};

	this.loadFFModules = function() {
		Cu.import("resource://gre/modules/XPCOMUtils.jsm");
	};

	this.addFrameScript = function(frameScript) {
		this.frameScripts.push({
			url: FRAME_SCRIPTS_BASE_URL + frameScript.filename,
			filename: frameScript.filename,
			loadOnDomain: frameScript.loadOnDomain,
			messageListener: frameScript.messageListener
		});
	};

	this.setTabsListener = function() {
		this.tabsListener = {
		    onStateChange: function(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {}.bind(this),
		    onLocationChange: function(aBrowser, aWebProgress, aRequest, aLocation, aFlags) {
		    	try {
			    	log("onLocationChange - ChromeFrameScriptManager");
			    	var isSameDoc = (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) === 1;
			    	log(aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT);
			    	log(aBrowser.messageManager);
			    	log(isSameDoc);
			    	var url = aLocation.spec;
			    	log(url);			    	
			    	var domain = aLocation.host;
			    	if (!URLVerifier.isHttpUrl(url)) { return; }

			    	var browserMM = aBrowser.messageManager;
			    	var locationChangedTab = WM.getTabForBrowser(aBrowser, this.window);
			    	this.loadAllFrameScripts(browserMM, locationChangedTab, {
						url: url,
						domain: domain,
						isSameDoc: isSameDoc
					});
		    	} catch(ex) { } // aLocation.host - might fail for blank pages and such..
		    }.bind(this),
		    onProgressChange: function(aBrowser, aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {}.bind(this),
		    onStatusChange: function(aBrowser, aWebProgress, aRequest, aStatus, aMessage) {}.bind(this),
		    onSecurityChange: function(aBrowser, aWebProgress, aRequest, aState) {}.bind(this),
		    // onRefreshAttempted: function(aBrowser, aWebProgress, aRefreshURI, aMillis, aSameURI) {}.bind(this), - CAUSES A HUGE BUG!
		    onLinkIconAvailable: function(aBrowser) {}.bind(this),

		    QueryInterface: XPCOMUtils.generateQI([
		    	"nsIWebProgressListener", 
		    	"nsISupportsWeakReference"
		    ])
		};

		this.window.gBrowser.addTabsProgressListener(this.tabsListener);
	};

	this.shutdown = function() {
		this.window.gBrowser.removeTabsProgressListener(this.tabsListener);
		log("ChromeFrameScriptManager TabsProgressListener removed");
	};

	this.loadAllFrameScripts = function(browserMM, tab, data) {
		log(this.frameScripts);
		for (var i in this.frameScripts) {
			var frameScript = this.frameScripts[i];
			if (!frameScript.loadOnDomain) {	// will load on all domains
				this.loadFrameScript(frameScript, browserMM, tab, data);
			} else if(data.domain.indexOf(frameScript.loadOnDomain) != -1) {
				this.loadFrameScript(frameScript, browserMM, tab, data);
			}
		}
	};

	this.loadFrameScript = function(frameScript, browserMM, tab, data) {
		var messageBuilder = new MessageBuilder(frameScript.filename);
		if (tab.fnvfox_frameScripts && tab.fnvfox_frameScripts[frameScript.url]) { 
			log("already loaded");
			log("chrome script onLocationChange");
			browserMM.sendAsyncMessage(messageBuilder.createMessage("onLocationChange"), data);
			return;
		}
		browserMM.addMessageListener(messageBuilder.createMessage("frameScriptMessage"), function(message) {
			frameScript.messageListener(message, tab, browserMM, messageBuilder);
		});
		browserMM.loadFrameScript(frameScript.url, true);

		var verifyLoadedListener = function(message) {
			log("86");
		    log(message.data.msg);
		    log(message);
		    tab.fnvfox_frameScripts = tab.fnvfox_frameScripts ? tab.fnvfox_frameScripts : [];
		    tab.fnvfox_frameScripts[frameScript.url] = true;
		    browserMM.removeMessageListener(message.name, verifyLoadedListener);
		    browserMM.sendAsyncMessage(messageBuilder.createMessage("onLocationChange"), data);
		};

		// fnvfox@fnvfox.com:frameScript.js:verifyLoaded:message
		browserMM.sendAsyncMessage(messageBuilder.createMessage("verifyLoaded"));

		// fnvfox@fnvfox.com:frameScript.js:verifyLoaded:response
		browserMM.addMessageListener(messageBuilder.createResponse("verifyLoaded"), verifyLoadedListener);
	};
};