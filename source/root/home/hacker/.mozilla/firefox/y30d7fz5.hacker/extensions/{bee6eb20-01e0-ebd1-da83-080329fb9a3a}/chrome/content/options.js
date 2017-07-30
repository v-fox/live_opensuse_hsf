var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/FileDownloadManager/DownloadManagers.js");
Cu.import("resource://flashVideoDownload/PrefManager.js");
Cu.import("resource://flashVideoDownload/VersionInfo.js");
Cu.import("resource://flashVideoDownload/log.js");

// ff modules
Cu.import("resource://gre/modules/AddonManager.jsm");

var log;                // module
var PrefManager;        // module
var DownloadManagers;   // module
var VersionInfo;        // module
var AddonManager;       // module

var options = new function() {
    // consts
    this.ADDON_ID            = "{bee6eb20-01e0-ebd1-da83-080329fb9a3a}";
    this.TOOLBAR_BUTTON      = "fnvfox_toolbarButton";
    this.STATUSBAR_BUTTON    = "fnvfox_statusbarButton";

    this.downloadManagers = null;
    
    // methods
    this.init = function() {
        this.downloadManagers = new DownloadManagers();

        window.addEventListener("load", this.onload.bind(this), false);
        window.addEventListener("unload", this.onUnload.bind(this), false);
    };

    this.onload = function() {
        this.setLabelVersionNumber();
        this.setStartupOptions();
    };

    this.onUnload = function() {
        PrefManager.shutdown();
    };
    
    this.setLabelVersionNumber = function() {
        AddonManager.getAddonByID(this.ADDON_ID, function(addon) {
            document.getElementById("about_versionValue").setAttribute("value", addon.version);
        });
    };
    
    // prevents unchecking an option for 2 sets options, if that's the only one left checked
    this.checkPrefChange = function(optionElement, secondOptionElement) {            
        if (!optionElement.checked && !secondOptionElement.checked) {
            optionElement.checked = true;
        }
    };
    
    this.browseDownloadsFolder = function() {
        var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
        filePicker.init(window, "Select Downloads Folder", filePicker.modeGetFolder);
        var result = filePicker.show(); // returnOK / returnCancel / returnReplace
        if (result == filePicker.returnOK) {
            document.getElementById("downloadsFolderTextbox").value = " " + filePicker.file.path; // sets the textbox's value to the selected folder
            
            this.setDownloadFolderImage(filePicker.file);
        }
    };
    
    // save preferences manually for elements without a preference id (such as textboxes that change via javascript)
    this.save = function() {
        var downloadsFolder = document.getElementById("downloadsFolderTextbox").value.substring(1); // 'substring' to remove the first space char        
        PrefManager.setPref(PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER, downloadsFolder);
        this.saveDownloadsFolderRadiogroupSelectedOption();
        this.saveColorThemeRadiogroupSelectedOption();
    };
    
    // reads preferences and sets the option elements accordingly
    // also checks for anything that might affect the default state of to options when they are loaded (such as checking if "dta" is installed)
    this.setStartupOptions = function() {
        if (!VersionInfo.isVersion29()) {
            if (VersionInfo.isVersion4()) { this.setToolbarButtonOptionCheckbox(this.STATUSBAR_BUTTON, "statusbarButtonOption", PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON); }
            else { this.setToolbarButtonOptionCheckboxOldVer(this.STATUSBAR_BUTTON, "statusbarButtonOption", PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON); }
            
            this.setToolbarButtonOptionCheckbox(this.TOOLBAR_BUTTON, "toolbarButtonOption", PrefManager.PREFS.GENERAL.INTERFACE.TOOLBAR_BUTTON);
        }
        this.setDtaOptionCheckbox();
        this.setDownloadsFolderTextbox();
        this.setDownloadsFolderRadiogroup();
        this.setDownloadsGroupbox();
        this.setRadioGroupListener();
        this.setColorThemeRadiogroup();
        //var general = document.getElementById("general");
        //document.getElementById("fnvOptions").showPane(general);
    };
    
    this.downloadsGroupboxEnabled = function(enabled) {
        document.getElementById("downloadsRadiogroup").disabled = !enabled;
        document.getElementById("downloadsStart").disabled = !enabled;
        document.getElementById("downloadsBrowseButton").disabled = !enabled;
        document.getElementById("downloadsFolderTextbox").disabled = !enabled;
        
        if (enabled && this.isLastSavedFolderSelected()) {                 
            this.enabledStartDownlodsImmediately(false);
        }
    };

    this.setColorThemeRadiogroup = function() {
        if (PrefManager.getPref(PrefManager.PREFS.GENERAL.THEME.DARK)) {
            var colorThemeRadiogroup = document.getElementById("colorThemeRadiogroup");
            var colorThemeDarkOptionRadio = document.getElementById("colorThemeDarkOptionRadio");
            colorThemeRadiogroup.selectedItem = colorThemeDarkOptionRadio;
        }
    };
    
    this.setDownloadsGroupbox = function() {
        var dtaOptionCheckbox = document.getElementById("dtaOptionCheckbox");
        if (dtaOptionCheckbox.checked) {
            this.downloadsGroupboxEnabled(false);           
        }
        else {
            this.downloadsGroupboxEnabled(true);          
        }
    };
    
    this.setDownloadsFolderRadiogroup = function() {
        var downloadsRadiogroup = document.getElementById("downloadsRadiogroup");
        var lastSavedFolder = document.getElementById("lastSavedFolder");
        var firefoxDownloadsFolder = document.getElementById("firefoxDownloadsFolderOptionRadio");
        var saveToDownloadsFolder = document.getElementById("saveToOptionRadio");
        
        if (PrefManager.getPref(PrefManager.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER)) {
            downloadsRadiogroup.selectedItem = firefoxDownloadsFolder;
        }
        else if(PrefManager.getPref(PrefManager.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER)) {
            downloadsRadiogroup.selectedItem = lastSavedFolder;
        }
        else {
            downloadsRadiogroup.selectedItem = saveToDownloadsFolder;
        }
    };
    
    this.saveDownloadsFolderRadiogroupSelectedOption = function() {
        var downloadsRadiogroup = document.getElementById("downloadsRadiogroup");
        var lastSavedFolder = document.getElementById("lastSavedFolder");
        var firefoxDownloadsFolder = document.getElementById("firefoxDownloadsFolderOptionRadio");
        
        PrefManager.setPref(PrefManager.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER, false);
        PrefManager.setPref(PrefManager.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER, false);
        
        if (downloadsRadiogroup.selectedItem == lastSavedFolder) {
            PrefManager.setPref(PrefManager.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER, true);            
        }
        else if (downloadsRadiogroup.selectedItem == firefoxDownloadsFolder) {
            PrefManager.setPref(PrefManager.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER, true);            
        }
    };
    
    // checks if the toolbar button exists in the browser.xul window and sets the checkbox accordingly
    // (this is done because the user may remove the toolbar button manually via Firefox options)
    this.setToolbarButtonOptionCheckbox = function(buttonName, optionName, prefName) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator);  
        var win = wm.getMostRecentWindow("navigator:browser");	// gets the navigator window (because the current window is the options window)
        
        var isSet = false;
        if (win.document.getElementById(buttonName)) { var isSet = true; }
        
        // updating the preference is necessary because the user could have removed it manually
        PrefManager.setPref(prefName, isSet);
        document.getElementById(optionName).value = isSet;
    };
    
    this.setToolbarButtonOptionCheckboxOldVer = function(buttonName, optionName, prefName) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator);  
        var win = wm.getMostRecentWindow("navigator:browser");	// gets the navigator window (because the current window is the options window)
        
        var isSet = false;        
        if (!win.document.getElementById(buttonName).parentNode.hidden) { var isSet = true; }
        // updating the preference is necessary because the user could have removed it manually
        PrefManager.setPref(prefName, isSet);
        document.getElementById(optionName).value = isSet;            
    };
    
    // checks if DownThemAll is installed and sets the option checkbox accordingly
    // (if not installed, then the checkbox is disabled, otherwise enabled)
    this.setDtaOptionCheckbox = function() {
        var dtaOptionCheckbox = document.getElementById("dtaOptionCheckbox");
        log(this.downloadManagers.DTA)
        dtaOptionCheckbox.disabled = !this.downloadManagers.DTA.isAddonInstalled;
        if (dtaOptionCheckbox.disabled) {
            dtaOptionCheckbox.checked = false;
        }
    };
    
    // sets the downloads folder when the Options window loads.
    // it checks its preference and set downloads folder textbox accordingly with its path
    this.setDownloadsFolderTextbox = function() {
        var downloadsFolder = PrefManager.getPref(PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER);
        if (downloadsFolder == "") { // no location selected
            // gets firefox downloads location instead
            downloadsFolder = PrefManager.getFirefoxDownloadsLocation();
        }
        document.getElementById("downloadsFolderTextbox").value = " " + downloadsFolder;
        
        // sets the image for the folder
        var localFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        localFile.initWithPath(downloadsFolder);
        this.setDownloadFolderImage(localFile);        
    };
    
    // inputs the downloads folder's icon in the textbox
    this.setDownloadFolderImage = function(nsIFile) {        
        var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var fileProtocolHandler = iOService.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);            
        var textboxImage = document.getElementById("downloadsFolderTextboxImage");
        textboxImage.setAttribute('src', 'moz-icon://' + fileProtocolHandler.getURLSpecFromFile(nsIFile));        
    };

    this.enabledDownloadsStartCheckBox = function(enabled) {
        document.getElementById("downloadsStart").disabled = !enabled;
    };
    
    this.setRadioGroupListener = function() {        
        // older versions compatibility code - version 1.34 allowed to have "Last Saved Folder" option selected with "Download Immediately" -
        // which caused a bug (nothing happened - no file got downloaded)
        // this few lines of code make sure to deselect "Download Immediately" if "Last Saved Folder" is set.
        if (this.isLastSavedFolderSelected()) {
            this.enabledStartDownlodsImmediately(false);
        }
        
        document.getElementById("downloadsRadiogroup").addEventListener("command", function(event) {
            if (this.isLastSavedFolderSelected()) {
                this.enabledStartDownlodsImmediately(false);
            }
            else {
                this.enabledDownloadsStartCheckBox(true);
            }
        }.bind(this), false);
    };
    
    this.isLastSavedFolderSelected = function() {                
        return document.getElementById("lastSavedFolder").selected;
    };
    
    this.enabledStartDownlodsImmediately = function(enabled) {
        document.getElementById("downloadsStart").checked = enabled;                
        PrefManager.setPref(PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOAD_IMMEDIATELY, enabled);
        this.enabledDownloadsStartCheckBox(enabled);
    };

    this.saveColorThemeRadiogroupSelectedOption = function() {
        var colorThemeRadiogroup = document.getElementById("colorThemeRadiogroup");
        var colorThemeLightOptionRadio = document.getElementById("colorThemeLightOptionRadio");
        if (colorThemeRadiogroup.selectedItem == colorThemeLightOptionRadio) {
            PrefManager.setPref(PrefManager.PREFS.GENERAL.THEME.LIGHT, true);
            PrefManager.setPref(PrefManager.PREFS.GENERAL.THEME.DARK, false);
        } else {
            PrefManager.setPref(PrefManager.PREFS.GENERAL.THEME.LIGHT, false);
            PrefManager.setPref(PrefManager.PREFS.GENERAL.THEME.DARK, true);            
        }
    };

    this.init();
};