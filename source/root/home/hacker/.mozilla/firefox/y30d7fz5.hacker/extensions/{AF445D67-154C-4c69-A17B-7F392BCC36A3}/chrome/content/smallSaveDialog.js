/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
if ('undefined' == typeof Cc) var Cc = Components.classes;
if ('undefined' == typeof Ci) var Ci = Components.interfaces;
if ('undefined' == typeof Cu) var Cu = Components.utils;

try {
    if ("undefined" == typeof cysSmallSaveDialog)
        var cysSmallSaveDialog = {
            params: null,
            persist_: null,
            persistInterval_: null,
            currentFile_: null,
            Comment: null,
            videoID: null,
            ttsurl: null,
            cc_asr: null,
            subtitleTry: 0,
            cssFilesList: [],
            cssUrlsList: [],
            cssIndex: 0,
            doComments: true,
            avatarCount: 0,
            progressLabel: null,
            progressMax: 450,
            workTimer: 0,
            maxDL: 1,
            comments: null,
            stats: null,
            subtitle: null,
            page: null,
            sspacer: '<!-- cys_stats_script -->',
            commentList: [],
            gBrowserParent: null,

            cHeader: '<div style="display:inline-block; width:590px; color:rgb(102, 102, 102); font-size:13px;"><div style="margin:10px 10px 10px 10px;"><span><a href="*allcommentsurl*" style="text-decoration:none; color:rgb(128, 128, 128);"><strong style="font-weight:bold;">*allcommentsstr*</strong>&nbsp;&nbsp;&nbsp;(*allcommentscount*)</a>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;*commenttype*</span></div>',

            cAvatar: '<img style="margin:6px 0px 0px 5px; height:48px; width:48px; vertical-align:top;" src="*avatarimg*" />',

            cTemplate: '<div style="width:590px; min-height:44px; line-height:1.31;"><!--*avatar*--><div style="display:inline-block; width:530px; font-size:13px;"><div style="padding:3px 10px 3px 10px;"><a href="*profilelink*" target="_blank" style="font-weight:bold;  text-decoration:none; color:rgb(39, 147, 230);">*username*</a><span style="display:inline-block; margin-left:11px; font-size:10px; color:rgb(153, 153, 153);">*lastupdated*</span></div><div style="padding:3px 10px 3px 10px;"><span style="display:inline-block;">*commentbody*</span></div><div style="padding:0px 10px 10px 10px;"><a href="*commentid*" target="_blank" style="display:inline-block; margin-left:11px; font-size:11px; text-decoration:none; color:rgb(39, 147, 230);">*replies*</a></div></div></div>',

            statsScript: "<script type='text/javascript' src='MData/js'></script><script type='text/javascript' src='MData/cc'></script><script type='text/javascript'>\
         google.setOnLoadCallback(ytChDraw);\
         var ytChData =***;\
         function ytChDraw(e) {\
            var t = e.currentTarget, tn = t.nodeName, tid = 'data-metric-css', bid = 'data-mode-css', cls1 = ' yt-uix-tabs-selected', cls2 = ' yt-uix-button-toggled', i, ss;\
            if (tn=='TD') {\
               if (t.hasAttribute(tid)) {this.view = t.getAttribute(tid).substr(13); ss = t.parentNode.childNodes;\
                  for (i=0;i<ss.length;i++) {if (ss[i].nodeName == tn && ss[i].hasAttribute('class')) ss[i].className = ss[i].className.replace(cls1,'').replace(cls2,'');}\
                  t.className += cls1+cls2;\
               }\
            } else if (tn=='BUTTON') {\
               if (t.hasAttribute(bid)) {this.mode = t.getAttribute(bid).substr(11); ss = t.parentNode.childNodes;\
                  for (i=0;i<ss.length;i++) {if (ss[i].nodeName == tn && ss[i].hasAttribute('class')) ss[i].className = ss[i].className.replace(cls2,'');}\
                  t.className += cls2;\
               }\
            }\
           if (typeof this.id == 'undefined') this.id = document.getElementById('stats-chart-gviz');\
           if (typeof this.mode == 'undefined') this.mode = 'cumulative';\
           if (typeof this.view == 'undefined') this.view = 'views';\
           var data = new google.visualization.DataTable();\
           data.addColumn('date', 'day');\
           data.addColumn('number', this.mode);\
           for (i=0; i<ytChData.day.data.length;i++) {data.addRow([new Date(ytChData.day.data[i]),ytChData[this.view][this.mode].data[i]]);}\
           var options = ytChData[this.view][this.mode].opt;\
           var chart = new google.visualization.LineChart(this.id);\
           chart.draw(data, options);\
         }</script>",

            doCancel: function() { return true; },

            doOK: function() {
                //       document.getElementById("LED1").setAttribute('style', 'background-color:aqua');
                //       cysSmallSaveDialog.maxDL = cysCommons.cysPrefs.getIntPref("download.comments.threads");
                //       cysSmallSaveDialog.spinner = document.getElementById("threadspinner");
                //       for (var i=2;i<=cysSmallSaveDialog.maxDL;i++) { if (i<= cysSmallSaveDialog.maxDL) cysSmallSaveDialog.spinner.increase(); }


                document.getElementById("projectLabel").value = cysSmallSaveDialog.params.title;
                cysSmallSaveDialog.currentFile_ = cysSmallSaveDialog.getFile("Main Page.html"); //SAVE MAIN PAGE
                cysSmallSaveDialog.progressLabel = document.getElementById("progressLabel");
                cysSmallSaveDialog.progressBar = document.getElementsByTagName("progressmeter")[0];
                cysSmallSaveDialog.progressBar.max = cysSmallSaveDialog.progressMax;
                cysSmallSaveDialog.progressBar.value = Math.round(cysSmallSaveDialog.progressMax / (cysSmallSaveDialog.params.saveCommentPages + 1));
                cysSmallSaveDialog.setProgress(1, cysCommons.getCysString("saving.main"));
                if (cysSmallSaveDialog.params.pageUrl == "") cysSmallSaveDialog.params.pageUrl = cysCommons.getTopWin().getBrowser().contentDocument.location.toString();
                if (Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS != 'WINNT') document.getElementById("cys-ss0").hidden = true;
                cysSmallSaveDialog.persist_ = cysCommons.download(cysSmallSaveDialog.params.pageUrl, cysSmallSaveDialog.currentFile_, true, false, null, null, 0); // block cookie?
                cysSmallSaveDialog.persistInterval_ = setInterval(cysSmallSaveDialog.downloadingMainPage, 100);
            },

            addStats: function(stats, cb) {
                if (cb) {
                    if (stats) { //dump('\n*** Stats data:\n'+stats+'\n\n'); cysSmallSaveDialog.writeStringToFile(cysSmallSaveDialog.getFile('stats.xml'),null,stats,'UTF-8');  // saves stats info to file
                        if (stats.length < 30 || /<error_message>.+<\/error_message>/.test(stats)) {
                            var shtml = '<h2 class="CYS-error-msg" style="margin:3em;">' + cysCommons.getCysString("stats.error", null) + '</h2>';
                        } else {
                            var shtml = stats.replace(/<\?xml[\s\S]+<html_content>\s*?<!\[CDATA\[\s*/, '').replace(/\]\]>\s*<\/html_content>[\s\S]+/, ''); //dump('\n\n* stats html:\n'+shtml+'\n\n');
                            var sdata = stats.replace(/<\?xml[\s\S]+<graph_data>\s*?<!\[CDATA\[\s*/, '').replace(/\]\]>\s*<\/graph_data>[\s\S]+/, ''); //dump('\n\n* stats data:\n'+sdata+'\n\n');
                            shtml = shtml.replace(/<td/g, '<td onclick="ytChDraw(event)"').replace(/onclick=";return false;"/g, 'onclick="ytChDraw(event);return false;"');
                            shtml = shtml.replace('<div class="stats-chart-gviz"', '<div id="stats-chart-gviz"');
                            sdata = cysSmallSaveDialog.statsScript.replace('ytChData =***', 'ytChData = ' + sdata);
                            cysSmallSaveDialog.statsScript = sdata;
                        } //dump('\n\n*** Stats info:\ndata:\n' + sdata + '\n\nhtml:\n'+ shtml + '\n\n');
                        cysSmallSaveDialog.stats = shtml || 'done';
                    } else {
                        cysSmallSaveDialog.stats = 'done';
                    }
                    cysSmallSaveDialog.downloadingMainPage();
                } else if (cysSmallSaveDialog.stoken) {
                    var mdir = cysSmallSaveDialog.getFile('MData'),
                        statUrl = 'http://www.youtube.com/insight_ajax?action_get_statistics_and_data=1&v=' + cysSmallSaveDialog.params.videoID;
                    if (!mdir.exists() || !mdir.isDirectory()) mdir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                    if (typeof cysSmallSaveDialog.params.js1 == 'string' && typeof cysSmallSaveDialog.params.js2 == 'string') {
                        var f1 = mdir.clone(),
                            f2 = mdir.clone();
                        f1.append('js');
                        f2.append('cc')
                        cysCommons.writeFile(f1, cysSmallSaveDialog.params.js1, 'UTF-8');
                        cysCommons.writeFile(f2, cysSmallSaveDialog.params.js2, 'UTF-8'); //dump('\n* Writing libraries...\n');
                    }
                    cysCommons.getAJAX(statUrl, cysSmallSaveDialog.addStats, 'POST', cysSmallSaveDialog.stoken);
                } else {
                    cysSmallSaveDialog.stats = 'done';
                    cysSmallSaveDialog.downloadingMainPage();
                }
            },

            addSubtitle: function(d, cb) {
                if (cb) {
                    if (d) {
                        cysCommons.writeStringToFile(cysSmallSaveDialog.getFile(cysSmallSaveDialog.params.title + ".srt"), null, cysCommons.xmlToSrt(d), 'UTF-8');
                        cysSmallSaveDialog.subtitle = 'done';
                    } else {
                        var limitofcount = 2;
                        if (cysSmallSaveDialog.params.cysSubtitleLanguage == 'en' || cysSmallSaveDialog.params.cysSubtitleLanguage == 'en-GB') {
                            limitofcount = 4;
                        }
                        if (cysSmallSaveDialog.params.ignoreAutoSubtitles) {
                            cysSmallSaveDialog.subtitleTry++;
                        }
                        if (cysSmallSaveDialog.subtitleTry < limitofcount) {
                            cysCommons.getAJAX(cysSmallSaveDialog.getSubtitleUrl(cysSmallSaveDialog.subtitleTry), cysSmallSaveDialog.addSubtitle, 'GET', null, null);
                            cysSmallSaveDialog.subtitleTry++;
                        } else {
                            cysSmallSaveDialog.subtitle = 'done';
                        }
                    }
                    cysSmallSaveDialog.downloadingMainPage();
                } else if (cysSmallSaveDialog.subtitleTry == 0) {
                    //cysCommons.cysDump("3)"+cysSmallSaveDialog.params.ttsurl+"&type=track&lang=en&format=1&name=&kind=" + (cysSmallSaveDialog.params.cc_asr==1 ? "asr" : ""));
                    cysCommons.getAJAX(cysSmallSaveDialog.getSubtitleUrl(cysSmallSaveDialog.subtitleTry), cysSmallSaveDialog.addSubtitle, 'GET', null, null);
                    cysSmallSaveDialog.subtitleTry++;
                    //cysSmallSaveDialog.subtitle = 'done';
                }
            },
            getSubtitleUrl: function(counter) {
                var langslug = cysSmallSaveDialog.params.cysSubtitleLanguage;
                if (counter >= 2 && (langslug == 'en' || langslug == 'en-GB')) {
                    if (langslug == 'en') {
                        langslug = 'en-GB';
                    } else {
                        langslug = 'en';
                    }
                }
                return cysCommons.getSubtitleUrl(counter, cysSmallSaveDialog.params.cc_asr, cysSmallSaveDialog.params.ignoreAutoSubtitles, cysSmallSaveDialog.params.ttsurl, langslug);
            },
            addComments: function(comments, cb, id) { //
                cysSmallSaveDialog.setProgress(50);
                cysSmallSaveDialog.comments = cysSmallSaveDialog.params.Comment;
                //cysSmallSaveDialog.comments = cysCommons.saveImagesToLocal(cysSmallSaveDialog.comments, /\.js|\.jpg|\.ico|\.gif|\.png|\.swf/gi, "MData",cysSmallSaveDialog.currentFile_.parent.path, 500);
                cysSmallSaveDialog.comments = cysCommons.getImages(cysSmallSaveDialog.currentFile_.parent.path, cysSmallSaveDialog.comments);
                cysSmallSaveDialog.downloadingMainPage();
                return;
                /*if (cb) { //dump('\n\n*** Comment data:\n'+comments+'\n\n');
                 var i, cdata, ctotal, cstart, nextUrl; try{cdata = JSON.parse(comments).feed; ;}catch(e){};
                 cysSmallSaveDialog.subtitleTry = cysSmallSaveDialog.subtitleTry + 50;
                 if (cdata && cdata.entry) {
                    for (i=0;i<50;i++) {if (cdata.entry[i]) cysSmallSaveDialog.commentList.push(cdata.entry[i])}
                    cstart = cdata.openSearch$startIndex; ctotal = cdata.openSearch$totalResults.$t; if (ctotal > cysSmallSaveDialog.params.ccount) cysSmallSaveDialog.params.ccount = ctotal;
                    cysSmallSaveDialog.setProgress(10 + cysSmallSaveDialog.commentList.length / 24, cysCommons.getCysString("saving.comment",cysSmallSaveDialog.commentList.length,cysSmallSaveDialog.params.ccount));
                    //dump('\n Comments in array: '+cysSmallSaveDialog.commentList.length+' / '+ctotal+'  -  startindex: '+((cstart)?cstart.$t:cstart));
                    for (var r in cdata.link) {if (cdata.link[r].rel=='next') {nextUrl = cdata.link[r].href; break;}}
                    //
                    //cysCommons.cysDump("cysurl:"+nextUrl);
                    if (nextUrl && cysSmallSaveDialog.doComments && cysSmallSaveDialog.subtitleTry <= 700) { //dump('\nAJAX req:'+nextUrl+'\n');
                       setTimeout(function(){cysCommons.getAJAX(nextUrl,cysSmallSaveDialog.addComments,'GET','',50);},10);
                       return;
                    }
                 } else {
                    //dump('\n*** AJAX returned faulty data:\n'+comments+'\n\n Comments in array:\n'+cysSmallSaveDialog.commentList.length+'\n');
                 }
                 cysSmallSaveDialog.setProgress(50);
                 cysSmallSaveDialog.comments = []; cysSmallSaveDialog.avatars = []; var it, s, u, av, t = cysCommons.getCysString('latestcomments'), getav = cysSmallSaveDialog.params.avatars;
                 if (cysSmallSaveDialog.params.commentsbyrel) t = cysCommons.getCysString('bestcomments');
                 s = cysSmallSaveDialog.cHeader.replace('*commenttype*',t).replace('*allcommentsurl*','http://www.youtube.com/all_comments?v='+cysSmallSaveDialog.params.videoID);
                 cysSmallSaveDialog.comments.push(s.replace('*allcommentsstr*',cysCommons.getCysString('allcomments')).replace('*allcommentscount*',cysSmallSaveDialog.params.ccount));
                 for (i=0;i<cysSmallSaveDialog.commentList.length;i++) {
                    it = cysSmallSaveDialog.commentList[i]; s = cysSmallSaveDialog.cTemplate;
                    try{                                                            // user url: https://www.youtube.com/user/*userid*  or  https://www.youtube.com/channel/*it.yt$channelId.$t*
                       s = s.replace('*username*',it.author[0].name.$t).replace('*commentid*',it.id.$t).replace('*commentbody*',it.content.$t);
                       t = new Date(it.updated.$t); t = t.toLocaleString(); s = s.replace('*lastupdated*',t);
                       t = it.yt$replyCount.$t; s = s.replace('*replies*',((Number(t))?(cysCommons.getCysString('replies')+'&nbsp;'+t):''));
                       u = 'https://www.youtube.com/user/'+it.author[0].name.$t; t = it.yt$googlePlusUserId.$t; av = '';
                       if (t) {u = 'http://www.youtube.com/profile_redirector/'+t; av = 'http://picasaweb.google.com/data/entry/api/user/'+t+'?alt=json';}
                       s = s.replace('*profilelink*',u);
                       if (getav && !av) s = s.replace('<!--*avatar*-->',cysSmallSaveDialog.cAvatar.replace('*avatarimg*', 'https://i.ytimg.com/i/'+it.yt$channelId.$t.substr(2)+'/1.jpg')); // YT avatar!
                    } catch(e){
                       s=''; dump('\nFailed to process comment '+i);
                       //dump('\n\nUser: '+it.author[0].name.$t+'\nUser xml uri: '+it.author[0].uri.$t+'\nUser channelid: '+it.yt$channelId.$t);
                       //dump('\nGoogle+ account: '+((it.yt$googlePlusUserId)?('http://www.youtube.com/profile_redirector/'+it.yt$googlePlusUserId.$t):''));
                       //dump('\nUpdated: '+it.updated.$t+'\nContent: '+it.content.$t+'\nComment link: '+it.id.$t+'\nComment replies: '+it.yt$replyCount.$t);
                    }
                    if (s) {cysSmallSaveDialog.comments.push(s); cysSmallSaveDialog.avatars.push(av);}
                 }
                 if (getav && cysSmallSaveDialog.avatars.length) { //dump('\n* Avatar links to get: '+cysSmallSaveDialog.avatars.length);
                    for (i=0;i<cysSmallSaveDialog.avatars.length;i++) {
                       if (cysSmallSaveDialog.avatars[i]) {cysCommons.getAJAX(cysSmallSaveDialog.avatars[i],cysSmallSaveDialog.addAvatars,'GET','',i); cysSmallSaveDialog.avatarCount++;}
                    }
                 } else {                                                                                                                          // saves comments info to file
                    cysSmallSaveDialog.comments = cysSmallSaveDialog.comments.join('')+'</div>'; //cysSmallSaveDialog.writeStringToFile(cysSmallSaveDialog.getFile('comments.html'),null,cysSmallSaveDialog.comments,'UTF-8');
                    //cysSmallSaveDialog.comments = cysSmallSaveDialog.params.commentshtml;
                    cysSmallSaveDialog.downloadingMainPage();
                 }
                } else {
                 var commUrl = 'https://gdata.youtube.com/feeds/api/videos/'+cysSmallSaveDialog.params.videoID+'/comments?alt=json&max-results=50';//&start-index=301;
                 if (!cysSmallSaveDialog.params.commentsbyrel) commUrl += '&orderby=published';
                 cysSmallSaveDialog.subtitleTry = 50;
                 cysCommons.getAJAX(commUrl,cysSmallSaveDialog.addComments,'GET',null,50);
        
            }*/
            },

            addAvatars: function(d, cb, i) {
                if (!cb) { return; } //dump('\n Avatars to get: '+cysSmallSaveDialog.avatarCount);
                var dd;
                try {
                    dd = JSON.parse(d);
                    dd = dd.entry.gphoto$thumbnail.$t
                } catch (e) {}
                if (dd) cysSmallSaveDialog.comments[i + 1] = cysSmallSaveDialog.comments[i + 1].replace('<!--*avatar*-->', cysSmallSaveDialog.cAvatar.replace('*avatarimg*', dd));
                cysSmallSaveDialog.avatarCount--;
                cysSmallSaveDialog.setProgress(50 + 40 * (cysSmallSaveDialog.commentList.length - cysSmallSaveDialog.avatarCount) / cysSmallSaveDialog.commentList.length, cysCommons.getCysString("saving.avatars", cysSmallSaveDialog.avatarCount));
                if (!cysSmallSaveDialog.avatarCount) {
                    cysSmallSaveDialog.comments = cysSmallSaveDialog.comments.join('') + '</div>'; //cysSmallSaveDialog.writeStringToFile(cysSmallSaveDialog.getFile('comments.html'),null,cysSmallSaveDialog.comments,'UTF-8');
                    cysSmallSaveDialog.downloadingMainPage();
                }
            },

            downloadingMainPage: function() {
                if (cysSmallSaveDialog.persist_.currentState != 3) {
                    return;
                }
                clearInterval(cysSmallSaveDialog.persistInterval_);
                if (this !== cysSmallSaveDialog) { setTimeout(function() { cysSmallSaveDialog.downloadingMainPage() }, 20); /*dump('\n\n*** this !== cysSmallSaveDialog !!! (downloadingMainPage)\n\n');*/ return; }
                try {
                    if (!cysSmallSaveDialog.page) {
                        cysSmallSaveDialog.page = cysCommons.readFileToString(cysSmallSaveDialog.currentFile_);
                        var tt = String(/yt.setAjaxToken\('insight_ajax',\s*"[^"\s]+"/.exec(cysSmallSaveDialog.page)).replace(/yt.setAjaxToken\('insight_ajax',/, ''); // get stats token
                        if (tt) { cysSmallSaveDialog.stoken = 'session_token=' + tt.substring(tt.indexOf('"') + 1, tt.length - 1); } //cysCommons.cysDump('\n'+tt+'\n'); cysCommons.cysDump('\n'+cysSmallSaveDialog.stoken+'\n');
                        cysSmallSaveDialog.page = cysSmallSaveDialog.processPage(cysSmallSaveDialog.page, null, true);
                    }

                    cysSmallSaveDialog.setProgress(5);
                    if (cysSmallSaveDialog.params.saveSubtitles && cysSmallSaveDialog.params.ttsurl) {
                        if (cysSmallSaveDialog.subtitle) {
                            if (cysSmallSaveDialog.subtitle != 'done') {
                                cysSmallSaveDialog.subtitle = 'done';
                            }
                        } else {
                            cysSmallSaveDialog.setProgress(5, cysCommons.getCysString("saving.subtitle"));
                            cysSmallSaveDialog.addSubtitle();
                            return;
                        }
                        //cysSmallSaveDialog.addSubtitle(); return;
                    }


                    if (cysSmallSaveDialog.params.saveComments) { // save comments
                        if (cysSmallSaveDialog.comments) {
                            if (cysSmallSaveDialog.comments != 'done') {
                                //var ctgt = /<div[^>]+id="comments-test-iframe"[^>]*?>\s*<\/div>/.exec(cysSmallSaveDialog.page);
                                //cysCommons.cysDump(cysSmallSaveDialog.comments);
                                var ctgt = /id="watch-discussion"/.exec(cysSmallSaveDialog.page);
                                if (ctgt) {
                                    var start = ctgt["index"];
                                    var ctgt1 = /id="watch7-sidebar"/.exec(cysSmallSaveDialog.page);
                                    var end = ctgt1["index"];
                                    cysSmallSaveDialog.page = cysCommons.replaceContent(start - 5, end - 5, cysSmallSaveDialog.comments + "</div>", cysSmallSaveDialog.page); //cysSmallSaveDialog.page.replace(ctgt[0],cysSmallSaveDialog.comments); /*dump('\n\n*** Comment block found and replaced:\n'+ctgt[0]+'\n\ncomment data:\n'+cysSmallSaveDialog.comments);*/
                                }
                                cysSmallSaveDialog.comments = 'done';
                            }
                        } else {
                            cysSmallSaveDialog.setProgress(10, "Saving comments..."); //cysCommons.getCysString("saving.comment",0,cysSmallSaveDialog.params.ccount));
                            cysSmallSaveDialog.addComments();
                            return;
                        }

                        //cysSmallSaveDialog.comments = cysSmallSaveDialog.params.commentshtml;
                        /*if (cysSmallSaveDialog.comments) {
                           if (cysSmallSaveDialog.comments!='done') {
                              var ctgt = /<div[^>]+id="comments-test-iframe"[^>]*?>\s*<\/div>/.exec(cysSmallSaveDialog.page);
                              if (ctgt) {cysSmallSaveDialog.page = cysSmallSaveDialog.page.replace(ctgt[0],cysSmallSaveDialog.comments); /*dump('\n\n*** Comment block found and replaced:\n'+ctgt[0]+'\n\ncomment data:\n'+cysSmallSaveDialog.comments);}
                              cysSmallSaveDialog.comments = 'done';
                           } else {dump('\ncomments == done!!!!\n');}
                        } else {
                           cysSmallSaveDialog.setProgress(10, cysCommons.getCysString("saving.comment",0,cysSmallSaveDialog.params.ccount));
                           //cysSmallSaveDialog.addComments(); return;
            
                        }*/
                    }
                    //cysCommons.cysDump("cysSmallSaveDialog.params.saveStat:"+cysSmallSaveDialog.params.saveStat);
                    if (cysSmallSaveDialog.params.saveStat) { // save stats
                        if (cysSmallSaveDialog.stats) {
                            if (cysSmallSaveDialog.stats != 'done') {
                                var sdiv = /<div\s+id="action-panel-stats"\s+class="action-panel-content\s+hid">[\s\S]+?<\/p>\s*<\/div>\s*<\/div>/;
                                if (cysSmallSaveDialog.stats.indexOf('class="CYS-error-msg"') == -1) cysSmallSaveDialog.stats = cysSmallSaveDialog.sspacer + cysSmallSaveDialog.stats;
                                cysSmallSaveDialog.page = cysSmallSaveDialog.page.replace(sdiv, '<div id="action-panel-stats" class="action-panel-content">\n' + cysSmallSaveDialog.stats + '\n</div>');
                                cysSmallSaveDialog.stats = 'done';
                            }
                        } else {
                            cysSmallSaveDialog.setProgress(90, cysCommons.getCysString("saving.stats"));
                            cysSmallSaveDialog.addStats();
                            return;
                        }
                    }

                    cysSmallSaveDialog.setProgress(95, cysCommons.getCysString("saving.data"));
                    var pageStr = cysSmallSaveDialog.processPage(cysSmallSaveDialog.page, "MData"),
                        tt, ytlink = 'http://www.youtube.com/watch?v=' + cysSmallSaveDialog.params.videoID;
                    if (cysSmallSaveDialog.stats == 'done') pageStr = pageStr.replace(cysSmallSaveDialog.sspacer, cysSmallSaveDialog.statsScript); // inject stats script + data
                    tt = /<meta property="og:image" content="([\S]+)">/.exec(pageStr); // insert screen image
                    //cysCommons.cysDump("Here it goes:"+tt[0]+"::::"+tt[1]+":::");
                    //if (tt) { cysCommons.cysDump("in here:"); pageStr = pageStr.replace(/<div[^>]+id="player-api"[^>]*>([.]*)?<\/div>/,'<div id="placeholder-player" ><div class="player-width player-height"><a href="'+ytlink+'" target="_blank"><img src="'+tt[1]+'" width="640" height="390"></a></div></div>'); }
                    if (tt) {
                        pageStr = pageStr.replace(/<div class="player-api player-width player-height"[^>]*>([.]*)?<\/div>/, '');
                        pageStr = pageStr.replace(/<div id="placeholder-player"[^>]*>([.]*)?<\/div>/, '');
                        pageStr = pageStr.replace(/<div[^>]+id="player-api"[^>]*>([.]*)?<\/div>/, '<div id="player-api" class="player-width player-height off-screen-target" tabIndex="-1"><a href="' + ytlink + '" target="_blank"><img src="' + tt[1] + '" width="640" height="390"></a></div>');
                        pageStr = pageStr.replace(/<div[^>]+id="theater-background"[^>]*>([.]*)?<\/div>/, '<div id="theater-background" class="player-height"><a href="' + ytlink + '" target="_blank"><img src="' + tt[1] + '" width="640" height="390"></a></div>');
                    }

                    //cysCommons.cysDump(":::::::::"+cysSmallSaveDialog.params.detail);
                    if (cysSmallSaveDialog.params.detail != null) {
                        pageStr = pageStr.replace(/<div id="watch-description-text"[\s\S]*?<\/div>/, cysSmallSaveDialog.params.detail);
                    }
                    pageStr = pageStr.replace('<span class="yt-uix-button-content">Show more </span>', '<span class="yt-uix-button-content">SHOW LESS </span>');
                    pageStr = pageStr.replace('<span class="yt-uix-button-content">Show more</span>', '<span class="yt-uix-button-content">SHOW LESS </span>');
                    /*if (cysSmallSaveDialog.params.saveStat && typeof cysSmallSaveDialog.params.stathtml != 'undefined' && cysSmallSaveDialog.params.stathtml !='') {
                        pageStr = pageStr.replace(/<div id="watch-action-panels"[\s\S]*?id="action-panel-dismiss" data-close-parent-id="watch8-action-panels"><\/button>\n  <\/div>/,'<div style="height: 403px;" id="watch-action-panels" class="watch-action-panels yt-uix-button-panel yt-card yt-card-has-padding"><div style="height: 353px;" data-panel-loaded="true" id="action-panel-stats" class="action-panel-content">'+cysSmallSaveDialog.params.stathtml+'</div></div>');
                    }*/
                    //cysCommons.cysDump(pageStr);
                    cysSmallSaveDialog.page = pageStr;
                    cysCommons.writeStringToFile(cysSmallSaveDialog.currentFile_, null, pageStr);
                    var linkfile = cysSmallSaveDialog.getFile(cysCommons.getCysString('ytlink', null) + '.url');
                    cysCommons.writeStringToFile(linkfile, null, '[InternetShortcut]\nURL=' + cysSmallSaveDialog.params.pageUrl + '\n', 'Windows-1252');
                    cysSmallSaveDialog.cssIndex = 0;
                    cysSmallSaveDialog.downloadNextCSSFile();
                } catch (ex) {
                    cysCommons.cysDump(ex);
                }
            },

            processPage: function(page, folder, mainpage) {
                var head = page.indexOf("<head>"),
                    t, tt;
                if (head != -1) page = page.substring(0, head + 6) + '<meta http-equiv="content-type" content="text/html; charset=UTF-8">' + page.substring(head + 6);
                try {
                    var stime = new Date().getTime(),
                        n = 0;
                    // var ttime = ttime2 = stime; ttime = new Date().getTime(); cysCommons.cysDump ('\nS'+n+' -  ' + String(ttime-ttime2) + ' ms'); ttime2 = ttime; n+=1;
                    if (mainpage) {
                        page = page.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                        page = page.replace(/<!--\smachid:\s\w{10,300}\s-->/, '').replace('yt.preload.start()', '').replace("'PLAYLIST_BAR_PLAYING_INDEX': 0,", "'PLAYLIST_BAR_PLAYING_INDEX': -1,");
                        page = page.replace(/<div id="html5-player-messages" style="display:none">[\s]*<!--[\s\S]+?-->[\s]*?<\/div>/, ''); // remove html5player msgs,
                        page = page.replace(/<div[^>]+id="ticker"[^>]*>/, '<div id="ticker" class="hid">'); // hide cookie alert header
                        page = page.replace(/<div\s+id="watch-description"\s+class="yt-uix-expander\s+yt-uix-expander-collapsed/, '<div id="watch-description" class="yt-uix-expander yt-uix-expander-expanded'); // expand description area
                        page = page.replace(/<img[^\n>]+?data-thumb=/g, '<img src='); // restore sidebar thumbnails
                        page = page.replace('id="distiller-spinner"', 'style="display:none;" id="distiller-spinner"'); // hide comments loading spinner

                        t = /<a id="logo-container"[^>]*>\s*<img id="logo"[^>]+(src="[^">]+")[^>]*><\/a>/.exec(page);
                        if (t && t[1]) page = page.replace(t[0], '<a id="logo-container" href="http://www.youtube.com"><img id="logo" ' + t[1] + '></a>'); // cleanup logo image
                    } else {
                        page = page.replace(/"\/\//g, '"http://').replace(/'\/\//g, "'http://").replace(/\(\/\//g, "(http://");
                        page = page.replace(/<img\s+src="http:\/\/www.youtube-nocookie.com[^>]+?>/, '');
                        page = cysSmallSaveDialog.findLink(page, '.css', 'CSS', 1000);
                        if (folder) page = cysSmallSaveDialog.findLink(page, /\.js|\.jpg|\.ico|\.gif|\.png|\.swf|\.woff2|\.json/gi, folder, 2000);
                        page = page.replace(/href="\//g, 'href="http://www.youtube.com/');

                    }
                } catch (ex) { cysCommons.cysDump(ex); }
                //ttime = new Date().getTime(); cysCommons.cysDump ('\nTime / page (ms): ' + String(ttime - stime) + ' ms');
                //cysSmallSaveDialog.workTimer = cysSmallSaveDialog.workTimer + ttime - stime; //dump ('\nTotal time (ms): ' + cysSmallSaveDialog.workTimer);
                return page;
            },

            setProgress: function(pct, txt) {
                if (pct) cysSmallSaveDialog.progressBar.value = Math.round(cysSmallSaveDialog.progressMax * 0.01 * Number(pct));
                if (txt) {
                    cysSmallSaveDialog.progressLabel.value = txt;
                    document.title = cysSmallSaveDialog.progressLabel.value + '  -  ' + cysSmallSaveDialog.params.title;
                }
            },

            downloadNextCSSFile: function() {
                var cssFile = cysSmallSaveDialog.getFile("CSS");
                cssFile.append(cysSmallSaveDialog.cssFilesList[cysSmallSaveDialog.cssIndex]);
                cysSmallSaveDialog.currentFile_ = cssFile;
                cysSmallSaveDialog.progressLabel.value = cysCommons.getCysString("saving.data", null);
                if (cysSmallSaveDialog.cssIndex < 0 || !cysSmallSaveDialog.cssUrlsList[cysSmallSaveDialog.cssIndex]) {
                    return;
                }
                cysSmallSaveDialog.persist_ = cysCommons.download(cysSmallSaveDialog.cssUrlsList[cysSmallSaveDialog.cssIndex], cssFile, true);
                cysSmallSaveDialog.persistInterval_ = setInterval(cysSmallSaveDialog.processNextCSSFile, 100);
            },

            processNextCSSFile: function() {
                if (cysSmallSaveDialog.persist_ && cysSmallSaveDialog.persist_.currentState == 3) {
                    try {
                        clearInterval(cysSmallSaveDialog.persistInterval_);
                        var cssFileStr = cysSmallSaveDialog.readCssFileToString(cysSmallSaveDialog.currentFile_);
                        if (cssFileStr != "") {
                            cssFileStr = cssFileStr.replace(/"\/\//g, '"http://').replace(/'\/\//g, "'http://").replace(/\(\/\//g, "(http://");
                            cssFileStr = cysSmallSaveDialog.findLink(cssFileStr, /\.jpg|\.ico|\.gif|\.png/gi, "Data", 2000);
                            cysCommons.writeStringToFile(cysSmallSaveDialog.currentFile_, null, cssFileStr);
                        }
                    } catch (ex) {
                        cysCommons.cysDump(ex, ex.stack);
                    }
                    cysSmallSaveDialog.cssIndex++;
                    if (cysSmallSaveDialog.cssIndex < cysSmallSaveDialog.cssFilesList.length) {
                        cysSmallSaveDialog.downloadNextCSSFile();
                    } else {
                        cysSmallSaveDialog.setProgress(100);
                        document.getElementById("cys-SmallSaveDialog").getButton("cancel").click();
                    }
                }
            },

            readCssFileToString: function(_file) {
                if (!_file.exists()) { /*dump('\n!! readCssFileToString - file not found: '+_file.path+'\n');*/ return ''; }
                var data = "";
                var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
                fstream.init(_file, 0x01, parseInt("444", 8), null);
                var sis = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
                sis.init(fstream);
                data = sis.read(sis.available());
                sis.close();
                return data;
            },

            findLink: function(page, instr, folder, count) { // instr can be string or Regex object! 
                if (typeof instr == 'string') {
                    instr = cysCommons.escRegex(instr);
                } else { // instr is RegExp object!!
                    instr = instr.toString().replace('\/gi', '').replace('\/', '');
                }
                let regexStr = new RegExp('\=[\'\"]([^\'\"]*(' + instr + ')[^\'\"]*)[\'\"]', 'gi');

                let match, link = null,
                    step = 0,
                    repStr, str, originalChartLink = '';

                var lastlinkFileName;

                let matches = regexStr.execAll(page);
                regexStr = new RegExp('url[\(][\'\"]?([^\'\"\(]+(' + instr + ')[^\'\"\)]*)[\'\"]?[\)]', 'gi');
                matches = matches.concat(regexStr.execAll(page));
                regexStr = new RegExp('[\'\"]\:[\'\"]([^\'\"\(]+(' + instr + ')[^\'\"\)]*)[\'\"]\}', 'gi');
                matches = matches.concat(regexStr.execAll(page));

                for (var i = 0; i < matches.length; i++) {
                    step++;
                    match = matches[i];
                    link = match[1];
                    str = match[2];
                    let relativeLink, suffix = '';

                    if (!link) {
                        continue;
                    }

                    if (link.indexOf("http") === -1) {
                        if (link.indexOf("/") === 0) {
                            relativeLink = link;
                            link = 'http://www.youtube.com' + link;
                        } else {
                            continue;
                        }
                    }

                    if (link.indexOf('?') !== -1) {
                        let index = link.indexOf('?');
                        suffix = link.substring(index);
                        link = link.substring(0, index);
                    }
                    let filenamestart, linkFileName;
                    filenamestart = link.lastIndexOf("/");
                    if (filenamestart == -1) filenamestart = link.lastIndexOf("%2F") + 2;
                    linkFileName = link.substring(filenamestart + 1);
                    if (linkFileName.lastIndexOf(str) != (linkFileName.length - str.length)) {
                        continue;
                    }

                    if (folder.substring(0, 2) == 'MD') {
                        t = linkFileName.substring(linkFileName.length - 3);
                        if (t == 'jpg') linkFileName = rand = Math.floor(Math.random() * 999999).toString() + linkFileName;
                    }

                    repStr = (linkFileName.indexOf("chart_api_img") == -1 || originalChartLink == "") ? (relativeLink ? relativeLink : link) : originalChartLink;

                    regexStr = new RegExp(cysCommons.escRegex(repStr + suffix), 'g'); // new regex solution

                    if (linkFileName === lastlinkFileName) {
                        page = page.replace(regexStr, folder + "/" + step + linkFileName);
                    } else {
                        page = page.replace(regexStr, folder + "/" + linkFileName);
                    }
                    originalChartLink = "";
                    let linkFile = cysCommons.getFile([cysSmallSaveDialog.currentFile_.parent.path, folder]);
                    if (!linkFile.exists() || !linkFile.isDirectory()) linkFile.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                    if (linkFileName == lastlinkFileName) {
                        linkFile.append(step + linkFileName);
                    } else {
                        lastlinkFileName = linkFileName;
                        linkFile.append(linkFileName);
                    }
                    if (!linkFile.exists()) {
                        if (str == '.css') {
                            if (cysSmallSaveDialog.cssFilesList.indexOf(linkFileName) < 0) {
                                cysSmallSaveDialog.cssFilesList.push(linkFileName);
                                cysSmallSaveDialog.cssUrlsList.push(unescape(link + suffix));
                            }
                        } else { //if (linkFileName.substr(0,5)=='pixel') dump('\n\n** Pixel file name: '+linkFileName+'\nlink: '+link+'\nstring matched:\n'+str);
                            cysCommons.download(unescape(link + suffix), linkFile, true);
                        }
                    }
                }

                return page.replace(/\n+/g, '\n');
            },
            getFile: function(fn) { // returns nsiFile based in video folder
                var i, a = [cysSmallSaveDialog.params.savedir, cysSmallSaveDialog.params.title];
                if (typeof fn == 'string') {
                    a.push(fn);
                } else if (fn instanceof Array) {
                    a.concat(fn);
                }
                return cysCommons.getFile(a);
            },

            cmenu: function(task) {
                if (task == 'openfolder') {
                    var explorer = cysSmallSaveDialog.getFile();
                    if (explorer.isDirectory()) { // && !explorer.isExecutable() *removed because it's not working in linux/unix
                        try {
                            explorer.launch();
                        } catch (e) { // Unix/Linux work-around
                            var dir = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newFileURI(explorer);
                            var ps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
                            ps.loadUrl(dir);
                        }
                    }
                } else if (task == 'cancelcomments') {
                    //cysSmallSaveDialog.doComments = false;
                    cysSmallSaveDialog.doComments = 0;
                } else if (task == 'toggletopmost') {
                    window.QueryInterface(Ci.nsIInterfaceRequestor);
                    var W = window.getInterface(Ci.nsIWebNavigation);
                    var WD = W.QueryInterface(Ci.nsIDocShellTreeItem);
                    var WO = WD.treeOwner.QueryInterface(Ci.nsIInterfaceRequestor);
                    var XW = WO.getInterface(Ci.nsIXULWindow);
                    var tg = document.getElementById('cys-ss0');
                    if (tg.hasAttribute('checked')) {
                        XW.zLevel = XW.highestZ;
                    } else {
                        XW.zLevel = XW.normalZ;
                    }
                }
            },

            smallSaveDialog_onload: function() {
                cysSmallSaveDialog.params = window.arguments[0];
                var parentWnd = window.opener;
                var parentDoc = parentWnd.getBrowser().contentDocument;
                var width = parentWnd.screenX + parentWnd.innerWidth;
                var height = parentWnd.screenY + parentWnd.innerHeight;
                var top = height - 400;
                var left = width - 500;
                window.moveTo(left, 0);
                cysSmallSaveDialog.doOK();
            }
        }
} catch (ex) {
    cysCommons.cysDump(ex);
}

// Return all pattern matches with captured groups
RegExp.prototype.execAll = function(string) {
    var match = null;
    var matches = new Array();
    while (match = this.exec(string)) {
        var matchArray = [];
        for (i in match) {
            if (parseInt(i) == i) {
                matchArray.push(match[i]);
            }
        }
        matches.push(matchArray);
    }
    return matches;
}