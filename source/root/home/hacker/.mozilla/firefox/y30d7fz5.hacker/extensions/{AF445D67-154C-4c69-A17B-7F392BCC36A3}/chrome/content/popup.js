/******************************************************************************
*                              
******************************************************************************/
if ('undefined' === typeof Cc)
    var Cc = Components.classes;
if ('undefined' === typeof Ci)
    var Ci = Components.interfaces;
try {
       if ("undefined" === typeof popup)
        var cysPopup = {
            setDND : function (){ 
            console.log("setDND");
                cysCommons.cysPrefs.setBoolPref("cyspopup",false);
                cysOverlay.vid.obj1.close();
                cysPopup.doCancel();
            },
            setRemind : function(){
            try{
                var date = new Date();
                date.setDate(date.getDate() + 1);
                cysCommons.cysPrefs.setCharPref("cyspopup_time",date);
                console.log("setRemind");   
				cysCommons.cysPrefs.setBoolPref("cyspopup_show",false);
                cysCommons.cysPrefs.setBoolPref("cyspopup",true);
                console.log("value"+cysCommons.cysPrefs.getBoolPref("cyspopup"));
                }catch(e){ }
                cysPopup.doCancel();
            },
            doCancel : function(){
            return true;    
            },
            doOK : function(){
                return true;
            },
            openUrl : function (_url) {
                try{
                      window.open("https://www.patreon.com/completeyoutubesaver",'cys');
        
                 }catch(e){console.log(e);}
        },
           popup_onload : function (){
           console.log("call");
           try{
            var parentWnd = window.opener;
        //var parentDoc = parentWnd.getBrowser().contentDocument;
        var width = parentWnd.screenX+parentWnd.innerWidth;
        var height = parentWnd.screenY+parentWnd.innerHeight;
        var top = height - 180;
        var left = width - 300;
        console.log(top+ "::"+ left);
        window.moveTo(left,top);
               }catch(e){console.log(e);}
 }
            
              
           };
    
    }catch(e){
        console.log("error at popup");
    }
    
    