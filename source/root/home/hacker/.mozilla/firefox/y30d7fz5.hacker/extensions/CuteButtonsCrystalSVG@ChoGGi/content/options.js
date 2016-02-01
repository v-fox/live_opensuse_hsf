"use strict";
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
if (!cbOptions) var cbOptions = {};
Cu.import("chrome://cutebuttons/content/common.jsm");
Cu.import("chrome://cutebuttons/content/mosaic.jsm");
Cu.import("resource://gre/modules/Services.jsm");

cbOptions = {

  prefs: Services.prefs.getBranch("extensions.cutebuttons."),

  //get options from prefs for options dialog
  init: function(){
    var prefs = this.prefs;

    function set(id,pref){
      var tempPref = document.getElementById(id);
      if (prefs.getBoolPref(pref) == true)
        tempPref.value = 1;
      else
        tempPref.value = 0;
    }

    set("IconsRadio","icons");
    set("CheckboxIconsRadio","checkboxicons");
    set("RadioIconsRadio","radioicons");
    set("RotateIconsRadio","rotateicons");
    set("BlurDisabledRadio","blurdisabled");
    set("StatusbarRadio","statusbar");
    //set("MenuRadio","menuicons");
    set("ButtonRadio","buttonicons");
    document.getElementById("MosaicRadio").value = prefs.getIntPref("mosaic");

  },

  //when you press a radio
  radioChange: function(value,which,that,type){
    //update radio icon
    that.parentNode.selectedIndex = type;

    this.applyCSS(which,value);
    if (which == "menuicons" || which == "buttonicons"){
      if (value == true)
        value = false;
      else
        value = true;
    }
    this.prefs.setBoolPref(which,value);
  },

  mosaic: function(view,that){
    //update radio icon
    that.parentNode.selectedIndex = view;
    //set pref
    this.prefs.setIntPref("mosaic",view);
    //change mosaic
    cbStartup.mosaicCopy();
  },

  applyCSS: function(which,toggle){
    //apply the style sheets
    switch(which){
      case "icons":
        cbCommon.applyStyle("Icons.css",toggle,true);
        //fix for drop markers under linux (well at least ubuntu)
        var osString = Services.appinfo.OS;
        if (osString == "Linux")
          cbCommon.applyStyle("LinuxFix.css",toggle);
      break;
      case "checkboxicons":
        cbCommon.applyStyle("CheckmarkIcons.css",toggle,true);
      break;
      case "radioicons":
        cbCommon.applyStyle("RadioIcons.css",toggle,true);
      break;
      case "rotateicons":
        cbCommon.applyStyle("RotateIcons.css",toggle);
      break;
      case "blurdisabled":
        cbCommon.applyStyle("BlurDisabled.css",toggle);
      break;
      case "statusbar":
        var appInfo = Services.appinfo,
        versionChecker = Services.vc;
        if (appInfo.ID == "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}" && versionChecker.compare(appInfo.version, "4.0") >= 0)
          cbCommon.applyStyle("Statusbar-4evar.css",toggle,true);
        else if (appInfo.ID == "{8de7fcbb-c55c-4fbe-bfc5-fc555c87dbc4}")
          cbCommon.applyStyle("Statusbar-4evar.css",toggle,true);
        else
          cbCommon.applyStyle("Statusbar.css",toggle,true);
      break;
      case "buttonicons":
        cbCommon.applyStyle("NoIconsButtons.css",toggle);
      break;
      case "menuicons":
        cbCommon.applyStyle("NoIconsMenus.css",toggle);
      break;
    }
  /*
    var mainMenubarIcons = prefs.getIntPref("mainmenubaricons");
    if (mainMenubarIcons == 1){
      applyStyle("Menubar.css");
      applyStyle("MenubarIcons.css");
    } else if (mainMenubarIcons == 2){
      applyStyle("Menubar.css");
      applyStyle("MenubarText.css");
    }
  */
  }
};
