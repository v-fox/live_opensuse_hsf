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

function FileLabelMaker() {
	// these are the formats to be displayed in the popup window:
	// var DEFAULT_FLASH_FILE_FORMAT = "{{filenameNoExt}}";
	// var DEFAULT_VIDEO_FILE_FORMAT = "{{filenameNoExt}}";
	var DEFAULT_FLASH_FILE_FORMAT = "{{filenameNoExt}}";
	var DEFAULT_VIDEO_FILE_FORMAT = "{{filenameNoExt}}";

	// these are the formats to be displayed in the downloads window - when saving/downloading the file
	var DEFAULT_FILENAME_FORMAT = "{{filename}}";
	var FILENAME_FORMAT_AS_TITLE = "{{docTitle}}.{{fileExt}}";

	this.init = function() {
		log("29");
		log(PrefManager);
		// log(this.filena)
	};

	this.getFilenameFormat = function() {
		var suggestAltFilenames = PrefManager.getPref(
			PrefManager.PREFS.GENERAL.DOWNLOADS.SUGGEST_ALTERNATIVE_FILENAMES
		);

		log(suggestAltFilenames);

		return suggestAltFilenames ? 
			FILENAME_FORMAT_AS_TITLE : DEFAULT_FILENAME_FORMAT;
	};

	// The filename's format and how it's displayed in the popup
	this.getFileLabel = function(fileData) {
		if (!fileData) { return null; }
		if (fileData.Category === FileData.CATEGORY.FLASH) {
			return this.getFlashFileLabel(fileData);
		}
		if (fileData.Category === FileData.CATEGORY.VIDEO) {
			return this.getVideoFileLabel(fileData);
		}
	};

	// The filename's format and how it's displayed in the downloads window
	this.getFilenameLabel = function(fileData) {
		if (!fileData) { return null; }
		if (fileData.Category === FileData.CATEGORY.FLASH) {
			return this.getFlashFilenameLabel(fileData);
		}
		if (fileData.Category === FileData.CATEGORY.VIDEO) {
			return this.getVideoFilenameLabel(fileData);
		}
	};

	this.createLabel = function(format, fileData) {
		if (!format) { return null; }

		format = this.replaceMoustache(format, "quality", fileData.Quality);
		format = this.replaceMoustache(format, "category", fileData.Category);
		format = this.replaceMoustache(format, "filename", decodeURIComponent(fileData.Filename));
		format = this.replaceMoustache(format, "videoTitle", fileData.DocTitle);
		format = this.replaceMoustache(format, "flashTitle", fileData.DocTitle);
		format = this.replaceMoustache(format, "docTitle", fileData.DocTitle);
		format = this.replaceMoustache(format, "filenameNoExt", decodeURIComponent(fileData.FilenameNoExt));
		format = this.replaceMoustache(format, "fileSize", fileData.ContentLength.toString());
		format = this.replaceMoustache(format, "fileExt", fileData.FileExt);
		format = this.replaceMoustache(format, "fileType", fileData.FileType);

		return format;
	};

	// FileLabel functions - to be displayed in the popup
	// creates a flash file label from a file format
	this.getFlashFileLabel = function(fileData) {
		var format = DEFAULT_FLASH_FILE_FORMAT;

		return this.createLabel(format, fileData);
	};

	// creates a video file label from a file format
	this.getVideoFileLabel = function(fileData) {
		var format = this.getVideoFileFormat(fileData);

		return this.createLabel(format, fileData);
	};

	// creates a video file format
	this.getVideoFileFormat = function(fileData) {
		log(fileData);
		if (fileData.PopupLabelFormatString) {
			return (new FileLabel(fileData.PopupLabelFormatString)).Format;
		}
		return DEFAULT_VIDEO_FILE_FORMAT;
	};

	// FilenameLabel functions - to be displayed in the downloads window
	// creates a video filename label from a filename format
	this.getVideoFilenameLabel = function(fileData) {
		var format = this.getVideoFilenameFormat(fileData);
		log(this.createLabel(format, fileData));

		return this.createLabel(format, fileData);
	};

	// creates a video filename format
	this.getVideoFilenameFormat = function(fileData) {
		log(117);
		log(fileData);
		if (fileData.DownloadWindowFilenameFormatString) {
			return (new FileLabel(fileData.DownloadWindowFilenameFormatString)).Format;
		}
		log(this.getFilenameFormat());
		return this.getFilenameFormat();
	};

	// creates a flash filename format
	this.getFlashFilenameLabel = function(fileData) {
		var format = this.getFlashFilenameFormat(fileData);
		log(format);

		return this.createLabel(format, fileData);
	};

	this.getFlashFilenameFormat = function(fileData) {
		return this.getFilenameFormat();
	};

	this.replaceMoustache = function(str, moustache, value) {
		return str.replace("{{" + moustache + "}}", value);
	};

	this.init();
}