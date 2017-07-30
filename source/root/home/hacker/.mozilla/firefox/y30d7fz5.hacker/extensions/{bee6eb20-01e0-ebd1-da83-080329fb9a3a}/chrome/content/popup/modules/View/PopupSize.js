var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://flashVideoDownload/log.js");

var xulWindow;

// addon modules
var WM;
var FileData;
var Subscriber;

// holds all the modules (passed from overlay.js)
var ModulesList;

// modules' instances (passed from overlay.js)
var simpleObserver;

function PopupSize() {
	var DEFAULT_POPUP_SIZE = {
		WIDTH: 450,
		HEIGHT: 70
	};

	var CONTENT_ITEM_HEIGHT = 57;
	var MAX_CONTENT_ITEMS = 5;
	var SHOW_NO_FILES_FOUND_HEIGHT = 271;

	this.maxHeight;
	this.totalScrollArrowsHeight;
	this.maxContentHeight;

	this.init = function() {
		this.setMaxHeight();
		// log("maxHeight");
		// log(this.maxHeight);
		this.reset();
	};

	this.reset = function(options) {
		options = options || {};
		var height = options.resetToNoFilesFoundMessageSize ? 
			SHOW_NO_FILES_FOUND_HEIGHT : DEFAULT_POPUP_SIZE.HEIGHT;
		log("40 PopupSize: " + height);
		this.setSize({
			width: DEFAULT_POPUP_SIZE.WIDTH,
			height: height
		});
	};

	this.isSizeSetToNoFilesFoundMessage = function() {
		var xulIframe = this.getXulIframe();
		return xulIframe.height == SHOW_NO_FILES_FOUND_HEIGHT;
	};

	this.setTotalScrollArrowsHeight = function() {
		var bottomArrowHeight = $("#bottomArrow").outerHeight(true);
		var topArrowHeight = $("#topArrow").outerHeight(true);

		this.totalScrollArrowsHeight = bottomArrowHeight + topArrowHeight;
	};

	this.setMaxContentHeight = function() {
		this.maxContentHeight = CONTENT_ITEM_HEIGHT * MAX_CONTENT_ITEMS;
	};

	this.setMaxHeight = function() {
		this.setTotalScrollArrowsHeight();
		this.setMaxContentHeight();

		this.maxHeight = 
			// this.totalScrollArrowsHeight + 
			this.maxContentHeight + 
			DEFAULT_POPUP_SIZE.HEIGHT + 
			10;
	};

	this.setSize = function(dimensions) {	
		// var win = WM.getWin();
		var height = dimensions.height;
		var width = dimensions.width;
		var xulIframe = xulWindow.document.getElementById("fnvfoxIframe");
		var xulPanel = xulWindow.document.getElementById("fnvfoxResultsPanel");
		if (dimensions.hasOwnProperty("height")) {
			xulIframe.height = height;
			xulPanel.style.height = height + "px";
			// $("#content").css("height", height - 70);
		}
		if (dimensions.hasOwnProperty("width")) {
			xulIframe.width = width;
			xulPanel.style.width = width + 8 + "px";
			// $("#content").css("width", width - 40);
			// $("#wrapper").css("width", width - 40);
			// $("#title").css("width", width - 40);
		}
		log(xulIframe.height);
		log(xulPanel.style.height);
	};

	this.getXulIframe = function() {
		// var win = WM.getWin();
		return xulWindow.document.getElementById("fnvfoxIframe");
	};

	this.getMaxContentHeight = function() {
		return this.maxContentHeight;
	};

	this.increaseHeight = function(value) {
		var newHeight = parseInt(this.getXulIframe().height) + value;
		if (newHeight >= this.maxHeight) { return; }
		this.setSize({
			height: newHeight
		});
	};

	this.decreaseHeight = function(value) {
		this.increaseHeight(value * -1);
	};

	this.increaseWidth = function(value) {
		this.setSize({
			width: parseInt(this.getXulIframe().width) + value
		});
	};

	this.decreaseWidth = function(value) {
		this.increaseWidth(value * -1);
	};	

	this.init();
}