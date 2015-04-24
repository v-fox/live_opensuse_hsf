var options = new function() {
    var self = this;

    // consts
    this.TOOLBAR_BUTTON      = "fnvfox_toolbarButton";
    this.STATUSBAR_BUTTON    = "fnvfox_statusbarButton";
    
    // properties
    this.PrefManager         = null;
    this.DownloadManagers    = null;     // will be imported from a module
    this.Classes             = null;     // will be imported from a module
    this.VersionInfo         = null;     // will be imported from a module
    
    // methods
    this.initialization = function() {                        
        this.loadModules();
        
        window.addEventListener("load", this.onLoad, false);
        window.addEventListener("unload", this.onUnload, false);
    };
    
    this.loadModules = function() {
        Components.utils.import("resource://flashVideoDownload/DownloadManagers.js", this);
        Components.utils.import("resource://flashVideoDownload/Classes.js", this);
        Components.utils.import("resource://flashVideoDownload/PrefManager.js", this);
        Components.utils.import("resource://flashVideoDownload/VersionInfo.js", this);
    };

    this.onLoad = function() {
        self.PrefManager.startup();
        self.setStartupOptions();
        self.setLabelVersionNumber();
    };

    this.onUnload = function() {
        self.PrefManager.shutdown();
    };
    
    this.setLabelVersionNumber = function() {
        document.getElementById("about_versionValue").setAttribute("value", this.Classes.main.addonVersion);
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
            document.getElementById("fnvfox_downloadsFolderTextbox").value = " " + filePicker.file.path; // sets the textbox's value to the selected folder
            
            this.setDownloadFolderImage(filePicker.file);
        }
    };
    
    // save preferences manually for elements without a preference id (such as textboxes that change via javascript)
    this.save = function() {
        var downloadsFolder = document.getElementById("fnvfox_downloadsFolderTextbox").value.substring(1); // 'substring' to remove the first space char
        downloadsFolder = encodeURI(downloadsFolder);
        this.PrefManager.setPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER, downloadsFolder);
        this.saveDownloadsFolderRadiogroupSelectedOption();
    };
    
    // reads preferences and sets the option elements accordingly
    // also checks for anything that might affect the default state of to options when they are loaded (such as checking if "dta" is installed)
    this.setStartupOptions = function() {
        if (!this.VersionInfo.isVersion29()) {
            if (this.VersionInfo.isVersion4()) { this.setToolbarButtonOptionCheckbox(this.STATUSBAR_BUTTON, "fnvfox_statusbarButtonOption", this.PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON); }
            else { this.setToolbarButtonOptionCheckboxOldVer(this.STATUSBAR_BUTTON, "fnvfox_statusbarButtonOption", this.PrefManager.PREFS.GENERAL.INTERFACE.STATUSBAR_BUTTON); }
            
            this.setToolbarButtonOptionCheckbox(this.TOOLBAR_BUTTON, "fnvfox_toolbarButtonOption", this.PrefManager.PREFS.GENERAL.INTERFACE.TOOLBAR_BUTTON);
        }
        this.setDtaOptionCheckbox();        
        this.setDownloadsFolderTextbox();
        this.setDownloadsFolderRadiogroup();
        this.setDownloadsGroupbox();
        this.setRadioGroupListener();
        //var general = document.getElementById("general");
        //document.getElementById("fnvOptions").showPane(general);
    };
    
    this.downloadsGroupboxEnabled = function(enabled) {
        document.getElementById("fnvfox_downloadsRadiogroup").disabled = !enabled;
        document.getElementById("fnvfox_downloadsStart").disabled = !enabled;
        document.getElementById("fnvfox_downloadsBrowseButton").disabled = !enabled;
        document.getElementById("fnvfox_downloadsFolderTextbox").disabled = !enabled;
        
        if (enabled && this.isLastSavedFolderSelected()) {                 
            this.enabledStartDownlodsImmediately(false);
        }
    };
    
    this.setDownloadsGroupbox = function() {
        var dtaOptionCheckbox = document.getElementById("fnvfox_dtaOptionCheckbox");
        if (dtaOptionCheckbox.checked) {
            this.downloadsGroupboxEnabled(false);           
        }
        else {
            this.downloadsGroupboxEnabled(true);          
        }    
    };
    
    this.setDownloadsFolderRadiogroup = function() {
        var downloadsRadiogroup = document.getElementById("fnvfox_downloadsRadiogroup");
        var lastSavedFolder = document.getElementById("fnvfox_lastSavedFolder");
        var firefoxDownloadsFolder = document.getElementById("fnvfox_firefoxDownloadsFolderOptionRadio");
        var saveToDownloadsFolder = document.getElementById("fnvfox_saveToOptionRadio");
        
        if (this.PrefManager.getPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER)) {
            downloadsRadiogroup.selectedItem = firefoxDownloadsFolder;
        }
        else if(this.PrefManager.getPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER)) {
            downloadsRadiogroup.selectedItem = lastSavedFolder;
        }
        else {
            downloadsRadiogroup.selectedItem = saveToDownloadsFolder;
        }
    };
    
    this.saveDownloadsFolderRadiogroupSelectedOption = function() {
        var downloadsRadiogroup = document.getElementById("fnvfox_downloadsRadiogroup");
        var lastSavedFolder = document.getElementById("fnvfox_lastSavedFolder");
        var firefoxDownloadsFolder = document.getElementById("fnvfox_firefoxDownloadsFolderOptionRadio");
        
        this.PrefManager.setPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER, false);
        this.PrefManager.setPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER, false);
        
        if (downloadsRadiogroup.selectedItem == lastSavedFolder) {
            this.PrefManager.setPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.LAST_SAVED_FOLDER, true);            
        }
        else if (downloadsRadiogroup.selectedItem == firefoxDownloadsFolder) {
            this.PrefManager.setPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.USE_FIREFOX_DOWNLOADS_FOLDER, true);            
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
        this.PrefManager.setPref(prefName, isSet);
        document.getElementById(optionName).value = isSet;
    };
    
    this.setToolbarButtonOptionCheckboxOldVer = function(buttonName, optionName, prefName) {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator);  
        var win = wm.getMostRecentWindow("navigator:browser");	// gets the navigator window (because the current window is the options window)
        
        var isSet = false;        
        if (!win.document.getElementById(buttonName).parentNode.hidden) { var isSet = true; }
        // updating the preference is necessary because the user could have removed it manually
        this.PrefManager.setPref(prefName, isSet);
        document.getElementById(optionName).value = isSet;            
    };
    
    // checks if DownThemAll is installed and sets the option checkbox accordingly
    // (if not installed, then the checkbox is disabled, otherwise enabled)
    this.setDtaOptionCheckbox = function() {
        var dtaOptionCheckbox = document.getElementById("fnvfox_dtaOptionCheckbox");
        dtaOptionCheckbox.disabled = !this.DownloadManagers.dta.isAddonInstalled;
        if (dtaOptionCheckbox.disabled) {
            dtaOptionCheckbox.checked = false;
        }        
    };
    
    // sets the downloads folder when the Options window loads.
    // it checks its preference and set downloads folder textbox accordingly with its path
    this.setDownloadsFolderTextbox = function() {
        var downloadsFolder = this.PrefManager.getPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOADS_FOLDER);
        downloadsFolder = decodeURI(downloadsFolder);
        if (downloadsFolder == "") { // no location selected
            // gets firefox downloads location instead
            downloadsFolder = this.PrefManager.getFirefoxDownloadsLocation();
        }
        document.getElementById("fnvfox_downloadsFolderTextbox").value = " " + downloadsFolder;
        
        // sets the image for the folder
        var localFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        localFile.initWithPath(downloadsFolder);
        this.setDownloadFolderImage(localFile);        
    };
    
    // inputs the downloads folder's icon in the textbox
    this.setDownloadFolderImage = function(nsIFile) {        
        var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var fileProtocolHandler = iOService.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);            
        var textboxImage = document.getElementById("fnvfox_downloadsFolderTextboxImage");
        textboxImage.setAttribute('src', 'moz-icon://' + fileProtocolHandler.getURLSpecFromFile(nsIFile));        
    };

    this.enabledDownloadsStartCheckBox = function(enabled) {
        document.getElementById("fnvfox_downloadsStart").disabled = !enabled;
    };
    
    this.setRadioGroupListener = function() {        
        // older versions compatibility code - version 1.34 allowed to have "Last Saved Folder" option selected with "Download Immediately" -
        // which caused a bug (nothing happened - no file got downloaded)
        // this few lines of code make sure to deselect "Download Immediately" if "Last Saved Folder" is set.
        if (this.isLastSavedFolderSelected()) {
            this.enabledStartDownlodsImmediately(false);
        }
        
        document.getElementById("fnvfox_downloadsRadiogroup").addEventListener("command", function(event) {
            if (self.isLastSavedFolderSelected()) {
                self.enabledStartDownlodsImmediately(false);
            }
            else {
                self.enabledDownloadsStartCheckBox(true);
            }
        }, false);
    };
    
    this.isLastSavedFolderSelected = function() {                
        return document.getElementById("fnvfox_lastSavedFolder").selected;
    };
    
    this.enabledStartDownlodsImmediately = function(enabled) {
        document.getElementById("fnvfox_downloadsStart").checked = enabled;                
        this.PrefManager.setPref(this.PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOAD_IMMEDIATELY, enabled);
        this.enabledDownloadsStartCheckBox(enabled);
    };
}

options.initialization();