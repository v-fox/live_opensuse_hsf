/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
if ('undefined' == typeof Cc)
    var Cc = Components.classes;
if ('undefined' == typeof Ci)
    var Ci = Components.interfaces;
try {
    var openedFolder = 0;
    if ("undefined" == typeof cysOverlay)
        var cysOverlay = {
            idlist: {}, youtubekey:'AIzaSyBddgv6m3uvXYVQ3Ix_FByPXnJwu5iElBc', vid: null, js1: null, js2: null, defaultdir: null, lastprojectdir: null, filesizes: {}, decodeArray:null, isSignatureUpdatingStarted:0,getSubtitleCounter:{},signatureError:0,signatureFunctionCalled:0,openedStatisticsDiv:0,observerService:null,embeddedVideoIdList:{},currentEmbeddedVidList:{},currentURL:null,
            contextClickSaveComment: function(){
                var fp, rv,ext="html",fn="Main Page.html";
                var mainpagepath = cysCommons.getFile([cysOverlay.lastprojectdir,fn]);
                var strbd = cysCommons.readFileToString(mainpagepath);
                
                var commentshtml = cysCommons.getComments(cysCommons.cysPrefs.getCharPref("save.comments.count"),gBrowser)+'<script>(function() { setInterval(function(){ var m = document.getElementById("watch7-sidebar"); var n = document.getElementById("footer-container"); if(m && n) { m.setAttribute("style","margin-top:-"+(document.getElementById("watch7-main-container").clientHeight+430)+"px"); n.setAttribute("style","margin-top:"+(document.getElementById("watch7-main-container").clientHeight-1000)+"px");} },1000)})();</script>';
                //commentshtml= cysCommons.saveImagesToLocal(commentshtml, /\.js|\.jpg|\.ico|\.gif|\.png|\.swf/gi, "MData", cysOverlay.lastprojectdir, 1);
                commentshtml = cysCommons.getImages(cysOverlay.lastprojectdir,commentshtml);
                //cysCommons.cysDump(commentimages);
                strbd=strbd.replace(strbd.substring(strbd.indexOf('<div id="watch-discussion"'), strbd.indexOf('<div id="cys-comments-sukhvir"')), commentshtml);
                
                fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
                if (mainpagepath)
                    fp.displayDirectory = mainpagepath.parent;
                fp.defaultExtension = ext;
                fp.defaultString = fn;
                fp.appendFilter(ext, "*." + ext);
                fp.init(window, cysCommons.getCysString("right.click.2", null), Ci.nsIFilePicker.modeSave);
                rv = fp.show();
                if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace) {
                    fn = fp.file;
                    mainpagepath = fn.path;
                    /*solve linux/mac os path issue*/
                    if (mainpagepath.indexOf("." + ext) == -1 && ext != null && ext != "") {
                        mainpagepath = mainpagepath + "." + ext;
                    }
                    //cysCommons.cysDump("mainpagepath:"+mainpagepath);
                    cysCommons.writeFile(fn,strbd,"UTF-8");
                }
                
                //var curObj = {};// {title: "Comments Saved",content:"Comments Saved to "+cysOverlay.lastprojectdir};
                //openDialog("chrome://completeyoutubesaver/content/commentsaved.xul", "", "chrome,centerscreen,modal", curObj);
                //alert("Comments Saved to "+cysOverlay.lastprojectdir);
            },
            onLocationChange: function (wp, req, url, fl) {
               // cysCommons.cysDump("onLocationChange");
                var path;
                if (url.scheme.substr(0, 4) == 'http'){
                    path = url.scheme + '://' + url.host + url.path;  //cysCommons.cysDump('\n\nonLocationChange:\n'+path);
                    cysOverlay.currentURL = path;
                    if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && cysCommons.executeInSandbox("document") && cysCommons.executeInSandbox("document.body") && cysCommons.executeInSandbox("document.getElementById('cys_currenturl');") == null){
                        var scrp="var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cys_currenturl'); divtoappend.setAttribute('id','cys_currenturl'); divtoappend.setAttribute('value','"+cysOverlay.currentURL+"'); document.body.appendChild(divtoappend);";
                        cysCommons.executeInSandbox(scrp);
                    }
                }
                if (path && cysCommons.isYouTubeUrl(path, 'watch')) {  //cysCommons.cysDump('\nURL is YT video url');
                    if (cysOverlay.vid !=null && cysOverlay.vid.id && path.indexOf('v=' + cysOverlay.vid.id) == -1) {
                        cysOverlay.vid = null; //cysCommons.cysDump('\nnew YT video url!!\n');
                    }
                } else {
                    //cysCommons.cysDump("onLocationChange:else");
                    cysOverlay.vid=null;
                    //check if there are embedded videos?
                    //cysCommons.cysDump("\n1) onLocationChange:"+path);
                    if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                        //cysCommons.cysDump("onLocationChange:else if");
                        for(var key in cysOverlay.currentEmbeddedVidList){
                            delete cysOverlay.currentEmbeddedVidList[key];
                        }
                        try{
                            var inc = 0,k=0;
                            var scrp="var cysvids = document.getElementsByClassName('cysembeddedvideoid'); var ids=[];for(var i=0; i<cysvids.length;i++){ ids[i] = cysvids[i].getAttribute('value'); } ids.join(',');";
                            var vids = cysCommons.executeInSandbox(scrp);
                            //cysCommons.cysDump("vids:"+vids);
                            if(vids != ""){
                                //cysCommons.cysDump("onLocationChange:else if vids");
                                var videoIDs = vids.split(","),vidid;
                                for(var j=0;j<videoIDs.length;j++){
                                    //cysCommons.cysDump("onLocationChange:else if vids for");
                                    vidid = videoIDs[j];
                                    cysOverlay.currentEmbeddedVidList[vidid]={};
                                    cysOverlay.currentEmbeddedVidList[vidid].title = cysOverlay.embeddedVideoIdList[vidid].title;
                                    cysOverlay.currentEmbeddedVidList[vidid].url = {};
                                    for(var inurl in cysOverlay.embeddedVideoIdList[vidid].url){
                                        //cysCommons.cysDump("onLocationChange:else if vids for for:"+vidid);
                                        cysOverlay.currentEmbeddedVidList[vidid].url[0] = path;
                                    }
                                    cysOverlay.vid = cysOverlay.idlist[vidid];
                                    inc++;
                                }
                                if(typeof (cysOverlay.vid) !='undefined'){
                                    delete cysOverlay.vid.running;
                                }
                                //cysCommons.cysDump("in sandbox");
                            }
                            
                            /* if embedded videos are not loaded using above method than use below method*/
                            for(var vidid in cysOverlay.embeddedVideoIdList){
                                //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList:"+vidid);
                                if(cysOverlay.idlist[vidid] != null){
                                    var j=0;
                                    for(var inurl in cysOverlay.embeddedVideoIdList[vidid].url){
                                        //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList for:"+inurl);
                                        if(cysOverlay.embeddedVideoIdList[vidid].url[inurl] == path){
                                            //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList for if:"+path+":::cysOverlay.embeddedVideoIdList[vidid].url[inurl]"+cysOverlay.embeddedVideoIdList[vidid].url[inurl]);
                                            cysOverlay.currentEmbeddedVidList[vidid]={};
                                            cysOverlay.currentEmbeddedVidList[vidid].title = cysOverlay.embeddedVideoIdList[vidid].title;
                                            cysOverlay.currentEmbeddedVidList[vidid].url={};
                                            cysOverlay.currentEmbeddedVidList[vidid].url[0] = path;
                                            cysOverlay.vid = cysOverlay.idlist[vidid];
                                        }
                                        j++;
                                    }
                                    if(typeof (cysOverlay.vid) !='undefined' && cysOverlay.vid != null){
                                        delete cysOverlay.vid.running;
                                    }
                                }
                                inc++;
                            }
                            if(inc>0){
                                var btn = cysOverlay.button;
                                if(btn){
                                    btn.disabled = false;
                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                    cysOverlay.menuReload();
                                }
                            }
                        }catch(ex){
                            cysCommons.cysDump("error in onLocationChange:"+ex);
                        }
                    }
                }
                cysOverlay.onContentLoad();
            },
            onSecurityChange: function () {
            },
            onStatusChange: function () {
            },
            onProgressChange: function () {
            },
            onStateChange: function (wp, req, fl, st) {
                var nw = Ci.nsIWebProgressListener;
                if ((fl & nw.STATE_IS_WINDOW) && (fl & nw.STATE_STOP)) {
                    try {
                        if (wp.DOMWindow == wp.DOMWindow.top) {             //cysCommons.cysDump('\n\nOnStateChange\nRequest name: '+req.name+'\nrequest status: '+req.status);
                            if (cysCommons.isYouTubeUrl(req.name, 'watch')) { //cysCommons.cysDump('\nonStateChange!');
                                cysOverlay.onContentLoad();
                            }
                        } else {
                            //cysCommons.cysDump('\nonStateChange: DOMWindow.top is false!'); cysCommons.cysDump(' - request url:\n'+req.name);
                        }
                    } catch (e) {
                        cysCommons.cysDump(e);
                    }
                } else {
                    //cysCommons.cysDump('\nonStateChange states:\nSTATE_IS_WINDOW: '+((fl & nw.STATE_IS_WINDOW)>0)+'\nSTATE_STOP: '+((fl & nw.STATE_STOP)>0));
                }
            },
            getEmbeddedVideoSize: function (){
                var size=0;
                if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                    for(var key in cysOverlay.currentEmbeddedVidList){
                        size++;
                    }
                }
                return size;
            },
            addColsToMenuItem: function (item, act, fmtNo, cols, size, dal, daf) {
                var w = cysOverlay.colSizes;
                try {
                    var label, sp, f, t, tt, fmt = act + fmtNo, da = (dal) ? '1' : '';
                    if (cols.cfmt) {
                        label = document.createElement("label");
                        label.setAttribute("value", fmt);
                        label.setAttribute("width", w[0]);
                        item.appendChild(label);
                    }
                    if (cols.ctype) {
                        label = document.createElement("label");
                        label.setAttribute("value", cysCommons.getCysString(fmt + ".1" + da, null));
                        label.setAttribute("width", w[1]);
                        item.appendChild(label);
                    }
                    if (cols.ctypename) {
                        label = document.createElement("label");
                        label.setAttribute("value", cysCommons.getCysString(fmt + ".2", null));
                        label.setAttribute("width", w[2]);
                        item.appendChild(label);
                    }
                    if ((cols.cp) && cysCommons.getCysString(fmt + ".5", null) != "") {
                        label = document.createElement("label");
                        if (cysOverlay.vid.resolutions[fmt]) {
                            tt = cysOverlay.vid.resolutions[fmt].h + 'p';
                        } else {
                            tt = cysCommons.getCysString(fmt + ".5", null);
                            if (act == 'Cnv' && [41, 42, 43, 61, 62, 63, 71, 72].indexOf(Number(fmtNo)) > -1) {
                                f = 'Fmt' + cysCommons.convertFormatMatch[Number(fmtNo)][0];
                                if (f in cysOverlay.vid.bitrates)
                                    tt = cysOverlay.vid.bitrates[f] + 'b';
                            }
                        }
                        label.setAttribute("value", tt);
                        label.setAttribute("width", w[3]);
                        label.setAttribute('class', 'rjust');
                        item.appendChild(label);
                    }
                    if (cols.cresolution) {
                        label = document.createElement("label");
                        if (cysOverlay.vid.resolutions[fmt]) {
                            label.setAttribute("value", cysOverlay.vid.resolutions[fmt].w + 'x' + cysOverlay.vid.resolutions[fmt].h);
                        } else {
                            label.setAttribute("value", cysCommons.getCysString(fmt + ".3", null));
                        }
                        label.setAttribute("width", w[4]);
                        label.setAttribute('class', 'rjust');
                        item.appendChild(label);
                    }
                    if (cols.csound) {
                        sp = document.createElement("spacer");
                        sp.setAttribute("width", w[7]);
                        item.appendChild(sp);
                        label = document.createElement("label");
                        if (act == 'Fmt') {
                            if (daf) {
                                tt = cysCommons.getCysString(fmt + ".4" + da, null);
                                if (('Fmt' + daf) in cysOverlay.vid.bitrates)
                                    tt = tt.substr(0, tt.indexOf('/') + 1) + cysOverlay.vid.bitrates[('Fmt' + daf)];
                                tt = cysOverlay.getOpusStringIfApplicable(fmt,tt);
                            } else {
                                tt = cysCommons.getCysString(fmt + ".4" + cysOverlay.vid.age, null);
                                if(tt==""){
                                    tt = cysCommons.getCysString(fmt + ".4", null);
                                }
                            }
                        } else {
                            tt = cysCommons.getCysString(fmt + ".4", null);
                            if ([41, 42, 43, 61, 62, 63, 71, 72].indexOf(Number(fmtNo)) > -1) {
                                f = 'Fmt' + cysCommons.convertFormatMatch[Number(fmtNo)][0];
                                if (f in cysOverlay.vid.bitrates)
                                    tt = tt.substr(0, tt.indexOf('/') + 1) + cysOverlay.vid.bitrates[f];
                            }
                        }
                        label.setAttribute("value", tt);
                        label.setAttribute("width", w[5]);    
                        //label.setAttribute('class','rjust');
                        item.appendChild(label);
                    }
                    if (cols.csize) {
                        label = document.createElement("label");
                        label.setAttribute("width", w[6]);
                        if (size) {
                            label.setAttribute("value", size);
                        } else {
                            label.setAttribute("value", '. . .');
                        }
                        label.setAttribute('videoid',cysOverlay.vid.id);
                        label.setAttribute('class', 'rjust');
                        item.appendChild(label);
                    }
                    item.addEventListener("DOMMenuItemActive", cysOverlay.openContext, false);
                    item.addEventListener("DOMMenuItemInactive", cysOverlay.hideContext, false);
                } catch (ex) {
                    //cysCommons.cysDump(fmt);
                    cysCommons.cysDump("addColsToMenuItem error: "+ex);
                }
            },
            closeAll: function (evt) {
                var popups = document.getElementsByTagName('menupopup');
                for each (var popup in popups) {
                    try {
                        if (popup && popup.getAttribute("id").indexOf("cys-DropdownContextMenu") != -1 && popup.state == "open") {
                            popup.hidePopup();
                            // cysCommons.cysDump(">>> ");
                        }
                    } catch (ex) {
                    }
                }
            },
            openContext: function (evt) {
                //check if options->Status bar options...->Status->General->Links->"Show Links in" (status4evar.status.linkOver) is set to none or not
                var valuep=0;
                var widthp=800;
                try{
                    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("status4evar.status.");
                    valuep = prefs.getIntPref("linkOver");
                    widthp = prefs.getIntPref("toolbar.maxLength");
                }catch(ex){
                    
                }
                try{
                    var showstatusbar=true;
                    if(valuep === 0){
                        showstatusbar = true;
                    }else if(valuep){
                        showstatusbar = false;
                    }
                    var t = document.getElementById('statusbar-display');

                    if (!t)
                        return;
                    t.setAttribute("hidden", showstatusbar);
                    document.getElementById('cys-statusbar-display').setAttribute("hidden", showstatusbar);
                    document.getElementById('cys-statusbar-display').label = evt.target.getAttribute("statustext");
                    document.getElementById('cys-statusbar-display').width=widthp+"px";
                    document.getElementById('cys-statusbar-display').parentNode.width=widthp+"px";
                }catch(ex){

                }
            },
            hideContext: function () {
                var t = document.getElementById('statusbar-display');
                if (!t)
                    return;
                document.getElementById('cys-statusbar-display').label = "";
                document.getElementById('cys-statusbar-display').setAttribute("hidden", true);
                t.setAttribute("hidden", false);
            },
            removeAllChildren: function (target) {
                var child = target.childNodes;
                if (child.length > 0)
                    do {
                        target.removeChild(child.item(0));
                    } while (child.length > 0)
            },
            getDropdownContextMenu: function (id, statustext, convertTo, dashaudio) {
                if (id == null) id = "";
                var menu = cysOverlay.menu, order, menupopup, autopopup = cysOverlay.autopopup, menuitem, i, n = 0, it, last, ttip; //cysCommons.cysDump("getDropdownContextMenu, cys-dropdown-menu.state = "+menu.state);
                order = cysCommons.getSubMenu();
                if (convertTo == null) { 
                    var stustxt = cysCommons.getVideoFormatByUrl(statustext, true, 0, cysOverlay.vid.age);
                    ttip = cysCommons.getCysString('audiofileformat') + ' ' + stustxt;
                    ttip = cysOverlay.getOpusToolTipIfApplicable(statustext,ttip);
                }
                menupopup = document.createElement("menupopup");
                menupopup.setAttribute("id", "cys-DropdownContextMenu" + id);
                if (autopopup)
                    menupopup.setAttribute("youtube", statustext);
                for (i = 0; i < order.length; i++) {
                    it = order[i];
                    if (it.substr(0, 1) == '-')
                        continue;
                    if (it == 'sep' && n > 0 && last != 'sep') {
                        n++;
                        last = it;
                        menupopup.appendChild(document.createElement('menuseparator'));
                    } else if (it == '1') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.1", "cys-saveas", convertTo));
                    } else if (it == '2') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.2", "cys-savedefault", convertTo, cysOverlay.defaultdir));
                    } else if (it == '3' && cysOverlay.lastprojectdir) {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.3", "cys-savelastprojectdir", convertTo));
                    } else if (it == '4') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.4", "cys-savecomplete", convertTo));
                    } else if (!convertTo || dashaudio) {
                        if (it == '5') {
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.5", "cys-link", convertTo));
                        } else if (it == '6' && cysCommons.canConvert) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.6", "cys-saveaudioas", 0, ttip));
                        } else if (it == '7' && cysCommons.canConvert) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.7", "cys-saveaudiodefault", 0, ttip));
                        } else if (it == '8' && cysCommons.canConvert && cysOverlay.lastprojectdir) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.8", "cys-saveaudiolastprojectdir", 0, ttip));
                        } else if (it == '9' && cysCommons.canConvert) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.9", "cys-savecompletewaudio", 0, ttip));
                        }
                    }
                }
                if (last == 'sep')
                    menupopup.removeChild(menupopup.lastChild);
                menupopup.addEventListener('popuphiding', function (event) {
                    return cysOverlay.onpopuphiding2(event);
                }, false);
                menupopup.addEventListener('popupshowing', function (event) {
                    return cysOverlay.contextMenuClickShowing(event);
                }, false);
                return menupopup;
            },
            setContextMenuItem: function (menuitem, autopopup, statustext, statustext2, cs, menuid, convertTo, ttip) {
                menuitem.setAttribute("label", cysCommons.getCysString(cs, null));
                menuitem.setAttribute("id", menuid);
                if (convertTo != null)
                    menuitem.setAttribute('convertTo', convertTo);
                if (menuid.substr(-14) == 'lastprojectdir')
                    menuitem.setAttribute("tooltiptext", cysOverlay.lastprojectdir);
                if (ttip)
                    menuitem.setAttribute('tooltiptext', ttip);
                menuitem.addEventListener('command', function (event) {
                    cysOverlay.contextMenuClick(event);
                }, false);
                if (autopopup) {
                    menuitem.addEventListener("DOMMenuItemActive", cysOverlay.openContext, false);
                    menuitem.addEventListener("DOMMenuItemInactive", cysOverlay.hideContext, false);
                    menuitem.setAttribute("statustext", statustext);
                    menuitem.setAttribute("statustext2", statustext2);
                }
                return menuitem;
            },
            closeMenu: function () {
                cysOverlay.removeAllChildren(cysOverlay.menu);
                cysOverlay.menu.removeAttribute('button');
                cysOverlay.menu.removeAttribute('close');
                cysOverlay.menu.removeAttribute('close2');
                cysOverlay.menu.hidePopup();
            },
            displayEmbeddedVideoDownloads: function(videoID,quick){
                var doc=null;
                try{
                    if (cysOverlay.idlist[videoID] && videoID != cysOverlay.vid.id) {         // if ID saved, retrieve data without rescanning page
                        cysOverlay.vid = cysOverlay.idlist[videoID];
                        if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 2) {
                            if (typeof cysOverlay.vid.age == 'undefined') cysOverlay.vid.age = '';
                            var menu = cysOverlay.menu;
                            if(quick){
                                    menu.setAttribute('button', 1);
                                    menu.openPopup(cysOverlay.button, 'after_start');
                            }
                            if(menu && (menu.state == 'open' || menu.open)){
                                cysOverlay.menuToggle(menu);
                            }
                        } else if (cysOverlay.vid.rtmpe) {
                            btn.disabled = true;
                            //cysCommons.cysDump('contentLoad S2b - video in data cache has RTMPE streams only, no downloadable video link found!');
                        } else {//cysCommons.cysDump('\nData not found in cache...');
                            cysOverlay.vid.youTubeFormats = null;
                            cysOverlay.updateVideosList(doc,cysOverlay.vid.html,"https://www.youtube.com/watch?v="+videoID);
                        }
                    }
                }catch(ex){
                    cysCommons.cysDump('displayEmbeddedVideoDownloads error:'+ex);
                }
            },
            muxOpusIfAvailable: function (fmt) {
                if(cysOverlay.checkIfVideoMuxedWithOpus("Fmt"+fmt)){
                    if(typeof (cysOverlay.vid.dashAudio[5]) != 'undefined'){
                        return  cysOverlay.vid.dashAudio[5];
                    }else if(typeof (cysOverlay.vid.dashAudio[6]) != 'undefined'){
                        return  cysOverlay.vid.dashAudio[6];
                    }else if(typeof (cysOverlay.vid.dashAudio[7]) != 'undefined'){
                        return  cysOverlay.vid.dashAudio[7];
                    }
                }
                return cysOverlay.vid.dashAudio[cysCommons.dashVideo[fmt]];
            },
            getOpusStringIfApplicable: function (fmt,tt){
                if(cysOverlay.checkIfVideoMuxedWithOpus(fmt)){
                    if(typeof (cysOverlay.vid.dashAudio[5]) != 'undefined' || typeof (cysOverlay.vid.dashAudio[6]) != 'undefined' || typeof (cysOverlay.vid.dashAudio[7]) != 'undefined'){
                        var arr = tt.split("/");
                        if(typeof (cysOverlay.vid.dashAudio[5]) != 'undefined'){
                                return "OPS/165K"//+arr[1];
                        }else if(typeof (cysOverlay.vid.dashAudio[6]) != 'undefined' ){
                                return "OPS/65K"//+arr[1];
                        }else if(typeof (cysOverlay.vid.dashAudio[7]) != 'undefined' ){
                                return "OPS/48K"//+arr[1];
                        }
                    }
                }
                return tt;
            },
            checkIfVideoMuxedWithOpus: function(fmt){
                if(cysCommons.cysPrefs.getBoolPref("mux.opus.audio.vp9")==true && (cysCommons.getCysString(fmt+".11")=="WebM")){
                    return true;
                }
                return false;
            },
            getOpusToolTipIfApplicable: function(statustext,tooltip){
                fmt = "Fmt"+cysCommons.fmtFromUrl(statustext);
                if(cysOverlay.checkIfVideoMuxedWithOpus(fmt)){
                    tooltip = cysCommons.getCysString('audiofileformat')+" "+" OPUS ("+cysCommons.getCysString('Fmt251.4')+")";
                }
                return tooltip;
            },

            buildDropDownMenu: function () { //cysCommons.cysDump('\n**buildDropDownMenu');
            try{
                if (!cysOverlay.openFFmpegDialog()) {
                    setTimeout(cysOverlay.closeMenu, 200);
                    return null;
                }
                //cysCommons.cysDump("1) in buildDropDownMenu");
                var menu = cysOverlay.menu, menuitem, menuitemUrl, subMenu, mode, context, VF, CF, img, f, i, j; //cysCommons.cysDump("buildDropDownMenu, cys-dropdown-menu.state = "+menu.state+": menu.length");
                if (menu.state != 'open' && menu.childNodes.length && !menu.firstChild.disabled){
                    cysOverlay.removeAllChildren(menu);
                }
                //cysCommons.cysDump("2) in buildDropDownMenu");
                //cysOverlay.getStatisticsHtml();
                if (cysCommons.cysPrefs.getBoolPref('scan.hiddenformats') && !Object.keys(cysOverlay.vid.filesizes).length && !menu.hasAttribute('waiting')) {
                    cysCommons.cysDump("in throbber setting");
                    menuitem = document.createElement('menuitem');
                    img = document.createElement('image');
                    img.setAttribute("class", "throbber");
                    menuitem.appendChild(img);
                    menuitem.disabled = true;
                    menu.appendChild(menuitem);
                    VF = cysOverlay.vid.youTubeFormats;
                    f = Object.keys(VF);
                    for (i = 0; i < f.length; i++)
                        cysCommons.getAJAX(VF[f[i]], cysOverlay.getVideoSize, 'HEAD', 'Content-Length', 'Fmt' + f[i], 0);
                    setTimeout(cysOverlay.buildDropDownMenu, 1000);
                    menu.setAttribute('waiting', 1);
                    return;
                } else if (menu.hasAttribute('waiting')) {
                    cysCommons.cysDump("in else throbber setting");
                    if (Object.keys(cysOverlay.vid.filesizes).length == Object.keys(cysOverlay.vid.youTubeFormats).length) {
                        menu.removeAttribute('waiting');
                        cysOverlay.removeAllChildren(menu);
                        menu.hidePopup();
                        menu.openPopup(menu.parentNode, 'after_start', 0, 0, false, false, null);
                    } else {
                        setTimeout(cysOverlay.buildDropDownMenu, 500);
                    }
                }
                
                if (!cysOverlay.vid.title){
                    cysOverlay.vid.title = cysCommons.getTitle();
                }
                
                mode = cysCommons.cysPrefs.getIntPref((menu.hasAttribute('button')) ? 'button.left.click.open' : 'arrow.left.click.open');  //cysCommons.cysDump("mode = " + mode);
                menu.removeAttribute('button');
                menu.removeAttribute('close');
                menu.removeAttribute('close2');
                if (menu.state != 'open'){
                    cysOverlay.removeAllChildren(menu);
                }
                if (!cysOverlay.autopopup){
                    context = cysOverlay.getDropdownContextMenu("", null);
                }
                
                if (menu.state != 'open' && (!cysOverlay.vid.youTubeFormats || typeof cysOverlay.vid.youTubeFormats != 'object' || Object.keys(cysOverlay.vid.youTubeFormats).length < 1)) {
                    cysCommons.cysDump('\n***** Menu display aborting *****\nYTformats type: ' + typeof cysOverlay.vid.youTubeFormats + '\nYTformats value: ' + cysOverlay.vid.youTubeFormats + '\nYTformats properties:\n'+'::menu has setAttribute:'+menu.hasAttribute('waiting')+'\n::object len:' +'\n');// debug...
                    for (var t in cysOverlay.vid.youTubeFormats) cysCommons.cysDump(t + ' : ' + cysOverlay.vid.youTubeFormats[t]);   // debug...
                    menuitem = document.createElement((cysOverlay.autopopup) ? "menu" : "menuitem");
                    img = document.createElement('image');
                    img.setAttribute("class", "throbber");
                    menuitem.appendChild(img);
                    menuitem.disabled = true;
                    menu.appendChild(menuitem);
                    cysOverlay.isSignatureUpdatingStarted=0;
                    cysOverlay.vid.youTubeFormats = null;
                    cysOverlay.onContentLoad(1);
                    return;
                }
                var embsize=0,elabel;
                if (menu.state != 'open') {
                    
                    /*label = document.createElement('label');
                    label.setAttribute('value','well');
                    menuitem.appendChild(label);
                    menu.appendChild(menuitem);*/
                   
                    
                    if (!cysOverlay.autopopup) {
                        menu.setAttribute("context", "_child");
                        menu.appendChild(context);
                    }
                    var quick = mode != 1, dformats, qformats, bestQ, best1, FF, fc, act, last, menus = [], cnv = [], n = 0, it, t, qf, qm = {}, cols = {}, sizes, size, sr = {}, dash, af, al, label;
                    if (quick) {
                        dformats = cysCommons.getFormats(false, true);
                        qformats = cysCommons.getFormats(true);
                        bestQ = cysCommons.cysPrefs.getIntPref("download.quality.highest");
                        if (bestQ) {
                            dformats.sort(function (a, b) {
                                return a - b;
                            }).reverse()
                        } else {
                            dformats.sort(function (a, b) {
                                return b - a;
                            }).reverse()
                        }        // sort formats by quality
                    } else {
                        dformats = cysCommons.getFormats();
                        best1 = cysCommons.cysPrefs.getBoolPref('menu.dropdown.showbestonly');
                    }  //cysCommons.cysDump('\nbestQ: '+bestQ+'\ndformats:\n'+dformats+'\n\nqformats:\n'+qformats);
                    for (i = 0; i < dformats.length; i++) {
                        FF = dformats[i];
                        if (FF.substr(0, 1) == '-') {
                            if (quick) {
                                FF = FF.substr(1); // all formats considered for quick menu!
                            } else {
                                continue;          // format not enabled by user - for detailed menu
                            }
                        }
                        act = FF.substr(0, 3);
                        fc = 0;
                        qf = null;
                        if (FF.length > 3)
                            fc = parseInt(FF.substr(3));
                            //cysCommons.cysDump("act:"+act+"::fc:"+fc+"::qf:"+qf);
                        if (quick && act != 'sep') {                  // check if format in and already added to quickmenu       
                            if (FF in qm) {
                                //cysCommons.cysDump("FF in qm:"+FF+"::qm:"+qm);
                                continue;
                            } else if (qformats.indexOf(FF) > -1) {
                                qf = FF;    
                            } else {
                                //cysCommons.cysDump("else:"+"ff:"+FF+"::qf:"+qf);
                                
                                qf = cysCommons.getCysString(FF + '.1');
                                
                                /*sixtyfps = cysCommons.getCysString(FF + '.11');
                                if(typeof sixtyfps !='undefined'){
                                    cysCommons.cysDump("sixtyfps::"+sixtyfps);
                                }
                                if(sixtyfps.indexOf("60fps")>-1){
                                    if(qf.indexOf("WebM")){
                                        qf="WebM/60fps";
                                    }else if(qf.indexOf("MP4")>-1){
                                        qf="MP4/60fps";
                                    }
                                }else{*/

                                    if (qf == 'MP3' || qf == 'AAC' || qf == 'M4A')
                                        qf += ' (' + cysCommons.getCysString(FF + '.4').substr(0, 3) + ')';
                                /*}*/
                                //cysCommons.cysDump("else:::qf:"+qf+"ff:"+FF+"::");
                                if (qformats.indexOf(qf) == -1 || qf in qm){
                                    //cysCommons.cysDump("qformats.indexOf(qf) == -1 || qf in qm:"+qformats.indexOf(qf)+"::qf:"+qf+"::qf in qm"+(qf in qm)+"::ff:"+FF+"::");
                                    continue;
                                }
                            }
                        }
                        //cysCommons.cysDump("qf::"+qf);
                        if (act == 'Fmt' && cysOverlay.vid.youTubeFormats[fc]) {    // build menus array
                            //cysCommons.cysDump("fc:"+fc+"::cysOverlay.vid.youTubeFormats[fc]:"+cysOverlay.vid.youTubeFormats[fc]);
                            menus.push([act, fc, cysOverlay.vid.youTubeFormats[fc], qf]);
                            qm[qf] = n;
                            last = act;
                            n++;
                            //cysCommons.cysDump("here1: fc:"+fc+"::ff:"+FF+"::qf:"+qf);
                        } else if (act == 'sep' && last != act && n > 0) {
                            menus.push([act, null, null, null]);
                            last = act;
                            n++;
                            //cysCommons.cysDump("here2: fc:"+fc+"::ff:"+FF+"::qf:"+qf);
                        } else if (act == 'Cnv' && cysCommons.canConvert) {
                            if (fc in cysCommons['convertFormatMatch' + cysOverlay.vid.age]) {
                                menuitemUrl = null;
                                t = cysCommons['convertFormatMatch' + cysOverlay.vid.age][fc];
                                for (j = 0; j < t.length; j++) {
                                    VF = t[j];
                                    if (cysOverlay.vid.youTubeFormats[VF]) {
                                        menuitemUrl = cysOverlay.vid.youTubeFormats[VF];
                                        break;
                                    }
                                }
                                if (menuitemUrl) {
                                    menus.push([act, fc, menuitemUrl, qf]);
                                    cnv.push([fc, n]);
                                    qm[qf] = n;
                                    last = act;
                                    n++;
                                }
                            }
                            //cysCommons.cysDump("here3: fc:"+fc+"::ff:"+FF+"::qf:"+qf);
                        }
                    }
                    
                    if (!quick && cnv && best1) {                          // filter menus array
                        var ck = [], last = null;
                        for (i = 0; i < cnv.length; i++)
                            ck.push(cnv[i][0]);

                        ck.sort(function (a, b) {
                            return b - a;
                        });
                        
                        i = ck.length - 1;
                        while (i > -1) {
                            t = Math.floor(ck[i] / 10);
                            if (t == last) {
                                ck.splice(i, 1);
                            } else {
                                last = t;
                            }  // filter convert formats array
                            i--;
                        }
                        i = cnv.length - 1;
                        while (i > -1) {
                            if (ck.indexOf(cnv[i][0]) == -1)
                                menus.splice(cnv[i][1], 1); // filter menus
                            i--;
                        }
                    } else if (quick) {  // add separators + re-order filtered menu array for quick menu
                        //cysCommons.cysDump('\nqformats:'); for (i=0;i<qformats.length;i++){cysCommons.cysDump('\n'+qformats[i]);}
                        //cysCommons.cysDump('\nqm:'); for (t in qm){cysCommons.cysDump('\n'+t+' - '+qm[t]);}
                        //cysCommons.cysDump('\nmenus:'); for (i=0;i<menus.length;i++){t = menus[i]; cysCommons.cysDump('\n'+t[0]+' - '+t[1]+' - '+t[3]);}
                        i = qformats.length - 1;
                        while (i > -1) {
                            t = qformats[i];
                            if (t == last) {
                                qformats.splice(i, 1);
                            } else {
                                last = t;
                                if (t == 'sep') {
                                    qformats[i] = ['sep', null, null, null]
                                } else {
                                    if (t in qm) {
                                        qformats[i] = menus[parseInt(qm[t])].slice(0);
                                    } else {
                                        //cysCommons.cysDump("ignored:"+t);
                                        qformats.splice(i, 1);
                                    }
                                }
                            }
                            i--;
                        }
                        //cysCommons.cysDump("qformats::"+qformats);
                        menus = qformats;
                        //cysCommons.cysDump('\nmenus: #2'); for (i=0;i<menus.length;i++){t = menus[i]; cysCommons.cysDump('\n'+t[0]+' - '+t[1]+' - '+t[3]);}
                    }
                    
                    last = null;
                    n = 0;
                    sizes = cysOverlay.vid.filesizes;
                    if (!quick) {
                        cols.cfmt = cysCommons.cysPrefs.getBoolPref("menu.dropdown.fmt.col.enabled");
                        cols.ctype = cysCommons.cysPrefs.getBoolPref("menu.dropdown.type.col.enabled");
                        cols.ctypename = cysCommons.cysPrefs.getBoolPref("menu.dropdown.typename.col.enabled");
                        cols.cp = cysCommons.cysPrefs.getBoolPref("menu.dropdown.p.col.enabled");
                        cols.cresolution = cysCommons.cysPrefs.getBoolPref("menu.dropdown.resolution.col.enabled");
                        cols.csound = cysCommons.cysPrefs.getBoolPref("menu.dropdown.sound.col.enabled");
                        cols.csize = cysCommons.cysPrefs.getBoolPref('menu.dropdown.size.col.enabled');
                        var w = cysOverlay.colSizes, wid = 0, charcount=0;
                        
                        if(cols.cfmt && w[0]){
                            wid = wid + parseInt(w[0]) + 13;
                            charcount=charcount+8;
                        }
                        if(cols.ctype){
                            wid = wid + parseInt(w[1]) + 13;
                            charcount=charcount+4;
                        }
                        if(cols.ctypename){
                            wid = wid + parseInt(w[2]) + 13;
                            charcount=charcount+8;
                        }
                        if ((cols.cp) ) {
                            wid = wid + parseInt(w[3]) + 13;
                            charcount=charcount+5;
                        }
                        if (cols.cresolution) {
                            wid = wid + parseInt(w[4]) + 13;
                            charcount=charcount+10;
                        }
                        if (cols.csound) {
                            wid = wid + parseInt(w[5]) + 13;
                            charcount=charcount+11;
                        }
                        if (cols.csize) {
                            wid = wid + parseInt(w[6]) + 15;
                            charcount=charcount+7;
                        }
                    }
                    /*embedded videos*/
                    var doc = cysCommons.getDoc(), loc = doc.location;
                    if(!cysCommons.isYouTubeUrl(loc.href, "watch") && cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                        try{
                            embsize = cysOverlay.getEmbeddedVideoSize();
                            //cysCommons.cysDump("embsize:"+embsize);
                            if(embsize > 0){
                                for(var key in cysOverlay.currentEmbeddedVidList){
                                    //cysCommons.cysDump("cysOverlay.idlist:"+key+"::"+cysOverlay.embeddedVideoIdList[key].title);
                                    if(typeof (cysOverlay.idlist[key]) != 'undefined'){
                                        menuitem = document.createElement((cysOverlay.autopopup) ? "menu" : "menuitem");
                                        elabel = document.createElement('label');
                                        elabel.setAttribute("width", 15);
                                        elabel.setAttribute("class","header bulletpoint");
                                        if(key==cysOverlay.vid.id){
                                            elabel.setAttribute('value','\u2022');
                                        }else{
                                            elabel.setAttribute('value','');
                                        }
                                        menuitem.appendChild(elabel);
                                        elabel = document.createElement('label');
                                        elabel.setAttribute("class","header");
                                        elabel.setAttribute("tooltiptext",cysOverlay.currentEmbeddedVidList[key].title);
                                        elabel.setAttribute('value',cysOverlay.currentEmbeddedVidList[key].title);
                                        
                                        if(wid != 0 && !cysCommons.cysPrefs.getBoolPref("menu.dropdown.fullvideotitle") ){ //&& cysOverlay.currentEmbeddedVidList[key].title.length > charcount
                                            elabel.setAttribute('width', wid); 
                                        }
                                        elabel.setAttribute("statustext",key);
                                        elabel.setAttribute('crop', 'right'); 
                                        menuitem.appendChild(elabel);
                                        menuitem.setAttribute("tooltiptext",cysOverlay.currentEmbeddedVidList[key].title);
                                        menuitem.setAttribute("statustext",key);
                                        menuitem.setAttribute('crop', 'right'); 
                                        
                                        menuitem.addEventListener('click', function (event) {
                                            cysOverlay.displayEmbeddedVideoDownloads(event.target.getAttribute("statustext"), mode != 1);
                                        }, false);
                                        menu.appendChild(menuitem);
                                        menu.appendChild(document.createElement('menuseparator'));
                                    }
                                }
                            }
                        }catch(ex){
                            cysCommons.cysDump("error in embed video in buildmenu."+ex);
                        }
                    }
                    /*end*/
                    embsize=embsize*2;
                    var menulen = menus.length + embsize, menuindex =0;
                    for (i = embsize; i < menulen; i++) {
                        it = menus[menuindex];
                        //cysCommons.cysDump("menu items:0:"+it[0]+":::1:"+it[1]+":::2:"+it[2])
                        menuindex++;
                        cnv = null;
                        size = 0;
                        dash = af = al = ''; //cysCommons.cysDump('\n\n'+it[0]+'\n'+it[1]+'\n'+it[2]+'\n'+it[3]);
                        if (it[2]) {
                            menuitem = document.createElement((cysOverlay.autopopup) ? "menu" : "menuitem");
                            label = document.createElement("label");
                            label.setAttribute("width", 15);
                            if (it[1] in cysCommons.dashVideo) {
                                label.setAttribute("value", "—");
                            } else {
                                label.setAttribute("value", "\u2003");
                            }
                            if (it[0] == 'Cnv') {
                                cnv = it[1];
                                menuitem.setAttribute("convertTo", cnv);
                            } else if (it[1] in cysCommons.dashVideo && cysCommons.canConvert) {
                                dash = '1';
                                af = cysOverlay.muxOpusIfAvailable(it[1]);
                                al = cysOverlay.vid.youTubeFormats[af];
                                //cysCommons.cysDump('af:'+af+"---it[1]:"+it[1]+"---al:"+al+"---cysCommons.dashVideo[it[1]]:"+cysCommons.dashVideo[it[1]]);
                            } //cysCommons.cysDump('\ndash: '+dash+'\naf: '+af+'\nal: '+al);
                            menuitem.setAttribute("statustext", it[2]);
                            menuitem.setAttribute("statustext2", al);
                            menuitem.appendChild(label);
                            if (cysOverlay.autopopup) {
                                menuitem.addEventListener('click', function (event) {
                                    if (event.target.id == '') {
                                        cysOverlay.saveVideoFile(event, event.target.getAttribute("statustext"), null, event.target.getAttribute("convertTo") || null, event.target.getAttribute("statustext2"));
                                        cysOverlay.closeAll();
                                    }
                                }, false);
                                subMenu = cysOverlay.getDropdownContextMenu("", it[2], cnv, al);
                                menuitem.appendChild(subMenu);
                                menuitem.className += ' cys-hide-submenu-icon';
                            } else {
                                menuitem.addEventListener('click', function (event) {
                                    cysOverlay.menu.setAttribute('youtube', event.target.getAttribute("statustext"))
                                }, false);
                                menuitem.addEventListener('command', function (event) {
                                    cysOverlay.saveVideoFile(event, event.target.parentNode.getAttribute("statustext"), false, event.target.getAttribute("convertTo") || null)
                                }, false);
                            }
                            if (quick) {
                                menuitem.addEventListener("DOMMenuItemActive", cysOverlay.openContext, false);
                                menuitem.addEventListener("DOMMenuItemInactive", cysOverlay.hideContext, false);
                                act = it[3].substr(0, 3);
                                label = document.createElement("label");
                                if (act == 'Fmt' || act == 'Cnv') {
                                    label.setAttribute("value", cysCommons.getCysString(it[3] + ".2") + '   (' + cysCommons.getCysString(it[3] + '.1' + dash) + ')');
                                } else {
                                    label.setAttribute("value", it[3]);
                                }
                                menuitem.appendChild(label);
                            } else {
                                if (cols.csize) {
                                    if (sizes)
                                        size = sizes[it[0] + it[1]] || sizes['Fmt' + cysCommons.fmtFromUrl(it[2])];
                                    if (size) {
                                        if (al)
                                            size = parseInt(size) + parseInt(sizes[it[0] + af]);
                                        size = cysOverlay.size2MB(size);
                                    } else {
                                        if (it[2] in sr) {
                                            cysOverlay.getVideoSize(sr[it[2]], 2, it[0] + it[1], i);
                                        } else {
                                            cysCommons.getAJAX(it[2], cysOverlay.getVideoSize, 'HEAD', 'Content-Length', it[0] + it[1], i);
                                            if (it[0] == 'Fmt')
                                                sr[it[2]] = 'Fmt' + it[1];                                                    // save url of base format in temp array
                                        }
                                    }
                                }
                                addsep = cysOverlay.addColsToMenuItem(menuitem, it[0], it[1], cols, size, al, af);
                            }
                            menu.appendChild(menuitem);
                            last = it[0];
                            n++;
                        } else if (last != it[0] && n > 0) {
                            menu.appendChild(document.createElement('menuseparator'));
                            last = it[0];
                            n++;
                        }
                    }
                }
            }catch(ex){
                cysCommons.cysDump("error in buildDropDown"+ex);
            }
            },
            /*getStatisticsHtml: function (){
                var ret="";
                try{
                    sandbox=Components.utils.Sandbox(gBrowser.contentWindow,{sandboxPrototype:gBrowser.contentWindow, wantXrays:false});
                    ret=Components.utils.evalInSandbox("if(document.getElementsByClassName('action-panel-trigger-stats')[0]){ document.getElementById('action-panel-stats').innerHTML; }",sandbox);
                    if(ret.indexOf("yt-card-title") == -1){
                        var script = "if(document.getElementsByClassName('action-panel-trigger-stats')[0]){ triggerMouseEvent(document.getElementById('action-panel-overflow-button'),'click');triggerMouseEvent(document.getElementsByClassName('action-panel-trigger-stats')[0],'click'); document.getElementById('action-panel-stats').innerHTML; } function triggerMouseEvent(element, eventName, userOptions) { var options = { clientX: 0, clientY: 0, button: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, bubbles: true, cancelable: true }, event = element.ownerDocument.createEvent('MouseEvents'); if (!/^(?:click|mouse(?:down|up|over|move|out))$/.test(eventName)) { throw new Error('Only MouseEvents supported'); } if (typeof userOptions != 'undefined'){ for (var prop in userOptions) { if (userOptions.hasOwnProperty(prop)) options[prop] = userOptions[prop]; } } event.initMouseEvent(eventName, options.bubbles, options.cancelable,element.ownerDocument.defaultView,  options.button,options.clientX, options.clientY, options.clientX,options.clientY, options.ctrlKey, options.altKey,options.shiftKey, options.metaKey, options.button,element);element.dispatchEvent(event);}";
                        ret = Components.utils.evalInSandbox(script,sandbox);
                        cysCommons.cysDump("statistics:");
                        script = "triggerMouseEvent(document.getElementById('action-panel-overflow-button'),'click'); triggerMouseEvent(document.getElementsByClassName('action-panel-trigger-stats')[0],'click'); function triggerMouseEvent(element, eventName, userOptions) { var options = { clientX: 0, clientY: 0, button: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, bubbles: true, cancelable: true }, event = element.ownerDocument.createEvent('MouseEvents'); if (!/^(?:click|mouse(?:down|up|over|move|out))$/.test(eventName)) { throw new Error('Only MouseEvents supported'); } if (typeof userOptions != 'undefined'){ for (var prop in userOptions) { if (userOptions.hasOwnProperty(prop)) options[prop] = userOptions[prop]; } } event.initMouseEvent(eventName, options.bubbles, options.cancelable,element.ownerDocument.defaultView,  options.button,options.clientX, options.clientY, options.clientX,options.clientY, options.ctrlKey, options.altKey,options.shiftKey, options.metaKey, options.button,element);element.dispatchEvent(event);}";
                        Components.utils.evalInSandbox(script,sandbox);
                        cysCommons.cysDump("1)::videoID");
                    }
                    //cysCommons.cysDump("1)::videoID"+statistics);
                }catch(ex){
                    cysCommons.cysDump("error in main page getting statistics."+ex);
                }
                return ret;
            },*/
            getEncCode: function(){
                //cysCommons.cysDump("getEncCode method called.");
                try{
                    if(cysOverlay.signatureError===0 || cysOverlay.signatureError != cysOverlay.vid.id){
                        //cysCommons.cysDump("getVideoSize:"+cysOverlay.decodeArray);
                        cysOverlay.signatureError=cysOverlay.vid.id;
                        var scriptURL1=null, doc = cysCommons.getDoc(), text = doc.body.innerHTML,loc = doc.location;
                        if(cysCommons.isYouTubeUrl(loc.href, "watch")){
                            if (scriptURL1==null) {
                                scriptURL1=cysOverlay.findMatch(text, /\"js\":\s*\"([^\"]+)\"/);
                                scriptURL1=scriptURL1.replace(/\\/g,'');
                            }
                            if (scriptURL1 != null) {
                                if (scriptURL1.indexOf('//')==0) {
                                  var protocol=(doc.location.protocol=='http:')?'http:':'https:';
                                  scriptURL1=protocol+scriptURL1;
                                }
                                cysOverlay.fetchSignatureScript(scriptURL1,true);
                               // cysCommons.cysDump(scriptURL1);
                            }
                        }else{
                           // cysCommons.cysDump("getting signature getVideoSize:"+cysOverlay.decodeArray);
                            if(cysOverlay.vid){
                              //  cysCommons.cysDump("if getVideoSize:"+cysOverlay.decodeArray);
                                cysCommons.getAJAX("https://www.youtube.com/watch?v="+cysOverlay.vid.id,cysOverlay.ajaxupdateSignature);
                            }
                        }
                    }
                }catch(ex){
                    cysCommons.cysDump("error in getEncCode::"+ex);
                }
            },
            getVideoSize: function (size, cb, fmt, i) { //cysCommons.cysDump('\nitem '+i+' - '+fmt+'  -  cb: '+cb+' - '+String(size));
                if (!cysOverlay.vid){return;}
                try{
                    if (!size) {
                        if(cysOverlay.vid.youTubeFormats != null){
                            delete cysOverlay.vid.youTubeFormats[fmt.substr(3)];
                        }
                        if (cb) {
                            cysOverlay.getEncCode();
                        }
                    } else {
                        if (Number(cb) > 1) {    // previously queried
                            if (cysOverlay.vid.filesizes[size]) {
                                size = cysOverlay.vid.filesizes[size];
                            } else if (cb < 10) {
                                if (cb == 9){
                                    cysOverlay.getEncCode();
                                }
                                setTimeout(function () {
                                    cysOverlay.getVideoSize(size, cb++, fmt, i);
                                }, 1000);
                                return;
                            }
                        }
                        var menu = cysOverlay.menu;
                        if ((menu.state == 'open' || menu.open) && !menu.firstChild.disabled) {
                            var t = menu.childNodes[i];
                            var s = cysOverlay.size2MB(size); 
                            if(typeof (t) != 'undefined'){
                                t.setAttribute('size', s);
                                if(t.lastChild){
                                    var vidid = t.lastChild.getAttribute('videoid');
                                    if(cysOverlay.vid.id == vidid){
                                        t.lastChild.setAttribute('value', s);
                                    }
                                }
                            }
                        }
                        //cysCommons.cysDump(fmt+":here6");
                        cysOverlay.vid.filesizes[fmt] = size;
                    }
                }catch(ex){
                    cysCommons.cysDump("error in getVideoSize:"+ex);
                }
            },
            lookupFileSize: function (url, url2) {
                var s = cysCommons.fmtFromUrl(url);
                if (!s)
                    return null;
                s = cysOverlay.vid.filesizes['Fmt' + s];
                if (!s)
                    return null;
                var s2 = cysCommons.fmtFromUrl(url2);
                if (s2) {
                    s2 = cysOverlay.vid.filesizes['Fmt' + s2];
                   // cysCommons.cysDump("s:"+s+":::s2:"+s2);
                    if (s2)
                        s += s2;
                   // cysCommons.cysDump("s:"+s+":::s2:"+s2);
                }
                return cysOverlay.size2MB(s);
            },
            size2MB: function (s) {
                if (s < 20971520) {
                    s = (s / 1048576).toFixed(1) + cysCommons.getCysString('filesizein');
                } else {
                    s = (s / 1048576).toFixed(0) + cysCommons.getCysString('filesizein');
                }
                return s;
            },
            saveVideoFile: function (evt, url, saveAs, convertTo, url2) {
                
                try{
                //evt.preventDefault(); evt.stopPropagation(); //cysCommons.cysDump("saveVideoFile, "+document.getElementById("cys-DropdownContextMenu").state);
                try {
                    if (cysOverlay.autopopup) {
                        evt.target.parentNode.hidePopup();
                        evt.target.parentNode.parentNode.parentNode.hidePopup();
                    }
                } catch (ex) {
                    cysCommons.cysDump("error occured in saveVideoFile:"+ex);
                }
                var id = evt.originalTarget.id, menu = evt.originalTarget.parentNode, x, ext, exts, fname, file, file2, files, ext2, fn, fp, lastSaveDir, rv, t;
                if (menu.hasAttribute('close'))
                    menu.removeAttribute('close');
                if (saveAs == null || typeof saveAs === 'undefined')
                    saveAs = cysCommons.cysPrefs.getIntPref("menu.dropdown.left.click.save.as") == 0;
                ext = cysCommons.getVideoFormatByUrl(url, false, convertTo).toLowerCase();
                if (url2)
                    ext2 = cysCommons.getVideoFormatByUrl(url2, false).toLowerCase();
                exts = [ext, ext + '.tmp'];
                if (ext2)
                    exts.push(ext2);
                fname = cysOverlay.vid.title;
                
            }catch(ex){
                cysCommons.cysDump("error in saveVideoFile:"+ex);
            }
                try {
                    var openFolderPath = null;
                    if (saveAs) {
                        openedFolder = 0;
                        lastSaveDir = decodeURIComponent(cysCommons.cysPrefs.getCharPref("last.download.dir") || cysOverlay.defaultdir);
                        if (id.substr(id.length - 14) == 'lastprojectdir') {
                            lastSaveDir = cysOverlay.lastprojectdir;
                            if (cysCommons.cysPrefs.getBoolPref("save2last.useprojectname"))
                                fname = cysCommons.getFile(lastSaveDir).leafName;
                        }
                        
                        files = cysCommons.getFileNames(lastSaveDir, fname, exts);
                        fn = files.fn;
                        file = files.f0;
                        if (url2)
                            file2 = files.f2;
                        if (fn.indexOf("." + ext) == -1 && ext != null && ext != "") {
                            fn = fn + "." + ext;
                        }
                        fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
                        if (file)
                            fp.displayDirectory = file.parent;
                        fp.defaultExtension = ext;
                        fp.defaultString = fn;
                        fp.appendFilter(ext, "*." + ext);
                        fp.init(window, cysCommons.getCysString("right.click.2", null), Ci.nsIFilePicker.modeSave);
                        rv = fp.show();
                        if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace) {
                            file = fp.file;
                            filepath = file.path;
                            /*solve linux/mac os path issue*/
                            if (filepath.indexOf("." + ext) == -1 && ext != null && ext != "") {
                                filepath = filepath + "." + ext;
                            }
                            if (url2) {
                                t = filepath;
                                file2.initWithPath(t.substr(0, t.length - ext.length) + ext2);
                            }
                            cysCommons.cysPrefs.setCharPref("last.download.dir", encodeURIComponent(file.parent.path));
                            cysCommons.download(url, file, false, cysCommons.cysPrefs.getBoolPref('download.dta'), cysOverlay.vid.referer, convertTo, false, url2, file2, ext);
                            openFolderPath = file.parent;
                        }

                    } else {
                        openedFolder = 0;
                        files = cysCommons.getFileNames(cysOverlay.defaultdir, fname, exts);
                        file = files.f0;
                        if (url2)
                            file2 = files.f2;
                        cysCommons.download(url, file, false, cysCommons.cysPrefs.getBoolPref('download.dta'), cysOverlay.vid.referer, convertTo, false, url2, file2, ext);
                        openFolderPath = file.parent;
                        
                    }
                    
                    
                    
                    if(cysCommons.cysPrefs.getBoolPref("download.subtitles")==true && openFolderPath !=null){
                        cysOverlay.getSubtitleContent(null,false,file.parent.path,file.leafName);
                    }
                    
                    if (openedFolder == 0) {
                        cysCommons.openTargetFolder(openFolderPath);
                        openedFolder = 1;
                    }

                    if (menu.hasAttribute('close2'))
                        menu.removeAttribute('close2');

                } catch (ex) {
                    cysCommons.cysDump(ex);
                }
            },
            getSubtitleContent: function (data,cb,path,filename){
                if(cb){
                    var limitofcount = 2;
                    if(cysCommons.cysPrefs.getCharPref("subtitle.language")=='en' || cysCommons.cysPrefs.getCharPref("subtitle.language")=='en-GB'){
                        limitofcount=4;
                    }
                    if(cysCommons.cysPrefs.getBoolPref("ignore.auto.subtitles")){
                        cysOverlay.getSubtitleCounter[path+filename]++;
                    }
                    if((data=="" || data ==null || data == 0) && cysOverlay.getSubtitleCounter[path+filename] < limitofcount){
                        //cysCommons.cysDump("\ncysOverlay.getSubtitleCounter[path+filename]:"+cysOverlay.getSubtitleCounter[path+filename]);
                        cysCommons.getAJAX(cysOverlay.getSubtitleUrl(cysOverlay.getSubtitleCounter[path+filename]), cysOverlay.getSubtitleContent,"GET",null,path,filename);
                        cysOverlay.getSubtitleCounter[path+filename]++;
                    }else if(data !=""){
                        delete cysOverlay.getSubtitleCounter[path+filename];
                        if(filename.indexOf(".")>-1){
                            var tempf = filename.split(".");
                            filename = tempf[0];
                        }
                        //cysCommons.cysDump("\ngetSubtitleContent-filename:"+filename);
                        var a = [path, filename+".srt"];
                        
                        cysCommons.writeFile(cysCommons.getFile(a),cysCommons.xmlToSrt(data),'UTF-8');
                    }
                }else{
                    //cysCommons.cysDump("\npath+filename:"+path+filename);
                    cysOverlay.getSubtitleCounter[path+filename]=0;
                    cysCommons.getAJAX(cysOverlay.getSubtitleUrl(cysOverlay.getSubtitleCounter[path+filename]), cysOverlay.getSubtitleContent,"GET",null,path,filename);
                    cysOverlay.getSubtitleCounter[path+filename]++;
                }
            },
            getSubtitleUrl: function(counter){
                var langslug = cysCommons.cysPrefs.getCharPref("subtitle.language");
                if(counter>=2 && (langslug=='en' || langslug=='en-GB')){
                    if(langslug=='en'){
                        langslug = 'en-GB';
                    }else{
                        langslug = 'en';
                    }
                }
                return cysCommons.getSubtitleUrl(counter,cysOverlay.vid.cc_asr,cysCommons.cysPrefs.getBoolPref("ignore.auto.subtitles"),cysOverlay.vid.ttsurl,langslug);
            },
            onpopuphiding: function (evt) {
                var menu = cysOverlay.menu;
                menu.setAttribute('lastclosed', cysCommons.cTime());
                if (cysOverlay.autopopup)
                    return true;
                //cysCommons.cysDump("onpopuphiding, cys-dropdown-menu.state = "+menu.state);
                if (evt.target.getAttribute("id").indexOf("cys-DropdownContextMenu") != -1) {
                    //evt.preventDefault(); evt.stopPropagation();
                    return true;
                }
                //cysCommons.cysDump("onpopuphiding, cys-dropdown-menu.close = "+menu.hasAttribute('close')+"nonpopuphiding, cys-dropdown-menu.close2 = "+menu.hasAttribute('close2')+"nonpopuphiding, cys-dropdown-menu.contextClicked = "+menu.hasAttribute('contextClicked'));
                if (menu.hasAttribute('contextClicked')) {
                    menu.removeAttribute('contextClicked');
                    return true;
                }
                if (menu.hasAttribute('close')) {
                    menu.removeAttribute('close');
                    menu.setAttribute('close2', 'false');
                    return false;
                }
                return true;
            },
            onpopuphiding2: function (evt) {
                var menu = cysOverlay.menu; //cysCommons.cysDump("onpopuphiding2, cys-dropdown-menu.state = "+menu.state);
                menu.setAttribute('close', 'false');
                menu.removeAttribute('close2');
                return true;
            },
            contextMenuClickShowing: function (evt) {
                var id = "cys-DropdownContextMenu";
                document.getElementById(id).setAttribute("youtube", cysOverlay.menu.getAttribute("youtube"));
            },
            copyToClipboard: function (copytext) {
                try {
                    var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
                    str.data = copytext;
                    var trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
                    if ('init' in trans)
                        trans.init(cysCommons.getPrivacy().context);
                    trans.addDataFlavor("text/unicode");
                    trans.setTransferData("text/unicode", str, copytext.length * 2);
                    var clipid = Ci.nsIClipboard;
                    var clip = Cc["@mozilla.org/widget/clipboard;1"].getService(clipid);
                    clip.setData(trans, null, clipid.kGlobalClipboard);
                } catch (e) {
                    cysCommons.cysDump("error in copyToClipboard:"+e);
                }
            },
            contextMenuClick: function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var menu = cysOverlay.menu;                         //cysCommons.cysDump("contextMenuClick, cys-dropdown-menu.state = "+menu.state);
                menu.removeAttribute('close2');
                menu.removeAttribute('close');
                menu.setAttribute('contextClicked', true);
                menu.hidePopup(); 		                           //cysCommons.cysDump("contextMenuClick: "+evt.originalTarget.parentNode.getAttribute("id"));
                var url, url2, id, convertTo, et = evt.originalTarget;
                if (cysOverlay.autopopup) {
                    url = et.getAttribute("statustext");
                    url2 = et.getAttribute("statustext2");
                } else {
                    url = et.parentNode.getAttribute("youtube");
                }
                et.parentNode.removeAttribute("youtube");
                id = et.id;                                       //cysCommons.cysDump('\n'+id+'\nurl: '+url+'\nurl2 :'+url2);
                if (et.hasAttribute('convertTo'))
                    convertTo = et.getAttribute('convertTo');
                if (id == 'cys-saveas' || id == 'cys-saveaudioas' || id == 'cys-savelastprojectdir' || id == 'cys-saveaudiolastprojectdir') {
                    //cysCommons.cysDump("i m hre........");
                    cysOverlay.saveVideoFile(evt, url, true, convertTo, url2);
                } else if (id == 'cys-savedefault' || id == 'cys-saveaudiodefault') {
                    cysOverlay.saveVideoFile(evt, url, false, convertTo, url2);
                } else if (id == 'cys-link') {
                    if (url2)
                        url += ('\n' + url2);
                    cysOverlay.copyToClipboard(url);
                } else if (id == 'cys-savecomplete' || id == 'cys-savecompletewaudio') {
                    cysOverlay.cysButtonClick(url, convertTo, url2);
                }
            },
            getYouTubeVideoID: function (doc) { //cysCommons.cysDump('\ngetvideoID...');
                if (!doc)
                    return;
                var loc = doc.location, ytID, t, a;
                function getID(str) {
                    var it, id, p;
                    for each (p in str.split('&')) {
                        it = p.split('=');
                        if (it[0] == 'v' || it[0] == '!v') {
                            id = it[1];
                            break;
                        }
                    }
                    return id;
                }
                if (cysCommons.isYouTubeChannelUrl(loc.href)) {
                    for each (var s in doc.getElementsByTagName('h3')) {
                        try {
                            if (s.className == 'title') {
                                a = s.getElementsByTagName('a')[0];
                                if (a)
                                    t = a.href.split('?');
                                if (t.length > 1) {
                                    ytID = getID(t[1]);
                                    if (ytID) {
                                        t = a.title || a.textContent;
                                        ytID = [ytID, cysCommons.getTitle(t)];
                                        break;
                                    }
                                }
                            }
                        } catch (e) {
                        }
                    }
                } else {
                    t = loc.search.substring(1);
                    if (!t && loc.hash)
                        t = loc.hash.substring(1);
                    ytID = getID(t);
                }
                return ytID;
            },
            cysButtonClick: function (url, convertTo, url2) { //cysCommons.cysDump('\nbuttonClick\nurl: '+url+'\nconvertTo: '+convertTo+'\nurl2: '+url2+'\nsize: '+size);
                //cysOverlay.vid.stathtml = cysOverlay.getStatisticsHtml();
                /*
                //load comments to save it
                try{
                    if(sandbox==null){
                        sandbox=Components.utils.Sandbox(gBrowser.contentWindow,{sandboxPrototype:gBrowser.contentWindow, wantXrays:false});
                    }
                    Components.utils.evalInSandbox("var scrollposition=document.documentElement.scrollTop; if(document.getElementById('comments-test-iframe')){ document.getElementById('comments-test-iframe').innerHTML = document.getElementById('comments-test-iframe').innerHTML+'<a href=\"#commentareaanchor\" name=\"commentareaanchor\" id=\"commentareaanchor\"></a>';}else{ document.getElementById('comments-iframe-container').innerHTML = document.getElementById('comments-iframe-container').innerHTML+'<a href=\"#commentareaanchor\" name=\"commentareaanchor\" id=\"commentareaanchor\"></a>'; } triggerMouseEvent(document.getElementById('commentareaanchor'),'click'); document.getElementById('commentareaanchor').href='javascript:return false;'; scrollTo(0,scrollposition);triggerMouseEvent(document.getElementById('commentareaanchor'),'click');function triggerMouseEvent(element, eventName, userOptions) { var options = { clientX: 0, clientY: 0, button: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, bubbles: true, cancelable: true }, event = element.ownerDocument.createEvent('MouseEvents'); if (!/^(?:click|mouse(?:down|up|over|move|out))$/.test(eventName)) { throw new Error('Only MouseEvents supported'); } if (typeof userOptions != 'undefined'){ for (var prop in userOptions) { if (userOptions.hasOwnProperty(prop)) options[prop] = userOptions[prop]; } } event.initMouseEvent(eventName, options.bubbles, options.cancelable,element.ownerDocument.defaultView,  options.button,options.clientX, options.clientY, options.clientX,options.clientY, options.ctrlKey, options.altKey,options.shiftKey, options.metaKey, options.button,element);element.dispatchEvent(event);}", sandbox);
                    cysCommons.cysDump(")"+cysOverlay.vid.id+""+"::videoID");
                }catch(ex){
                    cysCommons.cysDump("error in scrolled:"+ex);
                }*/
                var menu = cysOverlay.menu;
                if (!url) {
                    if (menu.state == 'closed' && !menu.hasAttribute('button')) {
                        if (!menu.hasAttribute('lastclosed') || cysCommons.cTime() > parseInt(menu.getAttribute('lastclosed')) + 500) {
                            menu.setAttribute('button', 1);
                            menu.openPopup(cysOverlay.button, 'after_start');
                        }
                    } else {
                        menu.removeAttribute('button');
                    }
                    return;
                }
                url = url.trim();
                if (!url) {
                    cysCommons.cysAlert("clipboard.empty");
                    return false;
                }
                var targetUrl = cysCommons.getPageUrlFromID(cysOverlay.vid.id);
                var cpage = true
                if (cysCommons.isYouTubeChannelUrl())
                    cpage = false;
                var size = cysOverlay.lookupFileSize(url, url2);
                
                var curObj = {title: cysOverlay.vid.title, savedir: null, projDir: null, curpage: cpage, convert: convertTo, age: cysOverlay.vid.age, videoID: cysOverlay.vid.id, ttsurl: cysOverlay.vid.ttsurl, cc_asr: cysOverlay.vid.cc_asr,gBrowserParent:gBrowser,
                    videoUrl: url, videoName: null, pageUrl: targetUrl, videoFile: null, ok: false, formatStr: '', ccount: cysOverlay.vid.ccount, detail: cysOverlay.vid.detail, size: size, js1: this.js1, js2: this.js2/*, stathtml:cysOverlay.vid.stathtml*/};
                openDialog("chrome://completeyoutubesaver/content/saveDialog.xul", "", "chrome,modal,centerscreen,dialog", curObj);
                if (curObj.ok) {
                    
                    if (curObj.saveStat && (typeof curObj.js1 != 'string' || typeof curObj.js2 != 'string')) {
                        var mdir = cysCommons.getFile([curObj.savedir, curObj.title, 'MData']);
                        if (!mdir.exists() || !mdir.isDirectory())
                            mdir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                        this.js1 = mdir.clone();
                        this.js1.append('js');
                        this.js2 = mdir.clone();
                        this.js2.append('cc');  //cysCommons.cysDump('\n* Saving libraries... \n'+this.js1.path+'\n'+this.js2.path+'\n');
                        
                        this.js_1 = cysCommons.download('http://www.google.com/jsapi', this.js1, 1, 0);
                        //this.js_2 = cysCommons.download('http://www.google.com/uds/api/visualization/1.0/85433ced5f4f5ecf8f1c2c20eb7b5d63/format+en,default+en,ui+en,corechart+en.I.js',this.js2,1,0);
                        
                        this.js_2 = cysCommons.download('http://www.google.com/uds/api/visualization/1.0/ce05bcf99b897caacb56a7105ca4b6ed/format+en,default+en,ui+en,corechart+en.I.js', this.js2, 1, 0);
                        this.js_1i = setInterval(function () {
                            cysOverlay.loadAPI(1);
                        }, 500);
                        this.js_2i = setInterval(function () {
                            cysOverlay.loadAPI(2);
                        }, 500);
                    }
                    cysOverlay.lastprojectdir = curObj.projDir;
                    document.getElementById("cys-save-project-to-last-folder").setAttribute("hidden",false);
                    document.getElementById("cys-save-project-to-last-folder-top-sep").setAttribute("hidden",false);
                    document.getElementById("cys-save-project-to-last-folder").setAttribute("tooltiptext",curObj.projDir);
                    if (curObj.videoFile) {
                        var ext, ext2, file2, t;
                        if (url2) {
                            file2 = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                            ext = cysCommons.getVideoFormatByUrl(curObj.videoUrl, false);
                            ext2 = cysCommons.getVideoFormatByUrl(url2, false);
                            t = curObj.videoFile.path;
                            file2.initWithPath(t.substr(0, t.length - ext.length) + ext2);
                        }
                        cysCommons.download(curObj.videoUrl, curObj.videoFile, false, curObj.useDTA, curObj.pageUrl, convertTo, false, url2, file2,ext);
                    }
                    
                    openDialog("chrome://completeyoutubesaver/content/smallSaveDialog.xul", "", "chrome,dialog,minimizable,resizable", curObj);
                }
            },
            loadAPI: function (f) {  // load chart libraries into memory
                if (cysOverlay['js_' + f].currentState != 3)
                    return;
                clearInterval(cysOverlay['js_' + f + 'i']);
                cysOverlay['js_' + f] = null;
                this['loadAPI' + f] = function (data, id) {
                    var j = id.substr(id.length - 1), path = cysOverlay['js' + j].path;
                    cysOverlay['js' + j] = data; /*cysCommons.cysDump('\n* '+id+' - loading library into cysOverlay.js'+j+' ('+cysOverlay['js'+j].length+' bytes) :\n'+path);*/
                }
                cysCommons.readFile(this['js' + f], cysOverlay, 'loadAPI' + f)();  //cysCommons.cysDump('\n* LoadAPI - loading library '+f);
            },
            fetchSignatureScript: function (scriptURL,forcereloadmenu) {
               // cysCommons.cysDump("fetchSignatureScript:");
                try {
                    cysOverlay.isSignatureUpdatingStarted = 1;
                    cysCommons.getAJAX(scriptURL, cysOverlay.findSignatureCode,'GET',null,forcereloadmenu);//findSignatureCode(response.responseText);
                } catch(e) { cysCommons.cysDump("error in fetchSignatureScript"+e);}
            },
            findSignatureCode: function (sourceCode,cb,forcereloadmenu){
                if(cb){
                    //cysCommons.cysDump(sourceCode);
                    var signatureFunctionName = cysOverlay.findMatch(sourceCode, /\.set\s*\("signature"\s*,\s*([a-zA-Z0-9_$][\w$]*)\(/) || cysOverlay.findMatch(sourceCode, /\.sig\s*\|\|\s*([a-zA-Z0-9_$][\w$]*)\(/) || cysOverlay.findMatch(sourceCode, /\.signature\s*=\s*([a-zA-Z_$][\w$]*)\([a-zA-Z_$][\w$]*\)/); //old
                    //cysCommons.cysDump("Signature Code:");
                    //cysCommons.cysDump(signatureFunctionName);
                    if (signatureFunctionName == null) cysCommons.cysDump("error 2");
                    signatureFunctionName=signatureFunctionName.replace('$','\\$');    
                    //var regCode = new RegExp('function \\s*' + signatureFunctionName +
                    //cysCommons.cysDump("After Replace:");
                    //cysCommons.cysDump(signatureFunctionName);
                    var regCode = new RegExp(signatureFunctionName + '\\s*=\\s*function' +
                    '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);\n*(.+);return [\\w$]*\\.join');
                    var regCode2 = new RegExp('function \\s*' + signatureFunctionName + '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);\n*(.+);return [\\w$]*\\.join');    
                    var functionCode = cysOverlay.findMatch(sourceCode, regCode) || cysOverlay.findMatch(sourceCode, regCode2);

                    if (functionCode == null) cysCommons.cysDump("error at functionCode detection");

                    var reverseFunctionName = cysOverlay.findMatch(sourceCode, 
                    /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.reverse\s*\(\s*\)\s*}/);

                    if (reverseFunctionName) reverseFunctionName=reverseFunctionName.replace('$','\\$');        
                    var sliceFunctionName = cysOverlay.findMatch(sourceCode, 
                    /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*,\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.(?:slice|splice)\(.+\)\s*}/);

                    if (sliceFunctionName) sliceFunctionName=sliceFunctionName.replace('$','\\$');    

                    var regSlice = new RegExp('\\.(?:'+'slice'+(sliceFunctionName?'|'+sliceFunctionName:'')+
                    ')\\s*\\(\\s*(?:[a-zA-Z_$][\\w$]*\\s*,)?\\s*([0-9]+)\\s*\\)'); // .slice(5) sau .Hf(a,5)
                    var regReverse = new RegExp('\\.(?:'+'reverse'+(reverseFunctionName?'|'+reverseFunctionName:'')+
                    ')\\s*\\([^\\)]*\\)');  // .reverse() sau .Gf(a,45)
                    var regSwap = new RegExp('[\\w$]+\\s*\\(\\s*[\\w$]+\\s*,\\s*([0-9]+)\\s*\\)');
                    var regInline = new RegExp('[\\w$]+\\[0\\]\\s*=\\s*[\\w$]+\\[([0-9]+)\\s*%\\s*[\\w$]+\\.length\\]');
                    var functionCodePieces=functionCode.split(';');
                    var decodeArray=[];
                    for (var i=0; i<functionCodePieces.length; i++) {
                        functionCodePieces[i]=functionCodePieces[i].trim();
                        var codeLine=functionCodePieces[i];
                        //cysCommons.cysDump("codeLine:");
                        //cysCommons.cysDump(codeLine);
                        if (codeLine.length>0) {
                            var arrSlice=codeLine.match(regSlice);
                            //cysCommons.cysDump("arrSlice:");
                            //cysCommons.cysDump(arrSlice);
                            var arrReverse=codeLine.match(regReverse);
                            //cysCommons.cysDump("arrReverse1:");
                            //cysCommons.cysDump(arrReverse);
                            //cysCommons.cysDump("arrSlice.length:");
                            //cysCommons.cysDump(arrSlice.length);

                            if (arrSlice && arrSlice.length >= 2) { // slice
                              //  cysCommons.cysDump("1");
                                var slice=parseInt(arrSlice[1], 10);
                                //cysCommons.cysDump("2");
                                if (cysOverlay.isInteger(slice)){ 
                                  //  cysCommons.cysDump("3");
                                  decodeArray.push(-slice);
                                  //cysCommons.cysDump("4");
                                } else cysCommons.cysPrefs.setCharPref("signature.decryption.code", "");
                                //cysCommons.cysDump("arrSlice.decodeArray:");
                                //cysCommons.cysDump(decodeArray);
                            } else if (arrReverse && arrReverse.length >= 1) { // reverse
                                decodeArray.push(0);
                                //cysCommons.cysDump("arrReverse.decodeArray:");
                                //cysCommons.cysDump(decodeArray);
                            } else if (codeLine.indexOf('[0]') >= 0) { // inline swap
                                  if (i+2<functionCodePieces.length &&
                                  functionCodePieces[i+1].indexOf('.length') >= 0 &&
                                  functionCodePieces[i+1].indexOf('[0]') >= 0) {
                                    var inline=cysOverlay.findMatch(functionCodePieces[i+1], regInline);
                                    inline=parseInt(inline, 10);
                                    decodeArray.push(inline);
                                    i+=2;
                                  } else cysCommons.cysPrefs.setCharPref("signature.decryption.code", "");
                                //cysCommons.cysDump("codeLine.decodeArray:");
                                //cysCommons.cysDump(decodeArray);
                            } else if (codeLine.indexOf(',') >= 0) { // swap
                                var swap=cysOverlay.findMatch(codeLine, regSwap);      
                                swap=parseInt(swap, 10);
                                if (cysOverlay.isInteger(swap) && swap>0){
                                  decodeArray.push(swap);
                                } else cysCommons.cysPrefs.setCharPref("signature.decryption.code", "");
                                //cysCommons.cysDump("codeLine.indexOf(',').decodeArray:");
                                //cysCommons.cysDump(decodeArray);
                            } else {  cysCommons.cysPrefs.setCharPref("signature.decryption.code", ""); }
                            //cysCommons.cysDump("decodeArray:");
                            //cysCommons.cysDump(decodeArray);
                        }
                    }
                    //cysOverlay.decodeArray=decodeArray;
                    cysCommons.cysPrefs.setCharPref("signature.decryption.code", decodeArray.join());
                    cysCommons.cysDump("set signature.decryption.code:"+cysCommons.cysPrefs.getCharPref("signature.decryption.code"));
                    cysOverlay.isSignatureUpdatingStarted = 2;
                    if(forcereloadmenu===true){
                        if(cysOverlay.vid !=null){
                            cysOverlay.vid.youTubeFormats = null;
                            cysOverlay.onContentLoad(1);
                            //cysOverlay.buildDropDownMenu();
                            var menu = cysOverlay.menu;
                            if(menu && (menu.state =='open' || menu.open)) cysOverlay.menuToggle(menu);
                            cysCommons.cysDump("forcing reload");
                        }
                    }
                }
            },
            menuReload: function(){
                //cysCommons.cysDump("I m in menuReload");
                var menu = cysOverlay.menu;
                if(menu && menu.firstChild != null && menu.firstChild.firstChild.nodeName=="image"){
                    //cysCommons.cysDump("1) I m in menuReload");
                    cysOverlay.menuToggle(menu);
                }
            },
            menuToggle: function(menu){
                menu.hidePopup();
                //menu.openPopup(menu.parentNode, 'after_start');
                menu.openPopup(menu.parentNode, 'after_start', 0, 0, false, false, null);
            },
            decryptSignature: function(sig) {
               // cysCommons.cysDump("decryption:::::::::"+sig);
                try{
                    if (sig==null) return '';  
                    cysOverlay.decodeArray=cysCommons.cysPrefs.getCharPref("signature.decryption.code");
                    if(cysOverlay.decodeArray != null){
                        //cysCommons.cysDump("decrypt:"+cysOverlay.decodeArray);
                        var decodeArray = cysOverlay.decodeArray.split(",");
                        if(!decodeArray){ return cysOverlay.getSig(sig) }; //fallback method
                        if (decodeArray) {
                            var sig2=cysOverlay.decode(sig, decodeArray);
                            if (sig2) return sig2;
                        } else {
                            cysCommons.cysPrefs.setCharPref("signature.decryption.code", "");
                        }
                    }
                    
                }catch(ex){
                    cysCommons.cysDump("error in decryptSignature:"+ex);
                }
                return sig;
            },  
            swap: function(a,b){var c=a[0];a[0]=a[b%a.length];a[b]=c;return a},
            decode: function(sig, arr) { // encoded decryption
                if (!cysOverlay.isString(sig)) return null;
                var sigA=sig.split('');
                for (var i=0;i<arr.length;i++) {
                  var act=parseInt(arr[i]);
                  if (!cysOverlay.isInteger(act)) return null;
                  sigA=(act>0)?cysOverlay.swap(sigA, act):((act==0)?sigA.reverse():sigA.slice(-act));
                }
                var result=sigA.join('');
                return result;
            },
            isString: function(s) {
                return (typeof s==='string' || s instanceof String);
            },
            isInteger: function(n) {
                return (typeof n==='number' && n%1==0);
            },
            updateVideosListOnText: function(text,cb){
                cysOverlay.vid.running = 1; // analysis running
                cysOverlay.vid.referer = null;
                var tt, ttt, ref, fmap, af, ptk, d, dm, id, i, t, ttsurl,cc_asr;

                //cysCommons.cysDump(text);
                if (!text) {
                    delete cysOverlay.vid.running;
                    return;
                }
                if (!fmap && !af) { // get ytplayerconfig
                    tt = /data-swf-config="([^\n"]+)"/.exec(text);
                    if (tt){
                            tt = tt[1].replace(/&(amp;)?quot;/g, '"');   // channel featured video
                    } else {
                        tt = /ytplayer\.config\s*=\s*(\{[^\n]+\})\s*?;\s*?ytplayer\./.exec(text);
                        if (tt)
                            tt = tt[1];
                    }

                    if (tt){
                        try {
                            tt = JSON.parse(tt);
                        } catch (e) {
                            tt = '';
                        }
                    }

                    if (tt && 'args' in tt) {
                        ref = tt.url;
                        d = tt.assets;
                        ttt = tt.args;
                        id = ttt.video_id;
                        if (id == cysOverlay.vid.id) {
                            ptk = ttt.ptk;
                            fmap = ttt.url_encoded_fmt_stream_map;
                            af = ttt.adaptive_fmts;
                            dm = ttt.dashmpd;

                            if(typeof ttt.ttsurl != 'undefined'){
                                ttsurl = decodeURIComponent(ttt.ttsurl);
                            }else{
                                ttsurl = false;
                            }

                            if(typeof ttt.cc_asr != 'undefined' && ttt.cc_asr=="1"){
                                cc_asr = 1;
                            }else{
                                cc_asr = 0;
                            }
                            //cysCommons.setdef(d);
                        }
                        //cysCommons.cysDump('\n* * * updateVideosListOnText From swf config * * *\nID: '+id+'\nReferrer: '+ref+'\nptk: '+ptk+'\ndashmpd: '+dm+'\nFormats:\n'+fmap+'\nAdaptive Formats:\n'+af);
                    }
                    if (!fmap && !af) { // AJAX UI
                        //cysCommons.cysDump("2ajaxui in text");
                        cysCommons.getAJAX('http://www.youtube.com/watch?v=' + cysOverlay.vid.id + '&spf=navigate', cysOverlay.processAJAX);
                    } else {
                        //cysCommons.cysDump("1ajaxui");
                        cysOverlay.vid.referer = ref;
                        cysOverlay.vid.ptk = ptk;
                        cysOverlay.vid.dm = dm;
                        cysOverlay.vid.ttsurl = ttsurl;
                        cysOverlay.vid.cc_asr = cc_asr;
                        cysOverlay.fillVideoArray(fmap, af);
                    }
                }
            },
            updateVideosList: function (doc) {
                try{
                    if (cysOverlay.vid.youTubeFormats) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                    if(cysOverlay.isSignatureUpdatingStarted == 1){
                        setTimeout(cysOverlay.onContentLoad, 500);
                        return;
                    }
                    if (cysOverlay.vid.running) {
                        setTimeout(cysOverlay.onContentLoad, 500);
                        return;
                    }
                    cysOverlay.vid.running = 1; // analysis running
                    cysOverlay.vid.referer = null;
                    if (!doc) var doc = cysCommons.getDoc();
                    if (!doc || !doc.body) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                    var text = doc.body.innerHTML, tt, ttt, ref, fmap, af, ptk, d, dm, id, i, t, ttsurl,cc_asr;

                    if (!text) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                }catch(ex){
                    cysCommons.cysDump("updateVideosList error:"+ex);
                }
                try {
                    if (!fmap && !af) { // get ytplayerconfig
                        if (cysCommons.isYouTubeChannelUrl(doc.location.href)) {
                            tt = /data-swf-config="([^\n"]+)"/.exec(text);
                            if (tt)
                                tt = tt[1].replace(/&(amp;)?quot;/g, '"');   // channel featured video
                        } else {
                            tt = /ytplayer\.config\s*=\s*(\{[^\n]+\})\s*?;\s*?ytplayer\./.exec(text);
                            if (tt)
                                tt = tt[1];
                        }
                        
                        if (tt){
                            try {
                                tt = JSON.parse(tt);
                            } catch (e) {
                                tt = '';
                            }
                        }
                        
                        if (tt && 'args' in tt) {
                            ref = tt.url;
                            d = tt.assets;
                            ttt = tt.args;
                            id = ttt.video_id;
                            if (id == cysOverlay.vid.id) {
                                ptk = ttt.ptk;
                                fmap = ttt.url_encoded_fmt_stream_map;
                                af = ttt.adaptive_fmts;
                                dm = ttt.dashmpd;
                                
                                if(typeof ttt.ttsurl != 'undefined'){
                                    ttsurl = decodeURIComponent(ttt.ttsurl);
                                }else{
                                    ttsurl = false;
                                }
                                
                                if(typeof ttt.cc_asr != 'undefined' && ttt.cc_asr=="1"){
                                    cc_asr = 1;
                                }else{
                                    cc_asr = 0;
                                }
                                //cysCommons.setdef(d);
                            }
                            //cysCommons.cysDump('\n* * * From swf config * * *\nID: '+id+'\nReferrer: '+ref+'\nptk: '+ptk+'\ndashmpd: '+dm+'\nFormats:\n'+fmap+'\nAdaptive Formats:\n'+af);
                        }
                    }
                    if ((!fmap && !af) && text.indexOf('<div id="p">') > 0) { // feather UI
                        text = /<embed([^>]+)>/.exec(text);
                        if (text) {
                            t = /src="(\S+)"/.exec(text);
                            if (t && t[1]) {
                                cysOverlay.vid.referer = ref = t[1];
                            }
                            tt = /flashvars="(\S+)"/.exec(text);
                            if (tt && tt[1]) {
                                tt = tt[1].split('&amp;');
                                ttt = {};
                                for (i = 0; i < tt.length; i++) {
                                    t = tt[i].split('=');
                                    ttt[t[0]] = t[1];
                                }
                            }
                            id = ttt.video_id;
                            if (id == cysOverlay.vid.id) {
                                ptk = ttt.ptk;
                                fmap = decodeURIComponent(ttt.url_encoded_fmt_stream_map);
                                af = decodeURIComponent(ttt.adaptive_fmts);
                                dm = decodeURIComponent(ttt.dashmpd);
                                if(typeof ttt.ttsurl != 'undefined'){
                                    ttsurl = decodeURIComponent(ttt.ttsurl);
                                }else{
                                    ttsurl = false;
                                }
                                if(typeof ttt.cc_asr != 'undefined'){
                                    cc_asr = ttt.cc_asr;
                                }else{
                                    cc_asr = 0;
                                }
                            }
                            //cysCommons.cysDump('\n* * * From Feather config * * *\nID: '+id+'\nReferrer: '+ref+'\nptk: '+ptk+'\ndashmpd: '+dm+'\nFormats:\n'+fmap+'\nAdaptive Formats:\n'+af);
                        }
                    }
                    
                    if (!fmap && !af) { // AJAX UI
                        //cysCommons.cysDump("2ajaxui");
                        var vidurl = cysCommons.executeInSandbox("document.URL");
                        cysCommons.getAJAX(vidurl, cysOverlay.updateVideosListOnText);
                        //cysCommons.getAJAX('http://www.youtube.com/watch?v=' + cysOverlay.vid.id + '&spf=navigate', cysOverlay.processAJAX);
                    } else {
                        //cysCommons.cysDump("1ajaxui");
                        cysOverlay.vid.referer = ref;
                        cysOverlay.vid.ptk = ptk;
                        cysOverlay.vid.dm = dm;
                        cysOverlay.vid.ttsurl = ttsurl;
                        cysOverlay.vid.cc_asr = cc_asr;
                        //cysCommons.cysDump("updatevideoList-fmap:"+fmap);
                        //cysCommons.cysDump("updatevideoList-af:"+af);
                        cysOverlay.fillVideoArray(fmap, af);
                    }
                } catch (ex) {
                    cysCommons.cysDump('Videolist update error!');
                }
            },
            processAJAX: function (data, cb) {
                //cysCommons.cysDump("processAJAX");
                if (!cb) {
                    delete cysOverlay.vid.running;
                    return;
                }
                if (cysOverlay.vid.youTubeFormats) {
                    delete cysOverlay.vid.running;
                    return;
                }
                var fmap, af, rr = {}, dm, d, t, tt, ttt, id, ptk, ref, s, i, ss, ttsurl, cc_asr;
                try{
                    if (data.indexOf('{') > -1) {   // AJAX UI data
                        tt = JSON.parse(data);
                        if (tt) {
                            if (tt.swfcfg) {
                                ss = 'swfcfg';
                                tt = tt.swfcfg;
                            } else if (tt.html && tt.html.player) {
                                ss = 'html.player';
                                tt = tt.html.player;
                                ttt = tt;
                                if (tt) {
                                    tt = /ytplayer\.config\s*=\s*(\{[^\n]+\})\s*;\s*<\/script>/.exec(tt);
                                    if (!tt) {
                                        tt = /ytplayer\.config\s*=\s*(\{[^\n]*?\})\s*;\s*\(\s*function/.exec(ttt);
                                    }
                                    if (tt) {
                                        tt = tt[1];
                                        tt = JSON.parse(tt);
                                    }
                                }
                            } else if (tt && tt instanceof Array && tt.length) {
                                for (i = 0; i < tt.length; i++) {
                                    if (tt[i] && tt[i].swfcfg) {
                                        ss = 'swfcfg';
                                        tt = tt[i].swfcfg;
                                    }
                                    if (!ss && tt[i] && tt[i].data && tt[i].data.swfcfg) {
                                        ss = 'swfcfg';
                                        tt = tt[i].data.swfcfg;
                                    }
                                    if (!ss && tt[i] && tt[i].html && tt[i].html.player) {
                                        ss = 'html.player';
                                        tt = tt[i].html.player;
                                        if (tt) {
                                            tt = /ytplayer\.config\s*=\s*(\{[^\n]+\})\s*;\s*<\/script>/.exec(tt);
                                            if (tt) {
                                                tt = tt[1];
                                                tt = JSON.parse(tt);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (tt && 'args' in tt) {
                            ref = tt.url;
                            d = tt.assets;
                            ttt = tt.args;
                            id = ttt.video_id;
                            if (id == cysOverlay.vid.id) {
                                ptk = ttt.ptk;
                                fmap = ttt.url_encoded_fmt_stream_map;
                                af = ttt.adaptive_fmts;
                                dm = ttt.dashmpd;
                                if(typeof ttt.ttsurl != 'undefined'){
                                    ttsurl = decodeURIComponent(ttt.ttsurl);
                                }else{
                                    ttsurl = false;
                                }

                                if(typeof ttt.cc_asr != 'undefined'){
                                    cc_asr = ttt.cc_asr;
                                }else{
                                    cc_asr = 0;
                                }
                              //cysCommons.setdef(d);
                            }
                        }
                        //cysCommons.cysDump('\n* * * From AJAXUI info in '+ss+' * * *\nID: '+id+'\nReferrer: '+ref+'\nptk: '+ptk+'\ndashmpd: '+dm+'\nFormats:\n'+fmap+'\nAdaptive Formats:\n'+af);
                        if (fmap && ((dm && af) || !af)) {
                            cysOverlay.vid.ptk = ptk;
                            cysOverlay.vid.ref = ref;
                            cysOverlay.vid.dm = dm;
                            cysOverlay.vid.ttsurl = ttsurl;
                            cysOverlay.vid.cc_asr = cc_asr;
                            cysOverlay.vid.fmap = fmap;
                            cysOverlay.vid.af = af;
                            if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && cysCommons.executeInSandbox("document.getElementById('cys_"+cysOverlay.vid.id+"');") != null){
                                var scrp = "var cysdiv = document.getElementById('cys_"+cysOverlay.vid.id+"'); cysdiv.setAttribute('ptk','"+cysOverlay.vid.ptk+"'); cysdiv.setAttribute('ref','"+cysOverlay.vid.ref+"'); cysdiv.setAttribute('dm','"+cysOverlay.vid.dm+"'); cysdiv.setAttribute('ttsurl','"+cysOverlay.vid.ttsurl+"'); cysdiv.setAttribute('cc_asr','"+cysOverlay.vid.cc_asr+"'); cysdiv.setAttribute('af','"+af+"'); cysdiv.setAttribute('fmap','"+fmap+"');";
                                cysCommons.executeInSandbox(scrp);
                            }
                            cysOverlay.fillVideoArray(fmap, af);
                        } else {
                            cysCommons.getAJAX('http://www.youtube.com/get_video_info?eurl=http://www.youtube.com/&video_id=' + cysOverlay.vid.id, cysOverlay.processAJAX);
                            cysOverlay.vid.getinfo = 1;
                        }
                    } else {                      // get_video_info data
                        cysCommons.cysDump("processAJAX:get_video_info data:"+cysOverlay.vid.id+"::data:"+data);
                        for each (s in data.split('&')) {
                            t = s.split('=');
                            rr[t[0]] = t[1];
                        }
                        if (rr['video_id'] == cysOverlay.vid.id) {
                            fmap = decodeURIComponent(rr['url_encoded_fmt_stream_map']);
                            af = decodeURIComponent(rr['adaptive_fmts']);
                            cysOverlay.vid.ptk = rr['ptk'];
                            cysOverlay.vid.dm = dm = decodeURIComponent(rr['dashmpd']);
                            if(typeof rr['ttsurl'] != 'undefined'){
                                cysOverlay.vid.ttsurl = decodeURIComponent(rr['ttsurl']);
                            }else{
                                cysOverlay.vid.ttsurl = false;
                            }

                            if(typeof rr['ttsurl'] != 'undefined'){
                                cysOverlay.vid.cc_asr = rr['ttsurl'];
                            }else{
                                cysOverlay.vid.cc_asr = 0;
                            }
                            cysOverlay.vid.fmap = fmap;
                            cysOverlay.vid.af = af;
                        }
                        //cysCommons.cysDump('\n* * * From get_video_info * * *\nID: '+rr['video_id']+'\nReferrer (not here): '+cysOverlay.vid.referer+'\nptk: '+rr['ptk']+'\ndashmpd: '+dm+'\nFormats:\n'+fmap+'\nAdaptive Formats:\n'+af);
                        if (fmap && ((dm && af) || !af)){
                            //cysCommons.cysDump("processAJAX:get_video_info data:if");
                            cysOverlay.fillVideoArray(fmap, af);
                            if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                                var scrp = "var cysdiv = document.getElementById('cys_"+cysOverlay.vid.id+"'); cysdiv.setAttribute('ptk','"+cysOverlay.vid.ptk+"'); cysdiv.setAttribute('ref','"+cysOverlay.vid.ref+"'); cysdiv.setAttribute('dm','"+cysOverlay.vid.dm+"'); cysdiv.setAttribute('ttsurl','"+cysOverlay.vid.ttsurl+"'); cysdiv.setAttribute('cc_asr','"+cysOverlay.vid.cc_asr+"'); cysdiv.setAttribute('af','"+af+"'); cysdiv.setAttribute('fmap','"+fmap+"');";
                                cysCommons.executeInSandbox(scrp);
                            }
                        }else if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){ //if(cysOverlay.getEmbeddedVideoSize() == 0){
                            //cysCommons.cysDump("processAJAX:get_video_info data:else::"+cysOverlay.getEmbeddedVideoSize());
                            delete cysOverlay.currentEmbeddedVidList[cysOverlay.vid.id];
                            delete cysOverlay.idlist[cysOverlay.vid.id];
                            delete cysOverlay.embeddedVideoIdList[cysOverlay.vid.id];
                            if(cysOverlay.getEmbeddedVideoSize() > 0){
                                var inc=0;
                                for(var videoID in cysOverlay.currentEmbeddedVidList){
                                    if(typeof cysOverlay.idlist[videoID] == 'undefined'){
                                        cysOverlay.setVideoConfig(videoID);
                                        inc++;
                                        return;
                                    }
                                }
                            }
                            
                            var btn = cysOverlay.button;
                            if(btn){
                                if(inc==0 && cysOverlay.getEmbeddedVideoSize() > 0){
                                    btn.disabled = false;
                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                }else{
                                    btn.disabled = true;
                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                }
                            }
                        }
                    }
                }catch(ex){
                    if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){ 
                        //cysCommons.cysDump("catch in process Ajax");
                        delete cysOverlay.currentEmbeddedVidList[cysOverlay.vid.id];
                        delete cysOverlay.idlist[cysOverlay.vid.id];
                        delete cysOverlay.embeddedVideoIdList[cysOverlay.vid.id];
                        if(cysOverlay.getEmbeddedVideoSize() > 0){
                            var inc=0;
                            for(var videoID in cysOverlay.currentEmbeddedVidList){
                                if(typeof cysOverlay.idlist[videoID] == 'undefined'){
                                    cysOverlay.setVideoConfig(videoID);
                                    inc++;
                                    return;
                                }
                            }
                        }
                        var btn = cysOverlay.button;
                        if(btn){
                            if(inc==0 && cysOverlay.getEmbeddedVideoSize() > 0){
                                btn.disabled = false;
                                btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                            }else{
                                btn.disabled = true;
                                btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                            }
                        }
                    }
                    //cysCommons.cysDump("error in processAjax:"+ex);
                }
            },
            fillVideoArray: function (fm, af) {
                try{
                    if (cysOverlay.vid.youTubeFormats) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                    var i, j, k, str, pos, fmt, fmt2, fA, sig, s, a, v, p, o, sf = [], clen, rtmpe, res, br;
                    cysOverlay.vid.youTubeFormats = [];

                    fm = fm.split(',');
                    if (af && af.length > 0){
                        fm = fm.concat(af.split(','));
                    }
                    if (cysCommons.cysPrefs.getBoolPref('scan.hiddenformats') && cysOverlay.vid.dm) {
                        s = cysOverlay.vid.dm.substr(s.indexOf('.com/api/manifest/dash/') + 23).split('/');
                        for (i = 0; i < s.length; i += 2) {
                            if (s[i] != 'itag') {
                                sf.push(s[i] + '=' + s[i + 1]);
                            }
                        } //else if (s[i]!='signature') {sf.push(s[i]+'='+cysOverlay.getSig(s[i+1]));}} //cysCommons.cysDump('\nsf: '+sf+'\n');
                        s = sf.join('&');
                        sf = [];
                        for (i = 0; i < cysCommons.validFormats.length; i++)
                            sf.push('*' + s + '&itag=' + cysCommons.validFormats[i]); //cysCommons.cysDump('\nsf: '+sf+'\n');
                        if (sf)
                            fm = fm.concat(sf);
                    }
                    //cysCommons.cysDump('\n\n*****\nfmurls:'+fm);
                    for (j = 0; j < fm.length; j++) {
                        str = fm[j];
                        sig = 0;
                        clen = 0;
                        res = '', br = '';
                        //cysCommons.cysDump('\n\n*****\ninforloopfmurls:'+str);
                        fmt = /itag=(\d\d?\d?)/.exec(str);
                        if(!fmt){
                            fmt = /itag\/(\d\d?\d?)/.exec(str);    
                        }
                        if (fmt) {
                            fmt = fmt[1];
                        } else {
                            continue;
                        }
                        //cysCommons.cysDump("fmt:"+fmt);
                        if (fmt in cysOverlay.vid.youTubeFormats)
                            continue; //cysCommons.cysDump('\nFmt'+fmt);
                        if (str.substr(0, 1) == '*') {
                            if (!o)
                                continue;
                            str = o + str.substr(1);
                        } else {
                            str = decodeURIComponent(str);
                            pos = str.indexOf('url=http');
                            if (pos == -1) {
                                if (str.indexOf('conn=rtmpe://') > -1) {
                                    rtmpe = 1;
                                }
                                continue;
                            }
                            if (pos >= 0)
                                str = str.substr(pos) + '&' + str.substring(0, pos - 1);  // normalize string
                            str = str.substr(4);                                              // cut 'url=' out
                        }
                        if (str.indexOf('ratebypass=') == -1)
                            str += '&ratebypass=yes';
                        // if (str.indexOf('clen=')>0) str += '&keepalive=yes&range=0';  // *****
                        pos = str.indexOf('?');
                        if (!o)
                            o = str.substr(0, pos + 1);
                        fA = str.substr(pos + 1).split('&').sort();
                        for (i = 0, k = fA.length; i < k; i++) {
                            if (i) {
                                if (fA[i] == fA[i - 1]) {
                                    delete fA[i];
                                    continue;
                                }
                            }
                            s = fA[i];
                            p = s.indexOf('=');
                            if (p == -1) {
                                continue;
                            }
                            a = s.substr(0, p);
                            v = s.substr(p + 1);
                            if (a == 'quality' || a == 'type' || a == 'fallback_host' || a == 'index' || a == 'init') {
                                delete fA[i];
                                continue;
                            }
                            if (a == 'ratebypass') {
                                fA[i] = 'ratebypass=yes';
                                continue;
                            }
                            if (a == 'clen') {
                                clen = v;
                                continue;
                            }
                            if (a == 'range') {
                                if (clen) {
                                    fA[i] = a + '=0-' + clen;
                                    continue;
                                } else {
                                    delete fA[i];
                                    continue;
                                }
                            }
                            if (a == 'bitrate') {
                                br = v;
                                delete fA[i];
                                continue;
                            }
                            if (a == 'size') {
                                res = v;
                                delete fA[i];
                                continue;
                            }
                            if (a == 'signature') {
                                sig = 1;
                            }
                            ;
                            if (sig) {
                                continue;
                            }
                            ;
                            if (a == 'sig') {
                                fA[i] = 'signature=' + v;
                                sig = 1;
                            }
                            if (a == 's') {
                                p = cysOverlay.decryptSignature(v);
                                //p = cysOverlay.getSig(v);
                                fA[i] = 'signature=' + p;
                                sig = 1; //cysCommons.cysDump('\n# Case : '+(v.length-81)+'\n'+v+'\n'+p+'\n');
                            }
                        }
                        str = str.substring(0, pos + 1) + fA.join('&').replace(/&{2,}/g, '&');
                        if (clen)
                            cysOverlay.vid.filesizes['Fmt' + fmt] = Number(clen);
                        if (res) {
                            i = res.indexOf('x');
                            if (i > 1 & i < res.length - 3) {
                                cysOverlay.vid.resolutions['Fmt' + fmt] = {h: res.substr(i + 1), w: res.substr(0, i)};
                            }
                        }
                        if (br) cysOverlay.vid.bitrates['Fmt' + fmt] = Math.round(Number(br) / 1024) + 'K';
                        //if (cysOverlay.vid.ptk) str+='&ptk='+cysOverlay.vid.ptk
                        cysOverlay.vid.youTubeFormats[fmt] = str;
                        //cysCommons.cysDump('\n\nfmt: '+fmt+'\n'+str);
                    }

                    if (cysOverlay.vid.youTubeFormats.length) {
                        s = cysOverlay.vid.dm;
                        if (s) {
                            a = /\/s\/(\w{40,}\.\w{40,})\//.exec(s);
                            if (a) {
                                sig = cysOverlay.decryptSignature(a[1]);
                                //sig = cysOverlay.getSig(a[1]);
                                if (a[1] != sig) {
                                    s = s.replace(a[0], '/signature/' + sig + '/');
                                } else {
                                    s = '';
                                }
                            }
                        }
                        if (s) cysCommons.getAJAX(s, cysOverlay.processDASH, null, null, cysOverlay.vid.id);
                        cysOverlay.processDASH(null, 0, cysOverlay.vid.id);
                        delete cysOverlay.vid.running;
                        cysOverlay.cleanupCache();
                        if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){ 
                            cysOverlay.menuReload();
                            if(cysOverlay.getEmbeddedVideoSize()>0){
                                var ic=0;
                                for(var videoID in cysOverlay.currentEmbeddedVidList){
                                    if(typeof cysOverlay.idlist[videoID] == 'undefined'){
                                        /*var menu = cysOverlay.menu;
                                        if(menu && (menu.state =='open' || menu.open)) cysOverlay.menuToggle(menu);*/
                                        cysOverlay.setVideoConfig(videoID);
                                        ic++;
                                        return;
                                    }
                                }
                                if(ic==0){
                                    var btn = cysOverlay.button;
                                    if(btn){
                                        btn.disabled = false;
                                        btn.hidden = false;
                                    }
                                }
                            }
                        }
                    } else if (typeof cysOverlay.vid.getinfo == 'undefined') {
                        //cysCommons.cysDump('Format_url_map parsing failed - querying video-info database...');
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.vid.getinfo = 1;
                        cysCommons.getAJAX('http://www.youtube.com/get_video_info?eurl=http://www.youtube.com/&video_id=' + cysOverlay.vid.id, cysOverlay.processAJAX);  //'http://www.youtube.com/get_video_info?video_id='
                    } else {
                        cysOverlay.button.disabled = true;
                        if (rtmpe) {
                            cysOverlay.vid.rtmpe = 1;
                            //cysCommons.cysDump('fillVideoArray - RTMPE streams only, no downloadable video link found!');
                        }
                    }
                }catch(ex){
                    cysCommons.cysDump('fillVideoArray: error::'+ex);
                }
            },
            findMatch: function(text, regexp) {
                var matches=text.match(regexp);
                return (matches)?matches[1]:null;
            },
            getSig: function (s) {      // ** undo signature obfuscation... **
                var x = s.length - 81, o = s, a, b;
                function sr(a, y, z) {
                    a = a.substr(y, z);
                    var b = '', i, l = a.length - 1;
                    for (i = l; i >= 0; i--)
                        b += a[i];
                    return b;
                }
                function ss(a, b) {
                    var c = a[0];
                    a[0] = a[b % a.length];
                    a[b] = c;
                    return a
                }
                ;
                if (x == 1) {
                    a = sr(s, 0, 33);
                    b = sr(s, 34, 48);
                    s = b.substr(45, 1) + b.substr(2, 12) + b.substr(0, 1) + b.substr(15, 26) + s.substr(33, 1) + b.substr(42, 1) + b.substr(43, 1) + b.substr(44, 1) + b.substr(41, 1) + b.substr(46, 1) + a.substr(32, 1) + b.substr(14, 1) + a.substr(0, 32) + b.substr(47, 1);
                } else if (x == 2) {
                    a = s.substr(2, 40);
                    b = s.substr(43, 40);
                    s = a.substr(4, 1) + a.substr(1, 3) + a.substr(31, 1) + a.substr(5, 17) + s.substr(0, 1) + a.substr(23, 8) + b.substr(10, 1) + a.substr(32, 8) + s.substr(42, 1) + b.substr(0, 10) + a.substr(22, 1) + b.substr(11, 29);
                } else if (x == 3) {
                    a = sr(s, 3, 40);
                    b = sr(s, 42, 41);
                    s = b + s.substr(41, 3) + a.substr(2, 5) + s.substr(2, 4) + a.substr(4, 11) + a.substr(38, 3) + a.substr(9, 29) + a.substr(6, 5);
                } else if (x == 4) {
                    a = sr(s, 3, 40);
                    b = sr(s, 44, 40);
                    s = b.substr(7, 1) + b.substr(1, 6) + b.substr(0, 1) + b.substr(8, 15) + s.substr(0, 1) + b.substr(24, 9) + s.substr(1, 1) + b.substr(34, 6) + s.substr(43, 1) + a;
                } else if (x == 5) {
                    a = s.substr(2, 40);
                    b = s.substr(43, 40);
                    s = a + s.substr(42, 1) + b.substr(0, 20) + b.substr(39, 1) + b.substr(21, 18) + b.substr(20, 1);
                } else if (x == 6) {
                    a = s.substr(5).split('');
                    a = a.reverse();
                    a = ss(a, 57);
                    a = a.slice(4);
                    a = a.reverse();
                    a = a.slice(2);
                    s = a.join('');
                } else if (x == 7) {
                    a = s.substr(2).split('');
                    a = ss(a, 2);
                    a = ss(a, 8);
                    a = a.reverse();
                    a = a.slice(3);
                    a = ss(a, 18);
                    a = a.slice(2);
                    a = ss(a, 21);
                    a = ss(a, 25);
                    s = a.join('');
                } else if (x == 8) {
                    a = s.substr(3).split('');
                    a = ss(a, 1);
                    a = ss(a, 10);
                    a = a.reverse();
                    a = a.slice(2);
                    a = ss(a, 23);
                    a = a.slice(3);
                    a = ss(a, 15);
                    a = ss(a, 34);
                    s = a.join('');
                } else if (x == 9) {
                    a = sr(s, 2, 40);
                    b = sr(s, 34, 40);
                    s = b.substr(8, 1) + b.substr(2, 7) + b.substr(0, 1) + b.substr(6, 17) + s.substr(0, 2) + b.substr(22, 8) + s.substr(1, 3) + b.substr(35, 3) + s.substr(40, 4) + a;
                } else if (x == 11) {
                    a = s.substr(2).split('');
                    a = ss(a, 0);
                    a = ss(a, 32);
                    a = a.reverse();
                    a = a.slice(3);
                    a = ss(a, 43);
                    a = a.slice(3);
                    a = ss(a, 0);
                    a = ss(a, 23);
                    s = a.join('');
                }
                return s;
            },
            processDASH: function (dm, cb, id) { //cysCommons.cysDump('\n\n*** DASH manifest for videoID: '+id+'\n'+dm+'\n');
                if (id != cysOverlay.vid.id)
                    return;
                if (dm) {  // check for additional dash formats in dash manifest XML
                    var dp = new DOMParser(), dm = dp.parseFromString(dm, 'application/xml').documentElement, sf, v, a, s, fmt, i, j, k, o, w, h;
                    if (dm.nodeName != 'parsererror') {
                        sf = dm.getElementsByTagName('Representation');
                        if (sf.length) {
                            for (i = 0; i < sf.length; i++) {
                                w = h = a = s = '';
                                try {
                                    fmt = sf[i].getAttribute('id');
                                    v = sf[i].getAttribute('bandwidth');
                                    h = sf[i].getAttribute('height');
                                    w = sf[i].getAttribute('width');
                                } catch (e) {
                                } //cysCommons.cysDump('\nFormat in DASH manifest: '+fmt+'  -  bandwidth: '+v+'bps');
                                if (fmt && cysOverlay.vid.youTubeFormats && !cysOverlay.vid.youTubeFormats[fmt]) {
                                    a = sf[i].getElementsByTagName('BaseURL');
                                    if (a.length)
                                        s = a[0];
                                    if (s) {
                                        var tempurl = s.childNodes[0].nodeValue;
                                        //cysCommons.cysDump("tempurl.indexOf('/source/yt_otf/'):"+tempurl.indexOf('/source/yt_otf/'));
                                        if(tempurl.indexOf('/source/yt_otf/') == -1){
                                            cysOverlay.vid.youTubeFormats[fmt] = s.childNodes[0].nodeValue;
                                            /* resolve issue #53 in mantis*/
                                        
                                            cysOverlay.vid.filesizes['Fmt' + fmt] = Number(s.getAttribute('yt:contentLength'));
                                            //cysCommons.cysDump('\n\n*** Format added from DASH manifest: '+fmt+'\nsize: '+cysOverlay.vid.filesizes['Fmt'+fmt]+'\nURL: '+cysOverlay.vid.youTubeFormats[fmt]+'\n');
                                            if (h && w) {
                                                cysOverlay.vid.resolutions['Fmt' + fmt] = {h: h, w: w};
                                            }
                                            if (v)
                                                cysOverlay.vid.bitrates['Fmt' + fmt] = Math.round(Number(v) / 1024) + 'K';
                                        }
                                        tempurl = ""
                                        
                                    }
                                }
                            }
                        }
                    }
                }     // match available dash audio formats
                a = cysOverlay.vid.dashAudio = cysOverlay.vid.dashAudio || [];
                o = cysCommons.dashAudio;
                j = -1;
                for (i = 0; i < 3; i++) {
                    if (cysOverlay.vid.youTubeFormats && o[i] in cysOverlay.vid.youTubeFormats) {
                        for (k = j + 1; k <= i; k++) {
                            a[k] = o[i];
                        }
                        j = i;
                    } else if (i == 2) {
                        a[2] = a[1];
                    }
                }
                j = 2;
                for (i = 3; i < 5; i++) {
                    if (cysOverlay.vid.youTubeFormats && o[i] in cysOverlay.vid.youTubeFormats) {
                        for (k = j + 1; k <= i; k++) {
                            a[k] = o[i];
                        }
                        j = i;
                    } else if (i == 4) {
                        a[4] = a[3];
                    }
                }
                j = 4;
                for (i = 5; i < 8; i++) {
                    if (cysOverlay.vid.youTubeFormats && o[i] in cysOverlay.vid.youTubeFormats) {
                        for (k = j + 1; k <= i; k++) {
                            a[k] = o[i];
                        }
                        j = i;
                    } else if (i == 7) {
                        a[4] = a[3];
                    }
                }
                for (fmt in cysOverlay.vid.youTubeFormats) {
                    if (cysCommons.validFormats.indexOf(Number(fmt)) == -1 && cysCommons.dashAudio.indexOf(Number(fmt)) == -1)
                        cysCommons.cysDump('\n*** Format not in database: ' + fmt + '\n' + cysOverlay.vid.youTubeFormats[fmt] + '\n');
                }
            },
            getVideoDate: function (data,cb,videoID) {
                try{
                    if ((cysOverlay.vid != null && cysOverlay.vid.id && data && data.indexOf(cysOverlay.vid.id) > -1) || (videoID !=null && data && data.indexOf(videoID) > -1)) {
                        var vidinfo = JSON.parse(data);
                        var vi = vidinfo.items[0];
                        var t = String(vi.snippet.publishedAt), tdate = t, vdate, d1, d2, r = '', cc = -1,dd,au,ti;
                        vdate = new Date(tdate.substr(0, 4), tdate.substr(5, 2) - 1, tdate.substr(8, 2));
                        d1 = new Date(2012, 6, 1), d2 = new Date(2011, 4, 1), r = '';                    // audio quality jump dates
                        if (vdate < d1)
                            r = '1';
                        if (vdate < d2)
                            r = '2';
                        cysOverlay.vid.age = r;            // set age
                        //cysCommons.cysDump("cysOverlay.vid.age::"+cysOverlay.vid.age+"::vdate:"+vdate+"::d1:"+d1+"::d2:"+d2);
                        //t = String(/<gd:feedLink[^>\n]+>/.exec(data));
                        //if (t) t = String(/countHint='[\d]*/.exec(t)).substr(11);
                        //if (t) cc = parseInt(t);
                        cysOverlay.vid.ccount = vi.statistics.commentCount;     // set comment count

                        //t = String(/<yt:duration[^>\n]+>/.exec(data));
                        //if (t) t = String(/seconds='[\d]*/.exec(t)).substr(9);
                        //if (t)dd = parseInt(t); 
                        cysOverlay.vid.duration =cysCommons.getDurationFromYString(vi.contentDetails.duration);//cysCommons.getFormattedDuration(dd);//set duration
                        //cysCommons.cysDump("duration:if::"+cysOverlay.vid.duration);
                        /*t = String(/<author>[\s\S]+<\/author>/.exec(data));
                        if (t) t = String(/<name>[\s\S]+<\/name>/.exec(t)).substr(6);
                        if (t) au = t.replace("</name>","");*/
                        cysOverlay.vid.author = vi.snippet.channelTitle; //set author
                        cysOverlay.vid.channelid = vi.snippet.channelId; //set Channel ID
                        
                        cysOverlay.vid.published = cysCommons.getM(parseInt(tdate.substr(5, 2))-1)+" "+tdate.substr(8, 2)+", "+tdate.substr(0, 4);
                        //cysCommons.cysDump("cysOverlay.vid.published::"+cysOverlay.vid.published+"::month:"+tdate.substr(5, 2)+"::date:"+tdate.substr(8, 2)+"::year:"+tdate.substr(0, 4));


                        t = vi.snippet.title;//String(/<title>[\s\S]+<\/title>/.exec(data));
                        if(t){ 
                            cysOverlay.vid.title = cysCommons.getTitle(t);
                            if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && videoID !=null && cysOverlay.embeddedVideoIdList[videoID]){
                                //cysCommons.cysDump("setting title:"+videoID);
                                cysOverlay.embeddedVideoIdList[videoID].title=t;
                                cysOverlay.currentEmbeddedVidList[videoID].title=t;
                                cysOverlay.updateEmbeddedVideoTitle(videoID);
                            }
                        }

                        
                        var licensetr = "";
                        if(vi.contentDetails.licensedContent==true){
                            licensetr="<tr><td><strong>License</strong></td><td>Standard YouTube License</td></tr>";
                        }
                        /*var license = String(/terms'>[\s\S]*?<\/media:license>/.exec(data));
                        license = license.replace("terms'>","").replace("</media:license>","");
                        if(license=='youtube'){
                            licensetr="<tr><td><strong>License</strong></td><td>Standard YouTube License</td></tr>";
                        }*/

                        var category = "";/*String(/<media:category label='[\s\S]*?'/.exec(data));
                        category = category.replace("<media:category label='","").replace("'","");
                        category =  '<div id="watch-description-extras"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:100px"><strong>Category</strong></td><td>'+category+'</td></tr>'+licensetr+'</table></div>';
*/
                        var detail = vi.snippet.description;/*String(/<media:description type='plain'>[\s\S]*?<\/media:description>/.exec(data));*/
                        //cysCommons.cysDump("****************category:"+category+"::details:"+detail);
                        if(detail==null || detail=="null"){
                            detail="";
                        }
                        cysOverlay.vid.detail = '<div id="watch-description-text" style="max-height:none;" class=""><p id="eow-description">'+detail.replace("<media:description type='plain'>","").replace("</media:description>","").replace(/(?:\r\n|\r|\n)/g,"</br>")+'</p></div>'+category;
                        
                        if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && cysCommons.executeInSandbox("document.getElementById('cys_"+cysOverlay.vid.id+"');") != null){
                            var vidau="",vidtitle="",viddetail="";
                            if(cysOverlay.vid.author !=null){
                                vidau = cysOverlay.vid.author.replace(/'/g, "\\'");
                            }
                            if(cysOverlay.vid.title != null){
                                vidtitle = cysOverlay.vid.title.replace(/'/g, "\\'");
                            }
                            if(cysOverlay.vid.detail !=null){
                                viddetail = cysOverlay.vid.detail.replace(/'/g, "\\'");
                            }
                            var scrp = "var cysdiv = document.getElementById('cys_"+cysOverlay.vid.id+"'); cysdiv.setAttribute('age','"+cysOverlay.vid.age+"'); cysdiv.setAttribute('ccount','"+cysOverlay.vid.ccount+"'); cysdiv.setAttribute('author','"+vidau+"');  cysdiv.setAttribute('title','"+vidtitle+"'); cysdiv.setAttribute('duration','"+cysOverlay.vid.duration+"'); cysdiv.setAttribute('published','"+cysOverlay.vid.published+"'); cysdiv.innerHTML='"+viddetail+"';";
                            cysCommons.executeInSandbox(scrp);
                        }
                        //cysOverlay.vid.detail = 
                        //cysCommons.cysDump("****************category:"+category+"::details:"+cysOverlay.vid.detail);
                    }
                }catch(ex){
                    cysCommons.cysDump("error in getvideodate:"+ex);
                }
            },
            updateEmbeddedVideoTitle: function(videoID){
                /*update embedded video title if menu is open and it is showing "..." yet*/
                try{
                    if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                        var counter = 0,menu=cysOverlay.menu;
                        if(menu && menu.state =='open'){
                            var vidcount = cysOverlay.getEmbeddedVideoSize();
                            for(var imenu in menu){
                                if(counter > vidcount){
                                    break;
                                }
                                var k = (counter*2);
                                var t = menu.childNodes[k];
                                if(typeof (t) != 'undefined' && t.lastChild){
                                    var lastChild = t.lastChild;
                                    if(lastChild.getAttribute('statustext') == videoID){
                                        lastChild.setAttribute("tooltiptext",cysOverlay.currentEmbeddedVidList[videoID].title);
                                        lastChild.setAttribute('value', cysOverlay.currentEmbeddedVidList[videoID].title);
                                    }
                                }
                                counter++;
                            }
                        }
                    }  
                }catch(ex){
                    cysCommons.cysDump("error in updateEmbeddedVideoTitle:"+ex);
                }
            },
            ajaxupdateSignature: function(data){
                //cysCommons.cysDump('ajaxupdateSignature');
                var scriptURL=null;
                if((cysOverlay.isSignatureUpdatingStarted === 0 || typeof (cysOverlay.decodeArray) =='undefined' || cysOverlay.decodeArray===null || cysOverlay.decodeArray==="") && cysOverlay.signatureFunctionCalled===0){//&& cysOverlay.decodeArray==""
                  //  cysCommons.cysDump('ajaxupdateSignature: finding signature');
                    cysOverlay.updateSignature(scriptURL,data);
                }
            },
            updateSignature: function(scriptURL,text){
                try{
                    var doc = cysCommons.getDoc();
                    cysOverlay.signatureFunctionCalled=1;
                    
                    if (scriptURL==null && text !="") {
                        scriptURL=cysOverlay.findMatch(text, /\"js\":\s*\"([^\"]+)\"/);
                        scriptURL=scriptURL.replace(/\\/g,'');
                    }
                    //cysCommons.cysDump("updateSignature:scriptURL"+scriptURL);
                    if (scriptURL) {
                        if (scriptURL.indexOf('//')==0) {
                          var protocol=(doc.location.protocol=='http:')?'http:':'https:';
                          scriptURL=protocol+scriptURL;
                        }
                        cysOverlay.fetchSignatureScript(scriptURL,false);
                    }  
                   // cysCommons.cysDump("updateSignature:scriptURL with protocol:"+scriptURL);
                }catch(ex){
                    cysCommons.cysDump("error in updateSignature:"+ex)
                }
                
            },
            onContentLoad: function (x) {
                //cysCommons.cysDump('\n\n****contentLoad S0' + ((x) ? ' started by init!' : ''));
                
                if (cysOverlay.vid && ((cysOverlay.vid.youTubeFormats && cysOverlay.vid.youTubeFormats.length > 0) || cysOverlay.vid.rtmpe)) {
                    //resolving the issue of constant throbber display when video list is not loaded and icon is clicked
                    cysOverlay.menuReload();
                    return;
                }
                //cysCommons.cysDump('contentLoad S1');
                try{
                    var doc = cysCommons.getDoc(), loc = doc.location, btn = cysOverlay.button, videoID, vtitle,scriptURL=null,text;
                    if(doc != null){
                        text = doc.body.innerHTML;
                    }
                }catch(ex){
                    if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                        var btn = cysOverlay.button;
                        cysOverlay.vid = null;
                        if (btn && cysOverlay.getEmbeddedVideoSize()==0) {
                            btn.disabled = true;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        } else {
                            cysCommons.cysDump('1) contentLoad error - CYS button not found!');
                        }
                        return;
                    }
                    cysCommons.cysDump('error in getdoc:'+ex);
                }
                //cysCommons.cysDump("1) decodeArray:"+cysOverlay.decodeArray+"::isSignatureUpdatingStarted:"+cysOverlay.isSignatureUpdatingStarted+"::cysOverlay.signatureFunctionCalled:"+cysOverlay.signatureFunctionCalled);
                if (btn) cysOverlay.showDTA();
                if (loc && btn && cysCommons.isYouTubeUrl(loc.href, "watch")) {
                    cysOverlay.decodeArray=cysCommons.cysPrefs.getCharPref("signature.decryption.code");
                    if(cysOverlay.isSignatureUpdatingStarted === 0 && (typeof (cysOverlay.decodeArray) =='undefined' || cysOverlay.decodeArray===null || cysOverlay.decodeArray==="") && cysOverlay.signatureFunctionCalled===0){//&& cysOverlay.decodeArray==""
                        cysCommons.cysDump('finding signature');
                        cysOverlay.updateSignature(scriptURL,text);
                    }
                    videoID = cysOverlay.getYouTubeVideoID(doc);
                    if (videoID instanceof Array) {
                        vtitle = videoID[1];
                        videoID = videoID[0];
                    }
                    //cysCommons.cysDump('*** videoID: '+videoID+'\n');
                    if (videoID) {
                        btn.disabled = false;
                        btn.hidden = false; // en/disable un/hide button  
                        
                        if (cysOverlay.idlist[videoID]) {         // if ID saved, retrieve data without rescanning page
                            //cysCommons.cysDump('contentLoad S2');
                            cysOverlay.vid = cysOverlay.idlist[videoID];
                            if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 2) {
                                //cysCommons.cysDump('contentLoad S3');
                                var t = cysOverlay.vid; //cysCommons.cysDump('\n- Cached video data -\nid: '+t.id+'\nref: '+t.referer+'\nptk: '+t.ptk+'\nage: '+t.age+'\nformats: '+Object.keys(t.youTubeFormats).length+'\n\n');
                                if (typeof cysOverlay.vid.age == 'undefined')
                                    cysOverlay.vid.age = '';
                            } else if (cysOverlay.vid.rtmpe) {
                                //cysCommons.cysDump('contentLoad S4');
                                btn.disabled = true;
                                btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                //cysCommons.cysDump('contentLoad S2b - video in data cache has RTMPE streams only, no downloadable video link found!');
                            } else { 
                                cysOverlay.vid.youTubeFormats = null;
                                delete cysOverlay.vid.running;
                                cysOverlay.updateVideosList(doc);
                            }
                        } else {
                            cysOverlay.idlist[videoID] = {};
                            cysOverlay.vid = cysOverlay.idlist[videoID];
                            cysOverlay.vid.id = videoID;
                            cysOverlay.vid.title = vtitle;
                            cysOverlay.vid.timestamp = cysCommons.cTime();
                            cysOverlay.vid.age = cysOverlay.vid.ptk = cysOverlay.vid.referer = '';
                            cysOverlay.vid.ccount = -1;
                            cysOverlay.vid.filesizes = {};
                            cysOverlay.vid.resolutions = {};
                            cysOverlay.vid.bitrates = {};
                            cysOverlay.vid.youTubeFormats = null;
                            cysOverlay.vid.detail = null;
                            cysOverlay.vid.duration = null;
                            cysOverlay.vid.author = null;
                            cysOverlay.vid.published = null;
                            cysOverlay.vid.html = null;
                            //cysOverlay.vid.stathtml = null;
                            //cysCommons.cysDump("youtube gdata call before getVideoDate:"+'https://gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2');
                            //https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=AIzaSyBddgv6m3uvXYVQ3Ix_FByPXnJwu5iElBc&part=snippet,contentDetails,statistics,status
                            //cysCommons.getAJAX('https://gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2', cysOverlay.getVideoDate); // get video API feed
                            cysCommons.getAJAX('https://www.googleapis.com/youtube/v3/videos?id=' + videoID + '&key='+cysOverlay.youtubekey+'&part=snippet,contentDetails,statistics,status', cysOverlay.getVideoDate); // new url to get video infomration
                            cysOverlay.updateVideosList(doc);
                        }
                    } else {
                        cysOverlay.vid = null;
                        btn.disabled = true;
                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        return;
                    }
                } else if (loc && btn && loc.href == 'about:customizing') {
                    cysOverlay.vid = null;
                    btn.disabled = true;
                    btn.hidden = false;
                } else {
                    var size = 0; 
                    if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                        for(var key in cysOverlay.currentEmbeddedVidList){
                            videoID = key;
                            size++;
                        }
                    }
                    
                    if(size == 0) {
                        cysOverlay.vid = null;
                        if (btn) {
                            btn.disabled = true;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        } else {
                            //cysCommons.cysDump('2) contentLoad error - CYS button not found!');
                        }
                    }else if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && size>0 && ((cysOverlay.vid != null && cysOverlay.vid.running != 1 ) || cysOverlay.vid == null) ){
                        try{
                            for(var videoID in cysOverlay.currentEmbeddedVidList){
                                if (cysOverlay.idlist[videoID]) {         // if ID saved, retrieve data without rescanning page
                                    cysOverlay.menuReload();
                                    cysOverlay.vid = cysOverlay.idlist[videoID];
                                    if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 0) {
                                        //var t = cysOverlay.vid; //cysCommons.cysDump('\n- Cached video data -\nid: '+t.id+'\nref: '+t.referer+'\nptk: '+t.ptk+'\nage: '+t.age+'\nformats: '+Object.keys(t.youTubeFormats).length+'\n\n');
                                        if (typeof cysOverlay.vid.age == 'undefined') cysOverlay.vid.age = '';
                                    } else if (cysOverlay.vid.rtmpe) {
                                        btn.disabled = true;
                                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                        //cysCommons.cysDump('contentLoad S2b - video in data cache has RTMPE streams only, no downloadable video link found!');
                                    }else{
                                        if(cysOverlay.vid != null) cysOverlay.vid.youTubeFormats = null;
                                        //cysCommons.getAJAX('https://www.youtube.com/watch?v=' + videoID + '', cysOverlay.setVideoConfig,"GET",null,videoID); // get video API feed
                                        cysOverlay.setVideoConfig(videoID);
                                    }
                                }else{
                                    if(cysOverlay.vid != null) cysOverlay.vid.youTubeFormats = null;
                                    //cysCommons.getAJAX('https://www.youtube.com/watch?v=' + videoID + '', cysOverlay.setVideoConfig,"GET",null,videoID); // get video API feed
                                    cysOverlay.setVideoConfig(videoID);
                                }
                            }
                        }catch(ex){
                            cysCommons.cysDump("error in for loop:"+ex);
                        }
                    }else if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                            if(cysOverlay.vid != null) cysOverlay.vid.youTubeFormats = null;
                            //cysCommons.getAJAX('https://www.youtube.com/watch?v=' + videoID + '', cysOverlay.setVideoConfig,"GET",null,videoID); // get video API feed
                            if(videoID != "") cysOverlay.setVideoConfig(videoID);
                    }
                }
            },
            cleanupCache: function () {
                // idlist cache cleanup
                if (Math.random() > 0.2)
                    return;
                var cachesize = Object.keys(cysOverlay.idlist).length, o = cachesize, r = [], it, id, br, uris = '', i, k = String(cysCommons.cTime()).length;
                if (cachesize > 100) {
                    for (it in cysOverlay.idlist) {
                        /*cysCommons.cysDump('\nit: '+it);*/r.push(cysOverlay.idlist[it].timestamp + '-' + it);
                    }
                    r.sort();
                    for (i = 0; i < gBrowser.browsers.length; i++) {
                        br = gBrowser.getBrowserAtIndex(i);
                        uris += br.currentURI.spec;
                    }
                    i = 0;
                    while (cachesize > 20 && i < r.length) {
                        id = r[i].substr(k + 1);
                        if (uris.indexOf(id) == -1 && id != cysOverlay.vid.id) {
                            delete cysOverlay.idlist[id];
                            delete cysOverlay.currentEmbeddedVidList[id];
                            delete cysOverlay.embeddedVideoIdList[id];
                            cachesize--;
                        } //else{cysCommons.cysDump('\nid: '+id);}
                        i++;
                    } //cysCommons.cysDump('\n*** Cache clean-up ***\nStarting cachesize: '+o+'\nEnding cachesize: '+cachesize+'\n');
                }
            },
            onLoad: function () {
                try {
                    Cc["@completeyoutubesaver.com/completeyoutubesaver-processor;1"].getService();
                } catch (e) {
                    cysCommons.cysDump("error in loading processor");
                }
                gBrowser.addProgressListener(cysOverlay);
            },
            init: function () {
                cysCommons.cysDump('init S0');
                if (!gNavToolbox || !gNavToolbox.palette) {  // slow CPU work-around
                    setTimeout(cysOverlay.init, 1000);
                    return;
                }
                
                cysCommons.getConverterPath();  // is conversion installed properly?
                cysOverlay.defaultdir = cysCommons.getDefaultDir("Complete YouTube Saver", true);
                var oldVersion = cysCommons.cysPrefs.getCharPref("version");
                var newVersion = cysCommons.getVersion();
                if(cysCommons.cysPrefs.getCharPref("subtitle.language")=="en-GB"){
                    cysCommons.cysPrefs.setCharPref("subtitle.language","en");
                }
                cysCommons.cysDump('init S1');
                if (oldVersion != newVersion) {
                    //cysCommons.cysDump('\nOld version: ' + oldVersion + '\nNew version: ' + newVersion);
                    cysOverlay.cysButtonShow();
                    if (oldVersion) {
                        cysCommons.cysDump('\n1) Old version: ' + oldVersion + '\nNew version: ' + newVersion);
                        cysCommons.openUrl(cysCommons.getCysString('homepage') + cysCommons.getCysString('updatedpage').replace('___', cysCommons.getVersion().replace(/\./g, '')));
                    } else {
//                        cysCommons.cysDump('\n2) Old version: ' + oldVersion + '\nNew version: ' + newVersion);
                        cysCommons.openUrl(cysCommons.getCysString('homepage'));
                    }
                    cysCommons.cysPrefs.setCharPref("version", newVersion);
                    var opref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("cys.");
                    var npref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.cys.");
                    try {
                        oldVersion = opref.getCharPref('version');
                    } catch (e) {
                    }
                    if (oldVersion) {                                        // migrate prefs saved before v. 2.3.3
                        //cysCommons.cysDump ('\noldVersion: ' + oldVersion + ' - migrating prefs...\n');
                        var pi = ['download.quality.highest', 'menu.dropdown.left.click.save.as', 'button.left.click.open', 'arrow.left.click.open', 'download.comments.all', 'download.comments.numpages', 'download.comments.threads', 'folders.custom'];
                        var pb1 = ['icon.show.always', 'download.statistic', 'download.subtitles','download.comments', 'download.details.hide'];
                        var pb2 = ['hover', 'fmt.col.enabled', 'type.col.enabled', 'typename.col.enabled', 'resolution.col.enabled', 'sound.col.enabled', 'p.col.enabled'];
                        for each (var s in pi) {
                            try {
                                npref.setIntPref(s, opref.getIntPref(s));
                            } catch (e) {
                            }
                        }
                        for each (var s in pb1) {
                            try {
                                npref.setBoolPref(s, opref.getBoolPref(s));
                            } catch (e) {
                            }
                        }
                        for each (var s in pb2) {
                            try {
                                npref.setBoolPref('menu.dropdown.' + s, opref.getBoolPref('menu.dropdown.' + s));
                            } catch (e) {
                            }
                        }
                        opref.deleteBranch('');
                    }
                    var i, pb = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);      // delete pre- v.4 prefs
                    try {
                        pb.getBranch('extensions.cys.download.mp3').deleteBranch('');
                    } catch (e) {
                    }
                    try {
                        pb.getBranch('extensions.cys.menu.dropdown.mode').deleteBranch('');
                    } catch (e) {
                    }
                    try {
                        pb.getBranch('extensions.cys.menu.dropdown.right.click').deleteBranch('');
                    } catch (e) {
                    }
                    var fprefs = ['Fmt_46', 'Fmt_100', 'Fmt_101', 'Fmt_102', 'Fmt_82', 'Fmt_83', 'Fmt_84', 'Fmt_85', 'Fmt_45', 'Fmt_44', 'Fmt_43', 'Fmt_38', 'Fmt_37', 'Fmt_22', 'Fmt_35', 'Fmt_18', 'Fmt_34', 'Fmt_6', 'Fmt_5', 'Fmt_36', 'Fmt_17', 'Fmt_13', 'Cnv_1', 'Cnv_2', 'Cnv_3', 'Cnv_11', 'Cnv_12', 'Cnv_13', 'Cnv_14', 'Cnv_15'];
                    for (i = 0; i < fprefs.length; i++) {
                        try {
                            pb.getBranch('extensions.cys.menu.dropdown.' + fprefs[i] + '.row.enabled').deleteBranch('');
                        } catch (e) {
                        }
                    }
                    try {
                        pb.getBranch('extensions.cys.first.time').deleteBranch('');
                    } catch (e) {
                    }             // delete pre-4.2.7 pref
                }
                cysOverlay.button = document.getElementById('cys-button');
                cysOverlay.menu = document.getElementById("cys-dropdown-menu");
                cysOverlay.autopopup = cysCommons.cysPrefs.getBoolPref("menu.dropdown.hover");
                if (cysOverlay.button != null) {
                    cysOverlay.onLoad();  //only register listener + service if UI is OK!
                    if (!cysCommons.cysPrefs.getBoolPref("icon.show.always"))
                        cysOverlay.button.hidden = true;
                    cysOverlay.showDTA();
                    //cysCommons.cysDump('init S2');
                    //cysCommons.setdef();
                    if (!cysCommons.cysPrefs.getBoolPref('menu.dropdown.dash480p.hqaudio')) {
                        var r = cysCommons.dashVideo;
                        r[135] = 1;
                        r[244] = 4;
                        r[245] = 4;
                        r[246] = 4;
                    }
                    cysOverlay.setupMenuCols();
                    cysOverlay.onContentLoad(1);
                } else {
                    cysCommons.cysDump('init error - CYS button not found!');
                }
                
                /*try{
                    cysOverlay.observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
                    cysOverlay.observerService.addObserver(cysOverlay, "http-on-modify-request", false);
                }catch(ex){
                    cysCommons.cysDump("error in adding observer:"+ex);
                }*/
            },
            uninit: function(){
                cysOverlay.observerService.removeObserver(cysOverlay, "http-on-modify-request");
            },
            cysButtonShow: function () {
                try {
                    var id = "cys-toolbaritem", smallicons = gNavToolbox.getAttribute('iconsize') == 'small', hiddenbutton;
                    for each (var el in gNavToolbox.palette.childNodes) {
                        if (el.id == id) {
                            var urlBarElem = document.getElementById("urlbar-container"), navBar = document.getElementById("nav-bar"), cont, navSet, sb;
                            if (!urlBarElem)
                                urlBarElem = document.getElementById("nav-bar-inner");       // Sea-Monkey
                            if (urlBarElem && navBar) {
                                cont = urlBarElem.parentNode;
                                navSet = navBar.currentSet.split(",");
                                if (navSet.indexOf(id) == -1) {
                                    if (!document.getElementById(id))
                                        cont.appendChild(el);   // Mac work-around
                                    var sb = document.getElementById('urlbar-search-splitter');
                                    if (smallicons || urlBarElem.previousSibling.id != 'unified-back-forward-button' || !sb) {
                                        cont.insertItem(id, urlBarElem);
                                    } else {
                                        cont.insertItem(id, sb);                               // respecting FF forward-button auto-hiding, pre-FF29, doh.....
                                    }
                                    navBar.setAttribute("currentset", navBar.currentSet);
                                    document.persist("nav-bar", "currentset");
                                    //navbar.setAttribute ("dd-triggerrepaint", 0 );
                                }
                            }
                            break;
                        }
                    }
                } catch (ex) {
                    cysCommons.cysDump(ex);
                }
            },
            updateButtonTooltip: function () {
                var t = '', s;
                for each (s in cysCommons.conversions) {
                    if (!s)
                        continue;
                    t += (s.path.replace(/\.tmp$/, '(.tmp)') + '\n');
                }
                if (t)
                    t = cysCommons.getCysString('ffmpegjobs') + t;
                t = cysCommons.getCysString('name') + t;
                cysOverlay.button.tooltipText = t;
            },
            showDTA: function () {
                var dtatgl = document.getElementById("cys-dta-toggle");
                if (dtatgl) {
                    if (cysCommons.DTAstatus()) {
                        dtatgl.disabled = false;
                        dtatgl.hidden = false;
                        document.getElementById("cys-dta-toggle-sep").hidden = false;
                        dtatgl.setAttribute('checked', cysCommons.cysPrefs.getBoolPref("download.dta"));
                    } else {
                        dtatgl.disabled = true;
                        dtatgl.hidden = true;
                        document.getElementById("cys-dta-toggle-sep").hidden = true;
                    }
                }
            },
            openOptions: function () {
                var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch('browser.preferences.'), instant, o = {'v': -1}, i;
                instant = prefs.getBoolPref('instantApply');
                if (instant)
                    prefs.setBoolPref('instantApply', false);
                openDialog("chrome://completeyoutubesaver/content/preferences.xul", "", "chrome,titlebar,toolbar,centerscreen,modal,dialog=no,resizable", o);
                if (instant)
                    prefs.setBoolPref('instantApply', true); //cysCommons.cysDump('\n\no: '+o+' - o.v :'+o.v);
                if (o.v != 0) {
                    cysCommons.getConverterPath();
                    cysOverlay.defaultdir = cysCommons.getDefaultDir("Complete YouTube Saver", true);
                    cysCommons.setIcon();
                    if (cysOverlay.vid) {
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.vid = null;
                    }
                    for (i in cysOverlay.idlist) {
                        cysOverlay.idlist[i] = 'a';
                        delete cysOverlay.idlist[i];
                    }
                    delete cysOverlay.idlist;
                    cysOverlay.idlist = {};
                    cysOverlay.onContentLoad();
                }
            },
            openAbout: function ()
            {     // Firefox 4.0 implements new AddonManager - module is not available in Firefox 3.6 and earlier
                try {
                    Components.utils.import("resource://gre/modules/AddonManager.jsm");
                } catch (err) {
                }
                if (AddonManager) {
                    AddonManager.getAddonByID("{AF445D67-154C-4c69-A17B-7F392BCC36A3}", function (addon) {
                        openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", addon);
                    });
                } else {
                    var extensionManager = Cc[ "@mozilla.org/extensions/manager;1" ].getService(Ci.nsIExtensionManager);
                    openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", "urn:mozilla:item:{AF445D67-154C-4c69-A17B-7F392BCC36A3}", extensionManager.datasource);
                }
            },
            openFFmpegDialog: function () {
                if (cysCommons.canConvert)
                    return 1;
                var last = cysCommons.cysPrefs.getIntPref('ffmpeg.lastalert');
                if (last == -1)
                    return 1;
                var t = new Date();
                t = t.getDate();
                if (last == t)
                    return 1;
                var o = {'v': 0};
                openDialog("chrome://completeyoutubesaver/content/ffmpeg.xul", "", "chrome,titlebar,centerscreen,modal,dialog=yes,", o);
                if (o.v == 2) {
                    setTimeout(function () {
                        cysCommons.openUrl(cysCommons.getCysString('homepage', null) + cysCommons.getCysString('converterpage', null));
                    }, 500);
                } else if (o.v === true) {
                    t = -1;
                 //   cysCommons.cysDump('\no.v: ' + o.v);
                }
                cysCommons.cysPrefs.setIntPref('ffmpeg.lastalert', t);
                return null;
            },
            dtaToggle: function (e) {
                var dtatgl = document.getElementById("cys-dta-toggle");
                if (dtatgl && !dtatgl.disabled)
                    cysCommons.cysPrefs.setBoolPref('download.dta', dtatgl.hasAttribute('checked'));
            },
            setupMenuCols: function () {
                var r = Math.round, f, sz = getComputedStyle(document.getElementById('menu_File') || document.getElementById('file-menu')).getPropertyValue('font-size');
                sz = Number(sz.substr(0, sz.length - 2));
                f = (sz / 12) || 1; //cysCommons.cysDump('\nmenu font size: '+sz+'  =>  menu scale factor: '+r(f*100)/100+'\n');
                cysOverlay.colSizes = [r(f * 45), r(f * 40), r(f * 75), r(f * 45), r(f * 60), r(f * 65), r(f * 45), r(f * 6)];
            },
            setVideoConfig: function(videoID){
                try{
                    var tvideoID=null;
                    for(var key in cysOverlay.currentEmbeddedVidList){
                        tvideoID = key;
                        if(cysOverlay.idlist[tvideoID]){
                            cysOverlay.vid = cysOverlay.idlist[tvideoID];
                            if(cysOverlay.vid.running == 1){
                                //cysCommons.cysDump("setVideoConfig: is it running:"+videoID);
                                return;
                            }
                        }
                    }
                    //cysCommons.cysDump("setVideoConfig: in here ");
                    var btn = cysOverlay.button;
                    if (videoID && btn) {
                        //cysCommons.cysDump("setVideoConfig: if");
                        
                        cysOverlay.idlist[videoID] = {};
                        cysOverlay.vid = cysOverlay.idlist[videoID];
                        cysOverlay.vid.id = videoID;
                        cysOverlay.vid.title = null;
                        cysOverlay.vid.timestamp = cysCommons.cTime();
                        cysOverlay.vid.age = cysOverlay.vid.ptk = cysOverlay.vid.referer = '';
                        cysOverlay.vid.ccount = -1;
                        cysOverlay.vid.filesizes = {};
                        cysOverlay.vid.resolutions = {};
                        cysOverlay.vid.bitrates = {};
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.vid.detail = null;
                        cysOverlay.vid.duration = null;
                        cysOverlay.vid.author = null;
                        cysOverlay.vid.published = null;
                        cysOverlay.vid.html = null;
                        cysOverlay.vid.running = 1;
                        cysOverlay.vid.af = null;
                        cysOverlay.vid.fmap = null;
                        if(btn){
                            btn.disabled = false;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        }
                        if(!cysOverlay.availableInHTML(videoID)){
                            //cysCommons.cysDump("setVideoConfig: if: calling getVideoDate");
                            //cysCommons.getAJAX('https://gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2', cysOverlay.getVideoDate,'GET',false,videoID); // get video API feed
                            cysCommons.getAJAX('https://www.googleapis.com/youtube/v3/videos?id=' + videoID + '&key='+cysOverlay.youtubekey+'&part=snippet,contentDetails,statistics,status', cysOverlay.getVideoDate,'GET',false,videoID); // get video API feed
                            
                            //cysCommons.cysDump("setVideoConfig: if: calling processAJAX");
                            cysCommons.getAJAX('http://www.youtube.com/watch?v=' + videoID + '&spf=navigate', cysOverlay.processAJAX);
                        }
                    } else {
                        //cysCommons.cysDump("setVideoConfig: else");
                        cysOverlay.vid = null;
                        btn.disabled = true;
                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        return;
                    }
                }catch(ex){
                    cysCommons.cysDump("error in setVideoConfig:"+ex);
                }
            },
            observe: function(aSubject, aTopic, aData){
                if (aTopic == 'http-on-modify-request'){
                    /*try{
                        if(cysCommons.executeInSandbox("document") && cysCommons.executeInSandbox("document.body") ){
                            if(cysCommons.executeInSandbox("document.getElementById('cys_currenturl');") == null){
                                var scrp="var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cys_currenturl'); divtoappend.setAttribute('id','cys_currenturl'); divtoappend.setAttribute('value','"+cysOverlay.currentURL+"'); document.body.appendChild(divtoappend);";
                                cysCommons.executeInSandbox(scrp);
                            }else{
                                cysOverlay.currentURL = cysCommons.executeInSandbox("document.getElementById('cys_currenturl').getAttribute('value');");
                            }
                            for(var vidid in cysOverlay.embeddedVideoIdList){
                                if(cysOverlay.idlist[vidid] != null){
                                    var j=0;
                                    for(var inurl in cysOverlay.embeddedVideoIdList[vidid].url){
                                        //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList for:"+inurl);
                                        if(cysOverlay.embeddedVideoIdList[vidid].url[inurl] == cysOverlay.currentURL){
                                            //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList for if:"+path+":::cysOverlay.embeddedVideoIdList[vidid].url[inurl]"+cysOverlay.embeddedVideoIdList[vidid].url[inurl]);
                                            cysOverlay.currentEmbeddedVidList[vidid]={};
                                            cysOverlay.currentEmbeddedVidList[vidid].title = cysOverlay.embeddedVideoIdList[vidid].title;
                                            cysOverlay.currentEmbeddedVidList[vidid].url={};
                                            cysOverlay.currentEmbeddedVidList[vidid].url[0] = cysOverlay.currentURL;
                                            
                                            //cysOverlay.vid = cysOverlay.idlist[vidid];
                                            if(cysCommons.executeInSandbox("document.getElementById('cys_"+cysOverlay.idlist[vidid].id+"');") == null){
                                                //cysCommons.cysDump("in sandbox onLocationChange:");
                                                var scrp="var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cysembeddedvideoid'); divtoappend.setAttribute('id','cys_"+vidid+"'); divtoappend.setAttribute('value','"+vidid+"'); document.body.appendChild(divtoappend);";
                                                cysCommons.executeInSandbox(scrp);
                                                scrp = "var cysdiv = document.getElementById('cys_"+cysOverlay.idlist[vidid].id+"'); cysdiv.setAttribute('ptk','"+cysOverlay.idlist[vidid].ptk+"'); cysdiv.setAttribute('ref','"+cysOverlay.idlist[vidid].ref+"'); cysdiv.setAttribute('dm','"+cysOverlay.idlist[vidid].dm+"'); cysdiv.setAttribute('ttsurl','"+cysOverlay.idlist[vidid].ttsurl+"'); cysdiv.setAttribute('cc_asr','"+cysOverlay.idlist[vidid].cc_asr+"'); cysdiv.setAttribute('af','"+cysOverlay.idlist[vidid].af+"'); cysdiv.setAttribute('fmap','"+cysOverlay.idlist[vidid].fmap+"');";
                                                cysCommons.executeInSandbox(scrp);
                                                var vidau="",vidtitle="",viddetail="";
                                                if(cysOverlay.idlist[vidid].author !=null){
                                                    vidau=cysOverlay.idlist[vidid].author.replace(/'/g, "\\'");
                                                }
                                                if(cysOverlay.idlist[vidid].title != null){
                                                    vidtitle = cysOverlay.idlist[vidid].title.replace(/'/g, "\\'");
                                                }
                                                if(cysOverlay.idlist[vidid].detail !=null){
                                                    viddetail = cysOverlay.idlist[vidid].detail.replace(/'/g, "\\'");
                                                }
                                                scrp = "var cysdiv = document.getElementById('cys_"+cysOverlay.idlist[vidid].id+"'); cysdiv.setAttribute('age','"+cysOverlay.idlist[vidid].age+"'); cysdiv.setAttribute('ccount','"+cysOverlay.idlist[vidid].ccount+"'); cysdiv.setAttribute('author','"+vidau+"');  cysdiv.setAttribute('title','"+vidtitle+"'); cysdiv.setAttribute('duration','"+cysOverlay.idlist[vidid].duration+"'); cysdiv.setAttribute('published','"+cysOverlay.idlist[vidid].published+"'); cysdiv.innerHTML='"+viddetail+"';";
                                                cysCommons.executeInSandbox(scrp);
                                            }
                                            
                                        }
                                        j++;
                                    }
                                    
                                }
                            }
                        }
                        var url;
                        aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
                        url = aSubject.URI.spec;
                        //cysCommons.cysDump("url:"+url);
                        var matches = url.match(/:\/\/(?:www\.)?(?:youtube|youtube-nocookie)\.com\/v\/([^\?&]+)/i);
                        if( !matches ){
                            matches = url.match(/:\/\/(?:www\.)?(?:youtube|youtube-nocookie)\.com\/embed\/([^\?&]+)/i);
                        }
                        if( !matches ){
                            return false;
                        }
                        //cysCommons.cysDump("matches[1]:"+matches+"::url:"+url);
                        var videoID=cysCommons.getVideoIdFromEmbeddedURL(matches[1],url);
                        cysCommons.cysDump("observed videoID:"+videoID+":: matches[1]:"+matches[1]);
                        
                        var j=0;
                        
                        if(videoID !=null && videoID != 'videoseries' && typeof (cysOverlay.embeddedVideoIdList[videoID]) != 'undefined'){
                            for(var vidid in cysOverlay.embeddedVideoIdList){
                                if(vidid==videoID){
                                    for(var inurl in cysOverlay.embeddedVideoIdList[videoID].url){
                                        if(cysOverlay.embeddedVideoIdList[videoID].url[inurl] != cysOverlay.currentURL){
                                            var incr = parseInt(inurl)+1;
                                            cysOverlay.embeddedVideoIdList[videoID].url[incr]=cysOverlay.currentURL;
                                            cysOverlay.currentEmbeddedVidList[videoID]={};
                                            cysOverlay.currentEmbeddedVidList[videoID].title=cysOverlay.embeddedVideoIdList[videoID].title;
                                            cysOverlay.currentEmbeddedVidList[videoID].url={};
                                            cysOverlay.currentEmbeddedVidList[videoID].url[0]=cysOverlay.currentURL;
                                            var btn = cysOverlay.button;
                                            if(cysOverlay.vid && cysOverlay.vid.running != 1 && cysOverlay.idlist[videoID]){
                                                cysOverlay.vid = cysOverlay.idlist[videoID];
                                                if(btn){
                                                    btn.disabled = false;
                                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                                }
                                                break;
                                            }else if(cysOverlay.vid==null && cysOverlay.idlist[videoID]){
                                                cysOverlay.vid = cysOverlay.idlist[videoID];
                                                if(btn){
                                                    btn.disabled = false;
                                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                                }
                                                break;
                                            }
                                        }
                                        j++;
                                    }
                                }
                            }
                            
                        }
                        if(videoID !=null && videoID != 'videoseries' && typeof (cysOverlay.embeddedVideoIdList[videoID]) == 'undefined'){
                            //cysCommons.cysDump("1) in observe video");
                            cysCommons.cysDump(" in observe after matching url:"+videoID);
                            
                            cysOverlay.embeddedVideoIdList[videoID] = {};
                            cysOverlay.embeddedVideoIdList[videoID].title = ". . .";
                            cysOverlay.embeddedVideoIdList[videoID].url={};
                            cysOverlay.embeddedVideoIdList[videoID].url[0] = cysOverlay.currentURL;
                            cysOverlay.currentEmbeddedVidList[videoID]={};
                            cysOverlay.currentEmbeddedVidList[videoID].title=". . .";
                            cysOverlay.currentEmbeddedVidList[videoID].url={};
                            cysOverlay.currentEmbeddedVidList[videoID].url[0]=cysOverlay.currentURL;
                            var scrp="var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cysembeddedvideoid'); divtoappend.setAttribute('id','cys_"+videoID+"'); divtoappend.setAttribute('value','"+videoID+"'); document.body.appendChild(divtoappend);";
                            cysCommons.executeInSandbox(scrp);
                            if(cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")){
                                //cysCommons.cysDump("detect.embedded.youtube:true");
                                cysOverlay.setVideoConfig(videoID);
                            }
                        }
                    }catch(ex){
                        cysCommons.cysDump("error in observer:"+ex);
                    }*/
                } 
            },
            
            availableInHTML: function(videoID){
                if(!videoID){
                    return false;
                }
                var scrp="";
                scrp = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"');");
                if(scrp==null){
                    return false;
                }
                cysOverlay.vid.ccount = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('ccount');");
                if(cysOverlay.vid.ccount==null){
                    return false;
                }
                cysOverlay.vid.ptk = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('ptk');");
                if(cysOverlay.vid.ptk==null){
                    return false;
                }
                cysOverlay.vid.age = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('age');");
                cysOverlay.vid.duration = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('duration');");
                cysOverlay.vid.published = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('published');");
                cysOverlay.vid.detail = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').innerHTML;");
                cysOverlay.vid.ref = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('ref');");
                cysOverlay.vid.dm = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('dm');");
                cysOverlay.vid.ttsurl = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('ttsurl');");
                cysOverlay.vid.cc_asr = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('cc_asr');");
                cysOverlay.vid.af = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('af');");
                cysOverlay.vid.fmap = cysCommons.executeInSandbox("document.getElementById('cys_"+videoID+"').getAttribute('fmap');");
                cysOverlay.fillVideoArray(cysOverlay.vid.fmap,cysOverlay.vid.af);
                return true;
            }

        };
    setTimeout(cysOverlay.init, 1000);
    //window.addEventListener("load", function() { cysOverlay.init(); }, false);
    //window.addEventListener("unload", function() { cysOverlay.uninit(); }, false);
    
} catch (ex) {
    cysCommons.cysDump(ex);
}
