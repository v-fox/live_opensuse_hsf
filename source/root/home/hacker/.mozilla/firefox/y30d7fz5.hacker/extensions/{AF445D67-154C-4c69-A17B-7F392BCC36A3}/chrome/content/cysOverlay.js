/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
if ('undefined' === typeof Cc)
    var Cc = Components.classes;
if ('undefined' === typeof Ci)
    var Ci = Components.interfaces;
try {
    var openedFolder = 0;
    if ("undefined" === typeof cysOverlay)
        var cysOverlay = {
            idlist: {},
            youtubekey: 'AIzaSyBddgv6m3uvXYVQ3Ix_FByPXnJwu5iElBc',
            vid: null,
            js1: null,
            js2: null,
            defaultdir: null,
            lastprojectdir: null,
            filesizes: {},
            decodeArray: null,
            isSignatureUpdatingStarted: 0,
            getSubtitleCounter: {},
            signatureError: 0,
            signatureFunctionCalled: 0,
            signatureCode: null,
            openedStatisticsDiv: 0,
            observerService: null,
            embeddedVideoIdList: {},
            currentEmbeddedVidList: {},
            currentURL: null,
            arrayVideoParams: {},
            loaderTimeout: null,
            videoListIsActual: false,
            cyscommentwrite: function() {
                var fp, rv, ext = "html",
                    fn = "Main Page.html";
                var mainpagepath = cysCommons.getFile([cysOverlay.lastprojectdir, fn]);
                var strbd = cysCommons.readFileToString(mainpagepath);
                console.log(strbd.indexOf("<div id='comment-section-renderer-items'"));
                console.log(strbd.indexOf("<button class='cyscommnet"));
                var commentshtml = cysOverlay.vid.comment + ' '; //<script>(function() { setInterval(function(){ var m = document.getElementById("watch7-sidebar"); var n = document.getElementById("footer-container"); if(m && n) { m.setAttribute("style","margin-top:-"+(document.getElementById("watch7-main-container").clientHeight+430)+"px"); n.setAttribute("style","margin-top:"+(document.getElementById("watch7-main-container").clientHeight-1000)+"px");} },1000)})();</script>
                commentshtml = cysCommons.getImages(cysOverlay.lastprojectdir, commentshtml);
                strbd = strbd.replace(strbd.substring(strbd.indexOf("<div id='comment-section-renderer-items'"), strbd.indexOf("<button class='cyscommnet")), commentshtml);
                //strbd = strbd.replace(strbd.substring(strbd.indexOf('<div id="comment-section-renderer-items"')), commentshtml);

                fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);

                if (mainpagepath)
                    fp.displayDirectory = mainpagepath.parent;
                fp.defaultExtension = ext;
                fp.defaultString = fn;
                fp.appendFilter(ext, "*." + ext);
                fp.init(window, cysCommons.getCysString("right.click.2", null), Ci.nsIFilePicker.modeSave);
                rv = fp.show();
                if (rv === Ci.nsIFilePicker.returnOK || rv === Ci.nsIFilePicker.returnReplace) {
                    fn = fp.file;
                    mainpagepath = fn.path;
                    /*solve linux/mac os path issue*/
                    if (mainpagepath.indexOf("." + ext) === -1 && ext !== null && ext !== "") {
                        mainpagepath = mainpagepath + "." + ext;
                    }
                    //cysCommons.cysDump("mainpagepath:"+mainpagepath);
                    cysCommons.writeFile(fn, strbd, "UTF-8");
                }

            },
            contextClickSaveComment: function() {
                cysCommons.cysDump("contextClickSaveComment");
                cysOverlay.vid.commentcount = 0;
                var url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" + cysOverlay.vid.id + "&maxResults=100&textFormat=plainText&key=" + cysOverlay.youtubekey + "";
                cysOverlay.vid.comment = "";
                cysCommons.getAJAX(url, cysOverlay.saveallcomments);
                //var curObj = {};// {title: "Comments Saved",content:"Comments Saved to "+cysOverlay.lastprojectdir};
                //openDialog("chrome://completeyoutubesaver/content/commentsaved.xul", "", "chrome,centerscreen,modal", curObj);
                //alert("Comments Saved to "+cysOverlay.lastprojectdir);
            },
            saveallcomments: function(data) {
                cysCommons.cysDump("saveallcomments");

                var data = JSON.parse(data);

                try {
                    var total = parseInt(cysCommons.cysPrefs.getCharPref("save.comments.count"));
                    for (i = 0; i < data.pageInfo.totalResults; i++) {
                        if (cysOverlay.vid.commentcount <= total) {
                            cysOverlay.vid.commentcount = cysOverlay.vid.commentcount + 1;
                            if (typeof data.items[i].snippet.topLevelComment.snippet.authorDisplayName != 'undefined') {
                                var commentdata = data.items[i].snippet.topLevelComment.snippet.textDisplay;
                                commentdata = commentdata.split('"').join('&#034;');
                                cysOverlay.vid.comment += "<section class='comment-thread-renderer'><div class='comment-renderer' data-cid='" + data.items[i].id + "'><a href='" + data.items[i].snippet.topLevelComment.snippet.authorChannelUrl + "' class='yt-uix-sessionlink  g-hovercard' data-ytid='" + data.items[i].snippet.topLevelComment.snippet.authorChannelId.value + "'>  <span class='video-thumb comment-author-thumbnail yt-thumb yt-thumb-48'><span class='yt-thumb-square'><span class='yt-thumb-clip'><img width='48' height='48' role='img' tabindex='0' src='" + data.items[i].snippet.topLevelComment.snippet.authorProfileImageUrl + "' data-ytimg='1' onload=';'><span class='vertical-align'></span></span></span></span></a><div id='' class='comment-simplebox-edit' data-editable-content-text='' data-image-src='' data-video-id=''></div><div class='comment-renderer-content'><div class='comment-renderer-header'><a href='" + data.items[i].snippet.topLevelComment.snippet.authorChannelUrl + "' class='yt-uix-sessionlink comment-author-text g-hovercard' data-ytid='" + data.items[i].snippet.topLevelComment.snippet.authorChannelId.value + "'>" + data.items[i].snippet.topLevelComment.snippet.authorDisplayName + "</a><span class='comment-renderer-time' tabindex='0'><a href='/watch?v=" + data.items[i].snippet.topLevelComment.snippet.videoId + "' class=' yt-uix-sessionlink'  rel='nofollow' target='_blank'> " + data.items[i].snippet.topLevelComment.snippet.publishedAt + "</a></span></div><div class='comment-renderer-text' tabindex='0' role='article'><div class='comment-renderer-text-content'>" + commentdata + "</div><div class='comment-text-toggle hid'><div class='comment-text-toggle-link read-more'><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-link' type='button' onclick='return false;'><span class='yt-uix-button-content'>Read more</span></button></div><div class='comment-text-toggle-link show-less hid'><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-link' type='button' onclick='return false;'><span class='yt-uix-button-content'>Show less</span></button></div></div></div><div class='comment-renderer-footer' data-vote-status='INDIFFERENT'><button class='yt-uix-button yt-uix-button-size-small yt-uix-button-link comment-renderer-reply yt-uix-sessionlink' type='button' onclick=';window.location.href=this.getAttribute('href');return false;' role='link' href='https://accounts.google.com/ServiceLogin?passive=true&amp;amp;hl=en&amp;amp;continue=http%3A%2F%2Fwww.youtube.com%2Fsignin%3Fhl%3Den%26next%3D%252Fwatch%253Fv%253DJgHQsgUjnDM%26action_handle_signin%3Dtrue%26app%3DNone&amp;amp;uilel=3&amp;amp;service=youtube' data-sessionlink='itct=CJIBEPBbIhMIqvGQpcD6zgIVoDxoCh2qPwyr'><span class='yt-uix-button-content'>Reply</span></button><span class='comment-renderer-like-count on'>" + data.items[i].snippet.topLevelComment.snippet.authorDisplayName + "</span>  <button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup comment-action-buttons-renderer-thumb yt-uix-sessionlink sprite-comment-actions sprite-like' type='button' onclick=';window.location.href=this.getAttribute('href');return false;' role='link' aria-label='Like' href='https://accounts.google.com/ServiceLogin?passive=true&amp;amp;hl=en&amp;amp;continue=http%3A%2F%2Fwww.youtube.com%2Fsignin%3Fhl%3Den%26next%3D%252Fwatch%253Fv%253DJgHQsgUjnDM%26action_handle_signin%3Dtrue%26app%3DNone&amp;amp;uilel=3&amp;amp;service=youtube' data-sessionlink='itct=CJMBEPBbIhMIqvGQpcD6zgIVoDxoCh2qPwyr'></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup comment-action-buttons-renderer-thumb yt-uix-sessionlink sprite-comment-actions sprite-dislike' type='button' onclick=';window.location.href=this.getAttribute('href');return false;' role='link' aria-label='Dislike' href=''></button></div></div></div><div class='comment-replies-renderer' data-visibility-tracking=''></div></section>";
                            }
                        } else {
                            cysOverlay.cyscommentwrite();
                            return;
                        }
                    }

                    if (data.nextPageToken) {
                        if (cysOverlay.vid.commentcount <= total) {
                            var url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" + cysOverlay.vid.id + "&maxResults=100&textFormat=plainText&key=" + cysOverlay.youtubekey + "&pageToken=" + data.nextPageToken + "";
                            cysCommons.getAJAX(url, cysOverlay.saveallcomments);
                        } else {
                            //cysOverlay.vid.comment +="</div><button class='cyscommnet yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more comment-section-renderer-paginator yt-uix-sessionlink' type='button' onclick=';return false;' aria-label='Show more' data-uix-load-more-post='true' data-uix-load-more-target-id='comment-section-renderer-items'  ><span class='yt-uix-button-content'>  <span class='load-more-loading hid'><span class='yt-spinner'><span title='Loading icon' class='yt-spinner-img  yt-sprite'></span>Loading...</span></span><span class='load-more-text'>Show more</span></span></button><div class='comment-simplebox' id='comment-simplebox'><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div><div class='comment-simplebox-frame'><div class='comment-simplebox-prompt'></div><div class='comment-simplebox-text' role='textbox' aria-multiline='true' contenteditable='plaintext-only'></div></div><div class='comment-simplebox-controls'><div class='comment-simplebox-buttons'><span class='comment-simplebox-character-counter'></span><span class='comment-simplebox-error-message hid' data-placeholder='Comment failed to post.'></span><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-simplebox-cancel' type='button' onclick=';return false;'><span class='yt-uix-button-content'>Cancel</span></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-primary yt-uix-button-empty comment-simplebox-submit yt-uix-sessionlink' type='button' onclick=';return false;' data-target='' data-params=''></button></div></div>  <span title='Loading icon' class='yt-spinner-img comment-simplebox-loading yt-sprite'></span></div><div class='feedback-banner hid'></div><span title='Loading icon' class='yt-spinner-img comment-renderer-loading yt-sprite'></span><div class='hid' id='comment-renderer-abuse'><div class='comment-renderer-abuse-content'></div></div></div></div>";
                            cysOverlay.cyscommentwrite();
                        }
                    } else {
                        //cysOverlay.vid.comment +="</div><button class='cyscommnet yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more comment-section-renderer-paginator yt-uix-sessionlink' type='button' onclick=';return false;' aria-label='Show more' data-uix-load-more-post='true' data-uix-load-more-target-id='comment-section-renderer-items'  ><span class='yt-uix-button-content'>  <span class='load-more-loading hid'><span class='yt-spinner'><span title='Loading icon' class='yt-spinner-img  yt-sprite'></span>Loading...</span></span><span class='load-more-text'>Show more</span></span></button><div class='comment-simplebox' id='comment-simplebox'><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div><div class='comment-simplebox-frame'><div class='comment-simplebox-prompt'></div><div class='comment-simplebox-text' role='textbox' aria-multiline='true' contenteditable='plaintext-only'></div></div><div class='comment-simplebox-controls'><div class='comment-simplebox-buttons'><span class='comment-simplebox-character-counter'></span><span class='comment-simplebox-error-message hid' data-placeholder='Comment failed to post.'></span><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-simplebox-cancel' type='button' onclick=';return false;'><span class='yt-uix-button-content'>Cancel</span></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-primary yt-uix-button-empty comment-simplebox-submit yt-uix-sessionlink' type='button' onclick=';return false;' data-target='' data-params=''></button></div></div>  <span title='Loading icon' class='yt-spinner-img comment-simplebox-loading yt-sprite'></span></div><div class='feedback-banner hid'></div><span title='Loading icon' class='yt-spinner-img comment-renderer-loading yt-sprite'></span><div class='hid' id='comment-renderer-abuse'><div class='comment-renderer-abuse-content'></div></div></div></div>";
                        cysOverlay.cyscommentwrite();
                    }

                } catch (e) {

                }
            },
            onLocationChange: function(wp, req, url, fl) {
                var path;
                cysCommons.cysPrefs.setCharPref('signature.decryption.code', '');
                cysOverlay.videoListIsActual = false;
                if (url.scheme.substr(0, 4) === 'http') {
                    path = url.scheme + '://' + url.host + url.path;
                    cysOverlay.currentURL = path;
                    /*if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && cysCommons.executeInSandbox("document") && cysCommons.executeInSandbox("document.body") && cysCommons.executeInSandbox("document.getElementById('cys_currenturl');") === null) {
                        var scrp = "var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cys_currenturl'); divtoappend.setAttribute('id','cys_currenturl'); divtoappend.setAttribute('value','" + cysOverlay.currentURL + "'); document.body.appendChild(divtoappend);";
                        cysCommons.executeInSandbox(scrp);
                    }*/
                }
                if (path && cysCommons.isYouTubeUrl(path, 'watch')) {
                    if (cysOverlay.vid !== null && cysOverlay.vid.id && path.indexOf('v=' + cysOverlay.vid.id) === -1) {
                        cysOverlay.vid = null;
                    }
                    if (cysOverlay.loaderTimeout) {
                        clearTimeout(cysOverlay.loaderTimeout);
                    }
                    cysOverlay.loaderTimeout = setTimeout(function() {
                        if (!cysOverlay.GetSignatureCode()) {
                            if (cysOverlay.vid) {
                                cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, cysOverlay.ajaxupdateSignature);
                            }
                        } else {
                            cysOverlay.decodeArray = cysOverlay.GetSignatureCode();
                        }
                        cysOverlay.onContentLoad();
                    }, 500);
                } else {
                    cysOverlay.vid = null;
                    var btn = cysOverlay.button;
                    if (btn) {
                        btn.disabled = true;
                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                    }
                    //check if there are embedded videos?
                    /*if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                        for (var key in cysOverlay.currentEmbeddedVidList) {
                            delete cysOverlay.currentEmbeddedVidList[key];
                        }
                        try {
                            var inc = 0,
                                k = 0;
                            var scrp = "var cysvids = document.getElementsByClassName('cysembeddedvideoid'); var ids=[];for(var i=0; i<cysvids.length;i++){ ids[i] = cysvids[i].getAttribute('value'); } ids.join(',');";
                            var vids = cysCommons.executeInSandbox(scrp);
                            if (vids !== "") {
                                var videoIDs = vids.split(","),
                                    vidid;
                                for (var j = 0; j < videoIDs.length; j++) {
                                    vidid = videoIDs[j];
                                    cysOverlay.currentEmbeddedVidList[vidid] = {};
                                    cysOverlay.currentEmbeddedVidList[vidid].title = cysOverlay.embeddedVideoIdList[vidid].title;
                                    cysOverlay.currentEmbeddedVidList[vidid].url = {};
                                    for (var inurl in cysOverlay.embeddedVideoIdList[vidid].url) {
                                        cysOverlay.currentEmbeddedVidList[vidid].url[0] = path;
                                    }
                                    cysOverlay.vid = cysOverlay.idlist[vidid];
                                    inc++;
                                }
                                if (typeof(cysOverlay.vid) !== 'undefined') {
                                    delete cysOverlay.vid.running;
                                }
                            }

                            /* if embedded videos are not loaded using above method than use below method*/
                            /*for (var vidid in cysOverlay.embeddedVideoIdList) {
                                if (cysOverlay.idlist[vidid] !== null) {
                                    var j = 0;
                                    for (var inurl in cysOverlay.embeddedVideoIdList[vidid].url) {
                                        if (cysOverlay.embeddedVideoIdList[vidid].url[inurl] === path) {
                                            cysOverlay.currentEmbeddedVidList[vidid] = {};
                                            cysOverlay.currentEmbeddedVidList[vidid].title = cysOverlay.embeddedVideoIdList[vidid].title;
                                            cysOverlay.currentEmbeddedVidList[vidid].url = {};
                                            cysOverlay.currentEmbeddedVidList[vidid].url[0] = path;
                                            cysOverlay.vid = cysOverlay.idlist[vidid];
                                        }
                                        j++;
                                    }
                                    if (typeof(cysOverlay.vid) !== 'undefined' && cysOverlay.vid !== null) {
                                        delete cysOverlay.vid.running;
                                    }
                                }
                                inc++;
                            }
                            if (inc > 0) {
                                var btn = cysOverlay.button;
                                if (btn) {
                                    btn.disabled = false;
                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                    cysOverlay.menuReload();
                                }
                            }
                        } catch (ex) {
                            cysCommons.cysDump("error in onLocationChange:" + ex, ex.stack);
                        }
                    }*/
                }
            },
            onSecurityChange: function() {},
            onStatusChange: function() {},
            onProgressChange: function() {},
            onStateChange: function(wp, req, fl, st) {
                var nw = Ci.nsIWebProgressListener;
                if ((fl & nw.STATE_IS_WINDOW) && (fl & nw.STATE_STOP)) {
                    try {
                        if (cysCommons.isYouTubeUrl(req.name, 'watch') || cysCommons.isYouTubeUrl(req.originalURI.asciiSpec, 'watch')) {
                            if (cysOverlay.loaderTimeout) {
                                clearTimeout(cysOverlay.loaderTimeout);
                            }
                            cysOverlay.loaderTimeout = setTimeout(function() {
                                if (!cysOverlay.GetSignatureCode()) {
                                    if (cysOverlay.vid) {
                                        cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, cysOverlay.ajaxupdateSignature);
                                    }
                                } else {
                                    cysOverlay.decodeArray = cysOverlay.GetSignatureCode();
                                }
                                cysOverlay.onContentLoad();
                            }, 100);
                        }
                    } catch (ex) {
                        cysCommons.cysDump(ex, ex.stack);
                    }
                }
            },
            getEmbeddedVideoSize: function() {
                var size = 0;
                if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                    for (var key in cysOverlay.currentEmbeddedVidList) {
                        size++;
                    }
                }
                return size;
            },
            GetSignatureCode: function() {
                return cysOverlay.signatureCode || null;
            },
            SetSignatureCode: function(code) {
                cysOverlay.signatureCode = code;
            },
            addColsToMenuItem: function(item, act, fmtNo, cols, size, dal, daf, dataonly, isDash, url) {
                var w = cysOverlay.colSizes;
                try {
                    var label, sp, f, t, tt, fmt = act + fmtNo,
                        da = (dal) ? '1' : '',
                        data = {},
                        age = cysOverlay.vid.age;
                    item.classList.add('menu-row');

                    data[0] = (da || isDash) ? '—' : '';
                    if (cols.cfmt && !dataonly) {
                        label = document.createElement("label");
                        label.setAttribute("value", fmt);
                        label.setAttribute("width", w[0]);
                        item.appendChild(label);
                    }
                    data[1] = fmt;
                    if (cols.ctype && !dataonly) {
                        label = document.createElement("label");
                        label.setAttribute("value", cysCommons.getCysString(fmt + ".1" + da, null));
                        label.setAttribute("width", w[1]);
                        item.appendChild(label);
                    }
                    data[2] = cysCommons.getCysString(fmt + ".1" + da, null);
                    let qual = cysCommons.getCysString(fmt + ".2");
                    qual = qual.replace("/60fps", "");
                    var q = /[?&]fps=(\d+)\D/.exec(url);
                    if (q && (q[1] === "60" || q[1] === "50")) {
                        qual = qual + "/" + q[1] + "fps"
                    }
                    if (cols.ctypename && !dataonly) {
                        label = document.createElement("label");
                        label.setAttribute("value", qual);
                        label.setAttribute("width", w[2]);
                        item.appendChild(label);
                    }
                    data[3] = qual;
                    if ((cols.cp) && cysCommons.getCysString(fmt + ".5", null) !== "") {
                        if (!dataonly) {
                            label = document.createElement("label");
                        }
                        if (cysOverlay.vid.resolutions[fmt]) {
                            tt = cysOverlay.vid.resolutions[fmt].h + 'p';
                        } else {
                            tt = cysCommons.getCysString(fmt + ".5", null);
                            if (act === 'Cnv' && [41, 42, 43, 61, 62, 63, 71, 72].indexOf(Number(fmtNo)) > -1) {
                                f = 'Fmt' + cysCommons.convertFormatMatch[Number(fmtNo)][0];
                                if (f in cysOverlay.vid.bitrates)
                                    tt = cysOverlay.vid.bitrates[f] + 'b';
                            }
                        }
                        if (!dataonly) {
                            label.setAttribute("value", tt);
                            label.setAttribute("width", w[3]);
                            label.setAttribute('class', 'rjust');
                            item.appendChild(label);
                        }
                    } else {
                        if (cysOverlay.vid.resolutions[fmt]) {
                            tt = cysOverlay.vid.resolutions[fmt].h + 'p';
                        } else {
                            tt = cysCommons.getCysString(fmt + ".5", null);
                            if (act === 'Cnv' && [41, 42, 43, 61, 62, 63, 71, 72].indexOf(Number(fmtNo)) > -1) {
                                f = 'Fmt' + cysCommons.convertFormatMatch[Number(fmtNo)][0];
                                if (f in cysOverlay.vid.bitrates)
                                    tt = cysOverlay.vid.bitrates[f] + 'b';
                            }
                        }
                    }

                    if (fmt.toLowerCase().indexOf('fmt') !== -1) {
                        data[4] = tt;
                    }

                    if (cols.cresolution) {
                        label = document.createElement("label");
                        if (cysOverlay.vid.resolutions[fmt]) {
                            label.setAttribute("value", tt = cysOverlay.vid.resolutions[fmt].w + 'x' + cysOverlay.vid.resolutions[fmt].h);
                        } else {
                            label.setAttribute("value", tt = cysCommons.getCysString(fmt + ".3", null));
                        }
                        if (!dataonly) {
                            label.setAttribute("width", w[4]);
                            label.setAttribute('class', 'rjust');
                            item.appendChild(label);
                        }
                    } else {
                        if (cysOverlay.vid.resolutions[fmt]) {
                            tt = cysOverlay.vid.resolutions[fmt].w + 'x' + cysOverlay.vid.resolutions[fmt].h;
                        } else {
                            tt = cysCommons.getCysString(fmt + ".3", null);
                        }
                    }

                    data[5] = tt;

                    if (cols.csound) {
                        sp = document.createElement("spacer");
                        sp.setAttribute("width", w[7]);
                        item.appendChild(sp);
                        if (!dataonly) {
                            label = document.createElement("label");
                        }
                        if (act === 'Fmt') {
                            if (daf) {
                                tt = cysCommons.getCysString(fmt + ".4" + da, null);
                                if (('Fmt' + daf) in cysOverlay.vid.bitrates)
                                    tt = tt.substr(0, tt.indexOf('/') + 1) + cysOverlay.vid.bitrates[('Fmt' + daf)];
                                tt = cysOverlay.getOpusStringIfApplicable(fmt, tt);
                            } else {
                                tt = cysCommons.getCysString(fmt + ".4" + age, null);
                                if (tt === "") {
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
                        if (!dataonly) {
                            label.setAttribute("value", tt);
                            label.setAttribute("width", w[5]);
                            //label.setAttribute('class','rjust');
                            item.appendChild(label);
                        }
                    } else {
                        if (act === 'Fmt') {
                            if (daf) {
                                tt = cysCommons.getCysString(fmt + ".4" + da, null);
                                if (('Fmt' + daf) in cysOverlay.vid.bitrates)
                                    tt = tt.substr(0, tt.indexOf('/') + 1) + cysOverlay.vid.bitrates[('Fmt' + daf)];
                                tt = cysOverlay.getOpusStringIfApplicable(fmt, tt);
                            } else {
                                tt = cysCommons.getCysString(fmt + ".4" + age, null);
                                if (tt === "") {
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
                    }
                    data[6] = tt;
                    if (cols.csize && !dataonly) {
                        label = document.createElement("label");
                        label.setAttribute("width", w[6]);
                        if (size) {
                            label.setAttribute("value", size);
                        } else {
                            label.setAttribute("value", '. . .');
                        }
                        label.setAttribute('videoid', cysOverlay.vid.id);
                        label.setAttribute('class', 'rjust');
                        item.appendChild(label);
                    }
                    data[7] = size;
                    if (!dataonly) {
                        item.addEventListener("DOMMenuItemActive", cysOverlay.openContext, false);
                        item.addEventListener("DOMMenuItemInactive", cysOverlay.hideContext, false);
                    }

                    item.setAttribute("value", JSON.stringify(data));
                } catch (ex) {
                    //cysCommons.cysDump(fmt);
                    cysCommons.cysDump("addColsToMenuItem error: " + ex, ex.stack);
                }
            },
            closeAll: function(evt) {
                var popups = document.getElementsByTagName('menupopup');
                for (var i in popups) {
                    try {
                        popup = popups[i];
                        if (popup && popup.getAttribute("id").indexOf("cys-DropdownContextMenu") !== -1 && popup.state === "open") {
                            popup.hidePopup();
                            // cysCommons.cysDump(">>> ");
                        }
                    } catch (ex) {}
                }
            },
            openContext: function(evt) {
                //check if options->Status bar options...->Status->General->Links->"Show Links in" (status4evar.status.linkOver) is set to none or not
                var valuep = 0;
                var widthp = 800;
                try {
                    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("status4evar.status.");
                    valuep = prefs.getIntPref("linkOver");
                    widthp = prefs.getIntPref("toolbar.maxLength");
                } catch (ex) {

                }
                try {
                    var showstatusbar = true;
                    if (valuep === 0) {
                        showstatusbar = true;
                    } else if (valuep) {
                        showstatusbar = false;
                    }
                    var t = document.getElementById('statusbar-display');

                    if (!t)
                        return;
                    t.setAttribute("hidden", showstatusbar);
                    document.getElementById('cys-statusbar-display').setAttribute("hidden", showstatusbar);
                    document.getElementById('cys-statusbar-display').label = evt.target.getAttribute("statustext");
                    document.getElementById('cys-statusbar-display').width = widthp + "px";
                    document.getElementById('cys-statusbar-display').parentNode.width = widthp + "px";
                } catch (ex) {

                }
            },
            hideContext: function() {
                var t = document.getElementById('statusbar-display');
                if (!t)
                    return;
                document.getElementById('cys-statusbar-display').label = "";
                document.getElementById('cys-statusbar-display').setAttribute("hidden", true);
                t.setAttribute("hidden", false);
            },
            removeAllChildren: function(target) {
                var child = target.childNodes;
                if (child.length > 0)
                    do {
                        target.removeChild(child.item(0));
                    } while (child.length > 0)
            },
            getDropdownContextMenu: function(id, statustext, convertTo, dashaudio) {
                if (id === null)
                    id = "";
                var menu = cysOverlay.menu,
                    order, menupopup, autopopup = cysOverlay.autopopup,
                    menuitem, i, n = 0,
                    it, last, ttip; //cysCommons.cysDump("getDropdownContextMenu, cys-dropdown-menu.state = "+menu.state);
                order = cysCommons.getSubMenu();
                if (convertTo === null) {
                    var stustxt = cysCommons.getVideoFormatByUrl(statustext, true, 0, cysOverlay.vid.age);
                    ttip = cysCommons.getCysString('audiofileformat') + ' ' + stustxt;
                    ttip = cysOverlay.getOpusToolTipIfApplicable(statustext, ttip);
                }
                menupopup = document.createElement("menupopup");
                menupopup.setAttribute("item", id);
                if (autopopup)
                    menupopup.setAttribute("youtube", statustext);
                for (i = 0; i < order.length; i++) {
                    it = order[i];
                    if (it.substr(0, 1) === '-')
                        continue;
                    if (it === 'sep' && n > 0 && last !== 'sep') {
                        n++;
                        last = it;
                        menupopup.appendChild(document.createElement('menuseparator'));
                    } else if (it === '1') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.1", "cys-saveas", convertTo));
                    } else if (it === '2') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.2", "cys-savedefault", convertTo, cysOverlay.defaultdir));
                    } else if (it === '3' && cysOverlay.lastprojectdir) {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.3", "cys-savelastprojectdir", convertTo));
                    } else if (it === '4') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.4", "cys-savecomplete", convertTo));
                    }
                    if (it === '5') {
                        n++;
                        last = it;
                        menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, dashaudio, "right.click.5", "cys-link", convertTo));
                    } else if (!convertTo || dashaudio) {
                        if (it === '6' && cysCommons.canConvert) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.6", "cys-saveaudioas", 0, ttip));
                        } else if (it === '7' && cysCommons.canConvert) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.7", "cys-saveaudiodefault", 0, ttip));
                        } else if (it === '8' && cysCommons.canConvert && cysOverlay.lastprojectdir) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.8", "cys-saveaudiolastprojectdir", 0, ttip));
                        } else if (it === '9' && cysCommons.canConvert) {
                            if (dashaudio)
                                statustext = dashaudio;
                            n++;
                            last = it;
                            menupopup.appendChild(cysOverlay.setContextMenuItem(document.createElement("menuitem"), autopopup, statustext, '', "right.click.9", "cys-savecompletewaudio", 0, ttip));
                        }
                    }
                }
                if (last === 'sep')
                    menupopup.removeChild(menupopup.lastChild);
                menupopup.addEventListener('popuphiding', function(event) {
                    return cysOverlay.onpopuphiding2(event);
                }, false);
                return menupopup;
            },
            setContextMenuItem: function(menuitem, autopopup, statustext, statustext2, cs, menuid, convertTo, ttip) {
                //cysCommons.cysDump('setContextMenuItem');
                menuitem.setAttribute("label", cysCommons.getCysString(cs, null));
                menuitem.setAttribute("id", menuid);

                if (convertTo !== null)
                    menuitem.setAttribute('convertTo', convertTo);
                if (menuid.substr(-14) === 'lastprojectdir')
                    menuitem.setAttribute("tooltiptext", cysOverlay.lastprojectdir);
                if (ttip)
                    menuitem.setAttribute('tooltiptext', ttip);
                menuitem.addEventListener('command', function(event) {
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
            closeMenu: function() {
                cysOverlay.removeAllChildren(cysOverlay.menu);
                cysOverlay.menu.removeAttribute('button');
                cysOverlay.menu.removeAttribute('close');
                cysOverlay.menu.removeAttribute('close2');
                cysOverlay.menu.hidePopup();
            },
            displayEmbeddedVideoDownloads: function(videoID, quick) {
                var doc = null;
                try {
                    if (cysOverlay.idlist[videoID] && videoID !== cysOverlay.vid.id) { // if ID saved, retrieve data without rescanning page
                        cysOverlay.vid = cysOverlay.idlist[videoID];
                        if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 2) {
                            if (typeof cysOverlay.vid.age === 'undefined')
                                cysOverlay.vid.age = '';
                            var menu = cysOverlay.menu;
                            if (quick) {
                                menu.setAttribute('button', 1);
                                menu.openPopup(cysOverlay.button, 'after_start');
                            }
                            if (menu && (menu.state === 'open' || menu.open)) {
                                cysOverlay.menuToggle(menu);
                            }
                        } else if (cysOverlay.vid.rtmpe) {
                            btn.disabled = true;
                            //cysCommons.cysDump('contentLoad S2b - video in data cache has RTMPE streams only, no downloadable video link found!');
                        } else { //cysCommons.cysDump('\nData not found in cache...');
                            cysOverlay.vid.youTubeFormats = null;
                            cysOverlay.videoListIsActual = false;
                            cysOverlay.updateVideosList(doc, cysOverlay.vid.html, "https://www.youtube.com/watch?v=" + videoID);
                        }
                    }
                } catch (ex) {
                    cysCommons.cysDump('displayEmbeddedVideoDownloads error:' + ex, ex.stack);
                }
            },
            muxOpusIfAvailable: function(fmt) {
                if (cysOverlay.checkIfVideoMuxedWithOpus("Fmt" + fmt)) {
                    if (typeof(cysOverlay.vid.dashAudio[5]) !== 'undefined') {
                        return cysOverlay.vid.dashAudio[5];
                    } else if (typeof(cysOverlay.vid.dashAudio[6]) !== 'undefined') {
                        return cysOverlay.vid.dashAudio[6];
                    } else if (typeof(cysOverlay.vid.dashAudio[7]) !== 'undefined') {
                        return cysOverlay.vid.dashAudio[7];
                    }
                }
                return cysOverlay.vid.dashAudio[cysCommons.dashVideo[fmt]];
            },
            getOpusStringIfApplicable: function(fmt, tt) {
                if (cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") && cysCommons.getCysString(fmt + '.11').toUpperCase() === 'MP4') {
                    quality = parseInt(cysCommons.getCysString(fmt + '.5'));
                    if (quality >= 720 || cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio.all")) {
                        return 'AAC/192K';
                    }
                }

                if (cysOverlay.checkIfVideoMuxedWithOpus(fmt)) {
                    if (typeof(cysOverlay.vid.dashAudio[5]) !== 'undefined' || typeof(cysOverlay.vid.dashAudio[6]) !== 'undefined' || typeof(cysOverlay.vid.dashAudio[7]) !== 'undefined') {
                        var arr = tt.split("/");
                        if (typeof(cysOverlay.vid.dashAudio[5]) !== 'undefined') {
                            return "OPS/165K" //+arr[1];
                        } else if (typeof(cysOverlay.vid.dashAudio[6]) !== 'undefined') {
                            return "OPS/65K" //+arr[1];
                        } else if (typeof(cysOverlay.vid.dashAudio[7]) !== 'undefined') {
                            return "OPS/48K" //+arr[1];
                        }
                    }
                }
                return tt;
            },
            checkIfVideoMuxedWithOpus: function(fmt) {
                if (cysCommons.cysPrefs.getBoolPref("mux.opus.audio.vp9") === true && (cysCommons.getCysString(fmt + ".11") === "WebM")) {
                    quality = parseInt(cysCommons.getCysString(fmt + ".5"));
                    if (quality < 720 && cysCommons.cysPrefs.getBoolPref("mux.opus.audio.vp9.all") === false) {
                        return false;
                    }
                    return true;
                }
                return false;
            },
            getOpusToolTipIfApplicable: function(statustext, tooltip) {
                fmt = "Fmt" + cysCommons.fmtFromUrl(statustext);
                if (cysOverlay.checkIfVideoMuxedWithOpus(fmt)) {
                    tooltip = cysCommons.getCysString('audiofileformat') + " " + " OPUS (" + cysCommons.getCysString('Fmt251.4') + ")";
                }
                return tooltip;
            },
            buildDropDownMenu: function() {
                cysCommons.cysDump('\n**buildDropDownMenu');
                try {
                    if (!cysOverlay.vid || !cysOverlay.vid.id) {
                        let timer = setInterval(function() {
                            if (cysOverlay.vid && cysOverlay.vid.id) {
                                clearInterval(timer);
                                cysOverlay.onContentLoad(1);
                            }
                        }, 300);
                        return;
                    }
                    var url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" + cysOverlay.vid.id + "&maxResults=100&textFormat=plainText&key=" + cysOverlay.youtubekey + "";
                    //set the comment data ;
                    cysCommons.getAJAX(url, cysOverlay.setComment);
                    if (!cysOverlay.openFFmpegDialog()) {
                        setTimeout(cysOverlay.closeMenu, 200);
                        return null;
                    }
                    cysCommons.cysDump("1) in buildDropDownMenu");
                    var menu = cysOverlay.menu,
                        menuitem, menuitemUrl, subMenu, mode, context, VF, CF, img, f, i, j, audioUrl = null; //cysCommons.cysDump("buildDropDownMenu, cys-dropdown-menu.state = "+menu.state+": menu.length");
                    mode = cysCommons.cysPrefs.getIntPref((menu.hasAttribute('button') ? 'button.left.click.open' : 'arrow.left.click.open'));

                    if (menu.state !== 'open' && menu.childNodes.length && !menu.firstChild.disabled) {
                        cysOverlay.removeAllChildren(menu);
                        if (mode === 2) {
                            menu.hidden = true;
                            this.openOptions();
                            menu.hidden = false;
                            return false;
                        }
                    }
                    cysCommons.cysDump("2) in buildDropDownMenu");
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

                        for (i = 0; i < f.length; i++) {
                            cysCommons.getAJAX(VF[f[i]], cysOverlay.getVideoSize, 'HEAD', 'Content-Length', 'Fmt' + f[i], 0);
                        }
                        setTimeout(cysOverlay.buildDropDownMenu, 1000);
                        menu.setAttribute('waiting', 1);

                        return;
                    } else if (menu.hasAttribute('waiting')) {
                        if (Object.keys(cysOverlay.vid.filesizes).length === Object.keys(cysOverlay.vid.youTubeFormats).length) {
                            menu.removeAttribute('waiting');
                            cysOverlay.removeAllChildren(menu);
                            menu.hidePopup();
                            menu.openPopup(menu.parentNode, 'after_start', 0, 0, false, false, null);
                        } else {
                            setTimeout(cysOverlay.buildDropDownMenu, 500);
                        }
                    }
                    cysCommons.cysDump("3) in buildDropDownMenu");

                    cysOverlay.vid.title = cysCommons.getTitle();

                    if (cysOverlay.mode) {
                        mode = cysOverlay.mode;
                    }
                    cysOverlay.mode = cysOverlay.lastmode = mode;
                    //cysCommons.cysDump("mode = " + mode);
                    menu.removeAttribute('button');
                    menu.removeAttribute('close');
                    menu.removeAttribute('close2');

                    if (menu.state !== 'open') {
                        cysOverlay.removeAllChildren(menu);
                    }

                    if (!cysOverlay.autopopup) {
                        context = cysOverlay.getDropdownContextMenu("", null);
                    }
                    cysCommons.cysDump("4) in buildDropDownMenu");

                    if (menu.state !== 'open' && (!cysOverlay.vid.youTubeFormats || typeof cysOverlay.vid.youTubeFormats !== 'object' || Object.keys(cysOverlay.vid.youTubeFormats).length < 1)) {
                        //cysCommons.cysDump('\n***** Menu display aborting *****\nYTformats type: ' + typeof cysOverlay.vid.youTubeFormats + '\nYTformats value: ' + cysOverlay.vid.youTubeFormats + '\nYTformats properties:\n' + '::menu has setAttribute:' + menu.hasAttribute('waiting') + '\n::object len:' + '\n');// debug...
                        /*for (var t in cysOverlay.vid.youTubeFormats)
                         cysCommons.cysDump(t + ' : ' + cysOverlay.vid.youTubeFormats[t]);   // debug...*/
                        menuitem = document.createElement((cysOverlay.autopopup) ? "menu" : "menuitem");
                        img = document.createElement('image');
                        img.setAttribute("class", "throbber");
                        menuitem.appendChild(img);
                        menuitem.disabled = true;
                        menu.appendChild(menuitem);
                        cysOverlay.isSignatureUpdatingStarted = 0;
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.videoListIsActual = false;
                        cysOverlay.onContentLoad(1);
                        return;
                    }
                    cysCommons.cysDump("5) in buildDropDownMenu");
                    var embsize = 0,
                        elabel;
                    if (menu.state !== 'open') {
                        /*label = document.createElement('label');
                         label.setAttribute('value','well');
                         menuitem.appendChild(label);
                         menu.appendChild(menuitem);*/

                        if (!cysOverlay.autopopup) {
                            menu.setAttribute("context", "_child");
                            menu.appendChild(context);
                        }
                        var quick = (mode === 3),
                            dformats, qformats, bestQ, best1, FF, fc, act, last, menus = [],
                            cnv = [],
                            n = 0,
                            it, t, qf, qm = {},
                            cols = {},
                            sizes, size, sr = {},
                            dash, af, al, label, convert = cysCommons.canConvert;
                        cysCommons.canConvert = true;
                        if (quick) {
                            dformats = cysCommons.getFormats(false, true);
                            qformats = cysCommons.getFormats(true);

                            bestQ = cysCommons.cysPrefs.getIntPref("download.quality.highest");
                            if (bestQ) {
                                dformats.sort(function(a, b) {
                                    return a - b;
                                }).reverse();
                            } else {
                                dformats.sort(function(a, b) {
                                    return b - a;
                                }).reverse();
                            } // sort formats by quality
                        } else {
                            dformats = cysCommons.getFormats();
                            best1 = cysCommons.cysPrefs.getBoolPref('menu.dropdown.showbestonly');
                        }

                        cysCommons.canConvert = convert;

                        var ffmpegStatus = -1;
                        try {
                            ffmpegStatus = cysCommons.cysPrefs.getIntPref('ffmpeg.install.status');
                        } catch (ex) {
                            cysCommons.cysPrefs.setIntPref('ffmpeg.install.status', -1);
                        }

                        for (i = 0; i < dformats.length; i++) {
                            FF = dformats[i];
                            if (FF.substr(0, 1) === '-') {
                                if (quick) {
                                    FF = FF.substr(1); // all formats considered for quick menu!
                                } else {
                                    continue; // format not enabled by user - for detailed menu
                                }
                            }
                            act = FF.substr(0, 3);

                            fc = 0;
                            qf = null;
                            if (FF.length > 3)
                                fc = parseInt(FF.substr(3));
                            if (quick && act !== 'sep') { // check if format in and already added to quickmenu
                                if (FF in qm) {
                                    continue;
                                } else if (qformats.indexOf(FF) > -1) {
                                    qf = FF;
                                } else {
                                    qf = cysCommons.getCysString(FF + '.1');
                                    if (qf === 'MP3' || qf === 'AAC' || qf === 'M4A')
                                        qf += ' (' + cysCommons.getCysString(FF + '.4').substr(0, 3) + ')';
                                    if (qformats.indexOf(qf) === -1 || qf in qm) {
                                        continue;
                                    }
                                }
                            }

                            //hide menu item
                            if ((cysCommons.isRequiredFFmpeg(FF) || (act === 'Cnv' && !cysCommons.audioIsDash(cysOverlay.getUrlFormat(FF)))) && ffmpegStatus === 0) {
                                continue;
                            }
                            if (act === 'Fmt' && cysOverlay.vid.youTubeFormats[fc]) { // build menus array
                                if (fc === 22 && cysOverlay.vid.youTubeFormats[fc]) {
                                    audioUrl = cysOverlay.vid.youTubeFormats[fc];
                                }
                                menus.push([act, fc, cysOverlay.vid.youTubeFormats[fc], qf]);
                                qm[qf] = n;
                                last = act;
                                n++;
                            } else if (act === 'sep' && last !== act && n > 0) {
                                menus.push([act, null, null, null]);
                                last = act;
                                n++;
                            } else if (act === 'Cnv') {
                                if (fc in cysCommons['convertFormatMatch' + cysOverlay.vid.age]) {
                                    menuitemUrl = null;
                                    t = cysCommons['convertFormatMatch' + cysOverlay.vid.age][fc];
                                    for (j = 0; j < t.length; j++) {
                                        VF = t[j];
                                        if (cysOverlay.vid.youTubeFormats[VF]) {
                                            menuitemUrl = cysOverlay.vid.youTubeFormats[VF];
                                            //cysCommons.dashAudioFormats[fc] = VF;
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
                            }
                        }

                        if (!quick && cnv && best1) { // filter menus array
                            var ck = [],
                                last = null;
                            for (i = 0; i < cnv.length; i++)
                                ck.push(cnv[i][0]);

                            ck.sort(function(a, b) {
                                return b - a;
                            });

                            i = ck.length - 1;
                            while (i > -1) {
                                t = Math.floor(ck[i] / 10);
                                if (t === last) {
                                    ck.splice(i, 1);
                                } else {
                                    last = t;
                                } // filter convert formats array
                                i--;
                            }
                            i = cnv.length - 1;
                            while (i > -1) {
                                if (ck.indexOf(cnv[i][0]) === -1)
                                    menus.splice(cnv[i][1], 1); // filter menus
                                i--;
                            }
                        } else if (quick) { // add separators + re-order filtered menu array for quick menu
                            i = qformats.length - 1;
                            while (i > -1) {
                                t = qformats[i];
                                if (t === last) {
                                    qformats.splice(i, 1);
                                } else {
                                    last = t;
                                    if (t === 'sep') {
                                        qformats[i] = ['sep', null, null, null];
                                    } else {
                                        if (t in qm) {
                                            qformats[i] = menus[parseInt(qm[t])].slice(0);
                                        } else {
                                            qformats.splice(i, 1);
                                        }
                                    }
                                }
                                i--;
                            }
                            menus = qformats;
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
                            var w = cysOverlay.colSizes,
                                wid = 0,
                                charcount = 0;

                            if (cols.cfmt && w[0]) {
                                wid = wid + parseInt(w[0]) + 13;
                                charcount = charcount + 8;
                            }
                            if (cols.ctype) {
                                wid = wid + parseInt(w[1]) + 13;
                                charcount = charcount + 4;
                            }
                            if (cols.ctypename) {
                                wid = wid + parseInt(w[2]) + 13;
                                charcount = charcount + 8;
                            }
                            if ((cols.cp)) {
                                wid = wid + parseInt(w[3]) + 13;
                                charcount = charcount + 5;
                            }
                            if (cols.cresolution) {
                                wid = wid + parseInt(w[4]) + 13;
                                charcount = charcount + 10;
                            }
                            if (cols.csound) {
                                wid = wid + parseInt(w[5]) + 13;
                                charcount = charcount + 11;
                            }
                            if (cols.csize) {
                                wid = wid + parseInt(w[6]) + 15;
                                charcount = charcount + 7;
                            }
                        }

                        embsize = embsize * 2;
                        var menulen = menus.length + embsize,
                            menuindex = 0;
                        for (i = embsize; i < menulen; i++) {
                            it = menus[menuindex];
                            menuindex++;
                            cnv = null;
                            size = 0;
                            dash = af = al = '';
                            if (it[2]) {
                                menuitem = document.createElement((cysOverlay.autopopup) ? "menu" : "menuitem");
                                menuitem.classList.add('menu-row');
                                label = document.createElement("label");
                                label.setAttribute("width", 16);
                                label.style.width = "15px";
                                label.style.textAlign = "center";

                                if (cysCommons.videoIsDash(it[1])) {
                                    label.setAttribute("value", "—");
                                    var ffmpegInstall = -1;
                                    try {
                                        ffmpegInstall = cysCommons.cysPrefs.getIntPref("ffmpeg.install.status");
                                    } catch (ex) {}

                                    if (ffmpegInstall === 2) {
                                        label.classList.add("cys-text");
                                        label.classList.add("warning");
                                    } else if (ffmpegInstall !== 1 || !cysCommons.canConvert) {
                                        label.classList.add("cys-icon");
                                        label.classList.add("warning");
                                        label.setAttribute("width", 16);
                                        label.setAttribute("value", "\u2003");
                                    }
                                } else {
                                    label.setAttribute("value", "\u2003");
                                    label.classList.add('clrdash');
                                }

                                var ffmpegInstall = -1;
                                try {
                                    ffmpegInstall = cysCommons.cysPrefs.getIntPref("ffmpeg.install.status");
                                } catch (ex) {}
                                if (it[0] === 'Cnv') {
                                    cnv = it[1];
                                    menuitem.setAttribute("convertTo", cnv);
                                    var ffmpegAudioOnly = false;
                                    try {
                                        ffmpegAudioOnly = cysCommons.cysPrefs.getBoolPref("ffmpeg.install.audio.only");
                                    } catch (ex) {}
                                    var audioIsDash = cysCommons.audioIsDash(cysCommons.fmtFromUrl(it[2]));

                                    var ffmpegRequired = cysCommons.requiredFFmpeg(it[1]) || !audioIsDash;

                                    if (audioIsDash && !ffmpegRequired && cysCommons.cysPrefs.getBoolPref("menu.dropdown.showdashaudio")) {
                                        label.setAttribute("value", "—");
                                    }

                                    if (ffmpegRequired && ((ffmpegInstall === 2 && (!ffmpegAudioOnly || !cysCommons.canConvert)) || ffmpegInstall <= 0 || (!cysCommons.canConvert && ffmpegInstall === 1)) || (!cysCommons.canConvert && !audioIsDash)) {
                                        label.classList.add("cys-icon");
                                        label.classList.add("danger");
                                        label.setAttribute("width", 16);
                                        label.setAttribute("value", "\u2003");
                                    }
                                } else if (cysCommons.videoIsDash(it[1]) && (cysCommons.canConvert || ffmpegInstall === -1 || ffmpegInstall === 1 || ffmpegInstall === 2)) {
                                    dash = '1';
                                    af = cysOverlay.muxOpusIfAvailable(it[1]);
                                    al = cysOverlay.vid.youTubeFormats[af];
                                }

                                menuitem.setAttribute("statustext", it[2]);
                                //mux audio of fmt22
                                if (cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") === true && audioUrl !== null && al !== '' && cysCommons.getCysString("Fmt" + it[1] + '.11') === "MP4") {
                                    quality = parseInt(cysCommons.getCysString('Fmt' + it[1] + '.5'));
                                    if (quality >= 720 || cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio.all")) {
                                        al = audioUrl;
                                    }
                                }

                                menuitem.setAttribute("statustext2", al);
                                menuitem.setAttribute("id", 'cys-ItemMenu' + menuindex);
                                menuitem.appendChild(label);

                                var isVideo = (it[0] === 'Fmt');

                                if (cysOverlay.autopopup) {
                                    menuitem.addEventListener('click', function(event) {
                                        if (event.target.id === '' || event.target.id.indexOf('ItemMenu') !== -1) {
                                            if (!cysOverlay.GetSignatureCode()) {
                                                if (cysOverlay.vid) {
                                                    cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, function(data) {
                                                        cysOverlay.ajaxupdateSignature(data, function() {
                                                            cysOverlay.saveVideoFile(event, event.target.getAttribute("statustext"), null, event.target.getAttribute("convertTo") || null, event.target.getAttribute("statustext2"));
                                                        });
                                                    });
                                                }
                                                return;
                                            }
                                            cysOverlay.saveVideoFile(event, event.target.getAttribute("statustext"), null, event.target.getAttribute("convertTo") || null, event.target.getAttribute("statustext2"));
                                            cysOverlay.closeAll();
                                        }
                                    }, false);
                                    subMenu = cysOverlay.getDropdownContextMenu(menuindex, it[2], cnv, al);

                                    //show.submenu
                                    if (cysCommons.canShowSubmenu(it)) {
                                        menuitem.appendChild(subMenu);
                                    }

                                    menuitem.className += ' cys-hide-submenu-icon';
                                } else {
                                    menuitem.addEventListener('click', function(event) {
                                        cysOverlay.menu.setAttribute('youtube', event.target.getAttribute("statustext"));
                                    }, false);
                                    menuitem.addEventListener('command', function(event) {
                                        if (!cysOverlay.GetSignatureCode()) {
                                            if (cysOverlay.vid) {
                                                cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, function(data) {
                                                    cysOverlay.ajaxupdateSignature(data, function() {
                                                        cysOverlay.saveVideoFile(event, event.target.parentNode.getAttribute("statustext"), false, event.target.getAttribute("convertTo") || null);
                                                    });
                                                });
                                            }
                                            return;
                                        }
                                        cysOverlay.saveVideoFile(event, event.target.parentNode.getAttribute("statustext"), false, event.target.getAttribute("convertTo") || null);
                                    }, false);
                                }

                                if (quick) {
                                    menuitem.addEventListener("DOMMenuItemActive", cysOverlay.openContext, false);
                                    menuitem.addEventListener("DOMMenuItemInactive", cysOverlay.hideContext, false);
                                    act = it[3].substr(0, 3);
                                    label = document.createElement("label");
                                    if (act === 'Fmt' || act === 'Cnv') {
                                        label.setAttribute("value", cysCommons.getCysString(it[3] + ".2") + '   (' + cysCommons.getCysString(it[3] + '.1' + dash) + ')');
                                    } else {
                                        label.setAttribute("value", it[3]);
                                    }

                                    menuitem.appendChild(label);
                                    if (cols.csize) {
                                        if (sizes)
                                            size = sizes[it[0] + it[1]] || sizes['Fmt' + cysCommons.fmtFromUrl(it[2])];
                                        if (size) {
                                            if (al)
                                                size = parseInt(size) + parseInt(sizes[it[0] + af]);
                                            size = cysOverlay.size2MB(size);
                                        }
                                    }
                                    cysOverlay.addColsToMenuItem(menuitem, it[0], it[1], cols, size, al, af, true, cysCommons.videoIsDash(it[1]) || !cysCommons.requiredFFmpeg(it[1]), it[2]);
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
                                                if (it[0] === 'Fmt')
                                                    sr[it[2]] = 'Fmt' + it[1]; // save url of base format in temp array
                                            }
                                        }
                                    }
                                    addsep = cysOverlay.addColsToMenuItem(menuitem, it[0], it[1], cols, size, al, af, false, cysCommons.videoIsDash(it[1]) || (!isVideo && !cysCommons.requiredFFmpeg(it[1])), it[2]);
                                }
                                menu.classList.add('menu-table');
                                menu.appendChild(menuitem);
                                last = it[0];
                                n++;
                            } else if (last !== it[0] && n > 0) {
                                menu.appendChild(document.createElement('menuseparator'));
                                last = it[0];
                                n++;
                            }
                        }
                    }
                    cysCommons.cysDump("6) in buildDropDownMenu");
                    if (!menu.childNodes.length) {
                        menu.hidden = true;
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in buildDropDown:" + ex, ex.stack);
                }
            },
            /*getStatisticsHtml: function (){
             var ret="";
             try{
             sandbox=Components.utils.Sandbox(gBrowser.contentWindow,{sandboxPrototype:gBrowser.contentWindow, wantXrays:false});
             ret=Components.utils.evalInSandbox("if(document.getElementsByClassName('action-panel-trigger-stats')[0]){ document.getElementById('action-panel-stats').innerHTML; }",sandbox);
             if(ret.indexOf("yt-card-title") === -1){
             var script = "if(document.getElementsByClassName('action-panel-trigger-stats')[0]){ triggerMouseEvent(document.getElementById('action-panel-overflow-button'),'click');triggerMouseEvent(document.getElementsByClassName('action-panel-trigger-stats')[0],'click'); document.getElementById('action-panel-stats').innerHTML; } function triggerMouseEvent(element, eventName, userOptions) { var options = { clientX: 0, clientY: 0, button: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, bubbles: true, cancelable: true }, event = element.ownerDocument.createEvent('MouseEvents'); if (!/^(?:click|mouse(?:down|up|over|move|out))$/.test(eventName)) { throw new Error('Only MouseEvents supported'); } if (typeof userOptions !== 'undefined'){ for (var prop in userOptions) { if (userOptions.hasOwnProperty(prop)) options[prop] = userOptions[prop]; } } event.initMouseEvent(eventName, options.bubbles, options.cancelable,element.ownerDocument.defaultView,  options.button,options.clientX, options.clientY, options.clientX,options.clientY, options.ctrlKey, options.altKey,options.shiftKey, options.metaKey, options.button,element);element.dispatchEvent(event);}";
             ret = Components.utils.evalInSandbox(script,sandbox);
             cysCommons.cysDump("statistics:");
             script = "triggerMouseEvent(document.getElementById('action-panel-overflow-button'),'click'); triggerMouseEvent(document.getElementsByClassName('action-panel-trigger-stats')[0],'click'); function triggerMouseEvent(element, eventName, userOptions) { var options = { clientX: 0, clientY: 0, button: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, bubbles: true, cancelable: true }, event = element.ownerDocument.createEvent('MouseEvents'); if (!/^(?:click|mouse(?:down|up|over|move|out))$/.test(eventName)) { throw new Error('Only MouseEvents supported'); } if (typeof userOptions !== 'undefined'){ for (var prop in userOptions) { if (userOptions.hasOwnProperty(prop)) options[prop] = userOptions[prop]; } } event.initMouseEvent(eventName, options.bubbles, options.cancelable,element.ownerDocument.defaultView,  options.button,options.clientX, options.clientY, options.clientX,options.clientY, options.ctrlKey, options.altKey,options.shiftKey, options.metaKey, options.button,element);element.dispatchEvent(event);}";
             Components.utils.evalInSandbox(script,sandbox);
             cysCommons.cysDump("1)::videoID");
             }
             //cysCommons.cysDump("1)::videoID"+statistics);
             }catch(ex){
             cysCommons.cysDump("error in main page getting statistics."+ex);
             }
             return ret;
             },*/
            getEncCode: function() {
                try {
                    if (cysOverlay.signatureError === 0 || cysOverlay.signatureError !== cysOverlay.vid.id) {
                        cysOverlay.signatureError = cysOverlay.vid.id;
                        // text = doc.body.innerHTML,
                        var scriptURL1 = null,
                            text = cysOverlay.vid.text;
                        var loc = cysCommons.getLink();
                        if (cysCommons.isYouTubeUrl(loc, "watch")) {
                            if (scriptURL1 === null) {
                                scriptURL1 = cysOverlay.findMatch(text, /\"js\":\s*\"([^\"]+)\"/);
                                if (scriptURL1) {
                                    scriptURL1 = scriptURL1.replace(/\\/g, '');
                                }
                            }
                            if (scriptURL1 !== null) {
                                if (scriptURL1.indexOf('//') === 0) {
                                    var url = cysCommons.getLink();
                                    var arr = url.split("/");
                                    var protocol = (arr[0] === 'http:') ? 'http:' : 'https:';
                                    scriptURL1 = protocol + scriptURL1;
                                }

                                if (scriptURL1.indexOf('youtube') === -1) {
                                    var arr = cysCommons.getLink().split("/");
                                    var host = arr[0] + '/' + arr[1] + '/' + arr[2]; //cysCommons.getLink();
                                    scriptURL1 = host + scriptURL1;
                                }

                                cysOverlay.fetchSignatureScript(scriptURL1, true);
                            }
                        } else {
                            if (cysOverlay.vid) {
                                cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, cysOverlay.ajaxupdateSignature);
                            }
                        }
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in getEncCode::" + ex, ex.stack);
                }
            },
            getVideoSize: function(size, cb, fmt, i) {
                if (!cysOverlay.vid) {
                    return;
                }
                try {
                    if (!size) {
                        if (cysOverlay.vid.youTubeFormats !== null) {
                            delete cysOverlay.vid.youTubeFormats[fmt.substr(3)];
                        }
                        if (cb) {
                            cysOverlay.getEncCode();
                        }
                    } else {
                        if (Number(cb) > 1) { // previously queried
                            if (cysOverlay.vid.filesizes[size]) {
                                size = cysOverlay.vid.filesizes[size];
                            } else if (cb < 10) {
                                if (cb === 9) {
                                    cysOverlay.getEncCode();
                                }
                                setTimeout(function() {
                                    cysOverlay.getVideoSize(size, cb++, fmt, i);
                                }, 1000);
                                return;
                            }
                        }
                        var menu = cysOverlay.menu;
                        if ((menu.state === 'open' || menu.open) && !menu.firstChild.disabled) {
                            var t = menu.childNodes[i];
                            var s = cysOverlay.size2MB(size);
                            if (typeof(t) !== 'undefined') {
                                t.setAttribute('size', s);
                                if (t.lastChild) {
                                    var vidid = t.lastChild.getAttribute('videoid');
                                    if (cysOverlay.vid.id === vidid) {
                                        t.lastChild.setAttribute('value', s);
                                    }
                                }
                            }
                        }
                        cysOverlay.vid.filesizes[fmt] = size;
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in getVideoSize:" + ex, ex.stack);
                }
            },
            lookupFileSize: function(url, url2) {
                var s = cysCommons.fmtFromUrl(url);
                if (!s)
                    return null;
                s = parseInt(cysOverlay.vid.filesizes['Fmt' + s]);
                if (!s)
                    return null;
                var s2 = cysCommons.fmtFromUrl(url2);
                if (s2) {
                    s2 = parseInt(cysOverlay.vid.filesizes['Fmt' + s2]);
                    if (s2)
                        s += s2;
                }
                return cysOverlay.size2MB(s);
            },
            size2MB: function(s) {
                if (s < 20971520) {
                    s = (s / 1048576).toFixed(1) + cysCommons.getCysString('filesizein');
                } else {
                    s = (s / 1048576).toFixed(0) + cysCommons.getCysString('filesizein');
                }
                return s;
            },
            getItemElement: function(element) {
                if (!element) {
                    return null;
                }
                var parentId = element.parentNode.getAttribute('item');
                if (!parentId) {
                    return element;
                }
                parentId = parentId.toString();
                var elemId = 'cys-ItemMenu' + parentId;
                return document.getElementById(elemId) || element;
            },
            resetParams: function(target, isDropdown) {
                var childElements = target.childNodes;
                var arrayVideoParameters = [];
                if (isDropdown) {
                    var itemElement = this.getItemElement(target);
                    if (itemElement) {
                        childElements = itemElement.childNodes;
                    }
                }

                try {
                    var params = JSON.parse(this.getItemElement(target).getAttribute('value'));
                    var keys = Object.keys(params).sort();
                    var maxindex = Number(keys.slice(-1)[0]);
                    for (var i = 0; i <= maxindex; i++) {
                        arrayVideoParameters.push(params[i]);
                    }
                } catch (err) {

                }

                if (!arrayVideoParameters.length) {
                    var element = '';
                    for (var key in childElements) {
                        element = childElements[key];
                        if (typeof(element) === 'object' && element.nodeName.toLowerCase() === 'label') {
                            var value = element.getAttribute('value');
                            if (!value && element.classList.contains('cys-icon')) {
                                value = '—';
                            }
                            arrayVideoParameters.push(value);
                        }
                    }
                }

                this.arrayVideoParams['dash'] = arrayVideoParameters[0] === '—' ? 'DASH' : arrayVideoParameters[0];
                this.arrayVideoParams['fmt'] = arrayVideoParameters[1];
                this.arrayVideoParams['format'] = arrayVideoParameters[2];
                this.arrayVideoParams['quality'] = arrayVideoParameters[3];
                this.arrayVideoParams['resolution'] = arrayVideoParameters[4];
                this.arrayVideoParams['size'] = arrayVideoParameters[5];
                this.arrayVideoParams['audio'] = arrayVideoParameters[6];
                this.arrayVideoParams['size_mb'] = arrayVideoParameters[7];

                cysOverlay.vid.title = cysCommons.getTitle();
            },
            saveVideoFile: function(evt, url, saveAs, convertTo, url2) {
                this.resetParams(evt.target);
                try {
                    try {
                        if (cysOverlay.autopopup) {
                            cysOverlay.menu.hidePopup();
                        }
                    } catch (ex) {
                        cysCommons.cysDump("error occured in saveVideoFile:" + ex, ex.stack);
                    }
                    var id = evt.originalTarget.id,
                        menu = evt.originalTarget.parentNode,
                        x, ext, exts, fname, file, file2, files, ext2, fn, fp, lastSaveDir, rv, t;
                    if (menu.hasAttribute('close'))
                        menu.removeAttribute('close');
                    if (saveAs === null || typeof saveAs === 'undefined')
                        saveAs = cysCommons.cysPrefs.getIntPref("menu.dropdown.left.click.save.as") === 0;

                    ext = cysCommons.getVideoFormatByUrl(url, false, convertTo).toLowerCase();
                    if (url2)
                        ext2 = cysCommons.getVideoFormatByUrl(url2, false).toLowerCase();
                    exts = [ext, ext + '.tmp'];
                    if (ext2)
                        exts.push(ext2);

                    fname = cysCommons.getTitle();
                } catch (ex) {
                    cysCommons.cysDump("error in saveVideoFile:" + ex, ex.stack);
                }

                var params = { ok: false };
                var menu = document.getElementById("cys-dropdown-menu");
                var showDialog = false;

                var isVideo = this.arrayVideoParams.fmt.toString().toLowerCase().indexOf('fmt') !== -1;
                var isAudioDash = cysCommons.audioIsDash(cysCommons.fmtFromUrl(url));
                var isRequired = (isVideo && this.arrayVideoParams.dash) || cysCommons.requiredFFmpeg(this.arrayVideoParams.fmt.toString()) || (!isVideo && !isAudioDash);

                try {
                    params.ffmpeg = cysCommons.cysPrefs.getIntPref("ffmpeg.install.status");
                } catch (ex) {
                    params.ffmpeg = -1;
                }

                let canConvert = false;

                canConvert = (cysCommons.cysPrefs.getCharPref("ffmpeg.dir") !== "");

                let onlyAudio = false;
                try {
                    onlyAudio = canConvert && cysCommons.cysPrefs.getBoolPref("ffmpeg.install.audio.only");
                } catch (ex) {}

                if (!cysCommons.isActiveItem(isVideo, isRequired)) {
                    let wparams = params;
                    if (wparams.ffmpeg === -1) {
                        wparams.ffmpeg = 1;
                    }
                    if (isVideo) {
                        //video
                        if (isRequired) {
                            showDialog = true;
                            openDialog("chrome://completeyoutubesaver/content/ffmpegDialogDash.xul", "", "chrome,modal,centerscreen,dialog", wparams);
                        }
                    } else {
                        //audio
                        if (isRequired) {
                            if (wparams.ffmpeg === 2) {
                                return false
                            }
                            showDialog = true;
                            params.format = this.arrayVideoParams.format;
                            openDialog("chrome://completeyoutubesaver/content/ffmpegDialogAudio.xul", "", "chrome,modal,centerscreen,dialog", wparams);
                        }
                    }
                } else if (!canConvert && isRequired && (!isVideo || params.ffmpeg === 0) && params.ffmpeg <= 0) {
                    return false;
                } else if (isRequired && !isVideo && params.ffmpeg === 2 && !onlyAudio) {
                    return false;
                }

                if (params.ffmpeg <= 0) {
                    cysCommons.canConvert = false;
                }

                if (showDialog) {
                    if (params.ok) {
                        if (params.ffmpeg === 1) {
                            params.ok = false;
                            openDialog("chrome://completeyoutubesaver/content/installDialog.xul", "", "chrome,modal,centerscreen,dialog", params);
                        }
                        if (params.ok) {
                            cysCommons.cysPrefs.setIntPref("ffmpeg.install.status", params.ffmpeg);
                        }
                    } else {
                        cysOverlay.mode = cysOverlay.lastmode;
                        menu.openPopup(menu.parentNode, 'after_start', 0, 0, false, false, null);
                    }
                    return false;
                }

                try {
                    var openFolderPath = null;

                    if (saveAs) {
                        openedFolder = 0;
                        lastSaveDir = decodeURIComponent(cysCommons.cysPrefs.getCharPref("last.download.dir") || cysOverlay.defaultdir);
                        if (id.substr(id.length - 14) === 'lastprojectdir') {
                            lastSaveDir = cysOverlay.lastprojectdir;
                            if (cysCommons.cysPrefs.getBoolPref("save2last.useprojectname"))
                                fname = cysCommons.getFile(lastSaveDir).leafName;
                        }

                        fname = fname.replace(/\//g, '-');
                        files = cysCommons.getFileNames(lastSaveDir, fname, exts);
                        fn = files.fn;
                        file = files.f0;
                        if (url2)
                            file2 = files.f2;
                        if (fn.indexOf("." + ext) === -1 && ext !== null && ext !== "") {
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
                        if (rv === Ci.nsIFilePicker.returnOK || rv === Ci.nsIFilePicker.returnReplace) {
                            file = fp.file;
                            filepath = file.path;
                            /*solve linux/mac os path issue*/
                            if (filepath.indexOf("." + ext) === -1 && ext !== null && ext !== "") {
                                filepath = filepath + "." + ext;
                            }
                            var applyQuality = false;
                            if (url2) {
                                t = filepath;
                                quality = cysCommons.getVideoFormatByUrl(url, true).match(/(\d+)p/i);
                                if (quality) {
                                    quality = parseInt(quality[1]);
                                } else {
                                    quality = 0;
                                }
                                applyQuality = (quality >= 720 || cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio.all"));
                                if (cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") === true && typeof cysOverlay.vid.youTubeFormats['22'] !== 'undefined' && (ext.toLowerCase() === "mp4") && applyQuality) {
                                    file2.initWithPath(t.substr(0, t.length - (ext.length + 1)) + "_fmt22audio." + ext2.toLowerCase());
                                } else {
                                    file2.initWithPath(t.substr(0, t.length - ext.length) + ext2);
                                }
                            }
                            cysCommons.cysPrefs.setCharPref("last.download.dir", encodeURIComponent(file.parent.path));

                            cysCommons.download(url, file, false, cysCommons.cysPrefs.getBoolPref('download.dta'), cysOverlay.vid.referer, convertTo, false, url2, file2, ext, cysCommons.stopConvert(isVideo, onlyAudio, isRequired, params.ffmpeg), cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") && params.ffmpeg === 2 && onlyAudio && applyQuality);
                            openFolderPath = file.parent;
                        }

                    } else {
                        openedFolder = 0;
                        files = cysCommons.getFileNames(cysOverlay.defaultdir, fname, exts);
                        file = files.f0;
                        var applyQuality = false
                        if (url2) {
                            file2 = files.f2;
                            t = file.path;
                            quality = cysCommons.getVideoFormatByUrl(url, true).match(/(\d+)p/i);
                            if (quality) {
                                quality = parseInt(quality[1]);
                            } else {
                                quality = 0;
                            }
                            applyQuality = (quality >= 720 || cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio.all"));
                            if (cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") === true && typeof cysOverlay.vid.youTubeFormats['22'] !== 'undefined' && (ext.toLowerCase() === "mp4") && applyQuality) {
                                file2.initWithPath(t.substr(0, t.length - (ext.length + 1)) + "_fmt22audio." + ext2.toLowerCase());
                            } else {
                                file2.initWithPath(t.substr(0, t.length - ext.length) + ext2);
                            }
                        }
                        cysCommons.download(url, file, false, cysCommons.cysPrefs.getBoolPref('download.dta'), cysOverlay.vid.referer, convertTo, false, url2, file2, ext, cysCommons.stopConvert(isVideo, onlyAudio, isRequired, params.ffmpeg), cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") && params.ffmpeg === 2 && onlyAudio && applyQuality);
                        openFolderPath = file.parent;
                    }

                    if (cysCommons.cysPrefs.getBoolPref("download.subtitles") === true && openFolderPath !== null) {
                        cysOverlay.getSubtitleContent(null, false, file.parent.path, file.leafName);
                    }

                    if (openedFolder === 0) {
                        cysCommons.openTargetFolder(openFolderPath);
                        openedFolder = 1;
                    }

                    if (menu.hasAttribute('close2'))
                        menu.removeAttribute('close2');

                } catch (ex) {
                    console.log(ex);
                    console.log(ex.stack);
                    //cysCommons.cysDump(ex, ex.stack);

                }
            },
            getSubtitleContent: function(data, cb, path, filename) {
                if (cb) {
                    var limitofcount = 5;
                    if (cysCommons.cysPrefs.getCharPref("subtitle.language") === 'en' || cysCommons.cysPrefs.getCharPref("subtitle.language") === 'en-GB') {
                        limitofcount = 4;
                    }
                    if (cysCommons.cysPrefs.getBoolPref("ignore.auto.subtitles")) {
                        cysOverlay.getSubtitleCounter[path + filename]++;
                    }
                    if ((data === "" || data === null || data === 0) && cysOverlay.getSubtitleCounter[path + filename] < limitofcount) {
                        cysCommons.getAJAX(cysOverlay.getSubtitleUrl(cysOverlay.getSubtitleCounter[path + filename]), cysOverlay.getSubtitleContent, "GET", null, path, filename);
                        cysOverlay.getSubtitleCounter[path + filename]++;
                    } else if (data != "") {
                        delete cysOverlay.getSubtitleCounter[path + filename];
                        if (filename.indexOf(".") > -1) {
                            var tempf = filename.split(".");
                            filename = tempf[0];
                        }
                        var a = [path, filename + ".srt"];
                        cysCommons.writeFile(cysCommons.getFile(a), cysCommons.xmlToSrt(data), 'UTF-8');
                    }
                } else {
                    cysOverlay.getSubtitleCounter[path + filename] = 0;
                    cysCommons.getAJAX(cysOverlay.getSubtitleUrl(cysOverlay.getSubtitleCounter[path + filename]), cysOverlay.getSubtitleContent, "GET", null, path, filename);
                    cysOverlay.getSubtitleCounter[path + filename]++;
                }
            },
            getSubtitleUrl: function(counter) {
                var langslug = cysCommons.cysPrefs.getCharPref("subtitle.language");
                if (counter >= 2 && (langslug === 'en' || langslug === 'en-GB')) {
                    if (langslug === 'en') {
                        langslug = 'en-GB';
                    } else {
                        langslug = 'en';
                    }
                }
                return cysCommons.getSubtitleUrl(counter, cysOverlay.vid.cc_asr, cysCommons.cysPrefs.getBoolPref("ignore.auto.subtitles"), cysOverlay.vid.ttsurl, langslug);
            },
            onpopuphiding: function(evt) {
                var menu = cysOverlay.menu;
                cysOverlay.mode = null;
                menu.setAttribute('lastclosed', cysCommons.cTime());
                if (cysOverlay.autopopup)
                    return true;
                if (evt.target.getAttribute("id").indexOf("cys-DropdownContextMenu") !== -1) {
                    return true;
                }
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
            onpopuphiding2: function(evt) {
                var menu = cysOverlay.menu;
                cysOverlay.mode = null;
                menu.setAttribute('close', 'false');
                menu.removeAttribute('close2');
                return true;
            },
            contextMenuClickShowing: function(evt) {
                var id = "cys-DropdownContextMenu";
                var elem = document.getElementById(id);
                if (!elem) {
                    return false;
                }
                elem.setAttribute("youtube", cysOverlay.menu.getAttribute("youtube"));
            },
            copyToClipboard: function(copytext) {
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
                } catch (ex) {
                    cysCommons.cysDump("error in copyToClipboard:" + ex, ex.stack);
                }
            },
            contextMenuClick: function(evt) {
                cysCommons.cysDump('contextMenuClick');
                evt.preventDefault();
                evt.stopPropagation();
                var menu = cysOverlay.menu;
                menu.removeAttribute('close2');
                menu.removeAttribute('close');
                menu.setAttribute('contextClicked', true);
                menu.hidePopup();
                var url, url2, id, convertTo, et = evt.originalTarget;
                if (cysOverlay.autopopup) {
                    url = et.getAttribute("statustext");
                    url2 = et.getAttribute("statustext2");
                } else {
                    url = et.parentNode.getAttribute("youtube");
                }

                this.resetParams(evt.target, true);
                et.parentNode.removeAttribute("youtube");
                id = et.id;
                if (et.hasAttribute('convertTo'))
                    convertTo = et.getAttribute('convertTo');

                if (!cysOverlay.GetSignatureCode()) {
                    if (cysOverlay.vid) {
                        cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, function(data) {
                            cysOverlay.ajaxupdateSignature(data, function() {
                                cysOverlay.contextMenuClick(evt);
                            });
                        });
                    }
                    return;
                }
                if (id === 'cys-saveas' || id === 'cys-saveaudioas' || id === 'cys-savelastprojectdir' || id === 'cys-saveaudiolastprojectdir') {
                    cysOverlay.saveVideoFile(evt, url, true, convertTo, url2);
                } else if (id === 'cys-savedefault' || id === 'cys-saveaudiodefault') {
                    cysOverlay.saveVideoFile(evt, url, false, convertTo, url2);
                } else if (id === 'cys-link') {
                    if (url2)
                        url += ('\n' + url2);
                    cysOverlay.copyToClipboard(url);
                } else if (id === 'cys-savecomplete' || id === 'cys-savecompletewaudio') {
                    cysOverlay.cysButtonClick(url, convertTo, url2, true);
                }
            },
            getYouTubeVideoID: function() {
                var url = cysCommons.getLink();
                if (!url) {
                    return '';
                }
                var videoid = (url.split('#')[0]).match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?.*v=|\/)([^\s&]+)/);

                if (videoid != null) {
                    return videoid[1];
                }
            },
            getCommetdata: function() {
                console.log("getcommetn");
                return cysOverlay.vid.comment;
            },
            setComment: function(data) {
                try {
                    var data = JSON.parse(data);
                    if (!data.pageInfo) {
                        return;
                    }
                    var text = "<div id='watch-discussion' class='branded-page-box yt-card scrolldetect' data-scrolldetect-callback='comments-delay-load'><div id='comment-section-renderer' class='comment-section-renderer'><h2 class='comment-section-header-renderer' tabindex='0'><b>Comments</b> total <span class='alternate-content-link'></span> </h2><div class='comment-simplebox-renderer yt-uix-servicelink'><span class='video-thumb comment-author-thumbnail yt-thumb yt-thumb-48'><span class='yt-thumb-square'><span class='yt-thumb-clip'><img tabindex='0' role='img' height='48' width='48' alt='' data-ytimg='1' src='//s.ytimg.com/yts/img/avatar_48-vfllY0UTT.png' onload=';'><span class='vertical-align'></span></span></span></span><div class='comment-simplebox-renderer-collapsed comment-section-renderer-redirect'><div class='comment-simplebox-renderer-collapsed-content'>Add a public comment...</div><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div></div></div><div class='yt-uix-menu comment-section-sort-menu'>  <button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-menu-trigger' type='button' onclick=';return false;' aria-pressed='false' aria-label='Action menu.' aria-haspopup='true' role='button' aria-controls='aria-menu-id-3' id='kbd-nav-487622'><span class='yt-uix-button-content'>Newest first</span><span class='yt-uix-button-arrow yt-sprite'></span></button><div class='yt-uix-menu-content yt-ui-menu-content yt-uix-kbd-nav yt-uix-menu-content-hidden' role='menu' aria-expanded='false' id='aria-menu-id-3' data-kbd-nav-move-out='kbd-nav-487622' style='min-width: 106px; left: 156.5px; top: 914px;'><ul tabindex='0' class='yt-uix-kbd-nav yt-uix-kbd-nav-list'><li>  <button type='button' class='yt-ui-menu-item yt-uix-menu-close-on-select comment-section-sort-menu-item yt-uix-sessionlink'  data-menu_name='top-comments'><span class='yt-ui-menu-item-label'>Top comments</span></button></li><li>  <button type='button' class='yt-ui-menu-item yt-uix-menu-close-on-select comment-section-sort-menu-item yt-uix-sessionlink'  data-menu_name='newest-first'><span class='yt-ui-menu-item-label'>Newest first</span></button></li></ul></div></div><div id='comment-section-renderer-items' class='comment-section-renderer-items'>";
                    //vat text="<div id='watch-discussion' class='branded-page-box yt-card scrolldetect' data-scrolldetect-callback='comments-delay-load'><div id='comment-section-renderer' class='comment-section-renderer'><h2 class='comment-section-header-renderer' tabindex='0'><b>Comments</b> total <span class='alternate-content-link'></span> </h2><div class='comment-simplebox-renderer yt-uix-servicelink'><span class='video-thumb comment-author-thumbnail yt-thumb yt-thumb-48'><span class='yt-thumb-square'><span class='yt-thumb-clip'><img tabindex='0' role='img' height='48' width='48' alt='' data-ytimg='1' src='//s.ytimg.com/yts/img/avatar_48-vfllY0UTT.png' onload=';__ytRIL(this)'><span class='vertical-align'></span></span></span></span><div class='comment-simplebox-renderer-collapsed comment-section-renderer-redirect'><div class='comment-simplebox-renderer-collapsed-content'>Add a public comment...</div><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div></div></div><div class='yt-uix-menu comment-section-sort-menu'>  <button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-menu-trigger' type='button' onclick=';return false;' aria-pressed='false' aria-label='Action menu.' aria-haspopup='true' role='button' aria-controls='aria-menu-id-3' id='kbd-nav-487622'><span class='yt-uix-button-content'>Newest first</span><span class='yt-uix-button-arrow yt-sprite'></span></button><div class='yt-uix-menu-content yt-ui-menu-content yt-uix-kbd-nav yt-uix-menu-content-hidden' role='menu' aria-expanded='false' id='aria-menu-id-3' data-kbd-nav-move-out='kbd-nav-487622' style='min-width: 106px; left: 156.5px; top: 914px;'><ul tabindex='0' class='yt-uix-kbd-nav yt-uix-kbd-nav-list'><li>  <button type='button' class='yt-ui-menu-item yt-uix-menu-close-on-select comment-section-sort-menu-item yt-uix-sessionlink'  data-menu_name='top-comments'><span class='yt-ui-menu-item-label'>Top comments</span></button></li><li>  <button type='button' class='yt-ui-menu-item yt-uix-menu-close-on-select comment-section-sort-menu-item yt-uix-sessionlink'  data-menu_name='newest-first'><span class='yt-ui-menu-item-label'>Newest first</span></button></li></ul></div></div><div id='comment-section-renderer-items' class='comment-section-renderer-items'>";
                    for (i = 0; i < data.pageInfo.totalResults; i++) {
                        if (typeof data.items[i].snippet.topLevelComment.snippet.authorDisplayName != 'undefined') {
                            var commentdata = data.items[i].snippet.topLevelComment.snippet.textDisplay;
                            commentdata = commentdata.split('"').join('&#034;');
                            text += "<section class='comment-thread-renderer'><div class='comment-renderer' data-cid='" + data.items[i].id + "'><a href='" + data.items[i].snippet.topLevelComment.snippet.authorChannelUrl + "' class='yt-uix-sessionlink  g-hovercard' data-ytid='" + data.items[i].snippet.topLevelComment.snippet.authorChannelId.value + "'>  <span class='video-thumb comment-author-thumbnail yt-thumb yt-thumb-48'><span class='yt-thumb-square'><span class='yt-thumb-clip'><img width='48' height='48' role='img' tabindex='0' src='" + data.items[i].snippet.topLevelComment.snippet.authorProfileImageUrl + "' data-ytimg='1' onload=';'><span class='vertical-align'></span></span></span></span></a><div id='' class='comment-simplebox-edit' data-editable-content-text='' data-image-src='' data-video-id=''></div><div class='comment-renderer-content'><div class='comment-renderer-header'><a href='" + data.items[i].snippet.topLevelComment.snippet.authorChannelUrl + "' class='yt-uix-sessionlink comment-author-text g-hovercard' data-ytid='" + data.items[i].snippet.topLevelComment.snippet.authorChannelId.value + "'>" + data.items[i].snippet.topLevelComment.snippet.authorDisplayName + "</a><span class='comment-renderer-time' tabindex='0'><a href='/watch?v=" + data.items[i].snippet.topLevelComment.snippet.videoId + "' class=' yt-uix-sessionlink'  rel='nofollow' target='_blank'> " + data.items[i].snippet.topLevelComment.snippet.publishedAt + "</a></span></div><div class='comment-renderer-text' tabindex='0' role='article'><div class='comment-renderer-text-content'>" + commentdata + "</div><div class='comment-text-toggle hid'><div class='comment-text-toggle-link read-more'><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-link' type='button' onclick='return false;'><span class='yt-uix-button-content'>Read more</span></button></div><div class='comment-text-toggle-link show-less hid'><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-link' type='button' onclick='return false;'><span class='yt-uix-button-content'>Show less</span></button></div></div></div><div class='comment-renderer-footer' data-vote-status='INDIFFERENT'><button class='yt-uix-button yt-uix-button-size-small yt-uix-button-link comment-renderer-reply yt-uix-sessionlink' type='button' onclick=';window.location.href=this.getAttribute('href');return false;' role='link' href='https://accounts.google.com/ServiceLogin?passive=true&amp;amp;hl=en&amp;amp;continue=http%3A%2F%2Fwww.youtube.com%2Fsignin%3Fhl%3Den%26next%3D%252Fwatch%253Fv%253DJgHQsgUjnDM%26action_handle_signin%3Dtrue%26app%3DNone&amp;amp;uilel=3&amp;amp;service=youtube' data-sessionlink='itct=CJIBEPBbIhMIqvGQpcD6zgIVoDxoCh2qPwyr'><span class='yt-uix-button-content'>Reply</span></button><span class='comment-renderer-like-count on'>" + data.items[i].snippet.topLevelComment.snippet.authorDisplayName + "</span>  <button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup comment-action-buttons-renderer-thumb yt-uix-sessionlink sprite-comment-actions sprite-like' type='button' onclick=';window.location.href=this.getAttribute('href');return false;' role='link' aria-label='Like' href='https://accounts.google.com/ServiceLogin?passive=true&amp;amp;hl=en&amp;amp;continue=http%3A%2F%2Fwww.youtube.com%2Fsignin%3Fhl%3Den%26next%3D%252Fwatch%253Fv%253DJgHQsgUjnDM%26action_handle_signin%3Dtrue%26app%3DNone&amp;amp;uilel=3&amp;amp;service=youtube' data-sessionlink='itct=CJMBEPBbIhMIqvGQpcD6zgIVoDxoCh2qPwyr'></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup comment-action-buttons-renderer-thumb yt-uix-sessionlink sprite-comment-actions sprite-dislike' type='button' onclick=';window.location.href=this.getAttribute('href');return false;' role='link' aria-label='Dislike' href=''></button></div></div></div><div class='comment-replies-renderer' data-visibility-tracking=''></div></section>";
                        }
                    }
                    //text +="<button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more comment-section-renderer-paginator yt-uix-sessionlink' type='button' onclick=';return false;' aria-label='Show more' data-uix-load-more-post='true' data-sessionlink='itct=CAEQuy8iEwjd7t3BiPvOAhWUi2gKHcd7Cfo' data-uix-load-more-target-id='comment-section-renderer-items' data-uix-load-more-href='/comment_service_ajax?action_get_comments=1' data-uix-load-more-post-body='page_token=EhYSC0pnSFFzZ1VqbkRNwAEAyAEA4AEBGAYyzAIKuAJDZzBRakplaHU0ajd6Z0lnQUNnQkVza0JDQUFRa05LY2hvVDd6Z0lxdXdHSnY0ekc3SWFnNkhIZXd2UHZ6TFM2M2tpQ2hmK294dDJhK0lVQjNlbW1qSTdJbXVvejNKZnQ3dFArdnFtbkFlK0E3N2VDKzRHSHRnSDNoSkxmcC9qejR6L3ExK0grNEk3ZTdTT1J0dVQxeG9udndva0JwOXVaK3UvYnNLZGE1dVAwbGVYNDhNSlh1cmpzeSsvOW9wNDZqS3VWZ1l1a2o0SkU2ZmZSbTVtU3E5aDM5YnpOcXV5Z3ViOTduTW1YL1BtMC9jcW9BZnVhdFlISm04RGxiSUQ2dzVTejdQendsUUh0eGRUbXJ0TE03VG1HeUwvN3kreVI2NjhCR0FFZ0ZDaTBuKzNiMXRpV25HWT0iDyILSmdIUXNnVWpuRE0wAA%253D%253D' data-sessionlink-target='/comment_service_ajax?action_get_comments=1'><span class='yt-uix-button-content'>  <span class='load-more-loading hid'><span class='yt-spinner'><span class='yt-spinner-img  yt-sprite' title='Loading icon'></span>Loading...</span></span><span class='load-more-text'>Show more</span></span></button><div class='comment-simplebox' id='comment-simplebox'><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div><div class='comment-simplebox-frame'><div class='comment-simplebox-prompt'></div><div class='comment-simplebox-text' role='textbox' aria-multiline='true' contenteditable='plaintext-only'></div></div><div class='comment-simplebox-controls'><div class='comment-simplebox-buttons'><span class='comment-simplebox-character-counter'></span><span class='comment-simplebox-error-message hid' data-placeholder='Comment failed to post.'></span><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-simplebox-cancel' type='button' onclick=';return false;'><span class='yt-uix-button-content'>Cancel</span></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-primary yt-uix-button-empty comment-simplebox-submit yt-uix-sessionlink' type='button' onclick=';return false;' data-params='' data-target=''></button></div></div>  <span class='yt-spinner-img comment-simplebox-loading yt-sprite' title='Loading icon'></span></div><div class='feedback-banner hid'></div><span class='yt-spinner-img comment-renderer-loading yt-sprite' title='Loading icon'></span><div class='hid' id='comment-renderer-abuse'><div class='comment-renderer-abuse-content'></div></div></div></div>";
                    text += "</div><button class='cyscommnet yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more comment-section-renderer-paginator yt-uix-sessionlink' type='button' onclick=';return false;' aria-label='Show more' data-uix-load-more-post='true' data-uix-load-more-target-id='comment-section-renderer-items'  ><span class='yt-uix-button-content'>  <span class='load-more-loading hid'><span class='yt-spinner'><span title='Loading icon' class='yt-spinner-img  yt-sprite'></span>Loading...</span></span><span class='load-more-text'>Show more</span></span></button><div class='comment-simplebox' id='comment-simplebox'><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div><div class='comment-simplebox-frame'><div class='comment-simplebox-prompt'></div><div class='comment-simplebox-text' role='textbox' aria-multiline='true' contenteditable='plaintext-only'></div></div><div class='comment-simplebox-controls'><div class='comment-simplebox-buttons'><span class='comment-simplebox-character-counter'></span><span class='comment-simplebox-error-message hid' data-placeholder='Comment failed to post.'></span><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-simplebox-cancel' type='button' onclick=';return false;'><span class='yt-uix-button-content'>Cancel</span></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-primary yt-uix-button-empty comment-simplebox-submit yt-uix-sessionlink' type='button' onclick=';return false;' data-target='' data-params=''></button></div></div>  <span title='Loading icon' class='yt-spinner-img comment-simplebox-loading yt-sprite'></span></div><div class='feedback-banner hid'></div><span title='Loading icon' class='yt-spinner-img comment-renderer-loading yt-sprite'></span><div class='hid' id='comment-renderer-abuse'><div class='comment-renderer-abuse-content'></div></div></div></div>";
                    //text +="</div><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more comment-section-renderer-paginator yt-uix-sessionlink' type='button' onclick=';return false;' aria-label='Show more' data-uix-load-more-post='true' data-uix-load-more-target-id='comment-section-renderer-items'  ><span class='yt-uix-button-content'>  <span class='load-more-loading hid'><span class='yt-spinner'><span title='Loading icon' class='yt-spinner-img  yt-sprite'></span>Loading...</span></span><span class='load-more-text'>Show more</span></span></button><div class='comment-simplebox' id='comment-simplebox'><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div><div class='comment-simplebox-frame'><div class='comment-simplebox-prompt'></div><div class='comment-simplebox-text' role='textbox' aria-multiline='true' contenteditable='plaintext-only'></div></div><div class='comment-simplebox-controls'><div class='comment-simplebox-buttons'><span class='comment-simplebox-character-counter'></span><span class='comment-simplebox-error-message hid' data-placeholder='Comment failed to post.'></span><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-simplebox-cancel' type='button' onclick=';return false;'><span class='yt-uix-button-content'>Cancel</span></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-primary yt-uix-button-empty comment-simplebox-submit yt-uix-sessionlink' type='button' onclick=';return false;' data-target='' data-params=''></button></div></div>  <span title='Loading icon' class='yt-spinner-img comment-simplebox-loading yt-sprite'></span></div><div class='feedback-banner hid'></div><span title='Loading icon' class='yt-spinner-img comment-renderer-loading yt-sprite'></span><div class='hid' id='comment-renderer-abuse'><div class='comment-renderer-abuse-content'></div></div></div></div>";
                    cysOverlay.vid.comment = text;
                } catch (ex) {
                    var text = "<div id='watch-discussion' class='branded-page-box yt-card scrolldetect' data-scrolldetect-callback='comments-delay-load'><div id='comment-section-renderer' class='comment-section-renderer'><h2 class='comment-section-header-renderer' tabindex='0'><b>Comments</b> total <span class='alternate-content-link'></span> </h2><div class='comment-simplebox-renderer yt-uix-servicelink'><span class='video-thumb comment-author-thumbnail yt-thumb yt-thumb-48'><span class='yt-thumb-square'><span class='yt-thumb-clip'><img tabindex='0' role='img' height='48' width='48' alt='' data-ytimg='1' src='//s.ytimg.com/yts/img/avatar_48-vfllY0UTT.png' onload=';'><span class='vertical-align'></span></span></span></span><div class='comment-simplebox-renderer-collapsed comment-section-renderer-redirect'><div class='comment-simplebox-renderer-collapsed-content'>Add a public comment...</div><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div></div></div><div class='yt-uix-menu comment-section-sort-menu'>  <button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default yt-uix-menu-trigger' type='button' onclick=';return false;' aria-pressed='false' aria-label='Action menu.' aria-haspopup='true' role='button' aria-controls='aria-menu-id-3' id='kbd-nav-487622'><span class='yt-uix-button-content'>Newest first</span><span class='yt-uix-button-arrow yt-sprite'></span></button><div class='yt-uix-menu-content yt-ui-menu-content yt-uix-kbd-nav yt-uix-menu-content-hidden' role='menu' aria-expanded='false' id='aria-menu-id-3' data-kbd-nav-move-out='kbd-nav-487622' style='min-width: 106px; left: 156.5px; top: 914px;'><ul tabindex='0' class='yt-uix-kbd-nav yt-uix-kbd-nav-list'><li>  <button type='button' class='yt-ui-menu-item yt-uix-menu-close-on-select comment-section-sort-menu-item yt-uix-sessionlink'  data-menu_name='top-comments'><span class='yt-ui-menu-item-label'>Top comments</span></button></li><li>  <button type='button' class='yt-ui-menu-item yt-uix-menu-close-on-select comment-section-sort-menu-item yt-uix-sessionlink'  data-menu_name='newest-first'><span class='yt-ui-menu-item-label'>Newest first</span></button></li></ul></div></div><div id='comment-section-renderer-items' class='comment-section-renderer-items'>";
                    text += "Disabled or not found.</div><button class='cyscommnet yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more comment-section-renderer-paginator yt-uix-sessionlink' type='button' onclick=';return false;' aria-label='Show more' data-uix-load-more-post='true' data-uix-load-more-target-id='comment-section-renderer-items'  ><span class='yt-uix-button-content'>  <span class='load-more-loading hid'><span class='yt-spinner'><span title='Loading icon' class='yt-spinner-img  yt-sprite'></span>Loading...</span></span><span class='load-more-text'>Show more</span></span></button><div class='comment-simplebox' id='comment-simplebox'><div class='comment-simplebox-arrow'><div class='arrow-inner'></div><div class='arrow-outer'></div></div><div class='comment-simplebox-frame'><div class='comment-simplebox-prompt'></div><div class='comment-simplebox-text' role='textbox' aria-multiline='true' contenteditable='plaintext-only'></div></div><div class='comment-simplebox-controls'><div class='comment-simplebox-buttons'><span class='comment-simplebox-character-counter'></span><span class='comment-simplebox-error-message hid' data-placeholder='Comment failed to post.'></span><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-default comment-simplebox-cancel' type='button' onclick=';return false;'><span class='yt-uix-button-content'>Cancel</span></button><button class='yt-uix-button yt-uix-button-size-default yt-uix-button-primary yt-uix-button-empty comment-simplebox-submit yt-uix-sessionlink' type='button' onclick=';return false;' data-target='' data-params=''></button></div></div>  <span title='Loading icon' class='yt-spinner-img comment-simplebox-loading yt-sprite'></span></div><div class='feedback-banner hid'></div><span title='Loading icon' class='yt-spinner-img comment-renderer-loading yt-sprite'></span><div class='hid' id='comment-renderer-abuse'><div class='comment-renderer-abuse-content'></div></div></div></div>";
                    cysOverlay.vid.comment = text;
                    cysCommons.cysDump("error in setcomment function " + ex, ex.stack);
                }
            },
            adopen: function() {
                try {
                    cysCommons.cysDump('adopen');
                    if (cysCommons.cysPrefs.getBoolPref("cyspopup")) {
                        if (cysCommons.cysPrefs.getBoolPref("cyspopup_show")) {
                            openDialog("chrome://completeyoutubesaver/content/popup.xul", "", "chrome,titlebar,toolbar,modal,dialog=yes,resizable=no,left=0,top=0");
                        } else {
                            var d = new Date(cysCommons.cysPrefs.getCharPref("cyspopup_time"));
                            var d1 = new Date()
                            var timeDiff = Math.abs(d.getTime() - d1.getTime());
                            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            if (diffDays > 2) {
                                openDialog("chrome://completeyoutubesaver/content/popup.xul", "", "chrome,titlebar,toolbar,modal,dialog=yes,resizable=no,left=0,top=0");
                            }
                        }
                    }
                } catch (e) { console.log(e) }
            },
            cysButtonClick: function(url, convertTo, url2, inMenu) {
                cysCommons.cysDump('cysButtonClick');
                var menu = cysOverlay.menu;
                var mode = cysCommons.cysPrefs.getIntPref('button.left.click.open');

                cysOverlay.lastclick = 'button';
                menu.hidden = false;

                if (mode === 2 && !inMenu) {
                    this.openOptions();
                    return false;
                }
                if (!url) {
                    if (menu.state === 'closed' && !menu.hasAttribute('button')) {
                        //use for the contribution
                        //cysOverlay.adopen();
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

                var curObj = {
                    title: cysOverlay.vid.title,
                    Comment: cysOverlay.vid.comment,
                    savedir: null,
                    projDir: null,
                    curpage: cpage,
                    convert: convertTo,
                    age: cysOverlay.vid.age,
                    videoID: cysOverlay.vid.id,
                    ttsurl: cysOverlay.vid.ttsurl,
                    cc_asr: cysOverlay.vid.cc_asr,
                    gBrowserParent: gBrowser,
                    videoUrl: url,
                    videoName: null,
                    pageUrl: targetUrl,
                    videoFile: null,
                    ok: false,
                    formatStr: '',
                    ccount: cysOverlay.vid.ccount,
                    detail: cysOverlay.vid.detail,
                    size: size,
                    js1: this.js1,
                    js2: this.js2 /*, stathtml:cysOverlay.vid.stathtml*/
                };

                curObj.vid = cysOverlay.vid;

                openDialog("chrome://completeyoutubesaver/content/saveDialog.xul", "", "chrome,modal,centerscreen,dialog", curObj);
                if (curObj.ok) {

                    if (curObj.saveStat && (typeof curObj.js1 !== 'string' || typeof curObj.js2 !== 'string')) {
                        var mdir = cysCommons.getFile([curObj.savedir, curObj.title, 'MData']);
                        if (!mdir.exists() || !mdir.isDirectory())
                            mdir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                        this.js1 = mdir.clone();
                        this.js1.append('js');
                        this.js2 = mdir.clone();
                        this.js2.append('cc');
                        this.js_1 = cysCommons.download('http://www.google.com/jsapi', this.js1, 1, 0);
                        //this.js_2 = cysCommons.download('http://www.google.com/uds/api/visualization/1.0/85433ced5f4f5ecf8f1c2c20eb7b5d63/format+en,default+en,ui+en,corechart+en.I.js',this.js2,1,0);

                        this.js_2 = cysCommons.download('http://www.google.com/uds/api/visualization/1.0/ce05bcf99b897caacb56a7105ca4b6ed/format+en,default+en,ui+en,corechart+en.I.js', this.js2, 1, 0);
                        this.js_1i = setInterval(function() {
                            cysOverlay.loadAPI(1);
                        }, 500);
                        this.js_2i = setInterval(function() {
                            cysOverlay.loadAPI(2);
                        }, 500);
                    }
                    cysOverlay.lastprojectdir = curObj.projDir;
                    document.getElementById("cys-save-project-to-last-folder").setAttribute("hidden", false);
                    document.getElementById("cys-save-project-to-last-folder-top-sep").setAttribute("hidden", false);
                    document.getElementById("cys-save-project-to-last-folder").setAttribute("tooltiptext", curObj.projDir);
                    if (curObj.videoFile) {
                        var ext, ext2, file2, t;
                        var applyQuality = false;
                        if (url2) {
                            file2 = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                            ext = cysCommons.getVideoFormatByUrl(curObj.videoUrl, false).toLowerCase();
                            ext2 = cysCommons.getVideoFormatByUrl(url2, false).toLowerCase();
                            t = curObj.videoFile.path;

                            quality = cysCommons.getVideoFormatByUrl(curObj.videoUrl, true).match(/(\d+)p/i);
                            if (quality) {
                                quality = parseInt(quality[1]);
                            } else {
                                quality = 0;
                            }
                            applyQuality = (quality >= 720 || cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio.all"));
                            if (cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") === true && typeof cysOverlay.vid.youTubeFormats['22'] !== 'undefined' && (ext.toLowerCase() === "mp4") && applyQuality) {
                                file2.initWithPath(t.substr(0, t.length - (ext.length + 1)) + "_fmt22audio." + ext2.toLowerCase());
                            } else {
                                file2.initWithPath(t.substr(0, t.length - ext.length) + ext2);
                            }
                        }
                        var ffmpegStatus = -1;
                        try {
                            ffmpegStatus = cysCommons.cysPrefs.getIntPref("ffmpeg.install.status");
                        } catch (ex) {}

                        var onlyAudio = false;
                        try {
                            onlyAudio = cysCommons.canConvert && cysCommons.cysPrefs.getBoolPref("ffmpeg.install.audio.only");
                        } catch (ex) {}

                        var dashAudio = false;
                        if (!url2) {
                            if (curObj.convert) {
                                dashAudio = cysCommons.audioIsDash(curObj.convert, true);
                            } else {
                                dashAudio = cysCommons.audioIsDash(cysCommons.fmtFromUrl(curObj.videoUrl));
                            }
                        }

                        if (!cysOverlay.GetSignatureCode()) {
                            if (cysOverlay.vid) {
                                cysCommons.getAJAX("https://www.youtube.com/watch?v=" + cysOverlay.vid.id, function(data) {
                                    cysOverlay.ajaxupdateSignature(data);
                                    setTimeout(function() {
                                        cysOverlay.cysButtonClick(url, convertTo, url2, inMenu);
                                    }, 2000);
                                });
                            }
                            return;
                        }
                        cysCommons.download(curObj.videoUrl, curObj.videoFile, false, curObj.useDTA, curObj.pageUrl, convertTo, false, url2, file2, ext, !cysCommons.canConvert || ffmpegStatus === 0 || (ffmpegStatus === 2 && (url2 || !onlyAudio)) || dashAudio, cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") && ffmpegStatus === 2 && onlyAudio && applyQuality);
                    }

                    openDialog("chrome://completeyoutubesaver/content/smallSaveDialog.xul", "", "chrome,dialog,minimizable,resizable", curObj);
                }
            },
            loadAPI: function(f) { // load chart libraries into memory
                if (cysOverlay['js_' + f].currentState !== 3)
                    return;
                clearInterval(cysOverlay['js_' + f + 'i']);
                cysOverlay['js_' + f] = null;
                this['loadAPI' + f] = function(data, id) {
                    var j = id.substr(id.length - 1),
                        path = cysOverlay['js' + j].path;
                    cysOverlay['js' + j] = data;
                }
                cysCommons.readFile(this['js' + f], cysOverlay, 'loadAPI' + f)();
            },
            fetchSignatureScript: function(scriptURL, forcereloadmenu, callback) {
                try {
                    cysOverlay.isSignatureUpdatingStarted = 1;
                    cysCommons.getAJAX(scriptURL, function(sourceCode, cb, forcereloadmenu) {
                        cysOverlay.findSignatureCode(sourceCode, cb, forcereloadmenu, callback);
                    }, 'GET', null, forcereloadmenu); //findSignatureCode(response.responseText);
                } catch (ex) {
                    cysCommons.cysDump("error in fetchSignatureScript" + ex, ex.stack);
                }
            },
            findSignatureCode: function(sourceCode, cb, forcereloadmenu, callback) {
                if (cb) {
                    var signatureFunctionName = cysOverlay.findMatch(sourceCode, /\.set\s*\("signature"\s*,\s*([a-zA-Z0-9_$][\w$]*)\(/) || cysOverlay.findMatch(sourceCode, /\.sig\s*\|\|\s*([a-zA-Z0-9_$][\w$]*)\(/) || cysOverlay.findMatch(sourceCode, /\.signature\s*=\s*([a-zA-Z_$][\w$]*)\([a-zA-Z_$][\w$]*\)/); //old

                    if (signatureFunctionName === null) {
                        cysCommons.cysDump("error 2");
                    }

                    signatureFunctionName = signatureFunctionName.replace('$', '\\$');

                    var regCode = new RegExp(signatureFunctionName + '\\s*=\\s*function' + '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);\n*(.+);return [\\w$]*\\.join');
                    var regCode2 = new RegExp('function \\s*' + signatureFunctionName + '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);\n*(.+);return [\\w$]*\\.join');

                    var functionCode = cysOverlay.findMatch(sourceCode, regCode) || cysOverlay.findMatch(sourceCode, regCode2);

                    if (functionCode === null) {
                        cysCommons.cysDump("error at functionCode detection");
                    }

                    var reverseFunctionName = cysOverlay.findMatch(sourceCode, /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.reverse\s*\(\s*\)\s*}/);

                    if (reverseFunctionName) {
                        reverseFunctionName = reverseFunctionName.replace('$', '\\$');
                    }

                    var sliceFunctionName = cysOverlay.findMatch(sourceCode, /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*,\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.(?:slice|splice)\(.+\)\s*}/);

                    if (sliceFunctionName) {
                        sliceFunctionName = sliceFunctionName.replace('$', '\\$');
                    }

                    var regSlice = new RegExp('\\.(?:' + 'slice' + (sliceFunctionName ? '|' + sliceFunctionName : '') +
                        ')\\s*\\(\\s*(?:[a-zA-Z_$][\\w$]*\\s*,)?\\s*([0-9]+)\\s*\\)'); // .slice(5) sau .Hf(a,5)
                    var regReverse = new RegExp('\\.(?:' + 'reverse' + (reverseFunctionName ? '|' + reverseFunctionName : '') +
                        ')\\s*\\([^\\)]*\\)'); // .reverse() sau .Gf(a,45)
                    var regSwap = new RegExp('[\\w$]+\\s*\\(\\s*[\\w$]+\\s*,\\s*([0-9]+)\\s*\\)');
                    var regInline = new RegExp('[\\w$]+\\[0\\]\\s*=\\s*[\\w$]+\\[([0-9]+)\\s*%\\s*[\\w$]+\\.length\\]');
                    var functionCodePieces = functionCode.split(';');
                    var decodeArray = [];
                    for (var i = 0; i < functionCodePieces.length; i++) {
                        functionCodePieces[i] = functionCodePieces[i].trim();
                        var codeLine = functionCodePieces[i];
                        if (codeLine.length > 0) {
                            var arrSlice = codeLine.match(regSlice);
                            var arrReverse = codeLine.match(regReverse);
                            if (arrSlice && arrSlice.length >= 2) { // slice
                                var slice = parseInt(arrSlice[1], 10);
                                if (cysOverlay.isInteger(slice)) {
                                    decodeArray.push(-slice);
                                } else {
                                    cysOverlay.SetSignatureCode('');
                                }
                            } else if (arrReverse && arrReverse.length >= 1) { // reverse
                                decodeArray.push(0);
                            } else if (codeLine.indexOf('[0]') >= 0) { // inline swap
                                if (i + 2 < functionCodePieces.length &&
                                    functionCodePieces[i + 1].indexOf('.length') >= 0 &&
                                    functionCodePieces[i + 1].indexOf('[0]') >= 0) {
                                    var inline = cysOverlay.findMatch(functionCodePieces[i + 1], regInline);
                                    inline = parseInt(inline, 10);
                                    decodeArray.push(inline);
                                    i += 2;
                                } else {
                                    cysOverlay.SetSignatureCode('');
                                }
                            } else if (codeLine.indexOf(',') >= 0) { // swap
                                var swap = cysOverlay.findMatch(codeLine, regSwap);
                                swap = parseInt(swap, 10);
                                if (cysOverlay.isInteger(swap) && swap > 0) {
                                    decodeArray.push(swap);
                                } else {
                                    cysOverlay.SetSignatureCode('');
                                }
                            } else {
                                cysOverlay.SetSignatureCode('');
                            }
                        }
                    }
                    cysOverlay.SetSignatureCode(decodeArray.join());
                    cysOverlay.isSignatureUpdatingStarted = 2;

                    if (forcereloadmenu === true) {
                        if (cysOverlay.vid !== null) {
                            cysOverlay.vid.youTubeFormats = null;
                            cysOverlay.videoListIsActual = false;
                            cysOverlay.onContentLoad(1);

                            var menu = cysOverlay.menu;

                            if (menu && (menu.state === 'open' || menu.open)) {
                                cysOverlay.menuToggle(menu);
                            }

                            cysCommons.cysDump("forcing reload");
                        }
                    }
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                }
            },
            menuReload: function() {
                var menu = cysOverlay.menu;
                if (menu && menu.firstChild !== null && menu.firstChild.firstChild.nodeName === "image") {
                    cysOverlay.menuToggle(menu);
                }
            },
            menuToggle: function(menu) {
                menu.hidePopup();
                menu.openPopup(menu.parentNode, 'after_start', 0, 0, false, false, null);
            },
            decryptSignature: function(sig) {
                try {
                    if (sig === null) {
                        return '';
                    }
                    cysOverlay.decodeArray = cysOverlay.GetSignatureCode();

                    if (!!cysOverlay.decodeArray) {
                        var decodeArray = cysOverlay.decodeArray.split(",");
                        if (!decodeArray) {
                            return cysOverlay.getSig(sig);
                        }; //fallback method
                        if (decodeArray) {
                            var sig2 = cysOverlay.decode(sig, decodeArray);
                            if (sig2)
                                return sig2;
                        } else {
                            cysOverlay.SetSignatureCode('');
                        }
                    }

                } catch (ex) {
                    cysCommons.cysDump("error in decryptSignature:" + ex, ex.stack);
                }
                return sig;
            },
            swap: function(a, b) {
                var c = a[0];
                a[0] = a[b % a.length];
                a[b] = c;
                return a
            },
            decode: function(sig, arr) { // encoded decryption
                if (!cysOverlay.isString(sig))
                    return null;
                var sigA = sig.split('');
                for (var i = 0; i < arr.length; i++) {
                    var act = parseInt(arr[i]);
                    if (!cysOverlay.isInteger(act))
                        return null;
                    sigA = (act > 0) ? cysOverlay.swap(sigA, act) : ((act === 0) ? sigA.reverse() : sigA.slice(-act));
                }
                var result = sigA.join('');
                return result;
            },
            isString: function(s) {
                return (typeof s === 'string' || s instanceof String);
            },
            isInteger: function(n) {
                return (typeof n === 'number' && n % 1 === 0);
            },
            updateVideosListOnText: function(text, cb) {
                if (!cysOverlay.vid) {
                    return;
                }
                cysOverlay.vid.running = 1; // analysis running
                cysOverlay.vid.referer = null;
                var tt, ttt, ref, fmap, af, ptk, d, dm, id, i, t, ttsurl, cc_asr;
                if (!text) {
                    delete cysOverlay.vid.running;
                    return;
                }
                if (!fmap && !af) { // get ytplayerconfig
                    tt = /data-swf-config="([^\n"]+)"/.exec(text);
                    if (tt) {
                        tt = tt[1].replace(/&(amp;)?quot;/g, '"'); // channel featured video
                    } else {
                        tt = /ytplayer\.config\s*=\s*(\{[^\n]+\})\s*?;\s*?ytplayer\./.exec(text);
                        if (tt)
                            tt = tt[1];
                    }

                    if (tt) {
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
                        if (id === cysOverlay.vid.id) {
                            ptk = ttt.ptk;
                            fmap = ttt.url_encoded_fmt_stream_map;
                            af = ttt.adaptive_fmts;
                            dm = ttt.dashmpd;
                            if (typeof ttt.caption_tracks !== 'undefined') {
                                ttsurl = cysOverlay.getTTTUrl(ttt.caption_tracks);
                            } else {
                                ttsurl = false;
                            }
                            if (typeof ttt.cc_asr !== 'undefined' && ttt.cc_asr === "1") {
                                cc_asr = 1;
                            } else {
                                cc_asr = 0;
                            }
                        }
                    }
                    if (!fmap && !af) {
                        cysCommons.getAJAX('http://www.youtube.com/watch?v=' + cysOverlay.vid.id + '&spf=navigate', cysOverlay.processAJAX);
                    } else {
                        cysOverlay.vid.referer = ref;
                        cysOverlay.vid.ptk = ptk;
                        cysOverlay.vid.dm = dm;
                        cysOverlay.vid.ttsurl = ttsurl;
                        cysOverlay.vid.cc_asr = cc_asr;
                        cysOverlay.fillVideoArray(fmap, af);
                    }
                }
            },
            getTTTUrl: function(str) {
                try {
                    var tempttu1 = str.split("u="),
                        ttsurltemp = "";
                    if (typeof tempttu1[1] !== 'undefined') {
                        tempttu1[1] = tempttu1[1].replace("%252C", "%2C");
                        var tempttu2 = decodeURIComponent(tempttu1[1]);
                        var tempttu3 = tempttu2.split("&kind");
                        if (typeof tempttu3[0] !== 'undefined') {
                            ttsurltemp = tempttu3[0];
                            var tempttu4 = ttsurltemp.split("&lang=");
                            if (typeof tempttu4[0] !== 'undefined') {
                                ttsurltemp = tempttu4[0];
                            }
                        }
                    }
                    return ttsurltemp;
                } catch (ex) {
                    cysCommons.cysDump("getTTTUrl error");
                    cysCommons.cysDump(ex, ex.stack);
                }
            },
            updateVideosList: function(doc) {
                try {
                    if (!cysOverlay.vid || cysOverlay.videoListIsActual) {
                        return;
                    }
                    if (cysOverlay.vid.youTubeFormats) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                    if (cysOverlay.isSignatureUpdatingStarted === 1) {
                        setTimeout(function() {
                            cysOverlay.onContentLoad();
                        }, 500);
                        return;
                    }
                    if (cysOverlay.vid.running) {
                        setTimeout(cysOverlay.onContentLoad, 500);
                        return;
                    }
                    cysOverlay.vid.running = 1; // analysis running
                    cysOverlay.vid.referer = null;

                    if (!cysCommons.isYouTubeUrl(gBrowser.currentURI.spec, "watch")) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                    var text = cysOverlay.vid.text,
                        tt, ttt, ref, fmap, af, ptk, d, dm, id, i, t, ttsurl, cc_asr;

                    if (!text) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                } catch (ex) {
                    cysCommons.cysDump("updateVideosList error:" + ex, ex.stack);
                }
                try {
                    if (!fmap && !af) { // get ytplayerconfig
                        if (cysCommons.isYouTubeChannelUrl(cysCommons.getLink())) {
                            tt = /data-swf-config="([^\n"]+)"/.exec(text);
                            if (tt)
                                tt = tt[1].replace(/&(amp;)?quot;/g, '"'); // channel featured video
                        } else {
                            tt = /ytplayer\.config\s*=\s*(\{[^\n]+\})\s*?;\s*?ytplayer\./.exec(text);
                            if (tt)
                                tt = tt[1];
                        }

                        if (tt) {
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
                            if (id === cysOverlay.vid.id) {
                                ptk = ttt.ptk;
                                fmap = ttt.url_encoded_fmt_stream_map;
                                af = ttt.adaptive_fmts;
                                dm = ttt.dashmpd;
                                if (typeof ttt.caption_tracks !== 'undefined') {
                                    ttsurl = cysOverlay.getTTTUrl(ttt.caption_tracks);
                                } else {
                                    ttsurl = false;
                                }
                                if (typeof ttt.cc_asr !== 'undefined' && ttt.cc_asr === "1") {
                                    cc_asr = 1;
                                } else {
                                    cc_asr = 0;
                                }
                                //cysCommons.setdef(d);
                            }
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
                            if (id === cysOverlay.vid.id) {
                                ptk = ttt.ptk;
                                fmap = decodeURIComponent(ttt.url_encoded_fmt_stream_map);
                                af = decodeURIComponent(ttt.adaptive_fmts);
                                dm = decodeURIComponent(ttt.dashmpd);
                                if (typeof ttt.caption_tracks != 'undefined') {
                                    ttsurl = cysOverlay.getTTTUrl(ttt.caption_tracks);
                                } else {
                                    ttsurl = false;
                                }
                                if (typeof ttt.cc_asr != 'undefined') {
                                    cc_asr = ttt.cc_asr;
                                } else {
                                    cc_asr = 0;
                                }
                            }
                        }
                    }

                    if (!fmap && !af) { // AJAX UI
                        var vidurl = cysCommons.getLink();
                        //cysCommons.executeInSandbox("document.URL");
                        cysCommons.getAJAX(vidurl, cysOverlay.updateVideosListOnText);
                    } else {
                        cysOverlay.vid.referer = ref;
                        cysOverlay.vid.ptk = ptk;
                        cysOverlay.vid.dm = dm;
                        cysOverlay.vid.ttsurl = ttsurl;
                        cysOverlay.vid.cc_asr = cc_asr;
                        cysOverlay.fillVideoArray(fmap, af);

                        cysOverlay.videoListIsActual = true;
                    }
                } catch (ex) {
                    cysCommons.cysDump('Videolist update error!', ex.stack);
                }
            },
            processAJAX: function(data, cb) {
                if (!cb) {
                    if (cysOverlay.vid) {
                        delete cysOverlay.vid.running;
                    }
                    return;
                }
                if (cysOverlay.vid && cysOverlay.vid.youTubeFormats) {
                    delete cysOverlay.vid.running;
                    return;
                }
                var fmap, af, rr = {},
                    dm, d, t, tt, ttt, id, ptk, ref, s, i, ss, ttsurl, cc_asr;
                try {
                    if (data.indexOf('{') > -1) { // AJAX UI data
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
                            if (id === cysOverlay.vid.id) {
                                ptk = ttt.ptk;
                                fmap = ttt.url_encoded_fmt_stream_map;
                                af = ttt.adaptive_fmts;
                                dm = ttt.dashmpd;
                                if (typeof ttt.caption_tracks !== 'undefined') {
                                    ttsurl = cysOverlay.getTTTUrl(ttt.caption_tracks);
                                } else {
                                    ttsurl = false;
                                }
                                if (typeof ttt.cc_asr !== 'undefined') {
                                    cc_asr = ttt.cc_asr;
                                } else {
                                    cc_asr = 0;
                                }
                            }
                        }
                        if (fmap && ((dm && af) || !af)) {
                            cysOverlay.vid.ptk = ptk;
                            cysOverlay.vid.ref = ref;
                            cysOverlay.vid.dm = dm;
                            cysOverlay.vid.ttsurl = ttsurl;
                            cysOverlay.vid.cc_asr = cc_asr;
                            cysOverlay.vid.fmap = fmap;
                            cysOverlay.vid.af = af;
                            if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && cysCommons.executeInSandbox("document.getElementById('cys_" + cysOverlay.vid.id + "');") != null) {
                                var scrp = "var cysdiv = document.getElementById('cys_" + cysOverlay.vid.id + "'); cysdiv.setAttribute('ptk','" + cysOverlay.vid.ptk + "'); cysdiv.setAttribute('ref','" + cysOverlay.vid.ref + "'); cysdiv.setAttribute('dm','" + cysOverlay.vid.dm + "'); cysdiv.setAttribute('ttsurl','" + cysOverlay.vid.ttsurl + "'); cysdiv.setAttribute('cc_asr','" + cysOverlay.vid.cc_asr + "'); cysdiv.setAttribute('af','" + af + "'); cysdiv.setAttribute('fmap','" + fmap + "');";
                                cysCommons.executeInSandbox(scrp);
                            }
                            cysOverlay.fillVideoArray(fmap, af);
                        } else {
                            cysCommons.getAJAX('http://www.youtube.com/get_video_info?eurl=http://www.youtube.com/&video_id=' + cysOverlay.vid.id, cysOverlay.processAJAX);
                            cysOverlay.vid.getinfo = 1;
                        }
                    } else { // get_video_info data
                        let dspt = data.split('&');
                        for (s in dspt) {
                            s = dspt[i]
                            t = s.split('=');
                            rr[t[0]] = t[1];
                        }
                        if (rr['video_id'] === cysOverlay.vid.id) {
                            fmap = decodeURIComponent(rr['url_encoded_fmt_stream_map']);
                            af = decodeURIComponent(rr['adaptive_fmts']);
                            cysOverlay.vid.ptk = rr['ptk'];
                            cysOverlay.vid.dm = dm = decodeURIComponent(rr['dashmpd']);
                            if (typeof rr['ttsurl'] != 'undefined') {
                                cysOverlay.vid.ttsurl = decodeURIComponent(rr['ttsurl']);
                            } else {
                                cysOverlay.vid.ttsurl = false;
                            }
                            if (typeof rr['ttsurl'] != 'undefined') {
                                cysOverlay.vid.cc_asr = rr['ttsurl'];
                            } else {
                                cysOverlay.vid.cc_asr = 0;
                            }
                            cysOverlay.vid.fmap = fmap;
                            cysOverlay.vid.af = af;
                        }
                        if (fmap && ((dm && af) || !af)) {
                            cysOverlay.fillVideoArray(fmap, af);
                            if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                                var scrp = "var cysdiv = document.getElementById('cys_" + cysOverlay.vid.id + "'); cysdiv.setAttribute('ptk','" + cysOverlay.vid.ptk + "'); cysdiv.setAttribute('ref','" + cysOverlay.vid.ref + "'); cysdiv.setAttribute('dm','" + cysOverlay.vid.dm + "'); cysdiv.setAttribute('ttsurl','" + cysOverlay.vid.ttsurl + "'); cysdiv.setAttribute('cc_asr','" + cysOverlay.vid.cc_asr + "'); cysdiv.setAttribute('af','" + af + "'); cysdiv.setAttribute('fmap','" + fmap + "');";
                                cysCommons.executeInSandbox(scrp);
                            }
                        }/* else if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) { //if(cysOverlay.getEmbeddedVideoSize() === 0){
                            delete cysOverlay.currentEmbeddedVidList[cysOverlay.vid.id];
                            delete cysOverlay.idlist[cysOverlay.vid.id];
                            delete cysOverlay.embeddedVideoIdList[cysOverlay.vid.id];
                            if (cysOverlay.getEmbeddedVideoSize() > 0) {
                                var inc = 0;
                                for (var videoID in cysOverlay.currentEmbeddedVidList) {
                                    if (typeof cysOverlay.idlist[videoID] === 'undefined') {
                                        cysOverlay.setVideoConfig(videoID);
                                        inc++;
                                        return;
                                    }
                                }
                            }

                            var btn = cysOverlay.button;
                            if (btn) {
                                if (inc === 0 && cysOverlay.getEmbeddedVideoSize() > 0) {
                                    btn.disabled = false;
                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                } else {
                                    btn.disabled = true;
                                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                }
                            }
                        }*/
                    }
                } catch (ex) {
                    /*if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                        delete cysOverlay.currentEmbeddedVidList[cysOverlay.vid.id];
                        delete cysOverlay.idlist[cysOverlay.vid.id];
                        delete cysOverlay.embeddedVideoIdList[cysOverlay.vid.id];
                        if (cysOverlay.getEmbeddedVideoSize() > 0) {
                            var inc = 0;
                            for (var videoID in cysOverlay.currentEmbeddedVidList) {
                                if (typeof cysOverlay.idlist[videoID] === 'undefined') {
                                    cysOverlay.setVideoConfig(videoID);
                                    inc++;
                                    return;
                                }
                            }
                        }
                        var btn = cysOverlay.button;
                        if (btn) {
                            if (inc === 0 && cysOverlay.getEmbeddedVideoSize() > 0) {
                                btn.disabled = false;
                                btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                            } else {
                                btn.disabled = true;
                                btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                            }
                        }
                    }*/
                }
            },
            fillVideoArray: function(fm, af) {
                try {
                    if (cysOverlay.vid.youTubeFormats) {
                        delete cysOverlay.vid.running;
                        return;
                    }
                    cysCommons.cysDump('\n\nFill Video Array\n\n');
                    var i, j, k, str, pos, fmt, fmt2, fA, sig, s, a, v, p, o, sf = [],
                        clen, rtmpe, res, br;
                    cysOverlay.vid.youTubeFormats = [];

                    fm = fm.split(',');
                    if (af && af.length > 0) {
                        fm = fm.concat(af.split(','));
                    }
                    if (cysCommons.cysPrefs.getBoolPref('scan.hiddenformats') && cysOverlay.vid.dm) {
                        s = cysOverlay.vid.dm.substr(s.indexOf('.com/api/manifest/dash/') + 23).split('/');
                        for (i = 0; i < s.length; i += 2) {
                            if (s[i] !== 'itag') {
                                sf.push(s[i] + '=' + s[i + 1]);
                            }
                        }
                        s = sf.join('&');
                        sf = [];
                        for (i = 0; i < cysCommons.validFormats.length; i++)
                            sf.push('*' + s + '&itag=' + cysCommons.validFormats[i]);
                        if (sf)
                            fm = fm.concat(sf);
                    }

                    for (j = 0; j < fm.length; j++) {
                        str = fm[j];
                        sig = 0;
                        clen = 0;
                        res = '', br = '';
                        fmt = /itag=(\d\d?\d?)/.exec(str);
                        if (!fmt) {
                            fmt = /itag\/(\d\d?\d?)/.exec(str);
                        }
                        if (fmt) {
                            fmt = fmt[1];
                        } else {
                            continue;
                        }
                        if (fmt in cysOverlay.vid.youTubeFormats)
                            continue;
                        if (str.substr(0, 1) === '*') {
                            if (!o)
                                continue;
                            str = o + str.substr(1);
                        } else {
                            str = decodeURIComponent(str);
                            pos = str.indexOf('url=http');
                            if (pos === -1) {
                                if (str.indexOf('conn=rtmpe://') > -1) {
                                    rtmpe = 1;
                                }
                                continue;
                            }
                            if (pos >= 0)
                                str = str.substr(pos) + '&' + str.substring(0, pos - 1); // normalize string
                            str = str.substr(4); // cut 'url=' out
                        }
                        if (str.indexOf('ratebypass=') === -1)
                            str += '&ratebypass=yes';
                        pos = str.indexOf('?');
                        if (!o)
                            o = str.substr(0, pos + 1);
                        fA = str.substr(pos + 1).split('&').sort();

                        for (i = 0, k = fA.length; i < k; i++) {
                            if (i) {
                                if (fA[i] === fA[i - 1]) {
                                    delete fA[i];
                                    continue;
                                }
                                var sp = fA[i].split('=');
                                if (!sp || !sp[1]) {
                                    delete fA[i];
                                    continue;
                                }
                            }
                            s = fA[i];
                            p = s.indexOf('=');
                            if (p === -1) {
                                continue;
                            }
                            a = s.substr(0, p);
                            v = s.substr(p + 1);
                            if (a === 'quality' || a === 'type' || a === 'fallback_host' || a === 'index' || a === 'init') {
                                delete fA[i];
                                continue;
                            }
                            if (a === 'ratebypass') {
                                fA[i] = 'ratebypass=yes';
                                continue;
                            }
                            if (a === 'clen') {
                                clen = v;
                                continue;
                            }
                            if (a === 'range') {
                                if (clen) {
                                    fA[i] = a + '=0-' + clen;
                                    continue;
                                } else {
                                    delete fA[i];
                                    continue;
                                }
                            }
                            if (a === 'bitrate') {
                                br = v;
                                delete fA[i];
                                continue;
                            }
                            if (a === 'size') {
                                res = v;
                                delete fA[i];
                                continue;
                            }
                            if (a === 'signature') {
                                sig = 1;
                            };
                            if (sig) {
                                continue;
                            };
                            if (a === 'sig') {
                                fA[i] = 'signature=' + v;
                                sig = 1;
                            }
                            if (a === 's') {
                                p = cysOverlay.decryptSignature(v);
                                //p = cysOverlay.getSig(v);
                                fA[i] = 'signature=' + p;
                                sig = 1;
                            }
                        }
                        if (fA && fA.length) {
                            fA = cleanEmpty(fA);
                        }
                        str = str.substring(0, pos + 1) + fA.join('&').replace(/&{2,}/g, '&');
                        if (clen) {
                            if (!cysOverlay.vid.filesizes) {
                                cysOverlay.vid.filesizes = {};
                            }
                            cysOverlay.vid.filesizes['Fmt' + fmt] = Number(clen);
                        }

                        if (res) {
                            i = res.indexOf('x');
                            if (i > 1 & i < res.length - 3) {
                                if (!cysOverlay.vid.resolutions) {
                                    cysOverlay.vid.resolutions = {};
                                }
                                cysOverlay.vid.resolutions['Fmt' + fmt] = { h: res.substr(i + 1), w: res.substr(0, i) };
                            }
                        }
                        if (br) {
                            if (!cysOverlay.vid.bitrates) {
                                cysOverlay.vid.bitrates = {};
                            }
                            cysOverlay.vid.bitrates['Fmt' + fmt] = Math.round(Number(br) / 1024) + 'K';
                        }
                        //if (cysOverlay.vid.ptk) str+='&ptk='+cysOverlay.vid.ptk
                        cysOverlay.vid.youTubeFormats[fmt] = str;
                    }

                    if (cysOverlay.vid.youTubeFormats.length) {
                        s = cysOverlay.vid.dm;
                        if (s) {
                            a = /\/s\/(\w{40,}\.\w{40,})\//.exec(s);
                            if (a) {
                                sig = cysOverlay.decryptSignature(a[1]);
                                //sig = cysOverlay.getSig(a[1]);
                                if (a[1] !== sig) {
                                    s = s.replace(a[0], '/signature/' + sig + '/');
                                } else {
                                    s = '';
                                }
                            }
                        }
                        if (s)
                            cysCommons.getAJAX(s, cysOverlay.processDASH, null, null, cysOverlay.vid.id);
                        cysOverlay.processDASH(null, 0, cysOverlay.vid.id);
                        delete cysOverlay.vid.running;
                        cysOverlay.cleanupCache();
                        if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                            cysOverlay.menuReload();
                            if (cysOverlay.getEmbeddedVideoSize() > 0) {
                                var ic = 0;
                                for (var videoID in cysOverlay.currentEmbeddedVidList) {
                                    if (typeof cysOverlay.idlist[videoID] === 'undefined') {
                                        /*var menu = cysOverlay.menu;
                                         if(menu && (menu.state === 'open' || menu.open)) cysOverlay.menuToggle(menu);*/
                                        cysOverlay.setVideoConfig(videoID);
                                        ic++;
                                        return;
                                    }
                                }
                                if (ic === 0) {
                                    var btn = cysOverlay.button;
                                    if (btn) {
                                        btn.disabled = false;
                                        btn.hidden = false;
                                    }
                                }
                            }
                        }
                    } else if (typeof cysOverlay.vid.getinfo === 'undefined') {
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.videoListIsActual = false;
                        cysOverlay.vid.getinfo = 1;
                        cysCommons.getAJAX('http://www.youtube.com/get_video_info?eurl=http://www.youtube.com/&video_id=' + cysOverlay.vid.id, cysOverlay.processAJAX); //'http://www.youtube.com/get_video_info?video_id='
                    } else {
                        cysOverlay.button.disabled = true;
                        if (rtmpe) {
                            cysOverlay.vid.rtmpe = 1;
                        }
                    }
                } catch (ex) {
                    cysCommons.cysDump('fillVideoArray: error::' + ex, ex.stack);
                }
            },
            findMatch: function(text, regexp) {
                var matches = text.match(regexp);
                return (matches) ? matches[1] : null;
            },
            getSig: function(s) { // ** undo signature obfuscation... **
                var x = s.length - 81,
                    o = s,
                    a, b;

                function sr(a, y, z) {
                    a = a.substr(y, z);
                    var b = '',
                        i, l = a.length - 1;
                    for (i = l; i >= 0; i--)
                        b += a[i];
                    return b;
                }

                function ss(a, b) {
                    var c = a[0];
                    a[0] = a[b % a.length];
                    a[b] = c;
                    return a;
                };
                if (x === 1) {
                    a = sr(s, 0, 33);
                    b = sr(s, 34, 48);
                    s = b.substr(45, 1) + b.substr(2, 12) + b.substr(0, 1) + b.substr(15, 26) + s.substr(33, 1) + b.substr(42, 1) + b.substr(43, 1) + b.substr(44, 1) + b.substr(41, 1) + b.substr(46, 1) + a.substr(32, 1) + b.substr(14, 1) + a.substr(0, 32) + b.substr(47, 1);
                } else if (x === 2) {
                    a = s.substr(2, 40);
                    b = s.substr(43, 40);
                    s = a.substr(4, 1) + a.substr(1, 3) + a.substr(31, 1) + a.substr(5, 17) + s.substr(0, 1) + a.substr(23, 8) + b.substr(10, 1) + a.substr(32, 8) + s.substr(42, 1) + b.substr(0, 10) + a.substr(22, 1) + b.substr(11, 29);
                } else if (x === 3) {
                    a = sr(s, 3, 40);
                    b = sr(s, 42, 41);
                    s = b + s.substr(41, 3) + a.substr(2, 5) + s.substr(2, 4) + a.substr(4, 11) + a.substr(38, 3) + a.substr(9, 29) + a.substr(6, 5);
                } else if (x === 4) {
                    a = sr(s, 3, 40);
                    b = sr(s, 44, 40);
                    s = b.substr(7, 1) + b.substr(1, 6) + b.substr(0, 1) + b.substr(8, 15) + s.substr(0, 1) + b.substr(24, 9) + s.substr(1, 1) + b.substr(34, 6) + s.substr(43, 1) + a;
                } else if (x === 5) {
                    a = s.substr(2, 40);
                    b = s.substr(43, 40);
                    s = a + s.substr(42, 1) + b.substr(0, 20) + b.substr(39, 1) + b.substr(21, 18) + b.substr(20, 1);
                } else if (x === 6) {
                    a = s.substr(5).split('');
                    a = a.reverse();
                    a = ss(a, 57);
                    a = a.slice(4);
                    a = a.reverse();
                    a = a.slice(2);
                    s = a.join('');
                } else if (x === 7) {
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
                } else if (x === 8) {
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
                } else if (x === 9) {
                    a = sr(s, 2, 40);
                    b = sr(s, 34, 40);
                    s = b.substr(8, 1) + b.substr(2, 7) + b.substr(0, 1) + b.substr(6, 17) + s.substr(0, 2) + b.substr(22, 8) + s.substr(1, 3) + b.substr(35, 3) + s.substr(40, 4) + a;
                } else if (x === 11) {
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
            processDASH: function(dm, cb, id) {
                if (id !== cysOverlay.vid.id)
                    return;
                if (dm) { // check for additional dash formats in dash manifest XML
                    var dp = new DOMParser(),
                        dm = dp.parseFromString(dm, 'application/xml').documentElement,
                        sf, v, a, s, fmt, i, j, k, o, w, h;
                    if (dm.nodeName !== 'parsererror') {
                        sf = dm.getElementsByTagName('Representation');
                        if (sf.length) {
                            for (i = 0; i < sf.length; i++) {
                                w = h = a = s = '';
                                try {
                                    fmt = sf[i].getAttribute('id');
                                    v = sf[i].getAttribute('bandwidth');
                                    h = sf[i].getAttribute('height');
                                    w = sf[i].getAttribute('width');
                                } catch (e) {}
                                if (fmt && cysOverlay.vid.youTubeFormats && !cysOverlay.vid.youTubeFormats[fmt]) {
                                    a = sf[i].getElementsByTagName('BaseURL');
                                    if (a.length)
                                        s = a[0];
                                    if (s) {
                                        var tempurl = s.childNodes[0].nodeValue;
                                        if (tempurl.indexOf('/source/yt_otf/') !== -1) {
                                            tempurl = tempurl + "sq/1/";
                                        }
                                        cysOverlay.vid.youTubeFormats[fmt] = tempurl; //s.childNodes[0].nodeValue;
                                        /* resolve issue #53 in mantis*/

                                        cysOverlay.vid.filesizes['Fmt' + fmt] = Number(s.getAttribute('yt:contentLength'));
                                        if (h && w) {
                                            cysOverlay.vid.resolutions['Fmt' + fmt] = { h: h, w: w };
                                        }
                                        if (v)
                                            cysOverlay.vid.bitrates['Fmt' + fmt] = Math.round(Number(v) / 1024) + 'K';
                                        tempurl = ""
                                    }
                                }
                            }
                        }
                    }
                } // match available dash audio formats
                a = cysOverlay.vid.dashAudio = cysOverlay.vid.dashAudio || [];
                o = cysCommons.dashAudio;
                j = -1;
                for (i = 0; i < 3; i++) {
                    if (cysOverlay.vid.youTubeFormats && o[i] in cysOverlay.vid.youTubeFormats) {
                        for (k = j + 1; k <= i; k++) {
                            a[k] = o[i];
                        }
                        j = i;
                    } else if (i === 2) {
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
                    } else if (i === 4) {
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
                    } else if (i === 7) {
                        a[4] = a[3];
                    }
                }
                for (fmt in cysOverlay.vid.youTubeFormats) {
                    if (cysCommons.validFormats.indexOf(Number(fmt)) === -1 && cysCommons.dashAudio.indexOf(Number(fmt)) === -1)
                        cysCommons.cysDump('\n*** Format not in database: ' + fmt + '\n' + cysOverlay.vid.youTubeFormats[fmt] + '\n');
                }
            },
            getVideoDate: function(data, cb, videoID, callback) {
                try {
                    if ((cysOverlay.vid !== null && cysOverlay.vid.id && data && data.indexOf(cysOverlay.vid.id) > -1) || (videoID !== null && data && data.indexOf(videoID) > -1)) {
                        var vidinfo = JSON.parse(data);
                        var vi = vidinfo.items[0];
                        var t = String(vi.snippet.publishedAt),
                            tdate = t,
                            vdate, d1, d2, r = '',
                            cc = -1,
                            dd, au, ti;
                        vdate = new Date(tdate.substr(0, 4), (tdate.substr(5, 2) - 1), tdate.substr(8, 2));
                        d1 = new Date(2012, 6, 1), d2 = new Date(2011, 4, 1), r = ''; // audio quality jump dates
                        if (vdate < d1)
                            r = '1';
                        if (vdate < d2)
                            r = '2';
                        cysOverlay.vid.age = r; // set age
                        cysOverlay.vid.ccount = vi.statistics.commentCount; // set comment count
                        cysOverlay.vid.duration = cysCommons.getDurationFromYString(vi.contentDetails.duration); //cysCommons.getFormattedDuration(dd);//set duration
                        cysOverlay.vid.author = vi.snippet.channelTitle; //set author
                        cysOverlay.vid.channelid = vi.snippet.channelId; //set Channel ID
                        cysOverlay.vid.published = cysCommons.getM(parseInt(tdate.substr(5, 2)) - 1) + " " + tdate.substr(8, 2) + ", " + tdate.substr(0, 4);
                        cysOverlay.vid.published2 = tdate;
                        t = vi.snippet.title;

                        if (!t) {
                            cysOverlay.vid.title = cysCommons.getTitle(t);
                            if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && videoID != null && cysOverlay.embeddedVideoIdList[videoID]) {
                                cysOverlay.embeddedVideoIdList[videoID].title = t;
                                cysOverlay.currentEmbeddedVidList[videoID].title = t;
                                cysOverlay.updateEmbeddedVideoTitle(videoID);
                            }
                        } else {
                            cysOverlay.vid.title = t;
                        }


                        var licensetr = "";
                        if (vi.contentDetails.licensedContent === true) {
                            licensetr = "<tr><td><strong>License</strong></td><td>Standard YouTube License</td></tr>";
                        }
                        var category = "";
                        var detail = vi.snippet.description;
                        if (detail === null || detail === "null") {
                            detail = "";
                        }
                        cysOverlay.vid.detail = '<div id="watch-description-text" style="max-height:none;" class=""><p id="eow-description">' + detail.replace("<media:description type='plain'>", "").replace("</media:description>", "").replace(/(?:\r\n|\r|\n)/g, "</br>") + '</p></div>' + category;

                        if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && cysCommons.executeInSandbox("document.getElementById('cys_" + cysOverlay.vid.id + "');") !== null) {
                            var vidau = "",
                                vidtitle = "",
                                viddetail = "";
                            if (cysOverlay.vid.author != null) {
                                vidau = cysOverlay.vid.author.replace(/'/g, "\\'");
                            }
                            if (cysOverlay.vid.title !== null) {
                                vidtitle = cysOverlay.vid.title.replace(/'/g, "\\'");
                            }
                            if (cysOverlay.vid.detail !== null) {
                                viddetail = cysOverlay.vid.detail.replace(/'/g, "\\'");
                            }
                            var scrp = "var cysdiv = document.getElementById('cys_" + cysOverlay.vid.id + "'); cysdiv.setAttribute('age','" + cysOverlay.vid.age + "'); cysdiv.setAttribute('ccount','" + cysOverlay.vid.ccount + "'); cysdiv.setAttribute('author','" + vidau + "');  cysdiv.setAttribute('title','" + vidtitle + "'); cysdiv.setAttribute('duration','" + cysOverlay.vid.duration + "'); cysdiv.setAttribute('published','" + cysOverlay.vid.published + "'); cysdiv.innerHTML='" + viddetail + "';";
                            cysCommons.executeInSandbox(scrp);
                        }
                    }
                    if (callback && typeof callback == 'function') {
                        callback();
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in getvideodate:" + ex, ex.stack);
                }
            },
            updateEmbeddedVideoTitle: function(videoID) {
                /*update embedded video title if menu is open and it is showing "..." yet*/
                try {
                    if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                        var counter = 0,
                            menu = cysOverlay.menu;
                        if (menu && menu.state === 'open') {
                            var vidcount = cysOverlay.getEmbeddedVideoSize();
                            for (var imenu in menu) {
                                if (counter > vidcount) {
                                    break;
                                }
                                var k = (counter * 2);
                                var t = menu.childNodes[k];
                                if (typeof(t) !== 'undefined' && t.lastChild) {
                                    var lastChild = t.lastChild;
                                    if (lastChild.getAttribute('statustext') === videoID) {
                                        lastChild.setAttribute("tooltiptext", cysOverlay.currentEmbeddedVidList[videoID].title);
                                        lastChild.setAttribute('value', cysOverlay.currentEmbeddedVidList[videoID].title);
                                    }
                                }
                                counter++;
                            }
                        }
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in updateEmbeddedVideoTitle:" + ex, ex.stack);
                }
            },
            ajaxupdateSignature: function(data, callback) {
                var scriptURL = null;
                if ((cysOverlay.isSignatureUpdatingStarted === 0 || typeof(cysOverlay.decodeArray) === 'undefined' || cysOverlay.decodeArray === null || cysOverlay.decodeArray === "") && cysOverlay.signatureFunctionCalled === 0) { //&& cysOverlay.decodeArray==""
                    if (data) {
                        cysOverlay.updateSignature(scriptURL, data, callback);
                    }
                }
            },
            updateSignature: function(scriptURL, text, callback) {
                try {
                    if (scriptURL === null && text !== "") {
                        scriptURL = cysOverlay.findMatch(text, /\"js\":\s*\"([^\"]+)\"/i);
                        if (scriptURL) {
                            scriptURL = scriptURL.replace(/\\/g, '');
                        }
                    }

                    if (scriptURL) {
                        if (scriptURL.indexOf('//') === 0) {
                            var url = cysCommons.getLink();
                            var arr = url.split("/");
                            var protocol = (arr[0] === 'http:') ? 'http:' : 'https:';
                            scriptURL = protocol + scriptURL;
                        }

                        if (scriptURL.indexOf('youtube') === -1) {
                            var arr = cysCommons.getLink().split("/");
                            var host = arr[0] + '/' + arr[1] + '/' + arr[2]; //cysCommons.getLink();
                            scriptURL = host + scriptURL;
                        }

                        cysOverlay.fetchSignatureScript(scriptURL, true, callback);
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in updateSignature:" + ex, ex.stack)
                }
            },
            setvideotext: function(d, callback) {
                var btn = cysOverlay.button,
                    vtitle;
                videoID = cysOverlay.getYouTubeVideoID();
                if (videoID instanceof Array) {
                    vtitle = videoID[1];
                    videoID = videoID[0];
                }
                if (videoID) {
                    btn.disabled = false;
                    btn.hidden = false; // en/disable un/hide button
                    var doc = cysCommons.getDoc();
                    if (cysOverlay.idlist[videoID]) { // if ID saved, retrieve data without rescanning page
                        cysOverlay.vid = cysOverlay.idlist[videoID];
                        cysOverlay.vid.text = d;
                        if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 2) {
                            var t = cysOverlay.vid;
                            if (typeof cysOverlay.vid.age === 'undefined')
                                cysOverlay.vid.age = '';
                        } else if (cysOverlay.vid.rtmpe) {
                            btn.disabled = true;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        } else {
                            cysOverlay.vid.youTubeFormats = null;
                            cysOverlay.videoListIsActual = false;
                            delete cysOverlay.vid.running;
                            cysOverlay.updateVideosList(doc);
                        }
                    } else {
                        cysOverlay.idlist[videoID] = {};
                        cysOverlay.vid = cysOverlay.idlist[videoID];
                        cysOverlay.vid.text = d;
                        cysOverlay.vid.id = videoID;
                        cysOverlay.vid.title = vtitle;
                        cysOverlay.vid.timestamp = cysCommons.cTime();
                        cysOverlay.vid.age = cysOverlay.vid.ptk = cysOverlay.vid.referer = '';
                        cysOverlay.vid.ccount = -1;
                        cysOverlay.vid.filesizes = {};
                        cysOverlay.vid.resolutions = {};
                        cysOverlay.vid.bitrates = {};
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.videoListIsActual = false;
                        cysOverlay.vid.detail = null;
                        cysOverlay.vid.duration = null;
                        cysOverlay.vid.author = null;
                        cysOverlay.vid.published = null;
                        cysOverlay.vid.html = null;
                        cysCommons.getAJAX('https://www.googleapis.com/youtube/v3/videos?id=' + videoID + '&key=' + cysOverlay.youtubekey + '&part=snippet,contentDetails,statistics,status', function(data, cb, videoID) {
                            cysOverlay.getVideoDate(data, cb, videoID, function() {
                                cysOverlay.updateVideosList(doc);
                            });
                        }); // new url to get video infomration                        
                    }
                } else {
                    cysOverlay.vid = null;
                    btn.disabled = true;
                    btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                    return;
                }

                if (callback && typeof callback == 'function') {
                    callback();
                }
            },
            onContentLoad: function(x, precallback) {
                console.log("OnContentLoad :: 11");

                if (precallback) {
                    precallback();
                }

                if (cysCommons.isYouTubeUrl(gBrowser.currentURI.spec, "watch")) {
                    if (cysOverlay.vid == null || !cysOverlay.vid.text) {
                        cysCommons.getAJAX(gBrowser.currentURI.spec, function(d) {
                            cysOverlay.setvideotext(d, function() {
                                cysOverlay.onContentLoad();
                            });
                        });
                        return;
                    }
                }

                if (cysOverlay.vid && ((cysOverlay.vid.youTubeFormats && cysOverlay.vid.youTubeFormats.length > 0) || cysOverlay.vid.rtmpe)) {
                    //resolving the issue of constant throbber display when video list is not loaded and icon is clicked
                    cysOverlay.menuReload();
                }

                var doc = cysCommons.getDoc();

                try {
                    var btn = cysOverlay.button;
                    btn.disabled = true;

                    if (!cysCommons.isYouTubeUrl(gBrowser.currentURI.spec, "watch")) {
                        return;
                    }

                    var loc = cysCommons.getLink(),
                        videoID, vtitle, scriptURL = null,
                        text;

                    if (!cysOverlay.vid || cysOverlay.vid.text == null) {
                        cysCommons.getAJAX(gBrowser.currentURI.spec, function(d) {
                            cysOverlay.setvideotext(d, function() {
                                cysOverlay.onContentLoad();
                            });
                        });
                    }

                    text = cysOverlay.vid.text;
                    //cysOverlay.vid.text= cysCommons.gethtmldata();
                    if (cysCommons.isYouTubeUrl(gBrowser.currentURI.spec, "watch")) {
                        text = cysOverlay.vid.text;
                    }
                } catch (ex) {
                    /*if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                        var btn = cysOverlay.button;
                        //cysOverlay.vid = null;
                        if (btn && cysOverlay.getEmbeddedVideoSize() === 0) {
                            btn.disabled = true;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        } else {
                            cysCommons.cysDump('1) contentLoad error - CYS button not found!');
                        }
                        return;
                    }*/
                    console.log('1 error in getdoc:' + ex.stack);
                }

                if (btn) {
                    cysOverlay.showDTA();
                }

                if (loc && btn && cysCommons.isYouTubeUrl(loc, "watch")) {
                    if (text) {
                        if (cysOverlay.isSignatureUpdatingStarted === 0 && cysOverlay.signatureFunonLocationChangectionCalled === 0) { //&& cysOverlay.decodeArray==""
                            cysOverlay.updateSignature(scriptURL, text);
                        }
                    }

                    videoID = cysOverlay.getYouTubeVideoID();

                    if (videoID instanceof Array) {
                        vtitle = videoID[1];
                        videoID = videoID[0];
                    }
                    if (videoID) {
                        btn.disabled = false;
                        btn.hidden = false; // en/disable un/hide button

                        if (cysOverlay.idlist[videoID]) { // if ID saved, retrieve data without rescanning page
                            cysOverlay.vid = cysOverlay.idlist[videoID];
                            if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 2) {
                                var t = cysOverlay.vid;
                                if (typeof cysOverlay.vid.age === 'undefined')
                                    cysOverlay.vid.age = '';
                            } else if (cysOverlay.vid.rtmpe) {
                                btn.disabled = true;
                                btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                            } else {
                                cysOverlay.vid.youTubeFormats = null;
                                cysOverlay.videoListIsActual = false;
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
                            cysOverlay.videoListIsActual = false;
                            cysOverlay.vid.detail = null;
                            cysOverlay.vid.duration = null;
                            cysOverlay.vid.author = null;
                            cysOverlay.vid.published = null;
                            cysOverlay.vid.html = null;
                            cysCommons.getAJAX('https://www.googleapis.com/youtube/v3/videos?id=' + videoID + '&key=' + cysOverlay.youtubekey + '&part=snippet,contentDetails,statistics,status', function(data, cb, videoID) {
                                cysOverlay.getVideoDate(data, cb, videoID, function() {
                                    cysOverlay.updateVideosList(doc);
                                });
                            }); // new url to get video infomration
                            return;
                        }
                    } else {
                        cysOverlay.vid = null;
                        btn.disabled = true;
                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        return;
                    }
                } else if (loc && btn && loc === 'about:customizing') {
                    cysOverlay.vid = null;
                    btn.disabled = true;
                    btn.hidden = false;
                } else {
                    var size = 0;
                    if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                        for (var key in cysOverlay.currentEmbeddedVidList) {
                            videoID = key;
                            size++;
                        }
                    }

                    if (size === 0) {
                        cysOverlay.vid = null;
                        if (btn) {
                            btn.disabled = true;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        } else {
                            cysCommons.cysDump('2) contentLoad error - CYS button not found!');
                        }
                    } /*else if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube") && size > 0 && ((cysOverlay.vid !== null && cysOverlay.vid.running !== 1) || cysOverlay.vid === null)) {
                        try {
                            for (var videoID in cysOverlay.currentEmbeddedVidList) {
                                if (cysOverlay.idlist[videoID]) { // if ID saved, retrieve data without rescanning page
                                    cysOverlay.menuReload();
                                    cysOverlay.vid = cysOverlay.idlist[videoID];
                                    if (cysOverlay.vid.youTubeFormats && Object.keys(cysOverlay.vid.youTubeFormats).length > 0) {
                                        if (typeof cysOverlay.vid.age === 'undefined')
                                            cysOverlay.vid.age = '';
                                    } else if (cysOverlay.vid.rtmpe) {
                                        btn.disabled = true;
                                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                                    } else {
                                        if (cysOverlay.vid !== null)
                                            cysOverlay.vid.youTubeFormats = null;
                                        cysOverlay.videoListIsActual = false;
                                        //cysCommons.getAJAX('https://www.youtube.com/watch?v=' + videoID + '', cysOverlay.setVideoConfig,"GET",null,videoID); // get video API feed
                                        cysOverlay.setVideoConfig(videoID);
                                    }
                                } else {
                                    if (cysOverlay.vid !== null)
                                        cysOverlay.vid.youTubeFormats = null;
                                    cysOverlay.videoListIsActual = false;
                                    //cysCommons.getAJAX('https://www.youtube.com/watch?v=' + videoID + '', cysOverlay.setVideoConfig,"GET",null,videoID); // get video API feed
                                    cysOverlay.setVideoConfig(videoID);
                                }
                            }
                        } catch (ex) {
                            cysCommons.cysDump("error in for loop:" + ex, ex.stack);
                        }
                    } else if (cysCommons.cysPrefs.getBoolPref("detect.embedded.youtube")) {
                        if (cysOverlay.vid !== null)
                            cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.videoListIsActual = false;
                        //cysCommons.getAJAX('https://www.youtube.com/watch?v=' + videoID + '', cysOverlay.setVideoConfig,"GET",null,videoID); // get video API feed
                        if (videoID !== "")
                            cysOverlay.setVideoConfig(videoID);
                    }*/
                }
            },
            cleanupCache: function() {
                // idlist cache cleanup
                if (Math.random() > 0.2)
                    return;
                var cachesize = Object.keys(cysOverlay.idlist).length,
                    o = cachesize,
                    r = [],
                    it, id, br, uris = '',
                    i, k = String(cysCommons.cTime()).length;
                if (cachesize > 100) {
                    for (it in cysOverlay.idlist) {
                        r.push(cysOverlay.idlist[it].timestamp + '-' + it);
                    }
                    r.sort();
                    for (i = 0; i < gBrowser.browsers.length; i++) {
                        br = gBrowser.getBrowserAtIndex(i);
                        uris += br.currentURI.spec;
                    }
                    i = 0;
                    while (cachesize > 20 && i < r.length) {
                        id = r[i].substr(k + 1);
                        if (uris.indexOf(id) === -1 && id !== cysOverlay.vid.id) {
                            delete cysOverlay.idlist[id];
                            delete cysOverlay.currentEmbeddedVidList[id];
                            delete cysOverlay.embeddedVideoIdList[id];
                            cachesize--;
                        }
                        i++;
                    }
                }
            },
            onLoad: function() {
                try {
                    Cc["@completeyoutubesaver.com/completeyoutubesaver-processor;1"].getService();
                } catch (ex) {
                    cysCommons.cysDump("error in loading processor", ex.stack);
                }
                gBrowser.addProgressListener(cysOverlay);
            },
            init: function() {
                if (typeof gNavToolbox === 'undefined' || !gNavToolbox || !gNavToolbox.palette) { // slow CPU work-around
                    setTimeout(cysOverlay.init, 1000);
                    return;
                }
                if (!console.assert) {
                    console.assert = function assert(condition, message) {
                        if (!condition) {
                            throw message || "Assertion failed";
                        }
                    };
                }

                cysOverlay.preloadImages();
                cysCommons.getConverterPath(); // is conversion installed properly?
                cysOverlay.defaultdir = cysCommons.getDefaultDir("Complete YouTube Saver", true);
                var oldVersion = cysCommons.cysPrefs.getCharPref("version");
                var newVersion = cysCommons.getVersion();

                let typesOption = cysCommons.cysPrefs.getCharPref("menu.open.types");
                if (typesOption) {
                    let types = typesOption.split(',');

                    if (types.indexOf(cysCommons.cysPrefs.getIntPref("button.left.click.open").toString()) == -1) {
                        cysCommons.cysPrefs.setIntPref("button.left.click.open", 2);
                    }
                    if (types.indexOf(cysCommons.cysPrefs.getIntPref("arrow.left.click.open").toString()) == -1) {
                        cysCommons.cysPrefs.setIntPref("arrow.left.click.open", 1);
                    }
                }

                if (cysCommons.cysPrefs.getCharPref("subtitle.language") === "en-GB") {
                    cysCommons.cysPrefs.setCharPref("subtitle.language", "en");
                }
                if (oldVersion !== newVersion) {
                    cysOverlay.cysButtonShow();
                    if (oldVersion) {
                        cysCommons.cysDump('\n1) Old version: ' + oldVersion + '\nNew version: ' + newVersion);
                        cysCommons.openWindow(cysCommons.getCysString('homepage') + cysCommons.getCysString('updatedpage').replace('___', cysCommons.getVersion().replace(/\./g, '')));
                    } else {
                        //                        cysCommons.cysDump('\n2) Old version: ' + oldVersion + '\nNew version: ' + newVersion);
                        cysCommons.openUrl(cysCommons.getCysString('homepage'));
                    }
                    cysCommons.cysPrefs.setCharPref("version", newVersion);
                    var opref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("cys.");
                    var npref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.cys.");
                    try {
                        oldVersion = opref.getCharPref('version');
                    } catch (e) {}
                    if (oldVersion) { // migrate prefs saved before v. 2.3.3
                        var pi = ['download.quality.highest', 'menu.dropdown.left.click.save.as', 'button.left.click.open', 'arrow.left.click.open', 'download.comments.all', 'download.comments.numpages', 'download.comments.threads', 'folders.custom'];
                        var pb1 = ['icon.show.always', 'download.statistic', 'download.subtitles', 'download.comments', 'download.details.hide'];
                        var pb2 = ['hover', 'fmt.col.enabled', 'type.col.enabled', 'typename.col.enabled', 'resolution.col.enabled', 'sound.col.enabled', 'p.col.enabled'];
                        for (var s in pi) {
                            try {
                                npref.setIntPref(pi[s], opref.getIntPref(pi[s]));
                            } catch (e) {}
                        }
                        for (var s in pb1) {
                            try {
                                npref.setBoolPref(pb1[s], opref.getBoolPref(pb1[s]));
                            } catch (e) {}
                        }
                        for (var s in pb2) {
                            try {
                                npref.setBoolPref('menu.dropdown.' + pb1[s], opref.getBoolPref('menu.dropdown.' + pb1[s]));
                            } catch (e) {}
                        }
                        opref.deleteBranch('');
                    }
                    var i, pb = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService); // delete pre- v.4 prefs
                    try {
                        pb.getBranch('extensions.cys.download.mp3').deleteBranch('');
                    } catch (e) {}
                    try {
                        pb.getBranch('extensions.cys.menu.dropdown.mode').deleteBranch('');
                    } catch (e) {}
                    try {
                        pb.getBranch('extensions.cys.menu.dropdown.right.click').deleteBranch('');
                    } catch (e) {}
                    var fprefs = ['Fmt_46', 'Fmt_100', 'Fmt_101', 'Fmt_102', 'Fmt_82', 'Fmt_83', 'Fmt_84', 'Fmt_85', 'Fmt_45', 'Fmt_44', 'Fmt_43', 'Fmt_38', 'Fmt_37', 'Fmt_22', 'Fmt_35', 'Fmt_18', 'Fmt_34', 'Fmt_6', 'Fmt_5', 'Fmt_36', 'Fmt_17', 'Fmt_13', 'Cnv_1', 'Cnv_2', 'Cnv_3', 'Cnv_11', 'Cnv_12', 'Cnv_13', 'Cnv_14', 'Cnv_15'];
                    for (i = 0; i < fprefs.length; i++) {
                        try {
                            pb.getBranch('extensions.cys.menu.dropdown.' + fprefs[i] + '.row.enabled').deleteBranch('');
                        } catch (e) {}
                    }
                    try {
                        pb.getBranch('extensions.cys.first.time').deleteBranch('');
                    } catch (e) {} // delete pre-4.2.7 pref
                }
                cysOverlay.button = document.getElementById('cys-button');
                cysOverlay.menu = document.getElementById("cys-dropdown-menu");
                cysOverlay.autopopup = cysCommons.cysPrefs.getBoolPref("menu.dropdown.hover");
                if (cysOverlay.button !== null) {
                    cysOverlay.onLoad(); //only register listener + service if UI is OK!
                    if (!cysCommons.cysPrefs.getBoolPref("icon.show.always"))
                        cysOverlay.button.hidden = true;
                    cysOverlay.showDTA();
                    if (!cysCommons.cysPrefs.getBoolPref('menu.dropdown.dash480p.hqaudio')) {
                        var r = cysCommons.dashVideo;
                        r[135] = 1;
                        r[244] = 4;
                        r[245] = 4;
                        r[246] = 4;
                    }
                    cysOverlay.setupMenuCols();
                    //cysOverlay.onContentLoad(1);
                } else {
                    console.log('init error - CYS button not found!');
                }
            },
            uninit: function() {
                cysOverlay.observerService.removeObserver(cysOverlay, "http-on-modify-request");
            },
            cysButtonShow: function() {
                try {
                    var id = "cys-toolbaritem",
                        smallicons = gNavToolbox.getAttribute('iconsize') === 'small',
                        hiddenbutton;
                    for (var i in gNavToolbox.palette.childNodes) {
                        let el = gNavToolbox.palette.childNodes[i];
                        if (el.id === id) {
                            var urlBarElem = document.getElementById("urlbar-container"),
                                navBar = document.getElementById("nav-bar"),
                                cont, navSet, sb;
                            if (!urlBarElem)
                                urlBarElem = document.getElementById("nav-bar-inner"); // Sea-Monkey
                            if (urlBarElem && navBar) {
                                cont = urlBarElem.parentNode;
                                navSet = navBar.currentSet.split(",");
                                if (navSet.indexOf(id) === -1) {
                                    if (!document.getElementById(id))
                                        cont.appendChild(el); // Mac work-around
                                    var sb = document.getElementById('urlbar-search-splitter');
                                    if (smallicons || urlBarElem.previousSibling.id !== 'unified-back-forward-button' || !sb) {
                                        cont.insertItem(id, urlBarElem);
                                    } else {
                                        cont.insertItem(id, sb); // respecting FF forward-button auto-hiding, pre-FF29, doh.....
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
                    cysCommons.cysDump(ex, ex.stack);
                }
            },
            updateButtonTooltip: function() {
                var t = '',
                    s;
                for (var i in cysCommons.conversions) {
                    s = cysCommons.conversions[i];
                    if (!s || !s.path)
                        continue;
                    t += (s.path.replace(/\.tmp$/, '(.tmp)') + '\n');
                }
                if (t)
                    t = cysCommons.getCysString('ffmpegjobs') + t;
                t = cysCommons.getCysString('name') + t;
                cysOverlay.button.tooltipText = t;
            },
            showDTA: function() {
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
            openOptions: function() {
                var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch('browser.preferences.'),
                    instant, o = { 'v': -1 },
                    i;
                instant = prefs.getBoolPref('instantApply');
                if (instant)
                    prefs.setBoolPref('instantApply', false);
                var params = {};
                openDialog("chrome://completeyoutubesaver/content/preferences.xul", "", "chrome,titlebar,toolbar,centerscreen,modal,dialog=no,resizable", params);

                try {
                    if (params.golink) {
                        window.open(params.golink, '_blank');
                    } else {
                        window.focus();
                    }
                } catch (ex) {}

                if (instant)
                    prefs.setBoolPref('instantApply', true);
                if (o.v !== 0) {
                    cysCommons.getConverterPath();
                    cysOverlay.defaultdir = cysCommons.getDefaultDir("Complete YouTube Saver", true);
                    cysCommons.setIcon();
                    if (cysOverlay.vid) {
                        cysOverlay.vid.youTubeFormats = null;
                        cysOverlay.videoListIsActual = false;
                        cysOverlay.vid = null;
                        //et id = cysOverlay.vid.id;
                        //cysOverlay.vid = { id: id };
                    }
                    for (i in cysOverlay.idlist) {
                        cysOverlay.idlist[i] = 'a';
                        delete cysOverlay.idlist[i];
                    }
                    delete cysOverlay.idlist;
                    cysOverlay.idlist = {};
                    cysOverlay.onContentLoad(1);
                }
            },
            openAbout: function() { // Firefox 4.0 implements new AddonManager - module is not available in Firefox 3.6 and earlier
                try {
                    Components.utils.import("resource://gre/modules/AddonManager.jsm");
                } catch (err) {}
                if (AddonManager) {
                    AddonManager.getAddonByID("{AF445D67-154C-4c69-A17B-7F392BCC36A3}", function(addon) {
                        openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", addon);
                    });
                } else {
                    var extensionManager = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);
                    openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", "urn:mozilla:item:{AF445D67-154C-4c69-A17B-7F392BCC36A3}", extensionManager.datasource);
                }
            },
            openFFmpegDialog: function() {
                if (cysCommons.canConvert)
                    return 1;
                var last = cysCommons.cysPrefs.getIntPref('ffmpeg.lastalert');
                if (last === -1)
                    return 1;
                var t = new Date();
                t = t.getDate();
                if (last === t)
                    return 1;
                var o = { 'v': 0 };
                cysCommons.cysPrefs.setIntPref('ffmpeg.lastalert', -1);
                return 1;
                /*openDialog("chrome://completeyoutubesaver/content/ffmpeg.xul", "", "chrome,titlebar,centerscreen,modal,dialog=yes,", o);
                 if (o.v === 2) {
                 setTimeout(function () {
                 cysCommons.openUrl(cysCommons.getCysString('homepage', null) + cysCommons.getCysString('converterpage', null));
                 }, 500);
                 } else if (o.v === true) {
                 t = -1;
                 }
                 cysCommons.cysPrefs.setIntPref('ffmpeg.lastalert', t);
                 return null;*/
            },
            dtaToggle: function(e) {
                var dtatgl = document.getElementById("cys-dta-toggle");
                if (dtatgl && !dtatgl.disabled)
                    cysCommons.cysPrefs.setBoolPref('download.dta', dtatgl.hasAttribute('checked'));
            },
            setupMenuCols: function() {
                var r = Math.ceil,
                    f, sz = getComputedStyle(document.getElementById('menu_File') || document.getElementById('file-menu')).getPropertyValue('font-size');
                sz = Number(sz.substr(0, sz.length - 2));
                f = (sz / 12) || 1;
                cysOverlay.colSizes = [r(f * 45), r(f * 40), r(f * 100), r(f * 40), r(f * 60), r(f * 65), r(f * 45), r(f * 5)];
            },
            setVideoConfig: function(videoID) {
                try {
                    var tvideoID = null;
                    for (var key in cysOverlay.currentEmbeddedVidList) {
                        tvideoID = key;
                        if (cysOverlay.idlist[tvideoID]) {
                            cysOverlay.vid = cysOverlay.idlist[tvideoID];
                            if (cysOverlay.vid.running === 1) {
                                return;
                            }
                        }
                    }
                    var btn = cysOverlay.button;
                    if (videoID && btn) {
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
                        cysOverlay.videoListIsActual = false;
                        cysOverlay.vid.detail = null;
                        cysOverlay.vid.duration = null;
                        cysOverlay.vid.author = null;
                        cysOverlay.vid.published = null;
                        cysOverlay.vid.html = null;
                        cysOverlay.vid.running = 1;
                        cysOverlay.vid.af = null;
                        cysOverlay.vid.fmap = null;
                        if (btn) {
                            btn.disabled = false;
                            btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        }
                        if (!cysOverlay.availableInHTML(videoID)) {
                            cysCommons.getAJAX('https://www.googleapis.com/youtube/v3/videos?id=' + videoID + '&key=' + cysOverlay.youtubekey + '&part=snippet,contentDetails,statistics,status', function(data, cb, videoID) {
                                cysOverlay.getVideoDate(data, cb, videoID, function() {
                                    cysCommons.getAJAX('http://www.youtube.com/watch?v=' + videoID + '&spf=navigate', cysOverlay.processAJAX);
                                });
                            }, 'GET', false, videoID); // get video API feed                            
                        }
                    } else {
                        cysOverlay.vid = null;
                        btn.disabled = true;
                        btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                        return;
                    }
                } catch (ex) {
                    cysCommons.cysDump("error in setVideoConfig:" + ex, ex.stack);
                }
            },
            observe: function(aSubject, aTopic, aData) {
                if (aTopic === 'http-on-modify-request') {
                    /*try{
                     if(cysCommons.executeInSandbox("document") && cysCommons.executeInSandbox("document.body") ){
                     if(cysCommons.executeInSandbox("document.getElementById('cys_currenturl');") === null){
                     var scrp="var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cys_currenturl'); divtoappend.setAttribute('id','cys_currenturl'); divtoappend.setAttribute('value','"+cysOverlay.currentURL+"'); document.body.appendChild(divtoappend);";
                     cysCommons.executeInSandbox(scrp);
                     }else{
                     cysOverlay.currentURL = cysCommons.executeInSandbox("document.getElementById('cys_currenturl').getAttribute('value');");
                     }
                     for(var vidid in cysOverlay.embeddedVideoIdList){
                     if(cysOverlay.idlist[vidid] !== null){
                     var j=0;
                     for(var inurl in cysOverlay.embeddedVideoIdList[vidid].url){
                     //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList for:"+inurl);
                     if(cysOverlay.embeddedVideoIdList[vidid].url[inurl] === cysOverlay.currentURL){
                     //cysCommons.cysDump("onLocationChange:else embeddedVideoIdList for if:"+path+":::cysOverlay.embeddedVideoIdList[vidid].url[inurl]"+cysOverlay.embeddedVideoIdList[vidid].url[inurl]);
                     cysOverlay.currentEmbeddedVidList[vidid]={};
                     cysOverlay.currentEmbeddedVidList[vidid].title = cysOverlay.embeddedVideoIdList[vidid].title;
                     cysOverlay.currentEmbeddedVidList[vidid].url={};
                     cysOverlay.currentEmbeddedVidList[vidid].url[0] = cysOverlay.currentURL;

                     //cysOverlay.vid = cysOverlay.idlist[vidid];
                     if(cysCommons.executeInSandbox("document.getElementById('cys_"+cysOverlay.idlist[vidid].id+"');") === null){
                     //cysCommons.cysDump("in sandbox onLocationChange:");
                     var scrp="var divtoappend = document.createElement('div'); divtoappend.style.visibility = 'hidden'; divtoappend.style.display='none'; divtoappend.setAttribute('class','cysembeddedvideoid'); divtoappend.setAttribute('id','cys_"+vidid+"'); divtoappend.setAttribute('value','"+vidid+"'); document.body.appendChild(divtoappend);";
                     cysCommons.executeInSandbox(scrp);
                     scrp = "var cysdiv = document.getElementById('cys_"+cysOverlay.idlist[vidid].id+"'); cysdiv.setAttribute('ptk','"+cysOverlay.idlist[vidid].ptk+"'); cysdiv.setAttribute('ref','"+cysOverlay.idlist[vidid].ref+"'); cysdiv.setAttribute('dm','"+cysOverlay.idlist[vidid].dm+"'); cysdiv.setAttribute('ttsurl','"+cysOverlay.idlist[vidid].ttsurl+"'); cysdiv.setAttribute('cc_asr','"+cysOverlay.idlist[vidid].cc_asr+"'); cysdiv.setAttribute('af','"+cysOverlay.idlist[vidid].af+"'); cysdiv.setAttribute('fmap','"+cysOverlay.idlist[vidid].fmap+"');";
                     cysCommons.executeInSandbox(scrp);
                     var vidau="",vidtitle="",viddetail="";
                     if(cysOverlay.idlist[vidid].author !=null){
                     vidau=cysOverlay.idlist[vidid].author.replace(/'/g, "\\'");
                     }
                     if(cysOverlay.idlist[vidid].title !== null){
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

                     if(videoID !=null && videoID !== 'videoseries' && typeof (cysOverlay.embeddedVideoIdList[videoID]) !== 'undefined'){
                     for(var vidid in cysOverlay.embeddedVideoIdList){
                     if(vidid==videoID){
                     for(var inurl in cysOverlay.embeddedVideoIdList[videoID].url){
                     if(cysOverlay.embeddedVideoIdList[videoID].url[inurl] !== cysOverlay.currentURL){
                     var incr = parseInt(inurl)+1;
                     cysOverlay.embeddedVideoIdList[videoID].url[incr]=cysOverlay.currentURL;
                     cysOverlay.currentEmbeddedVidList[videoID]={};
                     cysOverlay.currentEmbeddedVidList[videoID].title=cysOverlay.embeddedVideoIdList[videoID].title;
                     cysOverlay.currentEmbeddedVidList[videoID].url={};
                     cysOverlay.currentEmbeddedVidList[videoID].url[0]=cysOverlay.currentURL;
                     var btn = cysOverlay.button;
                     if(cysOverlay.vid && cysOverlay.vid.running !== 1 && cysOverlay.idlist[videoID]){
                     cysOverlay.vid = cysOverlay.idlist[videoID];
                     if(btn){
                     btn.disabled = false;
                     btn.hidden = !cysCommons.cysPrefs.getBoolPref("icon.show.always");
                     }
                     break;
                     }else if(cysOverlay.vid===null && cysOverlay.idlist[videoID]){
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
                     if(videoID !=null && videoID !== 'videoseries' && typeof (cysOverlay.embeddedVideoIdList[videoID]) === 'undefined'){
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
            availableInHTML: function(videoID) {
                if (!videoID) {
                    return false;
                }
                var scrp = "";
                scrp = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "');");
                if (scrp === null) {
                    return false;
                }
                cysOverlay.vid.ccount = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('ccount');");
                if (cysOverlay.vid.ccount === null) {
                    return false;
                }
                cysOverlay.vid.ptk = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('ptk');");
                if (cysOverlay.vid.ptk === null) {
                    return false;
                }
                cysOverlay.vid.age = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('age');");
                cysOverlay.vid.duration = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('duration');");
                cysOverlay.vid.published = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('published');");
                cysOverlay.vid.detail = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').innerHTML;");
                cysOverlay.vid.ref = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('ref');");
                cysOverlay.vid.dm = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('dm');");
                cysOverlay.vid.ttsurl = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('ttsurl');");
                cysOverlay.vid.cc_asr = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('cc_asr');");
                cysOverlay.vid.af = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('af');");
                cysOverlay.vid.fmap = cysCommons.executeInSandbox("document.getElementById('cys_" + videoID + "').getAttribute('fmap');");
                cysOverlay.fillVideoArray(cysOverlay.vid.fmap, cysOverlay.vid.af);
                return true;
            },
            preloadImages: function() {
                function load(url) {
                    var img = new Image();
                    img.src = url;
                }

                load('chrome://global/skin/media/throbber.png');
            },
            getUrlFormat: function(fmt) {
                let fc = 0;
                if (fmt.length > 3)
                    fc = parseInt(fmt.substr(3));
                if (fc in cysCommons['convertFormatMatch' + cysOverlay.vid.age]) {
                    let t = cysCommons['convertFormatMatch' + cysOverlay.vid.age][fc];
                    for (j = 0; j < t.length; j++) {
                        let VF = t[j];
                        if (cysOverlay.vid.youTubeFormats[VF]) {
                            let menuitemUrl = cysOverlay.vid.youTubeFormats[VF];
                            return cysCommons.fmtFromUrl(menuitemUrl);
                        }
                    }
                }
            }
        };
    setTimeout(cysOverlay.init, 1000);
    //window.addEventListener("load", function() { cysOverlay.init(); }, false);
    //window.addEventListener("unload", function() { cysOverlay.uninit(); }, false);

} catch (ex) {
    cysCommons.cysDump(ex, ex.stack);
}