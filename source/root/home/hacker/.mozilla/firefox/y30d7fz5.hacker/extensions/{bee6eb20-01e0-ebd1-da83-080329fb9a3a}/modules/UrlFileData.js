var EXPORTED_SYMBOLS = ["UrlFileData"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/FileData/FileData.js");

var log;        // module
var FileData;   // module

function UrlFileData(params) {
    var self = this;

    this._docUrl = null;
    this._filesData = null; // an array of FileData

    this.init(params);
};

// should turn this into module pattern
UrlFileData.prototype = new function() {
    this.init = function(params) {
        if (!params) { 
            throw "Exception: UrlFileData: 'params' is undefined";
        }

        this._docUrl = params.docUrl || null;
        this._filesData = params.filesData || [];

        if (params.fileData) {
            this._filesData.push(params.fileData);
        }

        if (!this._docUrl) {
            throw "Exception: UrlFileData: 'docUrl' is null";
        }
    };

    this.clearFilesData = function() {
        this._filesData = null;
    };

    this.addFileData = function(fileData) {
        if (this.isFileDataExist(fileData)) { return false; }
        this._filesData.push(fileData);
        return true;
    };

    this.isFileDataExist = function(fileData) {
        for (var i in this._filesData) {
            if (this._filesData[i].Url === fileData.Url) {
                return true;
            }
        }
        return false;
    };

    this.hasCategory = function(category) {
        if (this._filesData.length === 0) { return false; }
        for (var i in this._filesData) {
            if (this._filesData[i].Category === category) {
                return true;
            }
        }
        return false;
    };

    // return true if at least one FileData is of category "VIDEO"
    this.hasVideo = function() {
        return this.hasCategory(FileData.CATEGORY.VIDEO);
    };

    // return true if at least one FileData is of category "FLASH"
    this.hasFlash = function() {
        return this.hasCategory(FileData.CATEGORY.FLASH);
    };

    this.getFlashFilesData = function() {
        this.filterAllDuplicates();
        return this.getFilesDataByCategory(FileData.CATEGORY.FLASH);
    };

    this.getVideoFilesData = function() {
        this.filterAllDuplicates();
        return this.getFilesDataByCategory(FileData.CATEGORY.VIDEO);
    };    

    this.getFilesDataByCategory = function(category) {
        this.filterAllDuplicates();
        var filesData = [];
        for (var i in this._filesData) {
            var fileData = this._filesData[i];
            if (fileData.Category === category) {
                filesData.push(fileData);
            }
        }        
        return filesData.length > 0 ? filesData : null;
    };

    // incase "isFileDataExist" missed when added a new fileData
    this.filterDuplicates = function() {
        for (var i = 0; i < this._filesData.length; i++) {
            var fileData_i = this._filesData[i];
            for (var j = 0; j < this._filesData.length; j++) {
                var fileData_j = this._filesData[j];
                if (i != j && fileData_i.Url === fileData_j.Url) {
                    this._filesData.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };

    this.filterAllDuplicates = function() {
        while (true) {
            if (!this.filterDuplicates()) { return; }
        }
    };

    Object.defineProperty(this, "DocUrl", { 
        get: function() { return this._docUrl; },
        set: function(value) { this._docUrl = value; }
    });

    Object.defineProperty(this, "FilesData", { 
        get: function() { 
            this.filterDuplicates();
            return this._filesData;
        } 
    });
};