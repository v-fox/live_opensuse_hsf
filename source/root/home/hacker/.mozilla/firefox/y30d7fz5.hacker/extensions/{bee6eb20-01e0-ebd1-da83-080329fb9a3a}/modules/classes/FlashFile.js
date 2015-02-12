var EXPORTED_SYMBOLS = ["FlashFile"];
Components.utils.import("resource://flashVideoDownload/classes/MediaFile.js");

// FlashFile Class - Inherits from MediaClass
var FlashFile = function(fileType, doc, url, title, contentLength, docUrl) {
	// returns if any of the parameters were not sent (used when creating a new object just to define prototype inheritance)
	//if (!fileType || !doc || !url || !title || !contentLength) return;
	
	this.base = MediaFile;
	this.base(fileType, doc, url, title, contentLength);	

	// constructor
	this.init = function(url, docUrl) {		
		this.icon = MediaFile.getFlashIcon();
		this.label = this.adjustLabel(url);
		this.labelNoFileSize = this.label;
		this.filename = MediaFile.replaceInvalidChars(this.label, "_");
		this.addFileSizeToLabel();
		this.docUrl = docUrl;
		this.domain = this.getDomainNameFromUrl(this.docUrl);
	};
	
	// private methods
	this.adjustLabel = function(label) {
	    // takes only the last portion of the url (the label will be created from the last slash until the end)
	    var lastSlashPos = label.lastIndexOf("/");	    
	    if (lastSlashPos != -1) { label = label.substr(lastSlashPos + 1); }
	    
	    // finds the file's extension if such exists and remove it
	    var dotPos = label.lastIndexOf("." + this.fileType);
	    if (dotPos != -1) {
			label = label.substr(0, dotPos);
	    }
	    
	    label = MediaFile.trimLabel(label);
		label += "." + this.fileType;	// adds the file's extension back
	    
	    return label;
	};
	
	var isMediaFileExistsInList_Base = this.isMediaFileExistsInList;
	this.isMediaFileExistsInList = function(mediaFile) {
	    return isMediaFileExistsInList_Base(this.doc.flashFilesList, mediaFile);
	};
	
	// public methods
	var addToMediaList_Base = this.addToMediaList;
	this.addToMediaList = function(mediaFile) {
	    if (!FlashFile.isSupportedFileType(this.fileType)) { return }; 	// will not add to list if the file type is not supported
	    if (mediaFile == null) { mediaFile = this; } 							// if was not sent as a parameter, then uses itself
	    if (this.doc.flashFilesList == null) { this.doc.flashFilesList = new Array(); }
	    if (this.isMediaFileExistsInList(mediaFile)) { return; } 				// will not add to list if the media file already exists
	    addToMediaList_Base(this.doc.flashFilesList, mediaFile);
	};
	
	var createMenuItem_Base = this.createMenuItem;
	this.createMenuItem = function(document, flashVideoDownload) {
	    var menuItem = createMenuItem_Base(document, flashVideoDownload, this);
	    menuItem.setAttribute("class", "menuitem-iconic fnvfox_swfMenuItem");
	    
	    return menuItem;
	};

	// consturctor call
	this.init(url, docUrl);
};
    
// FlashFile Class - static methods
FlashFile.supportedFileTypes = ["swf"];
FlashFile.isSupportedFileType = function(fileType) {
	return MediaFile.isSupportedFileType(fileType, FlashFile.supportedFileTypes);
};