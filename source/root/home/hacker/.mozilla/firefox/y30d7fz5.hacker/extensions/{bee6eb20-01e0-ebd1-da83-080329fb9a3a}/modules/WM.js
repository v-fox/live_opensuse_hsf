var EXPORTED_SYMBOLS = ["WM"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

var WM = new function() {
	var self = this;

	this.WEBCONSOLE_XUL_FILENAME = "webconsole.xul";

	this.init = function() {};

	this.getWin = function() {
		var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
			.getService(Ci.nsIWindowMediator);
		var recentWin = wm.getMostRecentWindow("navigator:browser");

		if (this.getWinXulFilename(recentWin) !== this.WEBCONSOLE_XUL_FILENAME) {			
			return recentWin;
		}
		
		var enumerator = wm.getEnumerator(null);
		while (enumerator.hasMoreElements()) {
			var win = enumerator.getNext();
			if (win && this.getWinXulFilename(win) !== this.WEBCONSOLE_XUL_FILENAME) {
				return win;
			}
		}

		return null;
	};

	this.getWinXulFilename = function(win) {
		var xulFilename = win.location.href.split("/");
		xulFilename = xulFilename[xulFilename.length - 1];
		return xulFilename;
	};

    this.getTabForBrowser = function(browser, window) {
    	if (!browser) { return null; }
    	window = window || this.getWin();
		var gBrowser = window.gBrowser;
		if (gBrowser.getTabForBrowser) {
			return gBrowser.getTabForBrowser(browser);
		}
		if (gBrowser._tabForBrowser) {
			return gBrowser._tabForBrowser.get(browser);
		}

		return this._getTabForBrowser(browser);
    };

    this._getTabForBrowser = function(browser, window) {
    	window = window || this.getWin();
		var gBrowser = window.gBrowser;
		    	
		var mTabs = gBrowser.mTabContainer.childNodes;
		for (var i in mTabs) {
			var mTab = mTabs[i];
			if (mTab.linkedBrowser === browser) {
				return mTab;
			}
		}
		return null;
    };

	Object.defineProperty(this, "gBrowser", { get: function() { return this.getWin().gBrowser; } });

	this.init();
};