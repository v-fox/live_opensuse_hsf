//from Stylish v1.0.8
//http://userstyles.org
//the below is GPL v3

if (Cc == undefined)
  var Cc = Components.classes;
if (Ci == undefined)
  var Ci = Components.interfaces;
if (Cu == undefined)
  var Cu = Components.utils;
if (Cr == undefined)
  var Cr = Components.results;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
/*
console.log("CuteButtons:\n" + "STRING");

console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
console.logStringMessage("CuteButtons:\n" + "STRING");
*/

function cuteButtons(){}

cuteButtons.prototype = {

  classDescription: "CuteButtons Startup",
  contractID: "@CuteButtons/startup;1",
  classID: Components.ID("{638c4660-f72d-11de-8a39-0800200c9a66}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports,Ci.nsIObserver]),

  observe: function(aSubject,aTopic,aData){

    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
      .getBranch("extensions.cutebuttons.");

    //pick a mosaic file
    function getMosaic(which){
      var mosaic = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties)
        .get("ProfD",Ci.nsIFile);
      mosaic.append("extensions");
      mosaic.append("CuteButtonsCrystalSVG@ChoGGi");
      mosaic.append("content");
      if (which == true){
        mosaic.append("mosaic.png");
        return mosaic.fileSizeOfLink;
      } else
        return mosaic;
    }
    function moveMosaic(which,index){
      var mosaicPath = getMosaic();
      //original path to mosaic
      var mosaicOrig = mosaicPath.clone();
      mosaicOrig.append("mosaic.png");
      mosaicOrig.remove(false);
      //path to new mosaic
      var mosaicNew = mosaicPath.clone();
      mosaicNew.append(which);
      mosaicNew.copyTo(null,"mosaic.png");
      //update mosaicWhich so we aren't copying the same file all the time
      prefs.setIntPref("mosaicwhich",index);
    }
    var mosaic = prefs.getIntPref("mosaic");
    var mosaicWhich = prefs.getIntPref("mosaicwhich");
    //change the default on OSX (icons look dull instead of transparent)
    var osString = Cc["@mozilla.org/xre/app-info;1"]
      .getService(Ci.nsIXULRuntime).OS;
    if (mosaic == 0 && osString == "Darwin")
      mosaic = 3;

    switch(mosaic){
      case 0:
        if (mosaicWhich != mosaic || getMosaic(true) == 0)
          moveMosaic("mosaic.org.png",mosaic);
      break;
      case 1:
        if (mosaicWhich != mosaic || getMosaic(true) == 0)
          moveMosaic("mosaic.brighter.png",mosaic);
      break;
      case 2:
        if (mosaicWhich != mosaic || getMosaic(true) == 0)
          moveMosaic("mosaic.brighterreversed.png",mosaic);
      break;
      case 3:
        if (mosaicWhich != mosaic || getMosaic(true) == 0)
          moveMosaic("mosaic.gray.png",mosaic);
      break;
      case 4:
        if (mosaicWhich != mosaic || getMosaic(true) == 0)
          moveMosaic("mosaic.normal.png",mosaic);
      break;
    }

    //apply the style sheets
    function applyIt(file){
      uri = ios.newURI(c + file,null,null);
      if (!sss.sheetRegistered(uri,sss.AGENT_SHEET))
        sss.loadAndRegisterSheet(uri,sss.AGENT_SHEET);
    }

    var sss = Cc["@mozilla.org/content/style-sheet-service;1"]
      .getService(Ci.nsIStyleSheetService);
    var ios = Cc["@mozilla.org/network/io-service;1"]
      .getService(Ci.nsIIOService);
    var uri;
    var c = "chrome://cutebuttons/content/";

    if (prefs.getBoolPref("icons") == true){
      applyIt("Icons.css");
      //fix for drop markers under linux (well at least ubuntu)
      if (osString == "Linux")
        applyIt("LinuxFix.css");
    }
    if (prefs.getBoolPref("rotateicons") == true)
      applyIt("RotateIcons.css");
    if (prefs.getBoolPref("blurdisabled") == true)
      applyIt("BlurDisabled.css");
    if (prefs.getBoolPref("statusbar") == true){
        var appInfo = Cc["@mozilla.org/xre/app-info;1"]
          .getService(Ci.nsIXULAppInfo);
        var versionChecker = Cc["@mozilla.org/xpcom/version-comparator;1"]
          .getService(Ci.nsIVersionComparator);
        if (appInfo.ID == "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"
          && versionChecker.compare(appInfo.version, "4.0") >= 0)
          applyIt("Statusbar-4evar.css");
        else
          applyIt("Statusbar.css");
    }
    if (prefs.getBoolPref("buttonicons") == false)
      applyIt("NoIcons-Buttons.css");
  /*
    if (prefs.getBoolPref("menuicons") == false){
      applyIt("NoIcons-Menus.css");
    }
  */
    var mainMenubarIcons = prefs.getIntPref("mainmenubaricons");
    if (mainMenubarIcons == 1){
      applyIt("Menubar.css");
      applyIt("Menubar-Icons.css");
    } else if (mainMenubarIcons == 2){
      applyIt("Menubar.css");
      applyIt("Menubar-Text.css");
    }

  }
}

// this throws and is unnecessary in firefox 4+
try {
  Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager)
    .addCategoryEntry("profile-after-change","cuteButtons",cuteButtons.prototype.contractID,true,true);
} catch(e){}

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([cuteButtons]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([cuteButtons]);
