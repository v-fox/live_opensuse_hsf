var EXPORTED_SYMBOLS = ["NetworkNotifier"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/NetworkNotifier/NetworkData.js");
Cu.import("resource://flashVideoDownload/NetworkNotifier/DomainIgnoreList.js");

var log;                // module
var NetworkData;        // module
var DomainIgnoreList;   // module

var NetworkNotifier = function(simpleObserver, window) {
	var self = this;

    this.window = null;
	this.observerService = null;
    this.simpleObserver = null;

	this.init(simpleObserver, window);

    this.observe = function(aSubject, aTopic, aData) {
        if ((aTopic == "http-on-examine-response") || (aTopic == "http-on-modify-request")
            || (aTopic == "http-on-examine-cached-response")) {
            try {
                var networkData = NetworkData.createInstance(aSubject, this.window);
                if (networkData !== null) {
                    var fileData = networkData.convertToFileData();
                    if (DomainIgnoreList.isDomainInList(fileData)) { return; }
                    // log("54:");
                    // log(fileData);
                    this.simpleObserver.notify(this.simpleObserver.TOPICS.NETWORK_DATA, fileData);
                }
            } catch(ex) {}
        }
    }.bind(this);
};

NetworkNotifier.prototype = new function() {
    var URL_IGNORE_LIST = [
        // "metacafe.com"
    ];

    this.init = function(simpleObserver, window) {
        this.window = window;
        this.simpleObserver = simpleObserver;
        this.observerService = Cc["@mozilla.org/observer-service;1"]
            .getService(Ci.nsIObserverService);
        this.addObservers();
    };

    this.isDomainInUrlIgnoreList = function(domainName) {
        for (var i in URL_IGNORE_LIST) {
            if (domainName.indexOf(URL_IGNORE_LIST[i]) != -1) {
                return true;
            }
        }
        return false;
    };

    this.addObservers = function() {
        this.observerService.addObserver(this, "http-on-examine-response", false);
        this.observerService.addObserver(this, "http-on-modify-request", false);
        this.observerService.addObserver(this, "http-on-examine-cached-response", false);     
    };

    this.removeObservers = function() {
        this.observerService.removeObserver(this, "http-on-examine-response", false);
        this.observerService.removeObserver(this, "http-on-modify-request", false);
        this.observerService.removeObserver(this, "http-on-examine-cached-response", false);
        log("observers removed");
    };

    this.QueryInterface = function(aIID) {
        if (aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIObserver))
            { return this; }
        throw Cr.NS_NOINTERFACE;
    };

    this.shutdown = function() {
        this.removeObservers();
    };
};