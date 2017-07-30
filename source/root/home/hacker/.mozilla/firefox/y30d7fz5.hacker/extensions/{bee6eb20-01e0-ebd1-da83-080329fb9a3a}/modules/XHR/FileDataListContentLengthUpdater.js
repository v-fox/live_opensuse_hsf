var EXPORTED_SYMBOLS = ["FileDataListContentLengthUpdater"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

// modules import
Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/XHR/RecursiveXHR.js");
Cu.import("resource://flashVideoDownload/SimpleObserver/SimpleObserver.js");

// modules list
var log;
var XHR;
var SimpleObserver;

var FileDataListContentLengthUpdater = function(simpleObserver) {
	this.simpleObserver = null;

	this.init(simpleObserver);
};

// NOT FINISHED - NEED TO FINISH
FileDataListContentLengthUpdater.prototype = new function() {
	var NUM_OF_RECURSIVE_XHR = 4;

	this.init = function(simpleObserver) {
		this.simpleObserver = simpleObserver || null;
	};	

    this.updateContentLengthForUrlFileData = function(currentUrlFileData) {
    	// var currentUrlFileData = this.getUrlFileDataOfSelectedTab();
    	if (!currentUrlFileData) { return null; }

    	var filesDataList = this.getFilesDataListForRecursiveXHR(currentUrlFileData);
    	if (!filesDataList) { return; }
    	var splitFilesDataList = this.getSplitArray(filesDataList, NUM_OF_RECURSIVE_XHR);
    	log("split array");
    	log(splitFilesDataList);
    	this.sendMultipleRecursiveXHRs(splitFilesDataList);
    };

    this.getFilesDataListForRecursiveXHR = function(currentUrlFileData) {
    	log(currentUrlFileData);
    	var self = this;

    	var filesDataList = [];
    	for (var i in currentUrlFileData.FilesData) { 
    		var fileData = currentUrlFileData.FilesData[i];
    		if (!fileData.ContentLength.isEmpty()) { continue; }
    		var item = {
    			url: fileData.Url,
    			callback: function(responseData) {
    				log(responseData);
    				this.data.ContentLength = responseData.contentLength;
    				self.simpleObserver.notify(
    					self.simpleObserver.TOPICS.URL_FILE_DATA_CONTENT_LENGTH_UPDATED, 
    					this.data 	// fileData
    				);
    			},
    			data: fileData
    		};
    		filesDataList.push(item);
    	}
    	
    	return filesDataList;
    };

    this.getSplitArray = function(source, numOfXHRs) {
    	var indexesArray = this.getIndexesArray(source, 4);
    	return this.getChunksArray(source, indexesArray);
    };

	this.getIndexesArray = function(source, numOfArrays) {
		var indexesArray = [];
		var lengthOfEachArray = Math.floor(source.length / numOfArrays);
		var remainder = source.length % numOfArrays;
		for (var i = 0; i < numOfArrays; i++) {
			indexesArray.push(lengthOfEachArray);
		}
		for (var i = 0; i < remainder; i++) {
			indexesArray[i]++;
		}
		for (var i = 0; i < indexesArray.length;) {
			if (indexesArray[i] === 0) {
				indexesArray.splice(i, 1);
			} else {
				i++;
			}
		}

		return indexesArray;
	};

	this.getChunksArray = function(source, indexesArray) {
		var getPositions = function(currentIndex, indexesArray) {
			var startPos = 0;
			var endPos = indexesArray[0];

			for (var i = 0; i < currentIndex; i++) {
				startPos += indexesArray[i];
				endPos += indexesArray[i+1];
			}

			return { 
				start: startPos, 
				end: endPos
			};
		};			

		var chunksArray = [];
		var numOfArrays = indexesArray.length;
		for (var i = 0; i < numOfArrays; i++) {
			var positions = getPositions(i, indexesArray);

			var item = source.slice(positions.start, positions.end);
			chunksArray.push(item);
		};

		return chunksArray;
	};

	this.sendMultipleRecursiveXHRs = function(splitFilesDataList) {
		for (var i in splitFilesDataList) {
			splitFilesDataList[i].recursiveXHR = new RecursiveXHR();
			splitFilesDataList[i].recursiveXHR.send(
				splitFilesDataList[i], 
				RecursiveXHR.FILE_DATA_RESPONSE_HEADER_XHR
			);
		}
	};
};