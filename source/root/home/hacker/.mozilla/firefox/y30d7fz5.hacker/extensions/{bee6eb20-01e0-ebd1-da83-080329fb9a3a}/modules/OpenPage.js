var EXPORTED_SYMBOLS = ["OpenPage"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource://flashVideoDownload/PrefManager.js");
Cu.import("resource://flashVideoDownload/WM.js");

var log;            // module
var WM;             // module
var PrefManager;    // module
var AddonManager;   // firefox module

var OpenPage = new function() {
	var self = this;

	this.ADDON_ID 				= "{bee6eb20-01e0-ebd1-da83-080329fb9a3a}";
    this.TY_PAGE                = "thankyou.html";
    this.DOMAIN_NAME			= "http://fnvfox.appspot.com/";
    this.TY_PAGE_FULL_PATH		= "";

	this.init = function() {
		this.setTYPage();
	};

    this.setTYPage = function() {
        this.TY_PAGE_FULL_PATH = this.DOMAIN_NAME + this.TY_PAGE;
    };	

	this.checkVer = function() {
		AddonManager.getAddonByID(this.ADDON_ID, function(addon) {
			if (!addon) { 
				err("'addon' is null - 'this.ADDON_ID' not found"); 
				return;
			}
			var lastVersion = PrefManager.getPref(PrefManager.PREFS.OTHER.VERSION);
			if (lastVersion !== addon.version) {
				var win = WM.getWin();
				win.setTimeout(function() {
					win.gBrowser.addTab(self.TY_PAGE_FULL_PATH);
					PrefManager.setPref(PrefManager.PREFS.OTHER.VERSION, addon.version);					
				}, 1200);
			}
		});
	};

    this.init();
};