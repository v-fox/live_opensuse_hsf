var EXPORTED_SYMBOLS = ["PrefManager"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;            // module

var PrefManager = new function() {
    var self = this;
    
    var PREFS_BRANCH = "extensions.fnvfox.";
    
    // properties
    this.main = null;
    this.prefs = null;
    this.prefNames = [];
    this.children = [];
    
    // enums
    this.PREFS = {
        GENERAL: {
            THEME: {
                LIGHT                           : "general.theme.light",
                DARK                            : "general.theme.dark",
            },
            INTERFACE: {
                TOOLBAR_BUTTON                  : "general.interface.toolbarButton",        // boolPref
                STATUSBAR_BUTTON                : "general.interface.statusbarButton"       // boolPref
            },
            FLASH_AND_VIDEO_FILES: {
                SHOW_FLASH_FILES                : "general.flashAndVideoFiles.showFlashFiles",  // boolPref
                SHOW_VIDEO_FILES                : "general.flashAndVideoFiles.showVideoFiles"   // boolPref
            },
            DOWNLOAD_MANAGERS: {
                DTA                             : "general.downloadManagers.dta"        // boolPref
            },
            DOWNLOADS: {
                DOWNLOADS_FOLDER                : "general.downloads.downloadsFolder",              // charPref
                USE_FIREFOX_DOWNLOADS_FOLDER    : "general.downloads.useFirefoxDownloadsFolder",    // boolPref
                LAST_SAVED_FOLDER               : "general.downloads.useLastSavedFolder",           // boolPref
                DOWNLOAD_IMMEDIATELY            : "general.downloads.downloadImmediately",          // boolPref
                SUGGEST_ALTERNATIVE_FILENAMES   : "general.downloads.suggestAlternativeFilenames"   // boolPref
            }
        },
        YT: {
            FORMATS: {
                MP4     : "yt.formats.mp4",    // boolPref
                WEBM    : "yt.formats.webm",   // boolPref
                FLV     : "yt.formats.flv",    // boolPref
                _3GP    : "yt.formats.3gp",    // boolPref
                WEBM_3D : "yt.formats.3dwebm", // boolPref
                MP4_3D  : "yt.formats.3dmp4"   // boolPref
            },
            
            QUALITIES: {
                _144P       : "yt.qualities.144p",        // boolPref
                _240P       : "yt.qualities.240p",        // boolPref
                _270P       : "yt.qualities.270p",        // boolPref
                _360P       : "yt.qualities.360p",        // boolPref
                _480P       : "yt.qualities.480p",        // boolPref
                _520P       : "yt.qualities.520p",        // boolPref
                _720P       : "yt.qualities.720p",        // boolPref
                // _1080P : "yt.qualities.1080p",      // boolPref
                _3072P      : "yt.qualities.3072p",      // boolPref
                _240P_3D    : "yt.qualities.3d240p",   // boolPref
                _360P_3D    : "yt.qualities.3d360p",   // boolPref
                _480P_3D    : "yt.qualities.3d480p",   // boolPref
                _520P_3D    : "yt.qualities.3d520p",   // boolPref
                _720P_3D    : "yt.qualities.3d720p"    // boolPref
            },
            
            EMBEDDED_VIDEOS: {
                ENHANCED_DETECTION : "yt.embeddedVideos.enhancedDetection"
            }
        },
        OTHER: {
            VERSION: "other.version",
            FIRSTRUN: "other.firstRun"
        }
    };
    
    // public methods
    
    // acts as a constructor
    this.init = function() {
        // Register to receive notifications of preference changes      
        this.prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch(PREFS_BRANCH);  
        this.prefs.QueryInterface(Ci.nsIPrefBranch2);  
        this.prefs.addObserver("", this, false);
        this.children = this.getPrefsChildren();
        this.setFirstRunDownloadsFolderPref();
    };

    this.shutdown = function() { this.prefs.removeObserver("", this); }.bind(this);
    
    this.registerPrefName = function(prefName, prefFunc) {  
        this.prefNames.push({ name : prefName, func : prefFunc });
    };    
    
    this.getPref = function(prefName) {
        for(var i = 0; i < this.children.length; i++) {
            if (prefName == this.children[i].name) {
                switch(this.children[i].type) {
                    case this.prefs.PREF_STRING :
                        return this.prefs.getCharPref(prefName);
                    break;
                    case this.prefs.PREF_INT :
                        return this.prefs.getIntPref(prefName);
                    break;
                    case this.prefs.PREF_BOOL :
                        return this.prefs.getBoolPref(prefName);
                    break;
                    case this.prefs.PREF_INVALID :
                        return null;
                    break;
                }
            }
        }
        return null;
    };
    
    this.setPref = function(prefName, prefValue) {
        var prefType;
        for(var i = 0; i < this.children.length; i++) {
            if (prefName == this.children[i].name) {
                prefType = this.children[i].type;
            }
        }
        switch(prefType) {
            case this.prefs.PREF_STRING :
                this.prefs.setCharPref(prefName, prefValue);
            break;
            case this.prefs.PREF_INT :
                this.prefs.setIntPref(prefName, prefValue);
            break;
            case this.prefs.PREF_BOOL :
                this.prefs.setBoolPref(prefName, prefValue);
            break;
            case this.prefs.PREF_INVALID :
                return null;
            break;      
        }
        if (prefType) { }
    };
    
    // private methods
    
    this.observe = function(subject, topic, data) {
        if (topic != "nsPref:changed")  {  
            return;  
        }
        
        // checks all preferences and finds the matching one, then runs its corresponding function
        for (var i = 0; i < this.prefNames.length; i++) {
            if (this.prefNames[i].name == data) {
                this.prefNames[i].func();
            }
        } 
    }; 
    
    // returns all preferences for this prefs manager's brench in name/type pairs
    // types are : PREF_STRING, PREF_INT, PREF_BOOL, or PREF_INVALID.    
    this.getPrefsChildren = function() {
        var childList = this.prefs.getChildList("", {}); // returns all preferences values in an array
        var children = [];
        for(var i = 0; i < childList.length; i++) {
            children.push({
                name : childList[i],
                type : this.prefs.getPrefType(childList[i])
            });
        }
        return children;
    };
    
    // Returns the user configured downloads directory. 
    // The path is dependent on two user configurable prefs set in preferences:
    //
    // browser.download.folderList defines the default download location for files:
    //  0: Files are downloaded to the desktop by default.
    //  1: Files are downloaded to the system's downloads folder by default.
    //  2: Files are downloaded to the local path specified by the browser.download.dir preference. If this preference is invalid, the download directory falls back to the default.
    this.getFirefoxDownloadsLocation = function() {
        try {
            var downloadManager = Cc["@mozilla.org/download-manager;1"]
                .getService(Ci.nsIDownloadManager);
            
            return downloadManager.userDownloadsDirectory.path;
        } catch(e) { return false; }
    };
    
    this.getFirefoxDownloadsLocationAsLocalFile = function() {
        var localFile = Cc["@mozilla.org/file/local;1"]
            .createInstance(Ci.nsILocalFile);
        
        // NS_ERROR_FILE_UNRECOGNIZED_PATH may be thrown if the file path is not absolute
        try {
            localFile.initWithPath(this.getFirefoxDownloadsLocation());
            if (!localFile.exists()) {
                return false;
            }
        } catch(e) { return false; }
        
        return localFile;
    };
    
    this.getUserDefinedDownloadsFolderAsLocalFile = function() {
        var localFile = Cc["@mozilla.org/file/local;1"]
            .createInstance(Ci.nsILocalFile);
            
        // NS_ERROR_FILE_UNRECOGNIZED_PATH may be thrown if the file path is not absolute
        try {
            localFile.initWithPath(this.getPref(this.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER));
            if (!localFile.exists()) {
                return false;
            }
        } catch(e) { return false; }
        
        return localFile;       
    };
    
    // sets "extensions.fnvfox.general.downloads.downloadsFolder" preference to firefox's default downloads folder
    // this only sets the pref if no downloads folder was set, meaning is sets the pref on its first run
    this.setFirstRunDownloadsFolderPref = function() {      
        var downloadsFolder = this.getPref(this.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER);
        if (downloadsFolder == "") { // no location selected        
            downloadsFolder = this.getFirefoxDownloadsLocation();
            this.setPref(this.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER, downloadsFolder);
        }
    };
    
    // returns nsILocalFile inited with the downloads folder or false if none found nor exists
    this.getDownloadsFolder = function() {
        var useFirefoxDownloadsFolder = this.getPref(this.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER);        
        var lastSavedFolder = this.getPref(this.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER);
        //var downloadImmediately = this.getPref(this.PREFS.GENERAL.DOWNLOADS.DOWNLOAD_IMMEDIATELY);
        var localFile = this.getFirefoxDownloadsLocationAsLocalFile();        
        
        if (!useFirefoxDownloadsFolder) {
            if (lastSavedFolder) { return null; }
            
            localFile = this.getUserDefinedDownloadsFolderAsLocalFile();
            if (!localFile) {
                localFile = this.getFirefoxDownloadsLocationAsLocalFile();
            }
        }
        
        return localFile;
    };
    
    // checks if one of the youtube formats prefs is set to false, meaning if any of the formats is filtered
    this.isYouTubeFormatsFiltered = function() {
        var formats = this.PREFS.YT.FORMATS;
        for (var i in formats) {
            if (!this.getPref(formats[i])) {
                return true;
            }
        }
        return false;
    };
    
    // registers all youtube formats to the same function
    this.registerAllYouTubeFormats = function(prefFunc) {
        var formats = this.PREFS.YT.FORMATS;
        for (var i in formats) {
            this.registerPrefName((formats[i]), prefFunc);
        }
    };
    
    this.registerAllYouTubeQualities = function(prefFunc) {
        var qualities = this.PREFS.YT.QUALITIES;
        for (var i in qualities) {
            this.registerPrefName((qualities[i]), prefFunc);
        }
    };
    
    this.registerAllYouTubeEmbeddedVideos = function(prefFunc) {
        var embeddedVidees = this.PREFS.YT.EMBEDDED_VIDEOS;
        for (var i in embeddedVidees) {
            this.registerPrefName((embeddedVidees[i]), prefFunc);
        }
    };

    this.init();
};