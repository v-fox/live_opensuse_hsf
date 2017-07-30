var EXPORTED_SYMBOLS = ["FileDownloadManager"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/StringBundle.js");
Cu.import("resource://flashVideoDownload/VersionInfo.js");
Cu.import("resource://flashVideoDownload/PrefManager.js");
Cu.import("resource://flashVideoDownload/FileDownloadManager/DownloadManagers.js");

// ff modules
Cu.import("resource://gre/modules/Downloads.jsm");
Cu.import("resource://gre/modules/Task.jsm");
Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm");

var log;                // module
var StringBundle;       // module
var VersionInfo;        // module
var PrefManager;        // module
var DownloadManagers;   // module

// firefox modules
var Downloads;
var Task;

var FileDownloadManager = function(window) {
    this.downloadManagers = null;

	this.init(window);
};

FileDownloadManager.prototype = new function() {
    var INVALID_CHARS = ["\/", "\\", "\"", ":", "*", "?", "<", ">", "|"];
    var INVALID_CHARS_REPLACE_WITH = "_";

	this.init = function(window) {
		this.window = window || null;
        this.downloadManagers = new DownloadManagers();
	};

    this.getFilename = function(fileData) {
        var filename = fileData.DownloadWindowFilename;
        log(fileData);
        if (fileData.IsUseLabelAsFilename) { filename = fileData.PopupLabel; }
        filename = decodeURIComponent(filename);            // decodes characters
        filename = this.replaceInvalidChars(filename);      // replaces invalid characters
        log(filename);

        return filename;
    };

	this.downloadFile = function(fileData, xulWindow) {
        log("56");
        var filename = this.getFilename(fileData);
        log(filename);
        
        if (this.downloadManagers.DTA.isActive()) {
            this.downloadManagers.DTA.openXulWindow(fileData.Url, filename, fileData.DocTitle);
            return true;
        }

		var params = {
            filename: filename,
            fileExt: fileData.FileExt,
            isShowFilePicker: this.isShowFilePicker()
		};
		var nsIFile = this.getPathAndFilenameForDownload(params);
        if (!nsIFile) { return false; }

		if (nsIFile.exists() && !params.isShowFilePicker) {
			log("getting new filename");
			nsIFile = this.getNewFilenameWithNumber(nsIFile, params);
		}

        this.downloadFileUsingDownloadsJSM(fileData.Url, nsIFile);

        return true;    // just means that the file was found and may started downloading
	};

	this.getPathAndFilenameForDownload = function(params) {
        var nsIFilePicker = Ci.nsIFilePicker;
		var filename = params.filename;
		var fileExt = params.fileExt;
		var isShowFilePicker = params.isShowFilePicker;
		var downloadsFolder = PrefManager.getDownloadsFolder();

		var fp = this.getFilePicker(filename, fileExt);

    	// checks if the user would like to download the file without the file picker window
    	// if no downloads folder has been set (that would be the case if the user selected the option of "Last Saved Folder"), downloading immediately
    	// will be denied and the file picker window will appear.	
    	if (!isShowFilePicker) {
    	    // when adding a filename to the folder's path, it removes the leaf (the last folder)
    	    // so adding the dummy path will be overwritten when the filename is added to the path
    	    downloadsFolder.append("dummy_path");
    	    downloadsFolder.leafName = filename;	// adds the filename to the folder's path
    	    
    	    return downloadsFolder;
    	}
		
		if (downloadsFolder) { fp.displayDirectory = downloadsFolder; }
		var rv = fp.show();
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {	    
            var file = fp.file;	// the nsIFile - the path and the filename - example "c:/videos/ball.mpeg"
            return file;
        }
        return null;
	};

	this.getFilePicker = function(filename, fileExt) {
		var nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

		fp.init(this.window, StringBundle.get("other.downloadWinodwSaveAs"), nsIFilePicker.modeSave);
		fp.defaultString = filename;	// the default filename
		fp.appendFilter(fileExt, "*." + fileExt);

		return fp;	
	};

	this.downloadFileUsingDownloadsJSM = Task.async(function* (url, nsIFile) {
        try {
            // isPrivate: whether or not the window is in private browsing mode
            var isPrivate = PrivateBrowsingUtils.isWindowPrivate(this.window);
            var list = isPrivate ? 
                yield Downloads.getList(Downloads.PRIVATE) :
                yield Downloads.getList(Downloads.PUBLIC);

            var source = { url, isPrivate };
            var download = yield Downloads.createDownload({
                source,
                target: nsIFile
            });

            list.add(download);
            download.start();
        } catch(ex) {
            log(ex); 
        }
    });

    this.isShowFilePicker = function() {
        if (PrefManager.getDownloadsFolder() && 
            PrefManager.getPref(PrefManager.PREFS.GENERAL.DOWNLOADS.DOWNLOAD_IMMEDIATELY)) {
            return false;
        }
        return true;
    };

    // todo - might need to rewrite this function - looks messy
    this.renameDownloadFilename = function(filename, fileExt) {
    	filename = this.removeExtFromFilename(filename, fileExt);
        var matches = filename.match(/\s\(\d+\)/g); // find any matches for example (1), (4), (123)
        if (!matches) {
        	filename += " (1)";
        	return this.addFileExtToFilename(filename, fileExt);
        }
        var lastMatch = matches[matches.length - 1];    // get the last match, which is the relevant one
        // make sure it's at the end of the string
        if (filename.lastIndexOf(lastMatch) !== filename.length-lastMatch.length) {
        	filename += " (1)";
            return this.addFileExtToFilename(filename, fileExt);
        }
        var fileNum = lastMatch.trim();
        fileNum = fileNum.substr(1);
        fileNum = parseInt(fileNum);
        fileNum++;
        filename = filename.substring(0, filename.length-lastMatch.length);
        filename += " (" + fileNum + ")";
        
        return this.addFileExtToFilename(filename, fileExt);
    };

	this.removeExtFromFilename = function(filename, fileExt) {
		var fileExtPos = filename.lastIndexOf("." + fileExt);
		if (fileExtPos != -1) { 
			return filename.substr(0, fileExtPos);
		}
		return filename;
	};

	this.addFileExtToFilename = function(filename, fileExt) {
		return fileExt ? filename + "." + fileExt : filename;
	};

    this.getNewFilenameWithNumber = function(nsIFile, params) {
        var failsafe = 0;

        while (nsIFile.exists()) {
            failsafe++;
            if (failsafe >= 100) { break; }
            params.filename = this.renameDownloadFilename(params.filename, params.fileExt);
            nsIFile = this.getPathAndFilenameForDownload(params);
        }
        return nsIFile;
    };

    this.replaceInvalidChars = function(filename, replaceWith, invalidChars) {
        invalidChars = invalidChars || INVALID_CHARS;
        replaceWith = replaceWith || INVALID_CHARS_REPLACE_WITH;
        for (var i = 0; i < filename.length; i++) {
            for (var j = 0; j < invalidChars.length; j++) {
                if (filename[i] == invalidChars[j]) {
                    filename = filename.replace(invalidChars[j], replaceWith);
                }
            }
        }
        return filename;
    };
};