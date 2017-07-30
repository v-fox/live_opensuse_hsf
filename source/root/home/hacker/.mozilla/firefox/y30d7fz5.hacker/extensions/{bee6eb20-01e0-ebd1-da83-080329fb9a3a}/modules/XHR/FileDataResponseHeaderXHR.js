var EXPORTED_SYMBOLS = ["FileDataResponseHeaderXHR"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

// modules import
Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/Q.js");
Cu.import("resource://flashVideoDownload/XHR/XHR.js");

// modules list
var log;
var Q;
var XHR;

var FileDataResponseHeaderXHR = function(fileUrl) {
	this.init(fileUrl);
};

FileDataResponseHeaderXHR.prototype = new function() {
	this.init = function(fileUrl) {
		this.xhr = new XHR();
		this.overrideXHROnreadystatechange();
		this.fileUrl = fileUrl || null;
	};

	this.send = function(fileUrl) {
		fileUrl = this.fileUrl || fileUrl;
		if (!fileUrl) { 
			deferred.reject(new Error("No URL specified"));
			return deferred.promise; 
		}
		var deferred = Q.defer();

		// log("getting fileUrl " + this.fileUrl);
		this.xhr.send("head", fileUrl)
		.then(function(responseHeaders) {
			deferred.resolve(responseHeaders);
		}, function(error) {

		});

		return deferred.promise;
	};
	
	this.overrideXHROnreadystatechange = function() {
		this.xhr.setOnreadystatechange = function() {
			var deferred = Q.defer();
			this.xhr.onreadystatechange = function() {
				try {
					if (this.readyState == 3) {
						var contentLength = this.getResponseHeader("Content-Length");
						var contentType = this.getResponseHeader("Content-Type");
						if (contentLength && contentType) {
							deferred.resolve({
								readyState: 3,
								contentLength: contentLength,
								contentType: contentType
							});
						}
						this.abort();
					}

					if (this.readyState == 4) {
					    if (this.status == 200) {
							var contentLength = this.getResponseHeader("Content-Length");
							var contentType = this.getResponseHeader("Content-Type");					    	
							deferred.resolve({
								readyState: 4,
								contentLength: contentLength,
								contentType: contentType
							});
					    } else {
					    	deferred.reject(new Error(this.statusText));
					    }
					}
				} catch(ex) { }
			};

			return deferred;
		};		
	};
};