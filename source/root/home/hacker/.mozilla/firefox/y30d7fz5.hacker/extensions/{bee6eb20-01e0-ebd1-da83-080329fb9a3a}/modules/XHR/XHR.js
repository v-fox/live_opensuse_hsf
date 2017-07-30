var EXPORTED_SYMBOLS = ["XHR"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

// modules import
Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/Q.js");

// modules list
var log;
var Q;

var XHR = function() {
	this.xhr = null;
	this.callback = null

	this.init();
};

XHR.prototype = new function() {
	this.init = function() {
		this.xhr = this.createXhrObject();
	};

	this.createXhrObject = function() {
		return Cc['@mozilla.org/xmlextras/xmlhttprequest;1']
			.createInstance(Components.interfaces.nsIXMLHttpRequest);		
	};

	this.getParamsString = function(params) {
		if (!params) { return null; }
		var paramsString = null;
		if (params) {
			paramsString = "";
			for (var key in params) {
				paramsString += key + "=" + params[key] + "&";
			}
			paramsString = paramsString.substr(0, paramsString.length-1);
		}

		return paramsString;
	};

	this.send = function(method, url, params) {
		method = method ? method.toUpperCase() : "GET";
		this.xhr.abort();

		var paramsString = this.getParamsString(params);
		if (paramsString && method === "GET") {
			url += "?" + paramsString;
		}

		this.xhr.open(method, url, true);
		if (method === "POST") {
			this.xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		}		
		this.xhr.setRequestHeader('Cache-Control', 'no-cache');
		this.xhr.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_ANONYMOUS 
			| Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE 
			| Components.interfaces.nsIRequest.INHIBIT_PERSISTENT_CACHING;
		
		var deferred = this.setOnreadystatechange();
		this.xhr.send(paramsString);

		return deferred.promise;
	};

	this.setOnreadystatechange = function() {
		var deferred = Q.defer();
		this.xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
			    if (this.status == 200) {
					deferred.resolve(this);
			    } else {
			    	deferred.reject(new Error(this.statusText));
			    }
			}
		};

		return deferred;
	};
};