var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://flashVideoDownload/log.js");

var xulWindow;

// addon modules
var WM;
var FileData;
var Subscriber;
var FileDownloadManager;
var PrefManager;
var StringBundle;

// holds all the modules (passed from overlay.js)
var ModulesList;

// modules' instances (passed from overlay.js)
var simpleObserver;

function View() {
	this.popupSize = null;
	this.fileLabelMaker = null;
	this.localeBinder = null;

	this.SHOW_NO_FILES_FOUND_MESSAGE = 1;

	this.init = function(urlFileData) {
		this.popupSize = new PopupSize();								// popup module
		this.fileLabelMaker = new FileLabelMaker();						// popup module
		this.fileDownloadManager = new FileDownloadManager(xulWindow);	// addon module
		this.setContentMaxHeight();
		this.setCopiedToClipboardMessageTransitionendEvent()
		// $("#content").mCustomScrollbar();
		$("#content").mCustomScrollbar({ 
			// alwaysShowScrollbar: 1,
			// autoHideScrollbar: false,
			theme: "dark",	// the scrollbar's theme
			callbacks: {
			    onTotalScroll: function() {}, 		// scroll to bottom
			    onTotalScrollBack: function() {}, 	// scroll to top
			    onOverflowY: function() {}
			}
		});

		log(this.isShowFlashFiles());
		log(this.isShowVideoFiles());
	};

	this.buildList = function(params) {
		try {
		log(28);
		log(params);
		if (!params || !params.fileDataList || !params.containingElementId) { return; }
		var fileDataList = params.fileDataList;
		var isAtLeastOneFileAddedSuccessfully = false;
		var isAddedSuccessfully;
		// var containingElementId = params.containingElementId;

		for (var i in fileDataList) {
			var fileData = fileDataList[i];

			isAddedSuccessfully = this.addItemToList({
				containingElementId: params.containingElementId,
				downloadElementClass: params.downloadElementClass,
				copyUrlElementClass: params.copyUrlElementClass,
				fileData: fileData
			});

			if (isAddedSuccessfully) {
				isAtLeastOneFileAddedSuccessfully = true;
			}
		}

		log(isAtLeastOneFileAddedSuccessfully);
		return isAtLeastOneFileAddedSuccessfully;
	}catch(ex){log(ex);}
	};

	this.shouldAddItemToList = function(fileData) {
		if (fileData.Category === fileData.CATEGORY.FLASH && !this.isShowFlashFiles()) {
			return false;
		}

		if (fileData.Category === fileData.CATEGORY.VIDEO && !this.isShowVideoFiles()) {
			return false;
		}

		return true;
	};

	this.addItemToList = function(params) {
		if (!params || !params.fileData || !params.containingElementId) { return; }
		var fileData = params.fileData;
		
		if (!this.shouldAddItemToList(fileData)) {
			return false;
		}
		var containingElementId = params.containingElementId;
		var downloadElementClass = params.downloadElementClass;
		var copyUrlElementClass = params.copyUrlElementClass;

		var item = this.createItem(fileData);
		var downloadElement = $(item).find("." + downloadElementClass);
		var copyUrlElement = $(item).find("." + copyUrlElementClass);
		var containingElement = $("#" + containingElementId);
		item.appendTo(containingElement);

		// add attributes
		// $(item).attr("data-url", encodeURIComponent(fileData.Url));
		// $(item).attr("data-filename", fileData.DownloadWindowFilename);
		// $(item).attr("data-file_ext", fileData.fileExt);
		this.setDownloadClickEventListener(downloadElement, fileData);
		this.setCopyUrlClickEventListener(copyUrlElement, fileData);

		// increase popupSize by the "contentItem" height
		log("item height");
		// log(item);
		// log(item.outerHeight(true));
		// log(($(item)[0]).clientHeight);
		// log(($(item)[0]).offsetHeight);
		// log(($(item)[0]).scrollHeight);

		if (this.isFilterYouTubeItem(fileData)) {
			this.hideItem(item);
			return false;
		}

		// had to use a fixed element height instead of getting it dynamically because for some reason it sometimes gets a 91px height instead of 57px
		this.popupSize.increaseHeight(57);

		return true;
	};

	this.isFilterYouTubeItem = function(fileData) {
		var qualityPrefName = PrefManager.PREFS.YT.QUALITIES[fileData.QualityKey];
		var formatPrefName = PrefManager.PREFS.YT.FORMATS[fileData.FormatKey];
		var isDisplayedQuality = PrefManager.getPref(qualityPrefName);
		var isDisplayedFormat = PrefManager.getPref(formatPrefName);

		log("format key: " + fileData.QualityKey);
		log(PrefManager.getPref(qualityPrefName));

		return (!isDisplayedQuality || !isDisplayedFormat) && fileData.IsYouTube;
	};

	this.isShowFlashFiles = function() {
		var showFlashFilesPrefName = PrefManager.PREFS.GENERAL.FLASH_AND_VIDEO_FILES.SHOW_FLASH_FILES;

		return PrefManager.getPref(showFlashFilesPrefName);
	};

	this.isShowVideoFiles = function() {
		var showVideoFilesPrefName = PrefManager.PREFS.GENERAL.FLASH_AND_VIDEO_FILES.SHOW_VIDEO_FILES;

		return PrefManager.getPref(showVideoFilesPrefName);
	};

	this.setDownloadClickEventListener = function(element, fileData) {
		$(element).on("click", fileData, 
			function(event) {
				log(event);
				event.stopPropagation();	// prevents the popup window from remaining open
				var fileData = event.data;
				var downloadStarted = this.fileDownloadManager.downloadFile(fileData);
				if (downloadStarted) {
					var xulPanel = xulWindow.document.getElementById("fnvfoxResultsPanel");
					xulPanel.hidePopup();
				}
			}.bind(this)
		);
	};

	this.setCopyUrlClickEventListener = function(element, fileData) {
		$(element).on("click", fileData, 
			function(event) {
				// if (event.which == 3) {
					var fileData = event.data;					
		            var clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].
		                getService(Ci.nsIClipboardHelper);
		            clipboard.copyString(fileData.Url);
					// log("right click");
				// }
			}.bind(this)
		);
	};

	this.clearList = function(elementList) {
		$("#" + elementList).empty();
	};

	this.setCopiedToClipboardMessageTransitionendEvent = function() {
		var TOTAL_TRANSITIONS = 3;
		$("#copiedToClipboardMessage").on("transitionend", function() {
			var transitionCounter = $("#copiedToClipboardMessage").attr("data-transCounter");
			$("#copiedToClipboardMessage").attr("data-transCounter", ++transitionCounter);
			if ($("#copiedToClipboardMessage").attr("class") === "show") {
				$("#copiedToClipboardMessage").attr("class", "hide noRotation");
			}
			if (transitionCounter == TOTAL_TRANSITIONS) {
				$("#copiedToClipboardMessage").attr("class", "hide");
				$("#copiedToClipboardMessage").attr("data-transCounter", "0");
			}
		});		
	};

	this.showCopiedToClipboardMessage = function() {
		if ($("#copiedToClipboardMessage").attr("class") !== "hide noRotation") {
			$("#copiedToClipboardMessage").attr("class", "show");
		}		
	};

	this.createItem = function(fileData) {
		// TODO - if adding a tag that specifies the file type (video/flash) - use the following code-
		// if (fileData.Category === fileData.CATEGORY.FLASH/VIDEO)

		// fileData relevant properties - 
		// 	Category, ContentLength, FileType, Url, Quality
		fileData.PopupLabel = this.fileLabelMaker.getFileLabel(fileData);	// the label to show in the popup
		fileData.DownloadWindowFilename = this.fileLabelMaker.getFilenameLabel(fileData); // the name of the filename when downloading/saving file
		log(fileData.DownloadWindowFilename);
		var item = $("<div></div>").addClass("contentItem");
		item.attr("data-url", btoa(fileData.Url));
		item.hover(function() {
			$(".contentItem .itemButtonsInitial").removeClass("itemButtonsInitial");
		});

		// itemTextWrapper
		var itemTextWrapper = $("<div></div>").addClass("itemTextWrapper");
		var itemLabel = $("<div></div>").text(fileData.PopupLabel).addClass("itemLabel");
		var itemInfo = $("<div></div>").addClass("itemInfo");
		itemTextWrapper.append(itemLabel);
		itemTextWrapper.append(itemInfo);

		var itemFileType = $("<div></div>").text(fileData.FileType).addClass("itemFileType");
		var itemQuality = $("<div></div>").text(fileData.Quality).addClass("itemQuality");
		var fileSize = $("<div></div>").text(fileData.ContentLength.toString()).addClass("fileSize");
		itemInfo.append(itemFileType);
		itemInfo.append(itemQuality);
		itemInfo.append(fileSize);

		// itemType
		var itemType = $("<div></div>").addClass("itemType");
		var itemTypeSeparator = $("<div></div>").text("|").addClass("itemTypeSeparator");
		var itemTypeText = $("<div></div>").text(fileData.Category).addClass("itemTypeText");

		itemType.append(itemTypeSeparator);
		itemType.append(itemTypeText);

		// itemButtons
		var itemButtons = $("<div></div>").addClass("itemButtons");
		var itemCopyToURLButton = $("<div></div>")
			.addClass("itemCopyToURLButton")
			.addClass("itemCopyToURLSquareButton")
			.addClass("itemButtonsInitial");
		var itemDownloadButton = $("<div></div>")
			.addClass("itemDownloadButton")
			.addClass("itemDownloadSquareButton")
			.addClass("itemButtonsInitial");
		itemButtons.append(itemCopyToURLButton);
		itemButtons.append(itemDownloadButton);
		$(itemCopyToURLButton).on("click", this.showCopiedToClipboardMessage);

		item.append(itemTextWrapper);
		item.append(itemType);
		item.append(itemButtons);
		log(item);

		return item;
	};

	this.getContentParentElement = function(fileData) {
		if (fileData.Category === fileData.CATEGORY.VIDEO) {
			return "#videosContent";
		}
		if (fileData.Category === fileData.CATEGORY.FLASH) {
			return "#flashContent";
		}

		return null;
	};

	this.updateItem = function(fileData, updateItemFunction) {
		var contentParentElement = this.getContentParentElement(fileData);
		if (!contentParentElement) { return; }

		$(contentParentElement + " .contentItem").each(function(index, item) {
			var url = atob($(item).attr("data-url"));
			if (url === fileData.Url) {
				updateItemFunction(index, item, fileData);
				return false;
			}
			// log(index + ": " + $(item).attr("data-url") );
		}.bind(this));		
	};

	this.updateItemLabel = function(fileData) {
		this.updateItem(fileData, function(index, item, fileData) {
			var label = this.fileLabelMaker.getFileLabel(fileData);
			$(item).find(".itemLabel").text(label);
		}.bind(this));
	};

	this.updateItemInfoFileSize = function(fileData) {
		this.updateItem(fileData, function(index, item, fileData) {
			$(item).find(".fileSize").text(fileData.ContentLength.toString());
		});
	};

	this.resetView = function(options) {
		options = options || {};
		this.clearList("flashContent");
		this.clearList("videosContent");
		this.hideFlashTitle();
		this.hideVideosTitle();
		this.hideScrollArrows();
		// if (options.showNoFilesFoundMessage) {
		// 	this.popupSize.reset({ resetToNoFilesFoundMessageSize: true });
		// 	return;
		// }
		// this.popupSize.reset();
	};

	this.hideNoFilesFoundMessage = function() {
		this.resetView();
		this.popupSize.reset();
		$("#noFilesFoundMessage").attr("class", "hidden");
	};

	this.showNoFilesFoundMessage = function() {
		this.resetView();
		this.popupSize.reset({ resetToNoFilesFoundMessageSize: true });
		$("#noFilesFoundMessage").attr("class", "shown");
	};

	this.isNoFilesFoundMessageShown = function() {
		return $("#noFilesFoundMessage").hasClass("shown");
	};

	this.hideFlashTitle = function() { this.hideTitle("flashTitle"); };
	this.hideVideosTitle = function() { this.hideTitle("videosTitle"); };
	this.showFlashTitle = function() { this.showTitle("flashTitle"); };
	this.showVideosTitle = function() { this.showTitle("videosTitle"); };

	this.showTitle = function(elementId) {
		if (!$("#" + elementId).hasClass("titleHidden")) { return; }

		$("#" + elementId).removeClass("titleHidden");
		this.popupSize.increaseHeight($("#" + elementId).outerHeight(true));
	};

	this.hideTitle = function(elementId) {
		if ($("#" + elementId).hasClass("titleHidden")) { return; }

		$("#" + elementId).addClass("titleHidden");
		this.popupSize.decreaseHeight($("#" + elementId).outerHeight(true));
	};

	this.setTheme = function(theme) {
		if (!theme) { return; }
		$("#wrapper").attr("class", theme);
	};

	this.setContentMaxHeight = function() {
		$("#content").css("max-height", this.popupSize.getMaxContentHeight());
	};

	this.hideScrollArrows = function() {
		$(".scrollArrows").css("visibility", "hidden");
	};

	this.hideItem = function(item) {
		$(item).addClass("hide");
	};

	this.showItem = function(item) {
		$(item).removeClass("hide");
	};

	this.init();
}