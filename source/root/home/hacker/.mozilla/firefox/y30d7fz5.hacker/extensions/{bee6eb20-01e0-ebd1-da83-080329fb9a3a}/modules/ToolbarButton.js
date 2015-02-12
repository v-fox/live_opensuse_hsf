var EXPORTED_SYMBOLS = ["ToolbarButton"];

function ToolbarButton(window, versionInfo, buttonName, toolbarName, label, tooltip) {
	this.init = function(window, versionInfo, buttonName, toolbarName, label, tooltip) {
		this.window = window;
		this.versionInfo = versionInfo;
		this.buttonName = buttonName;
		this.toolbarName = toolbarName;
		this.label = label;
		this.tooltip = tooltip;
		this.stringBundle = this.getStringBundle(window);
		this.isTypeStatusButton = false;
	};

	this.getStringBundle = function(window) {
		return window.document.getElementById("flashVideoDownload_stringbundle");
	};

    this.addToolbarButton = function() {
    	try {
	    	if (this.isTypeStatusButton) {
	    		if (this.versionInfo.hasStatusBar()) {
					this.showStatusbarButton();
	    		} else if (this.versionInfo.hasAddonBar()) {
	    			this.addButton();
	    		}
	    	} else {
				this.addButton();
	    	}   
    	} catch(ex) { }
    };

    this.removeToolbarButton = function() {
    	try {
	    	if (this.isTypeStatusButton) {
	    		if (this.versionInfo.hasStatusBar()) {
	    			this.hideStatusbarButton();
	    		} else if (this.versionInfo.hasAddonBar) {
	    			this.removeButton();
	    		}
	    	} else {
				this.removeButton();
	    	}
    	}
    	catch(ex) { }
    };

    this.addButton = function() {
    	// will fail if firefox version is older than 4
	    var toolbarButton = this.window.document.getElementById(this.buttonName);
	    if (toolbarButton) { return false; }	// if a button already exists, do nothing...    		
	    
	    var toolbar = this.window.document.getElementById(this.toolbarName);
	    toolbarButton = this.window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:toolbarbutton");
	    toolbarButton.setAttribute('id', this.buttonName);
	    toolbarButton.setAttribute('label', this.label);
	    toolbarButton.setAttribute('tooltiptext', this.tooltip);
	    toolbarButton.setAttribute('class', 'fnvfox_toolbarButtonIconDisabled toolbarbutton-1 chromeclass-toolbar-additional');
	    toolbarButton.setAttribute('context', ''); 	// disables the context menu when right clicking the button
	    toolbarButton.setAttribute('onclick', 'flashVideoDownload.buttonPressed(event)');
        if (!this.versionInfo.isVersionBiggerOrEqual("29")) { // versions smaller than 29.0
            toolbar.appendChild(toolbarButton);
        }
	    toolbar.insertItem(this.buttonName, null, null, false);
	    toolbar.setAttribute("currentset", toolbar.currentSet);
	    this.window.document.persist(toolbar.id, "currentset"); 		
	
	    return true;
    };

    this.removeButton = function() {
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
    	this.window.document.getElementById(this.buttonName).parentNode.hidden = false;
    };

	// applies only for "Status Bar" buttons (they do not exist in version 29 or higher)
    this.hideStatusbarButton = function() {
    	this.window.document.getElementById(this.buttonName).parentNode.hidden = true;
    };    

	this.init(window, versionInfo, buttonName, toolbarName, label, tooltip);
};