var EXPORTED_SYMBOLS = ["DataModel"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/StringBundle.js");
Cu.import("resource://flashVideoDownload/NetworkNotifier/NetworkNotifier.js");
Cu.import("resource://flashVideoDownload/Observer.js");
Cu.import("resource://flashVideoDownload/SimpleObserver/Subscriber.js");
Cu.import("resource://flashVideoDownload/ChromeFrameScriptManager.js");
Cu.import("resource://flashVideoDownload/UrlFileData.js");
Cu.import("resource://flashVideoDownload/FileData/FileData.js");
Cu.import("resource://flashVideoDownload/XHR/RecursiveXHR.js");
Cu.import("resource://flashVideoDownload/XHR/FileDataListContentLengthUpdater.js");
Cu.import("resource://flashVideoDownload/YouTubeDec.js");

var log;						// module
var StringBundle;				// module
var NetworkNotifier;			// module
var Observer;					// module
var Subscriber; 				// module
var UrlFileData;				// module
var FileData;					// module
var ChromeFrameScriptManager; 	// module
var FileDataListContentLengthUpdater; // module
var YouTubeDec;					// module

// todo - should change it to a class with prototype
var DataModel = function(params) {
	var self = this;
	var window = null;

	this.observer = null;
	this.simpleObserver = null;
	this.networkNotifier = null;
	this.chromeFrameScriptManager = null;
	this.fileDataListContentLengthUpdater = null;

	this.init = function(params) {
		window = params.window;
		this.simpleObserver = params.simpleObserver;
		this.networkNotifier = new NetworkNotifier(this.simpleObserver, window);
		this.fileDataListContentLengthUpdater = new FileDataListContentLengthUpdater(this.simpleObserver);
		this.createNetworkDataSubscriber();
		this.createChromeFrameScriptManager();
		this.addFrameScripts();
		// logt(this);
	};

	this.addFrameScripts = function() {
        this.chromeFrameScriptManager.addFrameScript({
            filename: "frameScript_dailymotion.js",
            // loadOnDomain: "metacafe.com",
            // it is possible to use the browserMM and the messageBuilder to send a response back to the frame script
            messageListener: function(message, tab, browserMM, messageBuilder) {
            	log("frameScript_dailymotion - message");
                log(message);
                log(tab);
                log(this);
                var videoParamsList = message.data.videoParamsList;
                for (var i in videoParamsList) {
                	var fileData = new FileData(videoParamsList[i]);
                	fileData.Tab = tab;
                	log("go here dude");
                	log(fileData);
                	log(fileData.ContentLength.contentLength);
					if (this.addToFileDataList(fileData)) { // if added successfully
						this.notifyFileDataAdded(fileData);
					}
                }
                this.notifyFullVideoListFilesAdded();
            }.bind(this)
        });

        this.chromeFrameScriptManager.addFrameScript({
            filename: "frameScript_youtube.js",
            // loadOnDomain: "metacafe.com",
            // it is possible to use the browserMM and the messageBuilder to send a response back to the frame script
            messageListener: function(message, tab, browserMM, messageBuilder) {
            	log("frameScript_youtube - message");
            	var videoParamsList = message.data.videoParamsList;
            	YouTubeDec.decipher(videoParamsList).then(
            		function(videoParamsList) {
            			try {
            			log("80 - DataModel");
            			log(videoParamsList);
		                for (var i in videoParamsList) {
		                	var fileData = new FileData(videoParamsList[i]);
		                	fileData.Tab = tab;
		                	log("go here dude");
		                	log(fileData);
							if (this.addToFileDataList(fileData)) { // if added successfully
								log("added successfully");
								this.notifyFileDataAdded(fileData);
							}
		                }
		                this.notifyFullVideoListFilesAdded();
		            	} catch(ex) { log(ex);}
            		}.bind(this),
            		function(error) { log(error); }
            	);
            	log(message);
            }.bind(this)
        });        
	};

    this.createChromeFrameScriptManager = function() {
        this.chromeFrameScriptManager = new ChromeFrameScriptManager({
            window: window
        });
    };

	this.createNetworkDataSubscriber = function() {
		var callback = function(fileData) {
			// log("44");
			// log("callback");
			// logtr(fileData);
			if (this.addToFileDataList(fileData)) {	// if added successfully
				// logtr(fileData);
				this.notifyFileDataAdded(fileData);
			}
		};

		this.simpleObserver.subscribe(new Subscriber(
			this.simpleObserver.TOPICS.NETWORK_DATA, 
			callback.bind(this)
		));
	};

	this.addToFileDataList = function(fileData) {
		// log(fileData, 111);
		var tab = fileData.Tab;
		log(tab);
		if (!tab) { return false; }
		if (!tab.fnvfox_urlFileData) {
			log(116);
			tab.fnvfox_urlFileData = new UrlFileData({
				docUrl: fileData.DocUrl
			});
			// log(tab.fnvfox_urlFileData, 121);
			// log("122");
			// log(tab);
		} else {
			tab.fnvfox_urlFileData.DocUrl = fileData.DocUrl;
		}

		return tab.fnvfox_urlFileData.addFileData(fileData); // returns true if added successfully, false otherwise
	};

	this.notifyFileDataAdded = function(fileData) {
		if (fileData.Category === fileData.CATEGORY.FLASH) {
			this.simpleObserver.notify(this.simpleObserver.TOPICS.FLASH_ADDED, fileData);
		}
		if (fileData.Category === fileData.CATEGORY.VIDEO) {
			this.simpleObserver.notify(this.simpleObserver.TOPICS.VIDEO_ADDED, fileData);
		}		
	};

	this.notifyFullVideoListFilesAdded = function() {
		this.simpleObserver.notify(this.simpleObserver.TOPICS.FULL_VIDEO_LIST_FILES_ADDED);
	};

    this.getUrlFileDataOfSelectedTab = function() {
    	return window.gBrowser.selectedTab.fnvfox_urlFileData || null;
    };

    this.updateContentLengthForCurrentUrlFileData = function() {
    	var currentUrlFileData = this.getUrlFileDataOfSelectedTab();
    	this.fileDataListContentLengthUpdater.updateContentLengthForUrlFileData(currentUrlFileData);
    };

	this.shutdown = function() { 
		this.networkNotifier.shutdown();
	};

	Object.defineProperty(this, "FilesList", { get: function() { return this.filesList; } });

	this.init(params);
};