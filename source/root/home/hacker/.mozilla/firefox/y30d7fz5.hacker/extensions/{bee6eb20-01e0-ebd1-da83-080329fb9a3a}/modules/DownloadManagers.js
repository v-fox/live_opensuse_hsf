var EXPORTED_SYMBOLS = ["DownloadManagers"];

var DownloadManagers = {
    main : null,	// DownloadManagers.main - a reference to "flashVideoDownload" - should be passed set as a reference from "overlay.js"
    dta : {
        
        // private properties
        id                  : "{DDC359D1-844A-42a7-9AA1-88A850A938A8}",
        xulWindowUrl        : "chrome://dta/content/dta/addurl.xul",
        urlTextboxId	    : "address",
        renamingTextboxId   : "renaming",	// not used
        descriptionTextboxId: "description",
        xulWindow	    : null,
        tempClipboardValue  : "",
        
        // public properties
        isAddonInstalled    : false,
        isUserEnabled	    : true,
        
        // public methods
        init : function() {
            DownloadManagers.dta.checkIfInstalled();
            DownloadManagers.dta.checkIfUserEnabled();
        },

        // dta is active when the addon is installed/active and the user enabled it
        isActive : function() { return DownloadManagers.dta.isAddonInstalled && DownloadManagers.dta.isUserEnabled; },
        
        openXulWindow : function(videoUrl, videoName) {
            if (DownloadManagers.dta.isAddonInstalled) {
                var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher);
                
                // stores the current clipboard's value and then resets (changes value to " ")
                // this is done because if a value exists in the clipboard, it will automatically load it to dta's download url
                DownloadManagers.dta.tempClipboardValue = DownloadManagers.dta.getClipboardValue();
                DownloadManagers.dta.setClipboardValue(" ");
                
                DownloadManagers.dta.xulWindow = ww.openWindow(null, DownloadManagers.dta.xulWindowUrl, "dtaXulWindowAddUrl", "chrome,centerscreen", null);                
                if (DownloadManagers.dta.xulWindow) {
                    DownloadManagers.dta.xulWindow.addEventListener("load", function() { DownloadManagers.dta.setTextboxesValue(videoUrl, videoName); }, false);
                }
            }
        },
        
        // private methods
        checkIfInstalled : function() {
            // Firefox 4 and later; Mozilla 2 and later
            try {                
                var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);
                Application.getExtensions(function(extensions) {
                    var e = extensions.get(DownloadManagers.dta.id);
                    if (e && e.enabled) {
                        DownloadManagers.dta.isAddonInstalled = true;
                    }
                    else {
                        DownloadManagers.dta.isAddonInstalled = false;
                        Components.utils.import("resource://gre/modules/AddonManager.jsm");
                        AddonManager.getAddonByID(DownloadManagers.dta.id, function(addon) {
                            if (addon) {
                                DownloadManagers.dta.isAddonInstalled = true;
                            }
                        });
                    }
                });
            }
            // Firefox 3.6 and before; Mozilla 1.9.2 and before
            catch(e) {
                try {
                    var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication);
                    var ex = Application.extensions.get(DownloadManagers.dta.id);
                    if (ex && ex.enabled){
                        DownloadManagers.dta.isAddonInstalled = true;
                    }
                    else {
                        DownloadManagers.dta.isAddonInstalled = false;
                    }
                // SeaMonkey 2.1 and above
                } catch(e) {
                    var Application = Components.classes["@mozilla.org/smile/application;1"].getService(Components.interfaces.smileIApplication);
                    Application.getExtensions(function(extensions) {
                        var e = extensions.get(DownloadManagers.dta.id);
                        if (e && e.enabled) {
                            DownloadManagers.dta.isAddonInstalled = true;
                        }
                        else {
                            DownloadManagers.dta.isAddonInstalled = false;
                        }
                    });
                }
            }
        },
        checkIfUserEnabled : function() {
            var flashVideoDownloadPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.fnvfox.");
            DownloadManagers.dta.isUserEnabled = flashVideoDownloadPrefs.getBoolPref("general.downloadManagers.dta");
        },            
        
        setTextboxesValue : function(videoUrl, videoName) {
            DownloadManagers.dta.xulWindow.document.getElementById(DownloadManagers.dta.urlTextboxId).value = videoUrl;	
            DownloadManagers.dta.xulWindow.document.getElementById(DownloadManagers.dta.descriptionTextboxId).value = videoName;
            
            // loads back any stored value in the clipboard
            DownloadManagers.dta.xulWindow.setTimeout(function() {
                DownloadManagers.dta.setClipboardValue(DownloadManagers.dta.tempClipboardValue);
            }, 10);            
        },
        
        // stores value in the global clipboard
        setClipboardValue : function(videoUrl) {
            var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
                getService(Components.interfaces.nsIClipboardHelper);
            clipboard.copyString(videoUrl);            
        },
        
        // simply returns the value stored in the global clipboard
        getClipboardValue : function() {
            var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
            if (!clip) return false;
            
            var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);  
            if (!trans) return false;
            
            trans.addDataFlavor("text/unicode");
            clip.getData(trans, clip.kGlobalClipboard);
            
            var str       = new Object();  
            var strLength = new Object(); 
            
            trans.getTransferData("text/unicode", str, strLength);
            
            if (str) {  
                str = str.value.QueryInterface(Components.interfaces.nsISupportsString);  
                var pastetext = str.data.substring(0, strLength.value / 2);
                
                return pastetext;
            }
            
            return false;
        }
    }
};