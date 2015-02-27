var flashVideoDownload = new function() {
    var self = this;

    // private consts
    // switches for development
    var DEBUG = false;
    var DM_DEV = false;
    var OFFLINE_YOUTUBE = false;

    // private methods
    var log = function(logInfo) {
        if (DEBUG) { window.console.log(logInfo); }
    };
    
    // consts
    this.TOOLBAR_BUTTON			= "fnvfox_toolbarButton";
    this.STATUSBAR_BUTTON       = "fnvfox_statusbarButton";		// firefox 4 and above
    this.STATUS_BAR_BUTTON_VER3 = "fnvfox_statusbarButton_ver3"; 	// firefox 3.6 and below
    this.CONTEXT_MENU_ID		= "flashVideoDownloadContextMenu";    
    
    this.NAV_BAR                = "nav-bar";
    this.ADDON_BAR              = "addon-bar";	// firefox 4 and above
    this.STATUS_BAR             = "status-bar";	// firefox 3.6 and below    
    
    this.TY_PAGE                = "thankyou.html";
    this.DOMAIN_NAME			= "http://fnvfox.appspot.com/";
    this.TY_PAGE_FULL_PATH		= "";

    // stringbundle consts
    // (will be set through the "setStringbundleConsts" function)
    this.stringbundleConsts = {
        STATUSBAR_BUTTON_LABEL          : null,
        TOOLBAR_BUTTON_LABEL            : null,
        TOOLBAR_BUTTON_TOOLTIP          : null,
        CONTEXT_MENU_FLASH_TITLE        : null,
        CONTEXT_MENU_VIDEOS_TITLE       : null,
        CONTEXT_MENU_SHOW_ALL_VIDEOS    : null,
        DOWNLOAD_WINDOW_SAVE_AS         : null
    };
    
    // properties
    this.window				= null;
    this.PrefManager        = null;	// will be imported from a module
    this.DownloadManagers   = null;	// will be imported from a module
    this.Classes			= null;	// will be imported from a module
    this.addonVersion       = null;	// gets value from "checkVer" function    
    this.Dm                 = null; // will be imported from a module - this module will be used to transfer info from the main window (browser.xul) to the downloadManager.xul window
    this.VersionInfo        = null;
    
    // methods
    this.init = function() {
        this.setTYPage();	
        window.addEventListener("load", function() { self.onLoad(); }, false);
        window.addEventListener("unload", function() { self.onUnload(); }, false);
    };

    this.onLoad = function() {        
        this.window = window;   // stores a reference to browser's window (is used through the Classes lib)

        this.loadModules();
        this.PrefManager.startup();
        this.addObservers();
        this.addProgressListener();
        this.setStringbundleConsts();
        this.createToolbarButtons();
        this.loadUserPrefs();
        this.loadYouTubeFormatsPrefs();
        this.loadYouTubeQualitiesPrefs();
        this.loadYouTubeEmbeddedVideosPrefs();
        this.checkVer();
        this.registerPrefNames();
        this.checkStatusbarPref();
    };

    this.onUnload = function() {        
        this.PrefManager.shutdown();
        this.removeObservers();
    };

    this.setTYPage = function() {
        this.TY_PAGE_FULL_PATH = this.DOMAIN_NAME + this.TY_PAGE;
    };

    this.addObservers = function() {
        var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(this.flashVideoDownloadObserver, "http-on-examine-response", false);
        observerService.addObserver(this.flashVideoDownloadObserver, "http-on-modify-request", false);
        observerService.addObserver(this.flashVideoDownloadObserver, "http-on-examine-cached-response", false);     
    };

    this.removeObservers = function() {
        var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(this.flashVideoDownloadObserver, "http-on-examine-response", false);
        observerService.removeObserver(this.flashVideoDownloadObserver, "http-on-modify-request", false);
        observerService.removeObserver(this.flashVideoDownloadObserver, "http-on-examine-cached-response", false);
    };

    this.loadModules = function() {
        Components.utils.import("resource://flashVideoDownload/DownloadManagers.js", this);
    	Components.utils.import("resource://flashVideoDownload/Classes.js", this);
    	Components.utils.import("resource://flashVideoDownload/PrefManager.js", this);
    	Components.utils.import("resource://flashVideoDownload/Dm.js", this);
        Components.utils.import("resource://flashVideoDownload/VersionInfo.js", this);
        Components.utils.import("resource://flashVideoDownload/ToolbarButton.js", this);
        this.DownloadManagers.dta.init();
    	this.Classes.main = this;
    	this.PrefManager.main = this;
    	this.Dm.main = this;
    	this.Classes.setWindow(window);
        this.Classes.setDebugOn(DEBUG);
    };
    
    this.setStringbundleConsts = function() {	
    	//alert(this.Dm.JXON.hello);
    	var stringbundle = document.getElementById("flashVideoDownload_stringbundle");
    	this.stringbundleConsts.STATUSBAR_BUTTON_LABEL        = stringbundle.getString("statusbarButtonLabel");
    	this.stringbundleConsts.TOOLBAR_BUTTON_LABEL          = stringbundle.getString("toolbarButtonLabel");
    	this.stringbundleConsts.TOOLBAR_BUTTON_TOOLTIP        = stringbundle.getString("toolbarButtonTooltip");
    	this.stringbundleConsts.CONTEXT_MENU_FLASH_TITLE      = stringbundle.getString("contextMenuFlashTitle");
    	this.stringbundleConsts.CONTEXT_MENU_VIDEOS_TITLE     = stringbundle.getString("contextMenuVideosTitle");
    	this.stringbundleConsts.CONTEXT_MENU_SHOW_ALL_VIDEOS  = stringbundle.getString("contextMenuShowAllVideos");
    	this.stringbundleConsts.DOWNLOAD_WINDOW_SAVE_AS       = stringbundle.getString("downloadWinodwSaveAs");
    };

    this.createToolbarButtons = function() {
        this.toolbarButton = new this.ToolbarButton(
            window,
            this.VersionInfo,
            this.TOOLBAR_BUTTON,
            this.NAV_BAR,
            this.stringbundleConsts.TOOLBAR_BUTTON_LABEL,
            this.stringbundleConsts.TOOLBAR_BUTTON_TOOLTIP
        );

        this.statusbarButton = new this.ToolbarButton(
            window,
            this.VersionInfo,
            this.STATUSBAR_BUTTON,
            this.ADDON_BAR,
            this.stringbundleConsts.STATUSBAR_BUTTON_LABEL,
            this.stringbundleConsts.TOOLBAR_BUTTON_TOOLTIP
        );
        this.statusbarButton.setTypeStatusBarButton(true);
    };
    
    // registers pref names and functions to execute upon a preference change
    this.registerPrefNames = function() {	
        // toolbarButton pref - Add/Remove toolbar button
        this.PrefManager.registerPrefName(this.PrefManager.PREFS.GENERAL.INTERFACE.TOOLBAR_BUTTON, function() {
            var toolbarButtonPref = self.PrefManager.prefs.getBoolPref(self.PrefManager.PREFS.GENERAL.INTERFACE.TOOLBAR_BUTTON);	    
            if (toolbarButtonPref) {
                self.toolbarButton.addToolbarButton();
            } else {
                self.toolbarButton.removeToolbarButton();
            }
        });
        
        // dta pref - Enable/Disabled "DownThemAll!" Add-on compatibility
        this.PrefManager.registerPrefName(this.PrefManager.PREFS.GENERAL.DOWNLOAD_MANAGERS.DTA, function() {
            self.DownloadManagers.dta.isUserEnabled = self.PrefManager.prefs.getBoolPref(self.PrefManager.PREFS.GENERAL.DOWNLOAD_MANAGERS.DTA);
        });
        
        // statusbarButton pref - Show/Hide statusbar button
        this.PrefManager.registerPrefName(this.PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON, function() {
            var statusbarButtonPref = self.PrefManager.prefs.getBoolPref(self.PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON);				
            if (statusbarButtonPref) {
                self.statusbarButton.addToolbarButton();
            } else {
                self.statusbarButton.removeToolbarButton();
            }
        });
	
    	this.PrefManager.registerAllYouTubeFormats(this.loadYouTubeFormatsPrefs);
    	this.PrefManager.registerAllYouTubeQualities(this.loadYouTubeQualitiesPrefs);
    	this.PrefManager.registerAllYouTubeEmbeddedVideos(this.loadYouTubeEmbeddedVideosPrefs);
    };
    
    this.checkStatusbarPref = function() {
        if (!this.VersionInfo.hasStatusBar()) { return };
        
        var statusbarButtonPref = this.PrefManager.prefs.getBoolPref(this.PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON);				
        if (statusbarButtonPref) {
            this.toolbarButton.addToolbarButton();
        } else {
            this.toolbarButton.removeToolbarButton();
        }
    };

    this.addProgressListener = function() {
        var listener = {
            onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {       
            var doc = getBrowser().selectedBrowser.contentDocument;
            try {           
                var url = gBrowser.contentWindow.location;
                self.Classes.YouTubeVideoFile.checkIfYouTube(url);  // checks if the current url is "YouTube" and updates the "isYouTube" property
                if (self.Classes.YouTubeVideoFile.isYouTubeAndAvailableUrls()) {
                    self.Classes.YouTubeVideoFile.createMediaFiles(doc);
                    self.setStatusBar(doc);
                }
                else if (self.Classes.DailymotionVideoFile.isDailymotion(doc)) {            
                    if (self.Classes.DailymotionVideoFile.createMediaFiles(doc) == true) {
                        self.setStatusBar(doc);
                    }
                //self.log(self.Classes.DailymotionVideoFile.getDailymotionVideosParams(doc));
                }
                else if (self.Classes.MetacafeVideoFile.isMetacafe(doc)) {
                    if (self.Classes.MetacafeVideoFile.createMediaFiles(doc)) {
                        self.setStatusBar(doc);
                    }
                }
                else if (self.Classes.BreakVideoFile.isBreak(doc)) {                
                    if (self.Classes.BreakVideoFile.createMediaFiles(doc)) {
                        self.setStatusBar(doc);
                    }
                }
                else { // any other websites/links
                    self.Classes.YouTubeVideoFile.checkForChannelsPreviewVideos(doc, window, self);
                }
                
                if (OFFLINE_YOUTUBE) { // offline debugging mode
                    self.Classes.YouTubeVideoFile.createMediaFiles(doc);
                }
            } catch(ex) { log(ex); }
        },
            
            // runs when the document loads
            onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {       
                if (aFlag & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
                    var doc = getBrowser().selectedBrowser.contentDocument;         
                    try {
                        var url = gBrowser.contentWindow.location;
                        self.Classes.YouTubeVideoFile.checkIfYouTube(url);  // checks if the current url is "YouTube" and updates the "isYouTube" property
                        if (self.Classes.YouTubeVideoFile.isYouTubeAndAvailableUrls()) {
                            self.Classes.YouTubeVideoFile.createMediaFiles(doc);                
                            self.setStatusBar(doc);             
                        }
                        else if (self.Classes.DailymotionVideoFile.isDailymotion(doc)) {
                            if (self.Classes.DailymotionVideoFile.createMediaFiles(doc)) {              
                                self.setStatusBar(doc);
                            }
                        }           
                        else if (self.Classes.MetacafeVideoFile.isMetacafe(doc)) {
                            if (self.Classes.MetacafeVideoFile.createMediaFiles(doc)) {
                                self.setStatusBar(doc);
                            }
                        }
                        else if (self.Classes.BreakVideoFile.isBreak(doc)) {                
                            if(self.Classes.BreakVideoFile.createMediaFiles(doc)) {
                                self.setStatusBar(doc);
                            }
                            else { self.Classes.YouTubeVideoFile.checkForChannelsPreviewVideos(doc, window, self); }    // for youtube embeded videos that are used sometimes instead of break.com's video player
                        }
                        else {// any other websites/links
                            self.Classes.YouTubeVideoFile.checkForChannelsPreviewVideos(doc, window, self);
                        }           
                    } catch(ex) { log(ex); }
                } 
            },
            
            // runs when the URL changes (when switching between tabs)
            onLocationChange: function(aProgress, aRequest, aURI) {                
                self.clearStatusBar();
                if (aURI == null) {
                    if (self.hasStatusbarButtonOn()) {
                        var statusBarCSSClass = self.VersionInfo.hasAddonBar() ? "fnvfox_toolbarButtonIconDisabled toolbarbutton-1 chromeclass-toolbar-additional" : "fnvfox_statusBarIconDisabled";
                        document.getElementById(self.STATUSBAR_BUTTON).setAttribute("class", statusBarCSSClass);
                    }
                    if (self.hasToolbarButtonOn()) {
                        document.getElementById(self.TOOLBAR_BUTTON).setAttribute("class", "fnvfox_toolbarButtonIconDisabled toolbarbutton-1 chromeclass-toolbar-additional");  // toolbar button icon - added in version 0.3.6
                    }
                } else {
                    var doc = getBrowser().selectedBrowser.contentDocument;
                    try {               
                        var url = gBrowser.contentWindow.location;
                        // log(url);
                        self.Classes.YouTubeVideoFile.channelsVideoId = null;
                        self.Classes.YouTubeVideoFile.isCheckForAjaxVideo = true;
                    } catch(ex) { }
                    
                    self.setStatusBar(doc);
                }
            },
            onProgressChange: function() {},
            onSecurityChange: function() {}
        };
    
        getBrowser().addProgressListener(listener);
    };
    
    // the parent node is the actual toolbarbutton ("fnvfox_statusbarButton" for version 3.6 or older is an image element and not the actual toolbarbutton)
    this.hasToolbarButtonOn = function() { return document.getElementById(this.TOOLBAR_BUTTON) != null; }    
    this.hasStatusbarButtonOn = function() { return document.getElementById(this.STATUSBAR_BUTTON) != null; }
    
    this.removeToolbarButton = function(buttonName, toolbarName, isPersist) {
        var toolbarButton = document.getElementById(buttonName);
        if (toolbarButton == null) { return false; }	// if a button doesn't exist, do nothing...
    
        var toolbar = document.getElementById(toolbarName);
        toolbar.removeChild(toolbarButton);	
        toolbar.setAttribute("currentset", toolbar.currentSet);
        if (isPersist) {
            document.persist(toolbar.id, "currentset");  
        }        
    
        return true;
    };
    
    this.loadUserPrefs = function() {
        try {
            var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);
            var Extension = Application.extensions.get("{bee6eb20-01e0-ebd1-da83-080329fb9a3a}");
            this.prefs = Extension.prefs;
        } catch(ex) { }
    };
    
    // sets the displayed formats for youtube
    this.loadYouTubeFormatsPrefs = function() {
    	var formats = this.Classes.MediaFile.FORMATS;
    	var displayedFormats = {};
    	
    	// "self.Classes.MediaFile.FORMATS" and "self.PrefManager.PREFS.YT.FORMATS" keys are the same, so we can use the same keys to iterate both arrays
    	// example - 
    	// displayedFormats[formats.MP4] = self.PrefManager.getPref(self.PrefManager.PREFS.YT.FORMATS["MP4"]);	
    	for (var format in formats) {
    	    displayedFormats[formats[format]] = this.PrefManager.getPref(this.PrefManager.PREFS.YT.FORMATS[format]);
    	}

    	this.Classes.YouTubeVideoFile.setDisplayedFormats(displayedFormats);
    };
    
    this.loadYouTubeQualitiesPrefs = function() {
    	var qualities = this.Classes.MediaFile.QUALITIES;
    	var displayedQualities = {};
    	
    	for(var quality in qualities) {
    	    displayedQualities[qualities[quality]] = this.PrefManager.getPref(this.PrefManager.PREFS.YT.QUALITIES[quality]);
    	}
    	
    	this.Classes.YouTubeVideoFile.setDisplayedQualities(displayedQualities);
    };
    
    this.loadYouTubeEmbeddedVideosPrefs = function() {
    	var embeddedVideos = {};
    	embeddedVideos.isEnhancedDetectionEnabled = this.PrefManager.getPref(this.PrefManager.PREFS.YT.EMBEDDED_VIDEOS.ENHANCED_DETECTION);
    	
    	this.Classes.YouTubeVideoFile.setEmbeddedVideos(embeddedVideos);
    };
    
    this.checkVer = function() {
        try { 
            try {
                // Gets the version id for Firefox 4 and later; Mozilla 2 and later
                Components.utils.import("resource://gre/modules/AddonManager.jsm");
                AddonManager.getAddonByID("{bee6eb20-01e0-ebd1-da83-080329fb9a3a}", function(addon) {
                    var addonVersion = addon.version;
                    self.addonVersion = addonVersion;
                    // Gets the preferences for Firefox 4 and later / Mozilla 2 and later
                    Application.getExtensions(function (extensions) {			
                        let extension = extensions.get("{bee6eb20-01e0-ebd1-da83-080329fb9a3a}");
                        self.prefs = extension.prefs;		 
                        var firstRun	    = self.prefs.getValue("firstRun", true);
                        if (firstRun) {
                            self.prefs.setValue("firstRun", false);					
                            self.PrefManager.prefs.setBoolPref("toolbarButton", true);					
                            self.toolbarButton.addToolbarButton();
                            self.statusbarButton.addToolbarButton();                   
                        }
                        var lastCheckVersion = self.prefs.getValue("addonVersion", "");
                        var newU		 = self.prefs.getValue("new", true);
                        if (newU) {
                            self.prefs.setValue("addonVersion", addonVersion);
                            self.prefs.setValue("new", false);
                            window.setTimeout(function(){
                                var b = getBrowser();
                                b.selectedTab = b.addTab(self.TY_PAGE_FULL_PATH);
                            }, 1200);
                        } else {
                            if (lastCheckVersion!=addonVersion) {
                                self.prefs.setValue("addonVersion", addonVersion);
                                window.setTimeout(function(){
                                    var b = getBrowser();
				                    b.selectedTab = b.addTab(self.TY_PAGE_FULL_PATH);
                                }, 1200);
                            }
                        }
                    });
                });
            } catch(ex) {
                // Firefox 3.6 and before; Mozilla 1.9.2 and before
                var nsIExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);			
                var addonVersion	= nsIExtensionManager.getItemForID("{bee6eb20-01e0-ebd1-da83-080329fb9a3a}").version;
        		self.addonVersion = addonVersion;
                var firstRun	= self.prefs.getValue("firstRun", true);
                if (firstRun) {
                    self.prefs.setValue("firstRun", false);					
                    self.PrefManager.prefs.setBoolPref(self.PrefManager.PREFS.GENERAL.INTERFACE.TOOLBAR_BUTTON, true);					
                    self.toolbarButton.addToolbarButton();
                    self.statusbarButton.addToolbarButton();
                }			  
                var lastCheckVersion = self.prefs.getValue("addonVersion", "");
                var newU = self.prefs.getValue("new", true);
    
                if (newU) {
                    self.prefs.setValue("addonVersion", addonVersion);
                    self.prefs.setValue("new", false);
                    window.setTimeout(function() {
                        var b = getBrowser();
                        b.selectedTab = b.addTab(self.TY_PAGE_FULL_PATH);
                    }, 1200);
                } else {
                    if (lastCheckVersion!=addonVersion){
                        self.prefs.setValue("addonVersion", addonVersion);
                        window.setTimeout(function(){
                            var b = getBrowser();
                            b.selectedTab = b.addTab(self.TY_PAGE_FULL_PATH);
                        }, 1200);
                    }
                }			  
            }
        } catch(ex) {}	
    };

    this.buttonPressed = function(e) {
    	if (DM_DEV && e.button == 2) {
    	    self.openDm();
    	}
        
        var doc = getBrowser().selectedBrowser.contentDocument;
        var buttonId = e.target.getAttribute("id");
        var popup = document.getElementById(self.CONTEXT_MENU_ID);
        popup.setAttribute("invokingButtonId", buttonId); // could be either the statur bar(add-on bar) button or the toolbar        
        if (popup.hasChildNodes()) {
	       popup.showPopup(e.target, -1, -1, "popup", "bottomleft", "topleft");
	       // popup.openPopup(e.target, "after_start", 0, 0, true, false);
        }
        // meaning that the button is not active yet and therefore should do nothing
        else { return; }
        
        // fetches youtube files sizes
        if (doc.videoFilesList != null) {
    	    if (self.Classes.DailymotionVideoFile.isDailymotion(doc) ||
                self.Classes.MetacafeVideoFile.isMetacafe(doc) ||
                self.Classes.BreakVideoFile.isBreak(doc)) {	    
                    self.Classes.VideoFile.getVideosFileSizes(doc, self, 3);	// 3 = number of ajax requests
                    return;
                }
            self.Classes.VideoFile.getVideosFileSizes(doc, self);   
        }
    };
    
    this.openDm = function() {
    	if (DM_DEV) {
    	    var doc = getBrowser().selectedBrowser.contentDocument;
    	    var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                .getService(Components.interfaces.nsIWindowWatcher);
    	    ww.openWindow(null, "chrome://flashvideodownload/content/downloadManager.xul", "Download Manager", "chrome,resizable=yes,centerscreen,width=1050,height=450", null);
        	    
    	    if (doc.videoFilesList != null) {
                this.Dm.videoFilesQueue.enqueue(doc.videoFilesList);		
    	    }
    	    if (doc.flashFilesList != null) {
                this.Dm.flashFilesQueue.enqueue(doc.flashFilesList);
    	    }
    	}
    };
    
    this.flashVideoDownloadObserver = {
        observe: function(aSubject, aTopic, aData) {            
            if ((aTopic=="http-on-examine-response") || (aTopic=="http-on-modify-request")
                || (aTopic=="http-on-examine-cached-response")) {
                try {				
                    aSubject.QueryInterface(Components.interfaces.nsIRequest);
                    var url		= aSubject.name;                    
                    var contentType	= aSubject.contentType;
                    var contentLength 	= aSubject.contentLength;
                    var fileType 	= self.Classes.MediaFile.getFileType(contentType, url);
                    aSubject.QueryInterface(Components.interfaces.nsIChannel);
        		    var browser = self.getBrowser(aSubject, aSubject);
                    if (!browser) { return; }
        		    var doc    = browser.contentDocument;
		    
                    self.Classes.YouTubeVideoFile.checkIfYouTube(doc);
            		//    if (self.Classes.YouTubeVideoFile.isYouTube && self.Classes.YouTubeVideoFile.urlType == self.Classes.YouTubeVideoFile.YOUTUBE_URL_TYPE.CHANNELS) {
            		//	self.Classes.YouTubeVideoFile.checkForChannelsPreviewVideos(doc, window, self);			
            		//    }
		    
                    // this prevents adding mp4/flv videos read from headers on YouTube and Dailymotion
                    // a different algorithm will be used to extract the video files from YouTube and Dailymotion				
                    if (self.Classes.YouTubeVideoFile.isYouTube && self.Classes.YouTubeVideoFile.isSupportedFileType(fileType)) { return; }
        		    if (self.Classes.DailymotionVideoFile.isDailymotion(doc) && self.Classes.DailymotionVideoFile.isSupportedFileType(fileType)) { return; }
        		    if (self.Classes.MetacafeVideoFile.isMetacafe(doc) && self.Classes.MetacafeVideoFile.isSupportedFileType(fileType) && doc.videoFilesList.length > 0) { return; }
        		    if (self.Classes.BreakVideoFile.isBreak(doc) && self.Classes.BreakVideoFile.isSupportedFileType(fileType) && doc.videoFilesListAdded) { return; }
		    
                    if (self.Classes.FlashFile.isSupportedFileType(fileType) || self.Classes.VideoFile.isSupportedFileType(fileType)) {
                        var title  = doc.title;
                        var domain = doc.domain;
                        var href   = doc.location.href;			
            			var mediaFile;
            			if (self.Classes.FlashFile.isSupportedFileType(fileType)) {
            			    mediaFile = new self.Classes.FlashFile(fileType, doc, url, title, contentLength, doc.URL);
            			}
            			else if (self.Classes.VideoFile.isSupportedFileType(fileType)) {
            			    mediaFile = new self.Classes.VideoFile(fileType, doc, url, title, contentLength, doc.URL);
            			    if (!mediaFile.contentLength) {
            				    self.Classes.VideoFile.setVideoFileSize(mediaFile, doc, self);
            			    }
            			}
            			if (mediaFile == null) { return };
            			mediaFile.addToMediaList(mediaFile);	// adds itself to the media list for its owning document			
            			self.setStatusBar(doc);
            			return;
                    }
                } catch(ex) { 
                    //log(ex); log(aSubject); 
                }    
            } else { }
            return;
        },
    
        QueryInterface: function(aIID) {
            if (aIID.equals(Components.interfaces.nsISupports) || aIID.equals(Components.interfaces.nsIObserver))
                { return this; }
            throw Components.results.NS_NOINTERFACE;
        }
    };
    
    this.getBrowser = function(aChannel, aSubject) {
        try {
            var notificationCallbacks = 
                aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aSubject.loadGroup.notificationCallbacks;
      
            if (!notificationCallbacks) { return null; }
            var callback = notificationCallbacks.getInterface(Components.interfaces.nsIDOMWindow);
            return callback.top.document ? 
                gBrowser.getBrowserForDocument(callback.top.document) : null;
        }
        catch(ex) {
            return null;
        } 
    };

    this.clearStatusBar = function() {
        // log("clearing from: " + from);
        var flashVideoDownloadContextMenu = document.getElementById(this.CONTEXT_MENU_ID);
        while (flashVideoDownloadContextMenu.firstChild) {
            flashVideoDownloadContextMenu.removeChild(flashVideoDownloadContextMenu.firstChild);
        }
    };
    
    // overrideSameDocCheck - overrides the check that checks if "doc" is the current document
    this.setStatusBar = function(doc, overrideSameDocCheck) {	
        if (getBrowser().selectedBrowser.contentDocument != doc && !overrideSameDocCheck) { return false; }
    	
        if (doc.flashFilesList == null) doc.flashFilesList = new Array();
        if (doc.videoFilesList == null) doc.videoFilesList = new Array();
    
        var flashVideoDownloadContextMenu = document.getElementById(this.CONTEXT_MENU_ID);
    	var isShowFlashFiles = this.PrefManager.getPref(this.PrefManager.PREFS.GENERAL.FLASH_AND_VIDEO_FILES.SHOW_FLASH_FILES);
    	var isShowVideoFiles = this.PrefManager.getPref(this.PrefManager.PREFS.GENERAL.FLASH_AND_VIDEO_FILES.SHOW_VIDEO_FILES);	
	
        this.clearStatusBar();
        if (doc.flashFilesList.length > 0 && isShowFlashFiles) {
            var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem");
            menuitem.setAttribute("label", self.stringbundleConsts.CONTEXT_MENU_FLASH_TITLE);
            menuitem.style.fontWeight = "bold"
            flashVideoDownloadContextMenu.appendChild(menuitem);
            
            for (var i=0; i < doc.flashFilesList.length; i++) {
                var menuItem = doc.flashFilesList[i].createMenuItem(document, this);
                flashVideoDownloadContextMenu.appendChild(menuItem);
            }
        }
	
        if (doc.videoFilesList.length > 0 && isShowVideoFiles) {		
            if (doc.flashFilesList.length > 0 && isShowFlashFiles) { this.addMenuSeparatorToContextMenu(flashVideoDownloadContextMenu); }
	    
            var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem");
            menuitem.setAttribute("label", self.stringbundleConsts.CONTEXT_MENU_VIDEOS_TITLE);
            menuitem.style.fontWeight = "bold"
            flashVideoDownloadContextMenu.appendChild(menuitem);
            
    	    for (var i = 0; i < doc.videoFilesList.length;i++) {		
                if (doc.videoFilesList[i].contentLength === 0) continue;
    		
        		// relevant for YouTube videos only and is set in "createMenuItemDisplayAll"
        		// it will be set to "true" if the "Display All Available Videos" button has been pressed, thus preventing filtering the videos (as set in the prefs) when the context menu is opened again
        		doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered = doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered == undefined ? false : doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered;
                var menuItem = doc.videoFilesList[i].createMenuItem(document, this, doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered);	// "doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered" param is only relevant for YouTube MediaFiles
                flashVideoDownloadContextMenu.appendChild(menuItem);
            }
	    
            this.createMenuItemDisplayAll(flashVideoDownloadContextMenu, doc);	    	    
        }
    	var isButtonEnabled = false;	// indicates if a video/flash was found, turns blue if it find a video/flash
    	var statusBarCSSClass;
	
        if (doc.videoFilesList.length > 0 && isShowVideoFiles) {
    	    isButtonEnabled = true;
    	    if (this.hasStatusbarButtonOn()) {
        		statusBarCSSClass = this.VersionInfo.hasAddonBar() ? "fnvfox_toolbarButtonIconEnabledVideo toolbarbutton-1 chromeclass-toolbar-additional" : "fnvfox_statusBarIconEnabledVideo";
        		document.getElementById(this.STATUSBAR_BUTTON).setAttribute("class", statusBarCSSClass);
	        }	    	    
    	    if (this.hasToolbarButtonOn()) {
    		  document.getElementById(this.TOOLBAR_BUTTON).setAttribute("class", "fnvfox_toolbarButtonIconEnabledVideo toolbarbutton-1 chromeclass-toolbar-additional");	// toolbar button icon - added in version 0.3.6
	        }
    	} else {
    	    if (doc.flashFilesList.length > 0 && isShowFlashFiles) {
        		isButtonEnabled = true;
        		if (this.hasStatusbarButtonOn()) {
        		    statusBarCSSClass = this.VersionInfo.hasAddonBar() ? "fnvfox_toolbarButtonIconEnabled toolbarbutton-1 chromeclass-toolbar-additional" : "fnvfox_statusBarIconEnabled";
        		    document.getElementById(this.STATUSBAR_BUTTON).setAttribute("class", statusBarCSSClass);	// toolbar button icon - added in version 0.3.6
        		}
        		if (this.hasToolbarButtonOn()) {
        		    document.getElementById(this.TOOLBAR_BUTTON).setAttribute("class", "fnvfox_toolbarButtonIconEnabled toolbarbutton-1 chromeclass-toolbar-additional");	// toolbar button icon - added in version 0.3.6
        		}
    	    }
    	}
        
        if (!isButtonEnabled) {
            if (this.hasStatusbarButtonOn()) {
                statusBarCSSClass = this.VersionInfo.hasAddonBar() ? "fnvfox_toolbarButtonIconDisabled toolbarbutton-1 chromeclass-toolbar-additional" : "fnvfox_statusBarIconDisabled";
                document.getElementById(this.STATUSBAR_BUTTON).setAttribute("class", statusBarCSSClass);	// toolbar button icon - added in version 0.3.6
            }            
            if (this.hasToolbarButtonOn()) {
                document.getElementById(this.TOOLBAR_BUTTON).setAttribute("class", "fnvfox_toolbarButtonIconDisabled toolbarbutton-1 chromeclass-toolbar-additional");	// toolbar button icon - added in version 0.3.6
            }
        }
        return true;
    };
    
    // creates a menuitem that upon pressing it, will display all available videos, meaning will unhide all hidden menuitems
    this.createMenuItemDisplayAll = function(contextMenu, doc) {
    	if (doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered || !this.isContextMenuItemsHidden(contextMenu)) { return; } // will not add the "Display All" menuitem if it has been already pressed
    	
    	var menuItemSeparator = this.addMenuSeparatorToContextMenu(contextMenu, "fnvfox_menuitemDisplayAllSeparator"); // adds a separator
    	
    	var menuitemDisplayAll = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem");
    	menuitemDisplayAll.setAttribute("label", this.stringbundleConsts.CONTEXT_MENU_SHOW_ALL_VIDEOS);
    	menuitemDisplayAll.setAttribute("id", "fnvfox_menuitemDisplayAll");
    	menuitemDisplayAll.style.textAlign = "center";
    	menuitemDisplayAll.style.fontWeight = "bold";
    	
    	menuitemDisplayAll.addEventListener("command", function(event) {
    	    var menuItems = contextMenu.getElementsByTagName("xul:menuitem");
    	    var invokingButtonId = contextMenu.getAttribute("invokingButtonId");
    	    var invokingButton = document.getElementById(invokingButtonId);
    	    
    	    self.repopMenu = function() {
        		setTimeout(function() {
        		    var doc = getBrowser().selectedBrowser.contentDocument;
        		    var contextMenu = document.getElementById(self.CONTEXT_MENU_ID);
        		    var menuitemDisplayAll = document.getElementById("fnvfox_menuitemDisplayAll");
        		    var menuItemSeparator = document.getElementById("fnvfox_menuitemDisplayAllSeparator");
        		    
        		    contextMenu.showPopup(invokingButton, -1, -1, "popup", "bottomleft", "topleft");
        		    contextMenu.removeEventListener("popuphiding", self.repopMenu, false);
        		    doc.fnvfox_isYouTubeFormatsAndQualitiesUnfiltered = true;
        		    menuitemDisplayAll.hidden = true;
        		    menuItemSeparator.hidden = true;
        		}, 10);	
    	    }
    	    
    	    contextMenu.addEventListener("popuphiding", self.repopMenu, false);
    	    if (menuItems) {
        		for (var i in menuItems) {
        		    menuItems[i].hidden = false;
        		}
    	    }
	   }, false);
	
	   contextMenu.appendChild(menuitemDisplayAll);
    };
    
    // checks for any hidden context menu items (YouTube menuitems may be filtered and therefore hidden)
    this.isContextMenuItemsHidden = function(contextMenu) {
    	try {
    	    var menuItems = contextMenu.getElementsByTagName("xul:menuitem");
    	    for (var i in menuItems) {
                if (menuItems[i].hidden == true) { return true; }
    	    }
    	    return false;
    	} catch(ex) { log(ex); return false; }
    };
    
    // adds a menuitem separator to a context menu
    this.addMenuSeparatorToContextMenu = function(contextMenu, id) {
    	var separator = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuseparator");
    	if (id) { separator.setAttribute("id", id); }
    	contextMenu.appendChild(separator);
    	
    	return separator;
    };
    
    this.setFileContextMenuOptions = function(event) {        
        var menuitem = document.popupNode;	// selected menuitem
        var contextDownload = document.getElementById("flashVideoDownloadFileContextMenuDownload");
        var contextClipboard = document.getElementById("flashVideoDownloadFileContextMenuClipboard");
    
        contextDownload.onclick = function() {
            self.downloadFile(menuitem.getAttribute("filename"), menuitem.getAttribute("url"), menuitem.getAttribute("type"));
        };
        
        contextClipboard.onclick = function() {
            var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
                getService(Components.interfaces.nsIClipboardHelper);
            clipboard.copyString(menuitem.getAttribute("url"));
        };
    };
    
    this.getDownloadFile = function(defaultString, fileType, isShowFilePicker) {  // need to rewrite function
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
    
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, this.stringbundleConsts.DOWNLOAD_WINDOW_SAVE_AS, nsIFilePicker.modeSave);
        try {
            var urlExt = defaultString.substr(defaultString.lastIndexOf(".")+1, 3);
            if (urlExt != fileType) { defaultString += "." + fileType; }
        } catch(ex) { }
    
        fp.defaultString = defaultString;	// the default filename
        fp.appendFilter(fileType, "*." + fileType);

	   // gets the downloads folder (as nsILocalFile)
    	var downloadsFolder = this.PrefManager.getDownloadsFolder();
	
    	// checks if the user would like to download the file without the file picker window
    	// if no downloads folder has been set (that would be the case if the user selected the option of "Last Saved Folder"), downloading immediately
    	// will be denied and the file picker window will appear.	
    	if (!isShowFilePicker) {
    	    // when adding a filename to the folder's path, it removes the leaf (the last folder)
    	    // so adding the dummy path will be overwritten when the filename is added to the path
    	    downloadsFolder.append("dummy_path");		
    	    downloadsFolder.leafName = defaultString;	// adds the filename to the folder's path
    	    
    	    return downloadsFolder;
    	}

        if (downloadsFolder) { fp.displayDirectory = downloadsFolder; }    
        var rv = fp.show();
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {	    
            var file = fp.file;	// file selected location (where to save the file)
            return file;
        }
        return null;
    };

    this.isShowFilePicker = function() {
        if (this.PrefManager.getDownloadsFolder() && 
            this.PrefManager.getPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOAD_IMMEDIATELY)) {
            return false;
        }
        return true;
    };

    this.renameDownloadFile = function(filename) {
        var matches = filename.match(/\s\(\d+\)/g); // find any matches for example (1), (4), (123)
        if (!matches) { return filename + " (1)"; }
        var lastMatch = matches[matches.length - 1];    // get the last match, which is the relevant one
        // make sure it's at the end of the string
        if (filename.lastIndexOf(lastMatch) !== filename.length-lastMatch.length) {
            return filename + " (1)";
        }
        var fileNum = lastMatch.trim();
        fileNum = fileNum.substr(1);
        fileNum = parseInt(fileNum);
        fileNum++;
        filename = filename.substring(0, filename.length-lastMatch.length);
        return filename + " (" + fileNum + ")";
    };

    this.downloadFileUsingDownloadsJSM = function(url, file) {
        var imports = {};
        Components.utils.import("resource://gre/modules/Downloads.jsm", imports);
        Components.utils.import("resource://gre/modules/Task.jsm", imports);
        var Downloads = imports.Downloads;
        var Task = imports.Task;

        Task.spawn(function () {
            let list = yield Downloads.getList(Downloads.ALL);
            try {
                let download = yield Downloads.createDownload({
                    source: url,
                    target: file
                });
                list.add(download);
                try {
                    download.start();                    
                } finally { }
            } finally { }
        }).then(null, Components.utils.reportError);
    };
    
    this.downloadFile = function(title, url, fileType) {	
        try {	    
            // uses dta instead of firefox's file picker
            this.DownloadManagers.dta.isActive();
            if (this.DownloadManagers.dta.isActive()) {
                try {
                    var urlExt = title.substr(title.lastIndexOf(".")+1, 3);
                    if (urlExt != fileType) { title += "." + fileType; }
                } catch(ex) { log(ex); }
                this.DownloadManagers.dta.openXulWindow(url, title);
                return;
            }
        }
        catch(ex) { log(ex); }

        try {
            var filename = title;
            var file = this.getDownloadFile(filename, fileType, this.isShowFilePicker());
            var failsafe = 0;
            while (!this.isShowFilePicker() && file.exists()) {
                failsafe++;
                if (failsafe >= 100) { break; }
                filename = this.renameDownloadFile(filename);
                file = this.getDownloadFile(filename, fileType, false);
            }

            if (this.VersionInfo.isVersionBiggerOrEqual("26")) {
                this.downloadFileUsingDownloadsJSM(url, file);
                return;
            }            
    
            var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);  
            var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);  
            
            var uri = ios.newURI(url, null, null);	// source - the link of the file to download
            var target = ios.newFileURI(file);	// target - the location (where to save the file)
            
            // catch a firefox bug
            var xfer = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);
                var privacyContext = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                .getInterface(Components.interfaces.nsIWebNavigation)
                .QueryInterface(Components.interfaces.nsILoadContext);
	    
            xfer.init(uri, target, "", null, null, null, persist, false);  
            persist.progressListener = xfer;
            persist.saveURI(uri, null, null, null, null, file, privacyContext);
        } catch(ex) { log(ex); }
        finally {}
    };
    
    this.init();    
};