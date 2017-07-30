var EXPORTED_SYMBOLS = ["LocaleBinder"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/StringBundle.js");

var log;	// module
var StringBundle; // module

var LocaleBinder = function(doc) {
	this.doc = null;

	this.init(doc);
};

LocaleBinder.prototype = new function() {
	var DATA_ATTRIBUTE_LOCALE = "data-locale";
	var DATA_ATTRIBUTE_LOCALE_INNER_HTML = "data-locale-inner";

	this.init = function(doc) {
		this.doc = doc || null;
	};

	this.getAllElementsWithDataAttribute = function() {
		return this.doc.querySelectorAll("[" + DATA_ATTRIBUTE_LOCALE + "]");
	};

	this.setDoc = function(doc) {
		this.doc = doc;
	};

	this.bind = function() {
		if (!this.doc) { err("'this.doc' is not defined"); return; }

		var elements = this.getAllElementsWithDataAttribute();

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			if (this.hasLocaleForInnerHtml(element)) {
				this.setLocaleForInnerHtml(element);
			}

			this.setLocalesForAttributes(element);
		}
	};

	this.getLocaleValueForInnerHtml = function(element) {
		if (element.hasAttribute(DATA_ATTRIBUTE_LOCALE_INNER_HTML)) {
			localeValue = element.getAttribute(DATA_ATTRIBUTE_LOCALE_INNER_HTML);

			return StringBundle.get(localeValue);
		}
		return null;
	};

	this.hasLocaleForInnerHtml = function(element) {
		return element.hasAttribute(DATA_ATTRIBUTE_LOCALE_INNER_HTML);
	};

	this.setLocaleForInnerHtml = function(element) {
		var innerHtmlLocaleValue = this.getLocaleValueForInnerHtml(element);
		if (innerHtmlLocaleValue) {
			this.setTextNode(element, innerHtmlLocaleValue);
		}
	};

	this.setTextNode = function(element, text) {
		while (element.hasChildNodes()) {
			element.removeChild(element.firstChild);
		}

		element.appendChild(this.doc.createTextNode(text));
	};

	this.setLocalesForAttributes = function(element) {
		// log(element.dataset);
		// localeKey = "data-locale-tooltip" - for example
		for (var localeKey in element.dataset) {
			var localeValue = element.dataset[localeKey];
			var targetAttributeName = this.extractTargetAttributeName(localeKey);
			if (targetAttributeName && element.hasAttribute(targetAttributeName)) {
				element.setAttribute(targetAttributeName, StringBundle.get(localeValue));
			}
			// log(element.dataset[key]);
		}
	};

	this.extractTargetAttributeName = function(localeKey) {
		return localeKey.split("locale")[1].toLowerCase();
	};
};