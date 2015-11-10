if (!cuteButtons){var cuteButtons = {};}
if (!cuteButtons.mainmenuicons){cuteButtons.mainmenuicons = {};}

cuteButtons.mainmenuicons = {

init: function(){
  var idTmp,prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.cutebuttons.");
  //add icons for OSX menus
  if (prefs.getBoolPref("mainmenuicons") == false){
    return;
  }
  function set(id,icon){
    idTmp = document.getElementById(id);
    if (idTmp){
      idTmp.setAttribute("image","chrome://cutebuttons/skin/" + icon + ".png");
    }
  }
  //file menu
  set("menu_newNavigatorTab","tab_new");
  set("menu_newNavigator","new-window");
  set("menu_openLocation","location");
  set("menu_openFile","open");
  set("menu_close","tab_remove");
  set("menu_closeWindow","shutdown");
  set("menu_savePage","filesaveas");
  set("menu_saveFrame","download");
  set("menu_sendLink","mail_generic");
  set("menu_printSetup","pagesetup");
  set("menu_print","printer");
  set("menu_import","wizard");
  set("menu_FileQuitItem","shutdown");
  //edit
  set("menu_undo","undo");
  set("menu_redo","redo");
  set("menu_cut","cut");
  set("menu_copy","copy");
  set("menu_paste","paste");
  set("menu_delete","delete");
  set("menu_selectAll","sel-all");
  set("menu_find","search");
  set("menu_findAgain","search_again");
  //view
  set("viewToolbarsMenu","configure_toolbars");
  set("viewSidebarMenuMenu","view_right");
  set("menu_bookmarksSidebar","bookmark-manage");
  set("menu_historySidebar","history");
  set("emSidebar","extensions");
  set("tmSidebar","appearance");
  set("stylish-view-sidebar","stylish");
  set("menu_stop","stop");
  set("menu_reload","reload");
  set("viewFullZoomMenu","search");
  set("menu_zoomEnlarge","imagezoom-in");
  set("menu_zoomReduce","imagezoom-out");
  set("menu_zoomReset","imagezoom-0");
  set("pageStyleMenu","fonts");
  set("charsetMenu","charset");
  set("menu_pageSource","doc_source");
  set("menu_showAllTabs","tab_print");
  set("documentDirection-swap","insertcellcopy");
  //history
  set("historyMenuBack","back");
  set("historyMenuForward","forward");
  set("historyMenuHome","home");
  set("menu_showAllHistory","history");
  set("historyRestoreLastSession","reset");
  set("historyUndoMenu","undo");
  set("menu_restoreAllTabs","tab_new");
  set("historyUndoWindowMenu","undo_disabled");
  set("menu_clearClosedWindowsList","clear");
  set("menu_restoreAllWindows","new-window");
  //bookmarks
  set("menu_bookmarkThisPage","bookmark-manage");
  set("subscribeToPageMenuitem","rssplus");
  set("subscribeToPageMenupopup","rssplus");
  set("menu_bookmarkAllTabs","bookmark_toolbar");
  set("bookmarksToolbarFolderMenu","bookmark-options");
  //tools
  set("stylish-toolmenu","stylish");
  set("menu_search","search");
  set("menu_openDownloads","download");
  set("menu_openAddons","extensions");
  set("javascriptConsole","java");
  set("menu_inspector","inspector_domi");
  set("menu_pageInfo","info");
  set("privateBrowsingItem","eye");
  set("sanitizeItem","important");
  set("menu_preferences","options");
  set("menu_mac_services","configure");
  set("menu_mac_hide_app","firefox");
  set("menu_mac_hide_others","firehusk");
  set("menu_mac_show_all","new-window");
  //help
  set("menu_openHelp","help");
  set("troubleShooting","smalldino");
  set("releaseNotes","doc_source");
  set("feedbackPage","html");
  set("menu_HelpPopup_reportPhishingtoolmenu","important");
  set("menu_HelpPopup_reportPhishingErrortoolmenu","bugmenot");
  set("checkForUpdates","update");
  set("aboutName","mozdev-icon");
}
};
addEventListener("load",cuteButtons.mainmenuicons.init,false);
