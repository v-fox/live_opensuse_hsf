var flashVideoDownload = new function() {
    var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

    // modules
    var log;
    var logt;
    var logtr;
    var err;
    var ExceptionsLogger;
    var WM;
    var ToolbarButton;
    var StringBundle;
    var PrefManager;
    var SimpleObserver;
    var FileDownloadManager;
    var Subscriber;
    var OpenPage;
    var Observer;
    var FileData;
    var FileLabel;
    var FirstRun;
    var UIController;
    var DataModel;
    var LocaleBinder;
    
    var ModulesList;    // object that contains all the modules

    // consts
    var TOOLBAR_BUTTON          = "fnvfox_toolbarButton";
    var STATUSBAR_BUTTON        = "fnvfox_statusbarButton";         // firefox 4 and above
    var STATUS_BAR_BUTTON_VER3  = "fnvfox_statusbarButton_ver3";    // firefox 3.6 and below
    var CONTEXT_MENU_ID         = "flashVideoDownloadContextMenu";
    
    var NAV_BAR                 = "nav-bar";
    var ADDON_BAR               = "addon-bar";  // firefox 4 and above
    var STATUS_BAR              = "status-bar"; // firefox 3.6 and below    
    
    var TY_PAGE                 = "thankyou.html";
    var DOMAIN_NAME             = "http://fnvfox.appspot.com/";
    var TY_PAGE_FULL_PATH       = "";

    this.popupObject                = null;
    this.toolbarButton              = null;    
    this.dataModel                  = null;
    this.uIController               = null;
    this.simpleObserver             = null;
    this.localeBinder               = null;

    this.init = function() {
        this.loadPriorityModules();
        log("\"fnvfox\" debug mode on");
        log("\"fnvfox\" 'overlay.js' loaded");
        // logt("hey");

        window.addEventListener("load", this.onload.bind(this), false);
        window.addEventListener("unload", this.onUnload.bind(this), false);
    };

    this.loadPriorityModules = function() {
        logModules          = this.loadModule("resource://flashVideoDownload/log.js", true);
        log = logModules["log"];
        logt = logModules["logt"];
        logtr = logModules["logtr"];
        err = logModules["err"];
        ExceptionsLogger    = this.loadModule("resource://flashVideoDownload/ExceptionsLogger.js");
    };

    this.loadModules = function() {
        WM                  = this.loadModule("resource://flashVideoDownload/WM.js");
        ToolbarButton       = this.loadModule("resource://flashVideoDownload/ToolbarButton.js");
        StringBundle        = this.loadModule("resource://flashVideoDownload/StringBundle.js");
        PrefManager         = this.loadModule("resource://flashVideoDownload/PrefManager.js");
        OpenPage            = this.loadModule("resource://flashVideoDownload/OpenPage.js");
        Observer            = this.loadModule("resource://flashVideoDownload/Observer.js");
        FirstRun            = this.loadModule("resource://flashVideoDownload/FirstRun.js");
        UIController        = this.loadModule("resource://flashVideoDownload/UIController.js");
        DataModel           = this.loadModule("resource://flashVideoDownload/DataModel.js");
        SimpleObserver      = this.loadModule("resource://flashVideoDownload/SimpleObserver/SimpleObserver.js");
        Subscriber          = this.loadModule("resource://flashVideoDownload/SimpleObserver/Subscriber.js");
        FileData            = this.loadModule("resource://flashVideoDownload/FileData/FileData.js");
        FileLabel           = this.loadModule("resource://flashVideoDownload/FileLabel.js");
        FileDownloadManager = this.loadModule("resource://flashVideoDownload/FileDownloadManager/FileDownloadManager.js");
        LocaleBinder = this.loadModule("resource://flashVideoDownload/LocaleBinder.js");

        ModulesList = {
            WM:                     WM,
            ToolbarButton:          ToolbarButton, 
            StringBundle:           StringBundle, 
            PrefManager:            PrefManager, 
            OpenPage:               OpenPage, 
            Observer:               Observer, 
            FirstRun:               FirstRun, 
            UIController:           UIController, 
            DataModel:              DataModel, 
            SimpleObserver:         SimpleObserver, 
            Subscriber:             Subscriber,
            FileData:               FileData,
            FileLabel:              FileLabel,
            FileDownloadManager:    FileDownloadManager,
            LocaleBinder:           LocaleBinder
        };

        logt(StringBundle);
    };

    this.onload = function() {
        try {
            this.loadModules();
            this.createSimpleObserver();
            this.createDataModel();
            this.createUIController();
            this.createToolbarButtons();
            OpenPage.checkVer();
            this.setFirstRun();
        } catch(ex) { 
            err(ex);
        }
    };

    this.onUnload = function() {
        PrefManager.shutdown();
        this.dataModel.shutdown();
        this.uIController.shutdown();
    };

    this.getPopupObjectFromIframe = function() {
        var iframe = document.getElementById("fnvfoxIframe");
        return iframe.contentDocument.defaultView["flashVideoDownload_popup"];
    };

    this.setPopupObjectReference = function() {
        this.popupObject = this.getPopupObjectFromIframe();
    };

    this.loadModule = function(url, isMultiModules) {
        var moduleTemp = {};
        Cu.import(url, moduleTemp);

        if (isMultiModules) {
            return moduleTemp;
        }

        var name = url.split("/");
        name = name[name.length-1];
        name = name.split(".")[0];
        return moduleTemp[name];
    };

    this.createSimpleObserver = function() {
        this.simpleObserver = new SimpleObserver();
    };

    this.createDataModel = function() {
        this.dataModel = new DataModel({
            window: window,
            simpleObserver: this.simpleObserver
        });
    };

    this.createUIController = function() {
        this.uIController = new UIController({
            window: window, 
            dataModel: this.dataModel,
            simpleObserver: this.simpleObserver,
            ModulesList: ModulesList
        });
    };

    // maybe should move to the UIController ??
    this.createToolbarButtons = function() {
        this.toolbarButton = new ToolbarButton({
            window: window,
            buttonName: TOOLBAR_BUTTON,
            toolbarName: NAV_BAR,
            label: StringBundle.get("addon.toolbarButtonLabel"),
            tooltip: StringBundle.get("addon.name"),
            simpleObserver: this.simpleObserver
        });
    };

    this.setFirstRun = function() {
        FirstRun.setFirstRunEvent(function() {
            // console.log(this);
            // console.log("FirstRun Event Ran!");
            PrefManager.setPref(PrefManager.PREFS.GENERAL.INTERFACE.TOOLBAR_BUTTON, true);
            this.toolbarButton.addToolbarButton();
            // self.statusbarButton.addToolbarButton();
        }.bind(this));
        FirstRun.checkIsFirstRun();
    };

    this.init();
};