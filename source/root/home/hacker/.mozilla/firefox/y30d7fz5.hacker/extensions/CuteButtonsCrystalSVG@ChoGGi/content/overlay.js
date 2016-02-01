"use strict";
if (Cc == undefined) var Cc = Components.classes;
if (Ci == undefined) var Ci = Components.interfaces;
if (Cu == undefined) var Cu = Components.utils;
Cu.import("chrome://cutebuttons/content/common.jsm");
Cu.import("resource://gre/modules/Services.jsm");
if (!cbOverlay) var cbOverlay = {};
//Services.console.logStringMessage("CuteButtons:\n " + XXX);

cbOverlay = {

  prefs: Services.prefs.getBranch("extensions.cutebuttons."),

  init: function(){
    //let firstPaint go first
    window.setTimeout(function(){
      cbCommon.applySheets();
    },500);

    //add icon to statusbar
    if (!document.getElementById("status4evar-status-image")){
      var statusBarWidget = document.getElementById("status4evar-status-widget");
      if (statusBarWidget){
        var statusBarText = document.getElementById("status4evar-status-text"),
        statusBarIcon = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","image");

        //statusBarWidget.appendChild(statusBarIcon);
        statusBarIcon.id = "status4evar-status-image";
        statusBarIcon.setAttribute("label","");
        statusBarWidget.insertBefore(statusBarIcon,statusBarText);
        //copy value from label to image
        var observer = new MutationObserver(function(mutations){
          mutations.forEach(function(mutation){
            statusBarIcon.setAttribute("label",mutation.target.value);
          });
        });
        observer.observe(statusBarText,{attributes:true,attributeFilter:["value"]});
      }
    }
  },

  openOptions: function(button){
    if (button == 0){
      var em = Services.wm.getMostRecentWindow("cutebuttonsOptions");
      if (em)
        em.focus();
      else
        window.openDialog("chrome://cutebuttons/content/options.xul","","resizable");
        //window.gBrowser.addTab("chrome://cutebuttons/content/options.xul");
    }
  }
};

window.addEventListener("load", function load(event){
  window.removeEventListener("load",load,false);
  cbOverlay.init();
},false);
