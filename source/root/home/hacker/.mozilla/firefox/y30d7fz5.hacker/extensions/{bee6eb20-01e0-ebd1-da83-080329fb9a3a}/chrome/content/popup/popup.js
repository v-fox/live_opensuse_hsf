var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://flashVideoDownload/log.js");

// gets loaded twice ?? - need to check why
log("popup loaded");

// special vars
var xulWindow = null;

// addon modules
var WM = null;
var FileData = null;
var FileLabel = null;
var Subscriber = null;
var FileDownloadManager = null;
var PrefManager = null;
var StringBundle = null;

// holds all the modules (passed from overlay.js)
var ModulesList = null;

// modules' instances (passed from overlay.js)
var simpleObserver = null;
var localeBinder = null;

var flashVideoDownload_popup = new function() {
	this.view = null;
	this.isInit = null;

	this.init = function(modulesList, _xulWindow) {
		xulWindow = _xulWindow;
		this.setModulesList(modulesList);
		this.loadAddonModules();
		this.view = new View();
		this.view.showNoFilesFoundMessage();
		this.isInit = true;
		// console.log(document);
		// console.log($);
		log(this);

		window.addEventListener("unload", this.onUnload.bind(this), false);
	};

	// IsInit
	Object.defineProperty(this, "IsInit", {
		get: function() { return this.isInit === true; } // returns false if null
	});

	this.onUnload = function() { };

	this.resetView = function() {
		this.view = new View();
		this.view.showNoFilesFoundMessage();
	};

	this.loadAddonModules = function() {
		WM = ModulesList.WM;
		Subscriber = ModulesList.Subscriber;
		FileData = ModulesList.FileData;
		FileLabel = ModulesList.FileLabel;
		FileDownloadManager = ModulesList.FileDownloadManager;
		PrefManager = ModulesList.PrefManager;
		StringBundle = ModulesList.StringBundle;
	};

	this.setModulesList = function(modulesList) {
		ModulesList = modulesList;
	};

	this.setSimpleObserver = function(_simpleObserver) {
		simpleObserver = _simpleObserver;
	};

	this.setLocaleBinder = function(_localeBinder) {
		localeBinder = _localeBinder;
		localeBinder.setDoc(document);
		localeBinder.bind();
	};

	this.createSubscribers = function() {
		this.createUrlChangedNoDataSubscriber();
		this.createUrlChangedHasDataSubscriber();
		this.createFileAddedFromSelectedDocSubscriber();
		this.createUrlFileDataContentLengthUpdatedSubscriber();
		this.createThemeChangeRequestSubscriber();
		// this.createFileAddedToListSubscriber();
	};

	this.createThemeChangeRequestSubscriber = function() {
		var callback = function(data, topic) {
			var theme = topic.split(":")[1];
			if (!theme) { return; }
			this.view.setTheme(theme);
		};

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.POPUP_TOPICS.THEME_CHANGE_LIGHT, 
			callback.bind(this)
		));

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.POPUP_TOPICS.THEME_CHANGE_DARK, 
			callback.bind(this)
		));		
	};

	this.createUrlChangedNoDataSubscriber = function() {
		var callback = function() {
			log("popup - url changed no data");
			this.view.showNoFilesFoundMessage();
		};

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.TOPICS.URL_CHANGED_NO_DATA, 
			callback.bind(this)
		));
	};

	this.createUrlChangedHasDataSubscriber = function() {
		var callback = function(data) {
			log("popup - url changed has data");
			log(data.urlFileData);
			this.buildPopupFilesList(data.urlFileData);
		};

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.TOPICS.URL_CHANGED_HAS_DATA, 
			callback.bind(this)
		));
	};

	this.createUrlFileDataContentLengthUpdatedSubscriber = function() {
		var callback = function(data) {
			log("from popup updated content legnth:");
			this.view.updateItemLabel(data);
			this.view.updateItemInfoFileSize(data);
			// log(data);
		};

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.TOPICS.URL_FILE_DATA_CONTENT_LENGTH_UPDATED,
			callback.bind(this)
		));
	};

	// this.createFileAddedToListSubscriber = function() {
	// 	var callback = function(category) {
	// 		if (category === FileData.CATEGORY.FLASH) {
	// 			log("popup - flash file added");
	// 			this.view.showFlashTitle();
	// 		}
	// 		if (category === FileData.CATEGORY.VIDEO) {
	// 			log("popup - video file added");
	// 			this.view.showVideosTitle();
	// 		}
	// 	};

	// 	simpleObserver.subscribe(new Subscriber(
	// 		simpleObserver.POPUP_TOPICS.FLASH_FILE_ADDED_TO_LIST, 
	// 		callback.bind(this)
	// 	));

	// 	simpleObserver.subscribe(new Subscriber(
	// 		simpleObserver.POPUP_TOPICS.VIDEO_FILE_ADDED_TO_LIST, 
	// 		callback.bind(this)
	// 	));
	// };

	this.createFileAddedFromSelectedDocSubscriber = function() {
		// data = {
		// 	urlFileData: urlFileData,	// the entire list of fileDatas
		// 	fileData: fileData 			// the added fileData
		// }
		var callback = function(data) {
			var isAddedSuccessfully = false;
			var isMessageNowHidden = false;

			if (this.view.isNoFilesFoundMessageShown()) {
				this.view.hideNoFilesFoundMessage();
				isMessageNowHidden = true;
			}

			if (data.fileData.Category === FileData.CATEGORY.FLASH) {
				isAddedSuccessfully = this.view.addItemToList({
					fileData: data.fileData,
					containingElementId: "flashContent",
					downloadElementClass: "itemDownloadButton",
					copyUrlElementClass: "itemCopyToURLButton"					
				});
			}

			if (data.fileData.Category === FileData.CATEGORY.VIDEO) {
				isAddedSuccessfully = this.view.addItemToList({
					fileData: data.fileData,
					containingElementId: "videosContent",
					downloadElementClass: "itemDownloadButton",
					copyUrlElementClass: "itemCopyToURLButton"					
				});
			}

			if (!isAddedSuccessfully && isMessageNowHidden) {
				this.view.showNoFilesFoundMessage();
			}
		};

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.TOPICS.FLASH_ADDED_FROM_SELECTED_DOC, 
			callback.bind(this)
		));

		simpleObserver.subscribe(new Subscriber(
			simpleObserver.TOPICS.VIDEO_ADDED_FROM_SELECTED_DOC, 
			callback.bind(this)
		));		
	};

	// this.displayNoDataToDisplay = function() {
	// 	this.view.resetView({ showNoFilesFoundMessage: true });
	// };

	this.buildPopupFilesList = function(urlFileData) {
		log("buildPopupFilesList");
		this.view.hideNoFilesFoundMessage();

		var flashList = urlFileData.getFilesDataByCategory(FileData.CATEGORY.FLASH);
		var videoList = urlFileData.getFilesDataByCategory(FileData.CATEGORY.VIDEO);
		var isAtLeastOneFlashFileAddedSuccessfully = false;
		var isAtLeastOneVideoFileAddedSuccessfully = false;

		// log(flashList);
		// log(videoList);
		isAtLeastOneFlashFileAddedSuccessfully = this.view.buildList({
			containingElementId: "flashContent",
			downloadElementClass: "itemDownloadButton",
			copyUrlElementClass: "itemCopyToURLButton",
			fileDataList: flashList
		});

		isAtLeastOneVideoFileAddedSuccessfully = this.view.buildList({
			containingElementId: "videosContent",
			downloadElementClass: "itemDownloadButton",
			copyUrlElementClass: "itemCopyToURLButton",
			fileDataList: videoList
		});

		if (!isAtLeastOneFlashFileAddedSuccessfully &&
			!isAtLeastOneVideoFileAddedSuccessfully) {
			this.view.showNoFilesFoundMessage();
		}
		// log(this.filesListBuilder);
		// log(flashContainingElement);
	};
};