"use strict";
if (Cc == undefined) var Cc = Components.classes;
if (Ci == undefined) var Ci = Components.interfaces;
if (Cu == undefined) var Cu = Components.utils;
const EXPORTED_SYMBOLS = ["cbStartup"];
//Cu.import("resource://gre/modules/osfile.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
//Cu.import("chrome://cutebuttons/content/common.jsm");
//Services.console.logStringMessage("CuteButtons:\n " + XXX);

var cbStartup = {

  prefs: Services.prefs.getBranch("extensions.cutebuttons."),
  profileDir: FileUtils.getDir("ProfD",["CuteButtonsSVG"],true),

  cssCopy: function(){
    var prefs = this.prefs,
    profileDir = this.profileDir,
    cssFileAddon = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content","Icons.css"]),
    cssFileProfile = FileUtils.getFile("ProfD",["CuteButtonsSVG","Icons.css"]),
    cssFileMenubar = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content","Menubar.css"]),
    cssFileCheckmarkIcons = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content","CheckmarkIcons.css"]),
    cssFileRadioIcons = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content","RadioIcons.css"]),
    cssFileStatusbar4evar = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content","Statusbar-4evar.css"]),
    cssFileStatusbar = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content","Statusbar.css"]);

    function copyCSSFiles(exists){
      if (exists != false){//if it exists we need to remove it before copying over old file
        cssFileProfile.remove(false);
        FileUtils.getFile("ProfD",["CuteButtonsSVG","Menubar.css"]).remove(false);
        FileUtils.getFile("ProfD",["CuteButtonsSVG","CheckmarkIcons.css"]).remove(false);
        FileUtils.getFile("ProfD",["CuteButtonsSVG","RadioIcons.css"]).remove(false);
        FileUtils.getFile("ProfD",["CuteButtonsSVG","Statusbar-4evar.css"]).remove(false);
        FileUtils.getFile("ProfD",["CuteButtonsSVG","Statusbar.css"]).remove(false);
      }
      cssFileAddon.copyTo(profileDir,"Icons.css");
      cssFileMenubar.copyTo(profileDir,"Menubar.css");
      cssFileCheckmarkIcons.copyTo(profileDir,"CheckmarkIcons.css");
      cssFileRadioIcons.copyTo(profileDir,"RadioIcons.css");
      cssFileStatusbar4evar.copyTo(profileDir,"Statusbar-4evar.css");
      cssFileStatusbar.copyTo(profileDir,"Statusbar.css");
      //add date for below
      prefs.setCharPref("cssdate",cssFileAddon.lastModifiedTime);
    }

    //no profile css file exists or date of profile file and addon file are different
    if (cssFileProfile.exists() == false)
      copyCSSFiles(false);
    else if (cssFileAddon.lastModifiedTime != prefs.getCharPref("cssdate"))
      copyCSSFiles();
  },

  mosaicCopy: function(){
    var prefs = this.prefs,
    profileDir = this.profileDir,
    mosaic = prefs.getIntPref("mosaic"),
    mosaicWhich = prefs.getIntPref("mosaicwhich");


    function copyMosaic(file){
      var mosaicFileAddon = FileUtils.getFile("ProfD",["extensions","CuteButtonsCrystalSVG@ChoGGi","content",file]),
      mosaicFileProfile = FileUtils.getFile("ProfD",["CuteButtonsSVG","mosaic.png"]);

      if (mosaicFileProfile.exists() == false)//no profile file exists so copy mosaic
        mosaicFileAddon.copyTo(profileDir,"mosaic.png");
      else {
        if (mosaicWhich != mosaic){//no need to check file dates, just copy and call it a day
          //remove old mosaic and copy new one over (copy and overwrite, hah!)
          mosaicFileProfile.remove(false);
          mosaicFileAddon.copyTo(profileDir,"mosaic.png");
          //update mosaicWhich so we aren't copying the same file all the time
          prefs.setIntPref("mosaicwhich",mosaic);
        } else if (mosaicFileProfile.lastModifiedTime != mosaicFileAddon.lastModifiedTime){//profile file is different then addon file so copy newer over
          //remove old mosaic and copy new one over (copy and overwrite, hah!)
          mosaicFileProfile.remove(false);
          mosaicFileAddon.copyTo(profileDir,"mosaic.png");
        }
      }
    }

    if (prefs.getBoolPref("firstrun") == true){
      //and disable some other styles that (probably) don't look too nice (OSX and Linux)
      if (Services.appinfo.OS != "WINNT"){
        prefs.setBoolPref("checkboxicons",false);
        prefs.setBoolPref("radioicons",false);
      }
      prefs.setBoolPref("firstrun",false);
    }

//remove for v0.4.7
    if (prefs.getBoolPref("secondrun") == true){
      //and disable some other styles that (probably) don't look too nice (OSX and Linux)
      if (Services.appinfo.OS != "WINNT"){
        prefs.setBoolPref("checkboxicons",false);
        prefs.setBoolPref("radioicons",false);
      }
      prefs.setBoolPref("secondrun",false);
    }
//remove for v0.4.7

    switch(mosaic){
      case 0:
        copyMosaic("mosaic.png");
      break;
      case 1:
        copyMosaic("mosaic.brighter.png");
      break;
      case 2:
        copyMosaic("mosaic.brighterreversed.png");
      break;
      case 3:
        copyMosaic("mosaic.gray.png");
      break;
      case 4:
        copyMosaic("mosaic.normal.png");
      break;
    }
  }

};
