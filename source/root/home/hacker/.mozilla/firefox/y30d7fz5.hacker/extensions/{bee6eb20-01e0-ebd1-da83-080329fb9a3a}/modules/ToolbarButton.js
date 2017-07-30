var EXPORTED_SYMBOLS = ["ToolbarButton"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/VersionInfo.js");
Cu.import("resource://flashVideoDownload/SimpleObserver/SimpleObserver.js");
Cu.import("resource://flashVideoDownload/SimpleObserver/Subscriber.js");
Cu.import("resource://flashVideoDownload/PrefManager.js");

var log;			// module
var VersionInfo		// module
var Subscriber;		// module
var SimpleObserver; // module

var ToolbarButton = function(params) {
	var self = this;

	this.window  			= null;
	this.buttonName 		= null;
	this.toolbarName 		= null;
	this.label 				= null;
	this.tooltip 			= null;
	this.isTypeStatusButton = null;

	this.init(params);
};

ToolbarButton.prototype = new function() {
	this.STYLE_CLASSES = {
		ENABLED: "fnvfox_toolbarButtonEnabled",
		DISABLED: "fnvfox_toolbarButtonDisabled",
		ENABLED_VIDEO: "fnvfox_toolbarButtonEnabledVideo"
	};

	this.init = function(params) {
		this.window = params.window;
		this.simpleObserver = params.simpleObserver;
		this.buttonName = params.buttonName;
		this.toolbarName = params.toolbarName;
		this.label = params.label;
		this.tooltip = params.tooltip;
		this.isTypeStatusButton = false;

		// this.createFileDataAddedFromSelectedDocSubscriber();
		this.createUrlChangedNoDataSubscriber();
		this.createFileDataAddedSubscriber();
		// this.createOnLocationChangeSelectedDocSubscriber();
	};

	// this.createFileDataAddedFromSelectedDocSubscriber = function() {
	// 	var callback = function(fileData, topic) {
	// 		log(this.getButtonDisplay(), 52);
	// 		if (this.getButtonDisplay() === this.STYLE_CLASSES.ENABLED_VIDEO) { return; }
	// 		if (topic === SimpleObserver.TOPICS.FLASH_ADDED_FROM_SELECTED_DOC) {
	// 			// need to check if the state of the button is already on "enabled video" - if so, dont change to just "enabled"
	// 			this.setButtonDisplay(this.STYLE_CLASSES.ENABLED);
	// 		}
	// 		log(this.getButtonDisplay(), 57);
	// 		if (topic === SimpleObserver.TOPICS.VIDEO_ADDED_FROM_SELECTED_DOC) {
	// 			this.setButtonDisplay(this.STYLE_CLASSES.ENABLED_VIDEO);
	// 		};
	// 	};

		// SimpleObserver.subscribe(new Subscriber(
		// 	SimpleObserver.TOPICS.FLASH_ADDED_FROM_SELECTED_DOC, 
		// 	callback.bind(this)
		// ));
		// SimpleObserver.subscribe(new Subscriber(
		// 	SimpleObserver.TOPICS.VIDEO_ADDED_FROM_SELECTED_DOC, 
		// 	callback.bind(this)
		// ));
	// };

	
	this.createUrlChangedNoDataSubscriber = function() {
		var callback = function() {
			this.setButtonDisplay(this.STYLE_CLASSES.DISABLED);
		};

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.URL_CHANGED_NO_DATA,
			callback.bind(this)
		));
	};

	// whenever a file data is added this will handle the toolbar button's view -
	// possible situations:
	// 1. URL changed (another tab selected)
	// 2. Flash data file added from the currently selected document
	// 3. Video data file added from the currently selected document
	this.createFileDataAddedSubscriber = function() {
		// data = {
		// 	urlFileData: urlFileData,	// the entire list of fileDatas
		// 	fileData: fileData 			// the added fileData
		// }		
		var callback = function(data) {
			this.setButtonDisplay(this.STYLE_CLASSES.DISABLED);	// resets it before deciding what to set it to

			if (data.urlFileData.hasVideo() && this.isShowVideoFiles()) {
				this.setButtonDisplay(this.STYLE_CLASSES.ENABLED_VIDEO);
				return;
			}		
			if (data.urlFileData.hasFlash() && this.isShowFlashFiles()) {
				this.setButtonDisplay(this.STYLE_CLASSES.ENABLED);
			}
		};

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.URL_CHANGED_HAS_DATA,
			callback.bind(this)
		));

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.FLASH_ADDED_FROM_SELECTED_DOC, 
			callback.bind(this)
		));

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.VIDEO_ADDED_FROM_SELECTED_DOC, 
			callback.bind(this)
		));		
	};	

	// need to fix maybe
	// this.createOnLocationChangeSelectedDocSubscriber = function() {
	// 	var callback = function(selectedChangedDoc, topic) {
	// 		this.setButtonDisplay(this.STYLE_CLASSES.DISABLED);
	// 	};

	// 	SimpleObserver.subscribe(new Subscriber(
	// 		SimpleObserver.TOPICS.ON_LOCATION_CHANGE_SELECTED_DOC, 
	// 		callback.bind(this)
	// 	));
	// };

    this.addToolbarButton = function() {
    	try {    		
	    	if (this.isTypeStatusButton) {
	    		if (VersionInfo.hasStatusBar()) {
					this.showStatusbarButton();
	    		} else if (VersionInfo.hasAddonBar()) {
	    			this.addButton();
	    		}
	    	} else {
				this.addButton();
	    	}
    	} catch(ex) { err(ex); }
    };

    this.removeToolbarButton = function() {
    	try {
	    	if (this.isTypeStatusButton) {
	    		if (VersionInfo.hasStatusBar()) {
	    			this.hideStatusbarButton();
	    		} else if (VersionInfo.hasAddonBar) {
	    			this.removeButton();
	    		}
	    	} else {
				this.removeButton();
	    	}
    	}
    	catch(ex) { }
    };

    this.addButton = function() {
    	// var win = WM.getWin();
    	// will fail if firefox version is older than 4
	    var toolbarButton = this.window.document.getElementById(this.buttonName);
	    if (toolbarButton) { return false; }	// if a button already exists, do nothing...    		
	    
	    var toolbar = this.window.document.getElementById(this.toolbarName);
	    toolbarButton = this.window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:toolbarbutton");
	    toolbarButton.setAttribute('id', this.buttonName);
	    toolbarButton.setAttribute('label', this.label);
	    toolbarButton.setAttribute('tooltiptext', this.tooltip);
	    this.setButtonDisplay(this.STYLE_CLASSES.DISABLED, toolbarButton);
	    toolbarButton.setAttribute('context', ''); 	// disables the context menu when right clicking the button
	    toolbarButton.setAttribute('onclick', 'flashVideoDownload.uIController.buttonPressed(event)');
        if (!VersionInfo.isVersionBiggerOrEqual("29")) { // versions smaller than 29.0
            toolbar.appendChild(toolbarButton);
        }
	    toolbar.insertItem(this.buttonName, null, null, false);
	    toolbar.setAttribute("currentset", toolbar.currentSet);
	    win.document.persist(toolbar.id, "currentset"); 		
	
	    return true;
    };

    this.setButtonDisplay = function(value, toolbarButton) {
    	toolbarButton = toolbarButton || this.getButton();
    	if (!toolbarButton) { return; }
    	toolbarButton.setAttribute('class', value + ' toolbarbutton-1 chromeclass-toolbar-additional');
    };

    this.getButtonDisplay = function(toolbarButton) {
    	toolbarButton = toolbarButton || this.getButton();
    	if (!toolbarButton) { null; }
    	var re = new RegExp("(" 
    		+ this.STYLE_CLASSES.ENABLED_VIDEO + "|"
    		+ this.STYLE_CLASSES.ENABLED + "|"
    		+ this.STYLE_CLASSES.DISABLED + "|"
    		+ ")"
    	);
    	var display = toolbarButton.className.match(re);
    	return display ? display[1] : null;
    };

    this.getButton = function() {
    	return this.window.document.getElementById(this.buttonName) || null;
    };

    this.removeButton = function() {
    	// var win = WM.getWin();
        var toolbarButton = this.window.document.getElementById(this.buttonName);
        if (toolbarButton == null) { return false; }	// if a button doesn't exist, do nothing...
    
        var toolbar = this.window.document.getElementById(this.toolbarName);
        toolbar.removeChild(toolbarButton);	
        toolbar.setAttribute("currentset", toolbar.currentSet);
        if (!this.isTypeStatusButton) {
            this.window.document.persist(toolbar.id, "currentset");  
        }        
    
        return true;
    };

    this.setTypeStatusBarButton = function(isTypeStatusButton) {
    	this.isTypeStatusButton = isTypeStatusButton;
    };

    // applies only for "Status Bar" buttons (they do not exist in version 29 or higher)
    this.showStatusbarButton = function() {
    	// var win = WM.getWin();
    	this.window.document.getElementById(this.buttonName).parentNode.hidden = false;
    };

	// applies only for "Status Bar" buttons (they do not exist in version 29 or higher)
    this.hideStatusbarButton = function() {
    	// var win = WM.getWin();
    	this.window.document.getElementById(this.buttonName).parentNode.hidden = true;
    };

	this.isShowFlashFiles = function() {
		var showFlashFilesPrefName = PrefManager.PREFS.GENERAL.FLASH_AND_VIDEO_FILES.SHOW_FLASH_FILES;

		return PrefManager.getPref(showFlashFilesPrefName);
	};

	this.isShowVideoFiles = function() {
		var showVideoFilesPrefName = PrefManager.PREFS.GENERAL.FLASH_AND_VIDEO_FILES.SHOW_VIDEO_FILES;

		return PrefManager.getPref(showVideoFilesPrefName);
	};    
};