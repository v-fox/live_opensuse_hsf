var EXPORTED_SYMBOLS = ["FileData"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/FileData/ContentLength.js");

var log;	// module

var FileData = function(params) {
	this._url 						= null;
	this._contentType 				= null;
	this._contentLength 			= null;
	this._browserMM 				= null;
	this._fileType 					= null;
	this._filename 					= null;
	this._category 					= null;
	this._browserMM					= null;
	this._docUrl					= null;
	this._docDomain					= null;
	this._docTitle 					= null;
	this._aDOMWindow 				= null;
	this._tab 						= null;
	this._quality 					= null;
	this._formatKey 				= null;
	this._qualityKey 				= null;
	this._popupLabel 				= null;		// the label that will show for the file in the popup window list
	this._popupLabelFormatString 	= null;		// a format string representing the popup label - the popup label will be created from the format string
	this._downloadWindowFilename 	= null;		// the file name that will show in the download window (after clicking the download button)
	this._downloadWindowFilenameFormatString = null;	// the format string representing the file name thath will show in the download window - the downoad window filename will be created from the format string
	this._fileExt 					= null;
	this._isYouTube 				= null;

	this.init(params);
};

// should turn this into module pattern
FileData.prototype = {
	CATEGORY: {
		VIDEO: "video",
		FLASH: "flash"
	},
	init: function(params) {
		if (!params) { return; }
		this._url 					= params.url || null;
		this._contentType 			= params.contentType || null;
		this._fileType 				= params.fileType || null;
		this._filename 				= params.filename || null;
		this._category 				= params.category || null;
		this._browserMM				= params.browserMM || null;
		this._docUrl				= params.docUrl || null;
		this._docDomain				= params.docDomain || null;
		this._docTitle 				= params.docTitle || null;
		this._aDOMWindow 			= params.aDOMWindow || params.browser || null;
		this._tab 					= params.tab || null;
		this._downloadWindowFilename= params.downloadWindowFilename || null;
		this._filenameNoExt			= params.filenameNoExt || null;
		this._fileExt 				= params.fileExt || null;
		this._quality 				= params.itag || params.quality || null;
		this._formatKey 			= params.formatKey || null;
		this._qualityKey 			= params.qualityKey || null;
		this._popupLabelFormatString= params.popupLabelFormatString || null;
		this._downloadWindowFilenameFormatString = params.downloadWindowFilenameFormatString || null;
		this._popupLabel 			= params.popupLabel || null;
		this._isYouTube				= params.isYouTube || false;

		this.setContentLength(params.contentLength);
		this.setFilename(params.url);
		this.setFileExt();
		this.setFilenameNoExt();

		// this.removeExtFromFilename();
	},

	setContentLength: function(contentLength) {
		if (!contentLength) { this._contentLength = null; }
		this._contentLength = new ContentLength(contentLength);
	},

	setFilename: function(url) {
		if (this._filename || !url) { return; }
		var slashPos = url.lastIndexOf("/");
		this._filename = url.substr(slashPos + 1);;
		var quesMarkPos = this._filename.indexOf("?");
		if (quesMarkPos != -1) {
			this._filename = this._filename.substr(0, quesMarkPos);
		}
	},

	setFilenameNoExt: function() {
		this._filenameNoExt = this._filename.split(".")[0];
	},

	setFileExt: function() {
		if (!this._filename || this._fileExt) { return; }
		var dotPos = this._filename.lastIndexOf(".");
		this._fileExt = this._filename.substr(dotPos + 1);
		this._fileExt = this._fileExt.split("?")[0];
	},

	// getters
	get Url() 					{ return this._url; },
	get ContentType() 			{ return this._contentType; },
	get ContentLength() 		{ return this._contentLength; },
	get FileType() 				{ return this._fileType; },
	get Filename()				{ return this._filename; },
	get Category() 				{ return this._category; },
	get BrowserMM() 			{ return this._browserMM; },
	get DocUrl()	 			{ return this._docUrl; },
	get DocDomain() 			{ return this._docDomain; },
	get DocTitle()	 			{ return this._docTitle; },
	get Browser() 				{ return this._aDOMWindow; },
	get Tab() 					{ return this._tab; },
	get DownloadWindowFilename(){ return this._downloadWindowFilename; },
	get FilenameNoExt() 		{ return this._filenameNoExt; },
	get FileExt() 				{ return this._fileExt; },
	get Quality() 				{ return this._quality ? this._quality : ""; },
	get PopupLabel() 			{ return this._popupLabel; },
	get FormatKey() 			{ return this._formatKey; },
	get QualityKey() 			{ return this._qualityKey; },
	get PopupLabelFormatString(){ return this._popupLabelFormatString; },
	get DownloadWindowFilenameFormatString() 	{ return this._downloadWindowFilenameFormatString; },
	get IsYouTube() 			{ return this._isYouTube; },

	// setters
	set Url(value) 					{ this._url = value; },
	set ContentType(value)			{ this._contentType = value; },
	set ContentLength(value) 		{ this.setContentLength(value); },
	set FileType(value) 			{ this._fileType = value; },
	set Filename(value) 			{ this._filename = value; },
	set Category(value) 			{ this._category = value; },
	set BrowserMM(value)			{ this._browserMM = value; },
	set DocUrl(value)	 			{ this._docUrl = value; },
	set DocDomain(value)			{ this._docDomain = value; },
	set DocTitle(value)	 			{ this._docTitle = value; },
	set Browser(value) 				{ this._aDOMWindow = value },
	set Tab(value) 					{ this._tab = value; },
	set DownloadWindowFilename(value) { this._downloadWindowFilename = value; },
	set FilenameNoExt(value) 		{ this._filenameNoExt = value; },
	set FileExt(value) 				{ this._fileExt = value; },	
	set Quality(value) 				{ this._quality = value; },
	set FormatKey(value) 			{ this._formatKey = value; },
	set QualityKey(value) 			{ this._qualityKey = value; },
	set PopupLabelFormatString(value) { this._popupLabelFormatString = value; },
	set DownloadWindowFilenameFormatString(value)	{ this._downloadWindowFilenameFormatString = value; },
	set PopupLabel(value) 			{ this._popupLabel = value; },
	set IsYouTube(value) 			{ this._isYouTube = value; }
};

// a reference to "CATEGORY" from the function itself (rather than just from the object instance)
FileData.CATEGORY = FileData.prototype.CATEGORY;