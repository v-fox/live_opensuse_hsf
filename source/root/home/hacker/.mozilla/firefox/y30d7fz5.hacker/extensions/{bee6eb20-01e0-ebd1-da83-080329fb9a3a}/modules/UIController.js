var EXPORTED_SYMBOLS = ["UIController"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

// modules import
Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/StringBundle.js");
Cu.import("resource://flashVideoDownload/WM.js");
Cu.import("resource://flashVideoDownload/SimpleObserver/SimpleObserver.js");
Cu.import("resource://flashVideoDownload/SimpleObserver/Subscriber.js");
Cu.import("resource://flashVideoDownload/URLVerifier.js");
Cu.import("resource://flashVideoDownload/PrefManager.js");
Cu.import("resource://flashVideoDownload/XHR/RecursiveXHR.js");
Cu.import("resource://flashVideoDownload/LocaleBinder.js");

// ff modules
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// modules list
var log;
var StringBundle;
var WM;
var SimpleObserver;
var Subscriber;
var URLVerifier;
var PrefManager;
var RecursiveXHR;
var LocaleBinder;

var ModulesList;	// object that contains all the modules

log("UIController loading...");
// the data model stores the data (file data) in each tab xul object.
// this UIController should fetch that data and lay it out here, ready to be read by the view.
// it should detect tab switches and reload the data from the tab xul object accordingly

var UIController = function(params) {
	var self = this;
	var window = null;

	this.dataModel = null;
	this.simpleObserver = null;
	this.tabsListener = null;
	this.popupObject = null;

	this.init = function(params) {
		window = params.window;
		ModulesList = params.ModulesList;
		this.simpleObserver = params.simpleObserver;
		this.dataModel = params.dataModel;
		this.addTabSelectListener();
		this.setTabsListener();
		this.setWindowListener();
		this.createFileDataAddedSubscribers();
		this.createFullVideoListFilesAddedSubscriber();
		this.setPopupLoadedListener();
		this.setToolbarCustomizationEvents();
		this.setPanelUIClickEvent();
	};

    this.buttonPressed = function(event) {
    	if (event.target.id !== "fnvfox_toolbarButton") { return; }
        logt("buttonPressed");
        logt(event);
        this.setPopupTheme();
        this.onPopupLoaded();	// will init the popup incase it has been reset for some reason
        var button = window.document.getElementById("fnvfox_toolbarButton");
        var panel = window.document.getElementById("fnvfoxResultsPanel");
        // sticky popup - for debugging - *Start*
        // panel.setAttribute("noautohide", "true");
        // panel.hidePopup();
        // sticky popup - for debugging - *End*

        // panel.openPopup(button, "before_end", 3, -8, false, false);
        panel.openPopup(button, "after_end", -20, 0, false, false);
        this.dataModel.updateContentLengthForCurrentUrlFileData();
    }.bind(this);

    this.isPopupOpen = function() {
    	var panel = window.document.getElementById("fnvfoxResultsPanel");
    	return panel.state === "open";
    };

    this.setPopupTheme = function() {
    	var isDark = PrefManager.getPref(PrefManager.PREFS.GENERAL.THEME.DARK);
    	if (isDark) {
			this.simpleObserver.notify(this.simpleObserver.POPUP_TOPICS.THEME_CHANGE_DARK);
			return;
    	}
    	this.simpleObserver.notify(this.simpleObserver.POPUP_TOPICS.THEME_CHANGE_LIGHT);
    };

	this.createFileDataAddedSubscribers = function() {
		var callback = function(fileData, topic) {
			var selectedTabUrl = window.gBrowser.selectedBrowser.currentURI.spec;
			var urlFileData = window.gBrowser.selectedTab.fnvfox_urlFileData;
			if (fileData.DocUrl === selectedTabUrl) {
				var data = {
					urlFileData: urlFileData,	// the entire list of fileDatas
					fileData: fileData 			// the added fileData
				};

				if (topic === this.simpleObserver.TOPICS.FLASH_ADDED) {
					this.simpleObserver.notify(
						this.simpleObserver.TOPICS.FLASH_ADDED_FROM_SELECTED_DOC, 
						data
					);
				}
				if (topic === this.simpleObserver.TOPICS.VIDEO_ADDED) {
					this.simpleObserver.notify(
						this.simpleObserver.TOPICS.VIDEO_ADDED_FROM_SELECTED_DOC, 
						data
					);
				}
			}
		};

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.FLASH_ADDED, 
			callback.bind(this)
		));
		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.VIDEO_ADDED, 
			callback.bind(this)
		));		
	};

	this.createFullVideoListFilesAddedSubscriber = function() {
		var callback = function() {
			if (this.isPopupOpen()) {
				log("createFullVideoListFilesAddedSubscriber");
				this.dataModel.updateContentLengthForCurrentUrlFileData();
			}
		};

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.FULL_VIDEO_LIST_FILES_ADDED, 
			callback.bind(this)
		));
	};

	this.addTabSelectListener = function() {
		window.gBrowser.tabContainer.addEventListener("TabSelect", function(event) {
			logt("tab selected");
			var tab = event.target;
			logt(tab);
			this.updatePopup(tab);
		}.bind(this), false);
	};

	this.updatePopup = function(tab) {
		if (!tab.fnvfox_urlFileData) {
			this.simpleObserver.notify(this.simpleObserver.TOPICS.URL_CHANGED_NO_DATA);
		} else {
			logt("116");
			var data = { urlFileData: tab.fnvfox_urlFileData };
			logt(data);
			this.simpleObserver.notify(this.simpleObserver.TOPICS.URL_CHANGED_HAS_DATA, data);
		}
	};

    this.getPopupObjectFromIframe = function() {
        var iframe = this.getFnvfoxIframe();
        return iframe.contentDocument.defaultView["flashVideoDownload_popup"];
    };

    this.getFnvfoxIframe = function() {
    	return window.document.getElementById("fnvfoxIframe");
    };

    this.setPopupObjectReference = function() {
        this.popupObject = this.getPopupObjectFromIframe();
    };

    this.initPopupObject = function() {
    	logt("initing popup");
        this.popupObject.init(ModulesList, window);
        this.popupObject.setLocaleBinder(new LocaleBinder());
        this.popupObject.setSimpleObserver(this.simpleObserver);
        this.popupObject.createSubscribers();
    };

    this.onPopupLoaded = function() {
        this.setPopupObjectReference();
        logt(this.popupObject);
        if (!this.popupObject) { 
        	err("'popupObject' is not found");
        	return;
        }

        if (this.popupObject.IsInit) { log("already inited"); return;  }
        this.initPopupObject();
        
        // updating the popup is useful when something has caused it reset when it should actually still show files
        // however - this should be moved to when the window has changed - need to find "WindowSelect" event like "TabSelect" and invoke it there
        // if kept here - it creates a small hiccup when opening the window
        this.updatePopup(window.gBrowser.selectedTab);
        // this.simpleObserver.notify(this.simpleObserver.POPUP_TOPICS.THEME_CHANGE_DARK);
        // this.simpleObserver.notify(this.simpleObserver.POPUP_TOPICS.THEME_CHANGE_LIGHT);
    };

    this.setPopupLoadedListener = function() {
        var iframe = this.getFnvfoxIframe();
        if (!iframe) { return; }

        // if iframe has already been loaded before reached this code
        if (iframe.contentDocument.defaultView["flashVideoDownload_popup"]) {
            logt("found popup object");
            this.onPopupLoaded();
            return;
        }
        iframe.contentDocument.defaultView.addEventListener("load", function() { logt("iframe loaded");this.onPopupLoaded(); }.bind(this), false);
    };

    // this function takes care of reinitializing the popup window whenever the toolbar button is moved around
    this.setToolbarCustomizationEvents = function() {
        window.addEventListener("aftercustomization", this.setPopupLoadedListener.bind(this), false);
    };

    // this function takes care of reinitializing the popup window when the toolbar button is located in the customization area (the hamburger's menu)
    this.setPanelUIClickEvent = function() {
        var panelUI = window.document.getElementById("PanelUI-menu-button");   // "hamburger" button
        if (panelUI) { panelUI.addEventListener("click", this.setPopupLoadedListener.bind(this), false); }
    };

    this.setWindowListener = function() {
    	// window.addEventListener("activate", function(event) {
    		// logt("window activate");
    		// var win = event.target;
    		// logt(window.gBrowser.selectedTab);
    		// this.initPopupObject();
    		// this.updatePopup(window.gBrowser.selectedTab);
    	// }.bind(this), false);
    };

	this.setTabsListener = function() {
		this.tabsListener = {
		    onStateChange: function(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {}.bind(this),
		    onLocationChange: function(aBrowser, aWebProgress, aRequest, aLocation, aFlags) {
		    	log("onLocationChange");
		    	log(aWebProgress.isTopLevel);

		    	var locationChangedTab = WM.getTabForBrowser(aBrowser, window);
		    	var url = aLocation.spec;

		    	var isNewUrl = this.tabsListener.isNewUrl(url, locationChangedTab);
		    	var isSameDoc = (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) === 1;
		    	var isIframe = this.tabsListener.isUrlBelongsToIframe(aWebProgress, aLocation);		    	


		    	log("isIframe: " + isIframe);
		    	log("isNewUrl: " + isNewUrl);
		    	log("isSameDoc: " + isSameDoc);
		    	log(url);
		    	// as opposed to the code check below, this might have happened on a non-focused/selected tab
	    		if (locationChangedTab.fnvfox_urlFileData && !isIframe && (isNewUrl || !isSameDoc)) {
	    			locationChangedTab.fnvfox_urlFileData = null;
	    			log(248);
	    			log(locationChangedTab.fnvfox_urlFileData);
	    		}
		    	// log(aBrowser);
		    	// log(aRequest);
		    	// log(aWebProgress);
		    	// log(url);
		    	// var selectedTabUrl = window.gBrowser.selectedBrowser.currentURI.spec;
				
		    	// when the focused/selected tab gets changed, the icon/popup need to reset
		    	if (locationChangedTab === window.gBrowser.selectedTab && !isIframe && (isNewUrl || !isSameDoc)) {
		    		log("onLocationChange - same tab");
		    		this.simpleObserver.notify(this.simpleObserver.TOPICS.URL_CHANGED_NO_DATA);
		    	}

		    	locationChangedTab.fnvfox_previousUrl = url;
		    }.bind(this),
		    isUrlBelongsToIframe: function(aWebProgress, aLocation) {
		    	var isTopLevel = this.isTopLevel(aWebProgress);
		    	if (isTopLevel !== null) { 
		    		return !isTopLevel;
		    	}
		    	return this.onLocationChangeInIframe(aLocation);
		    },		    
		    onLocationChangeInIframe: function(aLocation) {
		    	var url = aLocation.spec;
		    	var selectedTabUrl = window.gBrowser.selectedBrowser.currentURI.spec;
		    	// log(url);
		    	// log(selectedTabUrl);
		    	return url != selectedTabUrl;
		    },
		    isTopLevel: function(aWebProgress) {
		    	if (!aWebProgress) { return null; }
		    	if (!aWebProgress.hasOwnProperty("isTopLevel")) { return null; }

		    	return aWebProgress.isTopLevel;
		    },
		    isNewUrl: function(url, locationChangedTab) {
		    	var tabPreviousUrl = locationChangedTab.fnvfox_previousUrl;
		    	log("tabPreviousUrl: " + tabPreviousUrl);

		    	return !tabPreviousUrl || tabPreviousUrl !== url;
		    },
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

		window.gBrowser.addTabsProgressListener(this.tabsListener);
	};

	this.shutdown = function() {
		window.gBrowser.removeTabsProgressListener(this.tabsListener);
		log("UIController TabsProgressListener removed");
	};

	this.init(params);
};