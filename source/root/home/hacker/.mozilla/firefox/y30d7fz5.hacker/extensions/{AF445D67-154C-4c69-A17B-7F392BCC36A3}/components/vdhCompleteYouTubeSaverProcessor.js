/******************************************************************************
 *            Copyright (c) 2006-2009 Michel Gutierrez. All Rights Reserved.
 ******************************************************************************/

/**
 * Constants.
 */

const Cc = Components.classes;
    const Ci = Components.interfaces;
    const NS_CYSPROC_CID = Components.ID("{982B8CD3-4310-410a-82CB-55C50728415C}");
    const NS_CYSPROC_PROG_ID = "@completeyoutubesaver.com/completeyoutubesaver-processor;1";
    const DHNS = "http://downloadhelper.net/1.0#";
    var cysBundle;
    var Util = null;
    function messageToJSConsole(msg) {
    var cysConsoleService = Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService);
        cysConsoleService.logStringMessage(msg);
        }

function errorToJSConsole(/** Error */ _e) {
var cysConsoleService = Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService);
    var consoleError = Cc['@mozilla.org/scripterror;1'].createInstance(Ci.nsIScriptError);
    consoleError.init(_e.message, _e.fileName, _e.lineNumber, _e.lineNumber, _e.columnNumber, 0, null);
    cysConsoleService.logMessage(consoleError);
    }

/**
 * Object constructor
 */
function Cys() {
try {
//       console.log("[Cys] constructor\n");
// messageToJSConsole("[Cys] constructor\n");
var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    this.pref = prefService.getBranch("extensions.cys.");
    this.core = Cc["@downloadhelper.net/core;1"].getService(Ci.dhICore);
    try {   // VDH version 4.9+
    Components.utils['import']("resource://dwhelper/util-service.jsm");
    }
catch (e) {   // VDH version up to 4.8.6.
Util = Cc["@downloadhelper.net/util-service;1"].getService(Ci.dhIUtilService);
}
this.core.registerProcessor(this);
} catch (e) {
//		messageToJSConsole("[Cys] !!! constructor: "+e+"\n");
// 		errorToJSConsole(e);
}
}

Cys.prototype = {
get name() { return "completeyoutubesaver-processor"; },
    get provider() { return "completeyoutubesaver"; },
    get title() { return this.getString("dwhelper.title") },
    get description() { return this.getString("dwhelper.description")},
    get enabled() { return true; }
}

Cys.prototype.getString = function(_key){
if (cysBundle == null){
cysBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
    cysBundle = cysBundle.createBundle("chrome://completeyoutubesaver/locale/strings.properties");
}
return cysBundle.GetStringFromName(_key);
    }

Cys.prototype.canHandle = function(desc) {
if (!desc.has("media-url")) return false;
    var mediaUrl = Util.getPropsString(desc, "media-url");
    return (mediaUrl != null && mediaUrl.indexOf("http://") == 0 && mediaUrl.indexOf(".youtube.com/") != - 1);
    }

Cys.prototype.requireDownload = function(desc) {
//messageToJSConsole("[Cys] requireDownload()\n");
return false;
    }

Cys.prototype.preDownload = function(desc) {
//messageToJSConsole("[Cys] preDownload()\n");
return true;
    }

Cys.prototype.handle = function(desc) {
try{
//messageToJSConsole("[Cys] handle()\n");
var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var w = wm.getMostRecentWindow("navigator:browser");
    var doc = w.content.document;
    var location = doc.location.href;
    var targetUrl = Util.getPropsString(desc, "page-url");
    var targetTitle = Util.getPropsString(desc, "sn-name");
    var videoUrl = Util.getPropsString(desc, "media-url");
// 		dump('\ntargetUrl: '+targetUrl);
//       dump('\ntitle: '+targetTitle);
//       dump('\nvideoUrl: '+videoUrl);
    if (location.indexOf("http://www.youtube.com/user/") == 0){
var div = doc.getElementById('playnav-curvideo-title');
    var a = div.getElementsByTagName("a");
    targetTitle = a[0].innerHTML;
    targetUrl = doc.getElementById("playnav-watch-link").href
}
targetTitle = (targetTitle) ? targetTitle.trim() : '';
    do{
    if (targetTitle.length > 4){
    var extInFilename = targetTitle.substring(targetTitle.length - 4, targetTitle.length).toUpperCase();
        if (extInFilename == ".MP4" || extInFilename == ".FLV" || extInFilename == ".3GP")	argetTitle = targetTitle.substring(0, targetTitle.length - 4).trim();
        extInFilename = null;
        if (targetTitle.length > 4)	xtInFilename = targetTitle.substring(targetTitle.length - 4, targetTitle.length).toUpperCase();
    }
    } while (extInFilename == ".MP4" || extInFilename == ".FLV" || extInFilename == ".3GP")
    if (targetTitle.toUpperCase() == ".MP4" || targetTitle.toUpperCase() == ".FLV" || targetTitle.toUpperCase() == ".3GP") targetTitle = targetTitle.replace(/./g, '_');
    var curObj = {title:targetTitle, savecomments:true, status:null, savedir:null, projDir:null, curpage:true, convert:null, age:0, videoID:null,
        videoUrl:videoUrl, videoName:null, pageUrl:targetUrl, videoFile:null, ok:false, formatStr:'', ccount: - 1, size:null, js1:{}, js2:{}};
    w.openDialog('chrome://completeyoutubesaver/content/saveDialog.xul', '', 'chrome,modal,centerscreen,dialog', curObj);
    if (curObj.ok){
if (curObj.videoFile != null) this.download(curObj.videoUrl, curObj.videoFile, false);
    w.openDialog("chrome://completeyoutubesaver/content/smallSaveDialog.xul", "", "chrome,dialog,minimizable,resizable", curObj);
}
} catch (e) {
messageToJSConsole("handle error:" + e);
    errorToJSConsole(e);
}
}

