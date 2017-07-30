var EXPORTED_SYMBOLS = ["StringBundle"];
var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://flashVideoDownload/log.js");
Cu.import("resource://flashVideoDownload/WM.js");

var log;	// module
var WM; 	// module

var StringBundle = new function() {
	var LOCALE_STRINGS_TREE = {
		"addon": {
			"name": "",
			"toolbarButtonLabel": ""
		},
		"options": {
			"mainTitle": "",
			"general": {
				"title": "",
				"themes": {
					"title": "",
					"dark": "",
					"light": ""
				},
				"flashAndVideos": {
					"title": "",
					"showFlashFilesResults_checkbox": "",
					"showVideosFilesResults_checkbox": ""
				},
				"downloadManagers": {
					"title": "",
					"useDownThemAll_checkbox": ""
				},
				"downloads": {
					"title": "",
					"useLastSavedFolder_radio": "",
					"useFFDownloadsFolder_radio": "",
					"saveTo_radio": "",
					"browse_button": "",
					"startDownloadsImmediately_checkbox": ""
				}
			},
			"yt": {
				"title": "",
				"formats": {
					"title": ""
				},
				"qualities": {
					"title": ""
				},
				"embeddedVideos": {
					"label": "",
					"enhancedDetection": {
						"label": "",
						"label1": "",
						"label2": "",
					}
				}
			},
			"about": {
				"title": "",
				"header": "",
				"version": "",
				"visitWebsite": ""
			},
			"dialogButtons": {
				"ok_button": "",
				"cancel_button": ""
			}
		},
		"popup": {
			"filesNotFound": "",
			"copiedToClipboard": "",
			"video": "",
			"flash": ""
		},
		"other": {
			"downloadWinodwSaveAs": ""
		}
	};

	this.stringbundle = null;

	this.init = function() {
		this.stringbundle = this.getStringbundle();
		this.buildLocaleStringsTree();
	};

	this.getTree = function() { return LOCALE_STRINGS_TREE; }

	this.getStringbundle = function() {
		return WM.getWin().document.getElementById("flashVideoDownload_stringbundle");
	};

	this.buildLocaleStringsTree = function() {
		this.getTreeNode(LOCALE_STRINGS_TREE);	// the root
	};

	this.getTreeNode = function(node, parent, nodeKey, str) {
		str = str || "";
		if (typeof node === "object") {
			// log("object");
			for (var i in node) {
				// log(node[i]);
				this.getTreeNode(node[i], node, i, str ? str + "." + i : i);
			}
		} else {
			// log(str);
			// logt(parent);
			// logt(nodeKey);
			try { 
				parent[nodeKey] = this.stringbundle.getString(str); 
			} catch(ex)  { err(ex); }
		}
	};

	this.get = function(keyString, tree) {
		var splitKeys = keyString.split(".");
		var currentPointer = tree || LOCALE_STRINGS_TREE;
		var key;

		for (var i in splitKeys) {
			key = splitKeys[i];

			if (key in currentPointer) {
				currentPointer = currentPointer[key];
			} else {
				return null;
			}
		} 
		return typeof currentPointer === "string" ? currentPointer : null;
	};

	this.init();
};