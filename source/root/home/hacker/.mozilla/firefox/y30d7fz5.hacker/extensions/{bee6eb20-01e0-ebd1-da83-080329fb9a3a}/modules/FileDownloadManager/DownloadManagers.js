var EXPORTED_SYMBOLS = ["DownloadManagers"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/PrefManager.js");

// ff modules
Cu.import("resource://gre/modules/AddonManager.jsm");

var log;            // module
var PrefManager;    // module

function DownloadManagers() {
    this.DTA = null;

    this.init();
}

DownloadManagers.prototype = new function() {
    this.init = function() {
        this.DTA = new DTA();
    };
};

// DTA
function DTA() {
    this.isAddonInstalled = false;

    this.init();
}

DTA.prototype = new function() {
    var ID = "{DDC359D1-844A-42a7-9AA1-88A850A938A8}";
    var XUL_WINDOW_URL = "chrome://dta/content/dta/addurl.xul";
    var URL_TEXTBOX_ID = "address";
    var FILENAME_TEXTBOX_ID = "filename";
    var DESCRIPTION_TEXTBOX_ID = "description";

    this.init = function() {
        this.checkIfInstalled();
        // this.checkIfUserEnabled();
    };

    this.checkIfInstalled = function() {
        // Firefox 4 and later; Mozilla 2 and later
        try {
            AddonManager.getAddonByID(ID, function(addon) {
                logt(addon);
                if (addon && addon.id === ID && addon.isActive) {
                    this.isAddonInstalled = true;
                    logt("yippiy");
                    return;
                }
                this.isAddonInstalled = false;
            }.bind(this));
        // SeaMonkey 2.1 and above
        } catch(e) {
            try {
                var Application = Cc["@mozilla.org/smile/application;1"].getService(Ci.smileIApplication);
                Application.getExtensions(function(extensions) {
                    var e = extensions.get(ID);
                    if (e && e.enabled) {
                        this.isAddonInstalled = true;
                    }
                    else {
                        this.isAddonInstalled = false;
                    }
                }.bind(this));
            }
            catch(ex) {}
        }
    };

    // this.checkIfUserEnabled = function() {
        // var flashVideoDownloadPrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.fnvfox.");
        // this.isUserEnabled = flashVideoDownloadPrefs.getBoolPref("general.downloadManagers.dta");
    // };

    this.isUserEnabled = function() {
        return PrefManager.getPref(PrefManager.PREFS.GENERAL.DOWNLOAD_MANAGERS.DTA);        
    };

    this.isActive = function() { return this.isAddonInstalled && this.isUserEnabled(); };

    this.openXulWindow = function(fileUrl, filename, fileDescription) {
        if (this.isAddonInstalled) {
            var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"]
                .getService(Ci.nsIWindowWatcher);
            
            // stores the current clipboard's value and then resets (changes value to " ")
            // this is done because if a value exists in the clipboard, it will automatically load it to dta's download url
            var tempClipboardValue = this.getClipboardValue();
            this.setClipboardValue(" ");
            
            var xulWindow = ww.openWindow(null, XUL_WINDOW_URL, "dtaXulWindowAddUrl", "chrome,centerscreen", null);                
            if (xulWindow) {
                var listener = () => {
                    this.setTextboxesValue(fileUrl, filename, fileDescription, xulWindow, tempClipboardValue); 
                    xulWindow.removeEventListener("load", listener);
                };
                xulWindow.addEventListener("load", listener, false);
            }
        }
    };

    this.setTextboxesValue = function(fileUrl, filename, fileDescription, xulWindow, tempClipboardValue) {
        xulWindow.document.getElementById(URL_TEXTBOX_ID).value = fileUrl; 
        xulWindow.document.getElementById(DESCRIPTION_TEXTBOX_ID).value = fileDescription;
        xulWindow.document.getElementById(FILENAME_TEXTBOX_ID).value = filename;
        
        // loads back any stored value in the clipboard
        xulWindow.setTimeout(function() {
            this.setClipboardValue(tempClipboardValue);
        }.bind(this), 10);
    };

    // stores value in the global clipboard
    this.setClipboardValue = function(fileUrl) {
        var clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].  
            getService(Ci.nsIClipboardHelper);
        clipboard.copyString(fileUrl);
    };

    // simply returns the value stored in the global clipboard
    this.getClipboardValue = function() {
        var clip = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
        if (!clip) return false;
        
        var trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);  
        if (!trans) return false;
        
        trans.addDataFlavor("text/unicode");
        clip.getData(trans, clip.kGlobalClipboard);
        
        var str       = new Object();  
        var strLength = new Object(); 
        
        trans.getTransferData("text/unicode", str, strLength);
        
        if (str) {  
            str = str.value.QueryInterface(Ci.nsISupportsString);  
            var pastetext = str.data.substring(0, strLength.value / 2);
            
            return pastetext;
        }
        return false;
    };

    this.init();    
};