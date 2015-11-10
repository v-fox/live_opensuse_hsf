if (!cutebuttons){var cutebuttons = {};}
if (!cutebuttons.options){cutebuttons.options = {};}

cutebuttons.options = {

prefs: Components.classes["@mozilla.org/preferences-service;1"]
  .getService(Components.interfaces.nsIPrefService)
  .getBranch("extensions.cutebuttons."),

//get options from prefs for options dialog
init: function(){
  var prefs = this.prefs,idTmp;

  function set(id,pref){
    idTmp = document.getElementById(id);
    if (prefs.getBoolPref(pref) == true){
      idTmp.value = 1;
    } else {
      idTmp.value = 0;
    }
  }
  set("IconsRadio","icons");
  set("RotateIconsRadio","rotateicons");
  set("BlurDisabledRadio","blurdisabled");
  set("StatusbarRadio","statusbar");
  //set("MenuRadio","menuicons");
  set("ButtonRadio","buttonicons");
  document.getElementById("MosaicRadio").value = prefs.getIntPref("mosaic");

},

//when you press a radio
radioChange: function(value,which){
  this.applyCSS(which,value);
  if (which == "menuicons" || which == "buttonicons"){
    if (value == true){
      value = false;
    } else {
      value = true;
    }
  }
  this.prefs.setBoolPref(which,value);
},

mosaic: function(view){
  this.prefs.setIntPref("mosaic",view);
},

applyCSS: function(which,enable){

  function applyIt(file){
    var uri = ios.newURI(c + file,null,null);
    if (enable == false){
      if (sss.sheetRegistered(uri,sss.AGENT_SHEET)){
        sss.unregisterSheet(uri,sss.AGENT_SHEET);
      }
    } else {
      if (!sss.sheetRegistered(uri,sss.AGENT_SHEET)){
        sss.loadAndRegisterSheet(uri,sss.AGENT_SHEET);
      }
    }
  }
  var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
    .getService(Components.interfaces.nsIStyleSheetService);
  var ios = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var uri;
  var c = "chrome://cutebuttons/content/";

  if (which == "icons"){
    applyIt("Icons.css");
    //fix for drop markers under linux (well at least ubuntu)
    var osString = Components.classes["@mozilla.org/xre/app-info;1"]
      .getService(Components.interfaces.nsIXULRuntime).OS;
    if (osString == "Linux"){
      applyIt("LinuxFix.css");
    }
  } else if (which == "rotateicons"){
    applyIt("RotateIcons.css");
  } else if (which == "blurdisabled"){
    applyIt("BlurDisabled.css");
  } else if (which == "statusbar"){
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
      .getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
      .getService(Components.interfaces.nsIVersionComparator);
    if (appInfo.ID == "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}" && versionChecker.compare(appInfo.version, "4.0") >= 0){
      applyIt("Statusbar-4evar.css");
    } else {
      applyIt("Statusbar.css");
    }
  } else if (which == "buttonicons"){
    applyIt("NoIcons-Buttons.css");
  } else if (which == "menuicons"){
    applyIt("NoIcons-Menus.css");
  }

/*
  var mainMenubarIcons = prefs.getIntPref("mainmenubaricons");
  if (mainMenubarIcons == 1){
    applyIt("Menubar.css");
    applyIt("Menubar-Icons.css");
  } else if (mainMenubarIcons == 2){
    applyIt("Menubar.css");
    applyIt("Menubar-Text.css");
  }
*/

}
};
