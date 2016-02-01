"use strict";
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("chrome://cutebuttons/content/mosaic.jsm");
Cu.import("chrome://cutebuttons/content/common.jsm");

function cuteButtons(){}

cuteButtons.prototype = {
  classDescription: "CuteButtons Startup",
  contractID: "@ChoGGi/CuteButtonsSVG;1",
  classID: Components.ID("{638c4660-f72d-11de-8a39-0800200c9a66}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupports,Ci.nsIObserver]),
  prefs: Services.prefs.getBranch("extensions.cutebuttons."),

  observe: function(){
    //icons won't show up if this is delayed so
    cbStartup.mosaicCopy();
    cbStartup.cssCopy();

    //it seems radio/checkbox css needs to be loaded early as well
    if (Services.appinfo.OS == "WINNT"){
      if (this.prefs.getBoolPref("checkboxicons") == true)
        cbCommon.applyStyle("CheckmarkIcons.css",true,true);
      if (this.prefs.getBoolPref("radioicons") == true)
        cbCommon.applyStyle("RadioIcons.css",true,true);
    }

  }
}
/*
 * The following line is what XPCOM uses to create components. Each component
 * prototype must have a .classID which is used to create it.
 *
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([cuteButtons]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([cuteButtons]);
