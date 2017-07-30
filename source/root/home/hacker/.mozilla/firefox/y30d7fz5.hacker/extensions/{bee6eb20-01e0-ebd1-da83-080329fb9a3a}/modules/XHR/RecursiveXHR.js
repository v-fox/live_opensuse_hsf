var EXPORTED_SYMBOLS = ["RecursiveXHR"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

// modules import
Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/XHR/XHR.js");
Cu.import("resource://flashVideoDownload/XHR/FileDataResponseHeaderXHR.js");

// modules list
var log;
var XHR;

var RecursiveXHR = function() {};

// XHR available types
RecursiveXHR.XHR = 1;
RecursiveXHR.FILE_DATA_RESPONSE_HEADER_XHR = 2;

RecursiveXHR.prototype = new function() {
	/*
		xhrType - will be the xhr object when this method is called recursively (and not the type)

		requestData -
			url - the request url
			callback - the callback function to call to, when the response has been received
				callback param - responseData - will contain the response data (according to the XHR type)
			data - other optional data to pass to the callback function
	*/
    this.send = function(requestData, xhrType, index) {
    	index = index === undefined ? 0 : index;
    	// log("iteration num = " + index);
    	var xhr = typeof(xhrType) === "object" ? xhrType : this.getXHR(xhrType);
    	// log(xhr);
    	if (index === requestData.length) { return; }

    	var url = requestData[index].url;
    	// log(url);
    	var callback = requestData[index].callback;
    	var data = requestData[index].data;
    	xhr.send(url)
    	.then(function(responseData) {
    		callback.bind(requestData[index])(responseData, data);
    		this.send(requestData, xhr, index + 1);
    	}.bind(this), function(error) {});
    };

    this.getXHR = function(xhrType) {
    	if (xhrType === RecursiveXHR.XHR) { return new XHR(); }
    	if (xhrType === RecursiveXHR.FILE_DATA_RESPONSE_HEADER_XHR) { return new FileDataResponseHeaderXHR(); }

    	return null;
    };
};