Cys.prototype.download = function (url, file, isHiddenDownload) {
var isSimpleList = this.pref.getIntPref("button.left.click.open") != 1;
    if (!isSimpleList || (!url.match(/fmt=36/gi) && !url.match(/fmt=17/gi) && !url.match(/fmt=13/gi))){
this.doDownload(url, file, isHiddenDownload);
    return;
}
var sizeRequest1 = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
    sizeRequest1.open("HEAD", url, true);
    sizeRequest1.onreadystatechange = function(event1){
    if (sizeRequest1.readyState == 2){
    try{
    var size1 = event1.originalTarget.getResponseHeader("Content-Length");
        if (size1 != null && size1 > 0){
    //messageToJSConsole("> readyState = "+sizeRequest1.readyState);
    //messageToJSConsole(url);
    event1.originalTarget.abort();
        Cys.doDownload(url, file, isHiddenDownload);
        return;
    } else{
    var sizeRequest2 = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
        var newUrl = null;
        if (url.match(/fmt=36/gi))
        newUrl = url.replace(/fmt=36/gi, "fmt=17");
        else
        newUrl = url.replace(/fmt=13/gi, "fmt=17");
        sizeRequest2.open("HEAD", newUrl, true);
        sizeRequest2.onreadystatechange = function(event2){
        if (sizeRequest2.readyState == 2){
        try{
        var size2 = event2.originalTarget.getResponseHeader("Content-Length");
            if (size2 != null && size2 > 0){
        //messageToJSConsole(">> readyState = "+sizeRequest2.readyState);
        //messageToJSConsole(this.channel.originalURI.spec);
        event2.originalTarget.abort();
            Cys.doDownload(this.channel.originalURI.spec, file, isHiddenDownload);
            return;
        } else{
        var newUrl = null;
            if (url.match(/fmt=36/gi))
            newUrl = url.replace(/fmt=36/gi, "fmt=13");
            else
            newUrl = url.replace(/fmt=13/gi, "fmt=36");
            var sizeRequest3 = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
            sizeRequest3.open("HEAD", newUrl, true);
            sizeRequest3.onreadystatechange = function(event3){
            if (sizeRequest3.readyState == 2){
            try{
            var size3 = event3.originalTarget.getResponseHeader("Content-Length");
                if (size3 != null && size3 > 0){
            //messageToJSConsole(">>> readyState = "+sizeRequest3.readyState);
            //messageToJSConsole(this.channel.originalURI.spec);
            event3.originalTarget.abort();
                Cys.doDownload(this.channel.originalURI.spec, file, isHiddenDownload);
                return;
            }
            } catch (ex){
            errorToJSConsole(ex);
            }
            }
            };
            sizeRequest3.send(null);
        }
        } catch (ex){
        errorToJSConsole(ex);
        }
        }
        };
        sizeRequest2.send(null);
    }
    } catch (ex){
    errorToJSConsole(ex);
    }
    }
    };
    sizeRequest1.send(null);
    }

Cys.prototype.doDownload = function (url, file, isHiddenDownload) {
try{
var wbPersist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].
    createInstance(Ci.nsIWebBrowserPersist);
    wbPersist.persistFlags = Ci.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES
    | Ci.nsIWebBrowserPersist.PERSIST_FLAGS_BYPASS_CACHE
    | Ci.nsIWebBrowserPersist.PERSIST_FLAGS_FIXUP_LINKS_TO_DESTINATION
    | Ci.nsIWebBrowserPersist.PERSIST_FLAGS_FIXUP_ORIGINAL_DOM
    | Ci.nsIWebBrowserPersist.PERSIST_FLAGS_NO_BASE_TAG_MODIFICATIONS
    | Ci.nsIWebBrowserPersist.PERSIST_FLAGS_DONT_CHANGE_FILENAMES;
    var io_service = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var source_uri = io_service.newURI(url, null, null);
    var w = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
    var isprivate = w.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsILoadContext);
    if (!isHiddenDownload){
var target_uri = io_service.newFileURI(file);
    var transfer = Cc["@mozilla.org/transfer;1"].createInstance(Ci.nsITransfer);
    transfer.init(source_uri, target_uri, "", null, null, null, wbPersist, isprivate);
    wbPersist.progressListener = transfer;
}
wbPersist.saveURI(source_uri, null, null, null, "", file, isprivate);
    return wbPersist;
} catch (ex){
errorToJSConsole(ex);
}
return null;
    }

Cys.prototype.observe = function(){}

Components.utils['import']("resource://gre/modules/XPCOMUtils.jsm");
    Cys.prototype.contractID = "@completeyoutubesaver.com/completeyoutubesaver-processor;1";
    Cys.prototype.classID = Components.ID("{982B8CD3-4310-410a-82CB-55C50728415C}");
//Cys.prototype.QueryInterface=XPCOMUtils.generateQI([Ci.dhIProcessor,]);
    Cys.prototype.QueryInterface = XPCOMUtils.generateQI([Ci.nsIObserver, ]);
    if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([Cys]);
    else
    var NSGetModule = XPCOMUtils.generateNSGetModule([Cys]);
