var EXPORTED_SYMBOLS = ["VideoParams"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");

var VideoParams = function(params) {
	this._url 					= null;
	this._contentType 			= null;
	this._contentLength 		= null;
	this._fileType 				= null;
	this._filename 				= null;
	this._category 				= null;
	this._docUrl				= null;
	this._docDomain				= null;
	this._docTitle 				= null;
	this._downloadWindowFilename = null;
	this._downloadWindowFilenameFormatString = null;
	this._fileExt 				= null;
	this._quality 				= null;
	this._isYouTube 			= false;
	this._isSigOk 				= null;
	this._fallbackHost 			= null;
	this._itag 					= null;
	this._s 					= null;
	this._playerJSUrl 			= null;
	this._formatKey  			= null;
	this._qualityKey  			= null;

	this.init(params);
};

VideoParams.prototype = {
	init:  function(params) {
		this._url 						= params.url || null;
		this._contentType 				= params.contentType || null;
		this._contentLength 			= params.contentLength || 0;
		this._fileType 					= params.fileType || null;
		this._filename 					= params.filename || null;
		this._category 					= params.category || null;
		this._docUrl					= params.docUrl || null;
		this._docDomain					= params.docDomain || null;
		this._docTitle 					= params.docTitle || null;
		this._downloadWindowFilename 	= params.downloadWindowFilename || null;
		this._fileExt 					= params.fileExt || null;
		this._quality 					= params.quality || null;
		this._isYouTube 				= params.isYouTube || false;
		this._popupLabelFormatString 	= params.popupLabelFormatString || null;
		this._downloadWindowFilenameFormatString = params.downloadWindowFilenameFormatString || null;

		// YouTube params
		this._isSigOk 			= params.isSigOk === null ? null : params.isSigOk;
		this._fallbackHost 		= params.fallbackHost || null;
		this._itag 				= params.itag || null;
		this._s 				= params.s || null;
		this._playerJSUrl 		= params.playerJSUrl || null;
		this._formatKey 		= params.formatKey || null;
		this._qualityKey 		= params.qualityKey || null;
	},

	JSONParse: function() {
		var parsed = {
			url: this.Url,
			contentType: this.ContentType,
			contentLength: this.ContentLength,
			fileType: this.FileType,
			filename: this.Filename,
			category: this.Category,
			docUrl: this.DocUrl,
			docDomain: this.DocDomain,
			docTitle: this.DocTitle,
			downloadWindowFilename: this.DownloadWindowFilename,
			fileExt: this.FileExt,
			quality: this.Quality,
			popupLabelFormatString: this.PopupLabelFormatString,
			downloadWindowFilenameFormatString: this.DownloadWindowFilenameFormatString,
			isYouTube: this.IsYouTube
		};

		if (this.IsYouTube) {
			parsed.isSigOk = this.IsSigOk;
			parsed.fallbackHost = this.FallbackHost;
			parsed.itag = this.Itag;
			parsed.s = this.S;
			parsed.playerJSUrl = this.PlayerJSUrl;
			parsed.formatKey = this.FormatKey;
			parsed.qualityKey = this.QualityKey;
		}

		return parsed;
	},

	// getters
	get Url() 					{ return this._url; },
	get ContentType() 			{ return this._contentType; },
	get ContentLength() 		{ return this._contentLength; },
	get FileType() 				{ return this._fileType; },
	get Filename()				{ return this._filename; },
	get Category() 				{ return this._category; },
	get DocUrl()	 			{ return this._docUrl; },
	get DocDomain() 			{ return this._docDomain; },
	get DocTitle()	 			{ return this._docTitle; },
	get DownloadWindowFilename(){ return this._downloadWindowFilename; },
	get FileExt() 				{ return this._fileExt; },
	get Quality() 				{ return this._quality; },
	get PopupLabelFormatString(){ return this._popupLabelFormatString; },
	get DownloadWindowFilenameFormatString() { return this._downloadWindowFilenameFormatString; },
	get IsYouTube() 			{ return this._isYouTube; },
	get IsSigOk() 				{ return this._isSigOk; },
	get FallbackHost() 			{ return this._fallbackHost; },
	get Itag() 					{ return this._itag; },
	get S() 					{ return this._s; },
	get PlayerJSUrl() 			{ return this._playerJSUrl; },
	get FormatKey()				{ return this._formatKey; },
	get QualityKey()			{ return this._qualityKey; }
};