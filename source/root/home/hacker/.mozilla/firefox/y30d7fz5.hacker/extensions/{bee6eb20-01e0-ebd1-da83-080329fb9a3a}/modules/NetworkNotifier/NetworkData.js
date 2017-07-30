var EXPORTED_SYMBOLS = ["NetworkData"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/WM.js");
Cu.import("resource://flashVideoDownload/FileData/FileData.js");

var log;	// module
var WM;		// module

var NetworkData = function(aSubject, window) {
	this.window = window || null;
	this.url = null;
	this.contentType = null;
	this.contentLength = null;
	this.fileType = null;
	this.category = null;
	this.browserMM = null;
	this.aDOMWindow = null;
	this.tab = null;

	this.init(aSubject);
};

NetworkData.prototype = new function() {
	var self = this;

	// note - need to check these formats, might be able to remove the youtube formats (webm, 3gp, etc..)
	this.FILETYPE_FORMATS = {
		MP4 	: "mp4",
		FLV 	: "flv",
		WEBM	: "webm",
		_3GP	: "3gp",
		WEBM_3D	: "3d.webm",
		MP4_3D	: "3d.mp4",
		SWF		: "swf",
		F4V		: "f4v"
	};

	this.CATEGORY = {
		VIDEO: "video",
		FLASH: "flash"
	};

	this.init = function(aSubject) {
		// log("NetworkData log");
		var httpChannel = aSubject.QueryInterface(Ci.nsIChannel);
        this.url = httpChannel.name;
        // logtr(this.url);
        this.contentType = httpChannel.contentType;
        this.contentLength = httpChannel.contentLength;
        var fileTypeAndCategory = this.getFileTypeAndCategory(this.contentType, this.url);
        this.fileType = fileTypeAndCategory.FILETYPE;
        this.category = fileTypeAndCategory.CATEGORY;
        var browser = this.getBrowser(httpChannel);
        // logtr(browser);
        if (!browser) {
        	browser = this.getBrowserOld(httpChannel);
        	// logtr(browser);
        }
        this.setValuesFromBrowser(browser);
	};

	this.stringify = function() {
		return JSON.stringify(this);
	};

	this.getFileTypeAndCategory = function(contentType, url) {
	    if (contentType == "application/x-shockwave-flash") {
	    	// log(contentType);
	        return {
	        	FILETYPE: this.FILETYPE_FORMATS.SWF,
	        	CATEGORY: this.CATEGORY.FLASH
	        };
	    }
	    
	    if (contentType.match("video/(webm$|x-webm$)")) {	// video/webm, video/x-webm
	        return {
	        	FILETYPE: this.FILETYPE_FORMATS.WEBM,
	        	CATEGORY: this.CATEGORY.VIDEO
	        };	    	
	    }

	    if (contentType.match("video/3gp")) {	// video/3gp, video/3gpp, video/3gpp2
	        return {
	        	FILETYPE: this.FILETYPE_FORMATS._3GP,
	        	CATEGORY: this.CATEGORY.VIDEO
	        };
	    }

	    if (contentType.match("video/(flv$|x-flv$)")) {	// video/flv, video/x-flv
	        return {
	        	FILETYPE: this.FILETYPE_FORMATS.FLV,
	        	CATEGORY: this.CATEGORY.VIDEO
	        };
	    } else {
	        var urlExt = url.substr(url.lastIndexOf(".") + 1, 3);  
	        if (urlExt == "flv") {
		        return {
		        	FILETYPE: this.FILETYPE_FORMATS.FLV,
		        	CATEGORY: this.CATEGORY.VIDEO
		        };
	        }
	    }

	    if (contentType == "video/mp4") {
	        return {
	        	FILETYPE: this.FILETYPE_FORMATS.MP4,
	        	CATEGORY: this.CATEGORY.VIDEO
	        };
	    }

		if (contentType == "video/f4v") {
	        return {
	        	FILETYPE: this.FILETYPE_FORMATS.F4V,
	        	CATEGORY: this.CATEGORY.VIDEO
	        };
		}

	    return null;
	};

    this.getBrowser = function(aChannel) {
        try {
        	log(122);
            var notificationCallbacks = 
                aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aChannel.loadGroup.notificationCallbacks;
            if (!notificationCallbacks) { log(127); return null; }
            var callback = notificationCallbacks.getInterface(Ci.nsIDOMWindow);
            // todo - NEED TO SET "tab" AND "aDOMWindow" HERE FOR OLDER VERSIONS AND TEST IT
            log(130);
            return callback.top.document ? 
                this.window.gBrowser.getBrowserForDocument(callback.top.document) : null;
        }
        catch(ex) {	// FF 26 and above
        	try {
        		// log(aChannel, "133");
        		log(133);
	            try {
	    			var loadContext = aChannel.notificationCallbacks.getInterface(Ci.nsILoadContext); // older versions
	    		} catch(ex) { 
	    			log(137);
	    			loadContext = aChannel.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext); 
	    		} // newer versions +38
	        	// log(loadContext, "134");
	        	log(141);
	            if (loadContext) {
	            	if (loadContext.topFrameElement) {
	            		var topFrameElement = loadContext.topFrameElement;	// browser element
	            		log(topFrameElement);
	            		return topFrameElement;
	            	}
	            	log(135);
	                var contentWindow = loadContext.associatedWindow; // this is the HTML window of the page that just loaded
	                var aDOMWindow = contentWindow.top
	                	.QueryInterface(Ci.nsIInterfaceRequestor)
	                	.getInterface(Ci.nsIWebNavigation)
	                	.QueryInterface(Ci.nsIDocShellTreeItem).rootTreeItem
	                	.QueryInterface(Ci.nsIInterfaceRequestor)
	                	.getInterface(Ci.nsIDOMWindow);
	                // todo - NEED TO CHECK COMPATIBILITY FOR VERSIONS EARLIER THAN 38
	                // todo - AND TO CHECK THE CODE BELOW ("if (!this.aDOMWindow) {.....")
	                if (aDOMWindow) {
	                	return aDOMWindow;	// browser element
	                }
	                var gBrowser = aDOMWindow.gBrowser; // this is the gBrowser object of the firefox window this tab is in
	                // log(gBrowser, "150");
	                var aTab = gBrowser._getTabForContentWindow(contentWindow.top); //this is the clickable tab xul element, the one found in the tab strip of the firefox window, aTab.linkedBrowser is same as browser var above //can stylize tab like aTab.style.backgroundColor = 'blue'; //can stylize the tab like aTab.style.fontColor = 'red';
	                var browser = aTab.linkedBrowser; // this is the browser within the tab //this is what the example in the previous section gives
	                return browser;
	            }
	            return null;
	        } catch(ex) { return null; }
        }
    };

    this.getBrowserOld = function(aChannel) {
        try {
            var notificationCallbacks = 
                aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aChannel.loadGroup.notificationCallbacks;
      
            if (!notificationCallbacks) { return null; }
            var callback = notificationCallbacks.getInterface(Components.interfaces.nsIDOMWindow);
            return callback.top.document ? 
                gBrowser.getBrowserForDocument(callback.top.document) : null;
        }
        catch(ex) {
            return null;
        } 
    };

    this.setValuesFromBrowser = function(browser) {
		this.aDOMWindow = browser;
		this.tab = WM.getTabForBrowser(browser, this.window);
		this.browserMM = browser.messageManager;
		this.docUrl = browser.currentURI.spec;
		this.docDomain = browser.currentURI.host;
		this.docTitle = browser.contentTitle;    	
    };

    this.convertToFileData = function() {
		return new FileData({
			url 			: this.url,
			contentType		: this.contentType,
			contentLength 	: this.contentLength,
			fileType 		: this.fileType,
			category 		: this.category,
			browserMM 		: this.browserMM,
			docUrl 			: this.docUrl,
			docDomain 		: this.docDomain,
			docTitle 		: this.docTitle,
			aDOMWindow 		: this.aDOMWindow,
			tab 			: this.tab
		});
    };
};

NetworkData.createInstance = function(aSubject, window) {
	var networkData = new NetworkData(aSubject, window);
	return networkData.fileType === null ? null : networkData;
};