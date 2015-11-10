if (!cuteButtons){var cuteButtons = {};}
if (!cuteButtons.overlay){cuteButtons.overlay = {};}

cuteButtons.overlay = {
getWin: Components.classes["@mozilla.org/appshell/window-mediator;1"]
  .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow,

init: function(){
  //add icon to statusbar
  var statusBarWidget = document.getElementById("status4evar-status-widget");
  if (statusBarWidget){
    var statusBarText = document.getElementById("status4evar-status-text");
    var statusBarIcon = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","image");
    statusBarWidget.appendChild(statusBarIcon);
    statusBarIcon.id = "status4evar-status-image";
    statusBarIcon.setAttribute("label","Done");
    statusBarWidget.insertBefore(statusBarIcon,statusBarText);
    //copy value from label to image
    var observer = new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        statusBarIcon.setAttribute("label",mutation.target.value);
      });
    });
    var config = {attributes:true,attributeFilter:["value"]};
    observer.observe(statusBarText,config);
    }

  //remove listener
  removeEventListener("load",cuteButtons.overlay.init,false);
},

openOptions: function(){
  var em = cuteButtons.overlay.getWin("cutebuttons");
  if (em)
    em.focus();
  else
    window.openDialog("chrome://cutebuttons/content/options.xul","","resizable");
}

};

addEventListener("load",cuteButtons.overlay.init,false);
