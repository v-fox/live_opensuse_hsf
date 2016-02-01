"use strict";
if (Cc == undefined) var Cc = Components.classes;
if (Ci == undefined) var Ci = Components.interfaces;
if (Cu == undefined) var Cu = Components.utils;
const EXPORTED_SYMBOLS = ["cbCommon"];
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
//Services.console.logStringMessage("CuteButtons:\n " + XXX);

var cbCommon = {

  applySheets: function(){
    var prefs = Services.prefs.getBranch("extensions.cutebuttons.");

    if (prefs.getBoolPref("icons") == true){
      cbCommon.applyStyle("Icons.css",true,true);
      //fix for drop markers under linux (well at least ubuntu)
      if (Services.appinfo.OS == "Linux")
        cbCommon.applyStyle("LinuxFix.css");
    }
/*
loaded in mosaic.jsm
    if (prefs.getBoolPref("checkboxicons") == true)
      cbCommon.applyStyle("CheckmarkIcons.css");
    if (prefs.getBoolPref("radioicons") == true)
      cbCommon.applyStyle("RadioIcons.css");
*/
    if (prefs.getBoolPref("rotateicons") == true)
      cbCommon.applyStyle("RotateIcons.css");
    if (prefs.getBoolPref("blurdisabled") == true)
      cbCommon.applyStyle("BlurDisabled.css");
    if (prefs.getBoolPref("buttonicons") == false)
      cbCommon.applyStyle("NoIconsButtons.css");
    if (prefs.getBoolPref("menuicons") == false)
      cbCommon.applyStyle("NoIconsMenus.css");
    if (prefs.getIntPref("mainmenubaricons") == 1){
      cbCommon.applyStyle("Menubar.css",true,true);
      cbCommon.applyStyle("MenubarIcons.css");
    } else if (prefs.getIntPref("mainmenubaricons") == 2){
      cbCommon.applyStyle("Menubar.css",true,true);
      cbCommon.applyStyle("MenubarText.css");
    }
    if (prefs.getBoolPref("statusbar") == true){
      if (Services.appinfo.ID == "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"
        && Services.vc.compare(Services.appinfo.version, "4.0") >= 0)
        cbCommon.applyStyle("Statusbar-4evar.css",true,true);
      else if (appInfo.ID == "{8de7fcbb-c55c-4fbe-bfc5-fc555c87dbc4}")
        cbCommon.applyStyle("Statusbar-4evar.css",true,true);
      else
        cbCommon.applyStyle("Statusbar.css",true,true);
    }

  },

  getMainWindow: function(){
    var wm = Services.wm.getMostRecentWindow,
    mainWin = wm("navigator:browser");

    if (!mainWin)
      mainWin = wm("mail:3pane");//thunderbird
    if (!mainWin)
      mainWin = wm("calendarMainWindow");//sunbird
    return mainWin;
  },

  applyStyle: function(file,toggle,profile){
    var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
    if (profile == true){
      var cssFile = "file:///" + FileUtils.getFile("ProfD",["CuteButtonsSVG",file]).path.replace(/\\/g,"/"),
      uri = Services.io.newURI(cssFile,null,null);
    } else var uri = Services.io.newURI("chrome://cutebuttons/content/" + file,null,null);

    if (toggle == false){
      if (sss.sheetRegistered(uri,sss.AGENT_SHEET))
        sss.unregisterSheet(uri,sss.AGENT_SHEET);
    } else {
      if (!sss.sheetRegistered(uri,sss.AGENT_SHEET))
        sss.loadAndRegisterSheet(uri,sss.AGENT_SHEET);
    }
  }

};
