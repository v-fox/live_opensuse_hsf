var EXPORTED_SYMBOLS = ["SimpleObserver"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var log;	// module

// SimpleObserver object
var SimpleObserver = function() {
	var self = this;

	this.subscribers = null;

	this.init();
};

SimpleObserver.prototype = new function() {
	this.TOPICS = {
		NETWORK_DATA: "network-data-topic",
		FLASH_ADDED:  "flash-file-added-topic",
		VIDEO_ADDED:  "video-file-added-topic",
		FLASH_ADDED_FROM_SELECTED_DOC: "flash-added-in-selected-topic",
		VIDEO_ADDED_FROM_SELECTED_DOC: "video-added-in-selected-topic",
		URL_CHANGED_HAS_DATA: "url-changed-has-data-topic",
		URL_CHANGED_NO_DATA: "url-changed-no-data-topic",
		NETWORK_DATA_ON_SELECTED_DOC: "network-data-on-selected-doc-topic",
		URL_FILE_DATA_CONTENT_LENGTH_UPDATED: "url-file-data-content-length-updated",
		FULL_VIDEO_LIST_FILES_ADDED: "full_video_list_files_added"
		// ON_LOCATION_CHANGE_SELECTED_DOC: "on-location-change-selected-doc-topic"
	};

	this.POPUP_TOPICS = {
		THEME_CHANGE_LIGHT: "theme-change:light",
		THEME_CHANGE_DARK: "theme-change:dark",
		FLASH_FILE_ADDED_TO_LIST: "flash-file-added-to-list-topic",	// currently not used
		VIDEO_FILE_ADDED_TO_LIST: "video-file-added-to-list-topic"	// currently not used
	};
		
	this.init = function() {
		this.subscribers = [];
	};

	this.subscribe = function(subscriber) {
		this.subscribers.push(subscriber);
	};

	this.unsubscribe = function(subscriber) {
		for (var i in this.subscribers) {
			if (this.subscribers[i] === subscriber) {
				this.subscribers.splice(i, 1);
			}
		}
	};

	this.notify = function(topic, data) {
		for (var i in this.subscribers) {
			if (this.subscribers[i].topic === topic) {
				this.subscribers[i].callback(data, topic);
			}
		}
	};
};