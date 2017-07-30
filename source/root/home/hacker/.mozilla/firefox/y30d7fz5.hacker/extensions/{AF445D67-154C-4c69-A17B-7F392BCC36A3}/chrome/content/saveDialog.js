/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
if ('undefined' == typeof Cc)
    var Cc = Components.classes;
if ('undefined' == typeof Ci)
    var Ci = Components.interfaces;

try {
    if ("undefined" === typeof cysSaveDialog)
        var cysSaveDialog = {
            defaultSaveDir: '',
            params: null,
            setTooltip: function (e) {
                var fl = document.getElementById('folderlist');
                fl.setAttribute('tooltiptext', fl.value);
                fl.setAttribute('crop', 'center');
            },
            doCancel: function () {
                //cysSniffer.unregListener();
                return true;
            },
            doOK: function () {
                var pname = document.getElementById("pname");
                pname.value = cysCommons.fixProjectName(pname.value, true);
                if (!pname.value) {
                    cysCommons.cysAlert("fill.projname");
                    pname.focus();
                    return false;
                }
                var path = document.getElementById("folderlist").value.trim();
                document.getElementById("folderlist").value = path;
                try {
                    var dir = cysCommons.getFile(path);
                    if (!dir.exists() || !dir.isDirectory())
                        dir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("0777", 8));
                    var projDirName = pname.value, projDirIndex = -1, projDir;
                    cysSaveDialog.params.videoName = projDirName;
                    do {
                        projDirIndex++;
                        projDir = cysCommons.getFile([path, projDirName + (projDirIndex ? "-" + projDirIndex : '')]);
                    } while (projDir.exists())
                    projDir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("0777", 8));
                    cysSaveDialog.params.projDir = projDir.path;
                    if (projDirIndex)
                        pname.value = pname.value + "-" + projDirIndex;
                } catch (ex) {
                    cysCommons.cysDump(ex);
                    cysCommons.cysAlert("wrong.savedir");
                    document.getElementById("folderlist").setAttribute('focused', true);
                    document.getElementById("folderlist").select();
                    return false;
                }
                cysSaveDialog.params.saveComments = document.getElementById("savecomments").checked;
                cysSaveDialog.params.saveCommentsCount = document.getElementById("savecommentscount").value;
                //if (cysSaveDialog.params.saveComments) {
                //cysSaveDialog.params.commentsbyrel = document.getElementById("savecommentstype").value=='true';
                //cysSaveDialog.params.avatars = document.getElementById("saveavatars").checked;
                //          cysSaveDialog.params.saveCommentPages = cysSaveDialog.params.commentPages;
                //          if (document.getElementById("savecommentsall").getItemAtIndex(1).getAttribute('selected') == 'true') {
                //             cysSaveDialog.params.saveCommentPages = document.getElementById("commentpages").valueNumber;
                //          }
                // }
                cysSaveDialog.params.saveStat = false;//document.getElementById("savestats").hasAttribute('checked');
                cysSaveDialog.params.saveSubtitles = document.getElementById("savesubtitles").hasAttribute('checked');
                cysSaveDialog.params.ignoreAutoSubtitles = document.getElementById("ignoreautosubtitles").hasAttribute('checked');
                cysSaveDialog.params.cysSubtitleLanguage = document.getElementById("cys-subtitle-language").value;
                cysSaveDialog.params.title = pname.value;
                cysSaveDialog.params.savedir = path;
                cysCommons.cysPrefs.setCharPref("download.dir", encodeURIComponent(path));
                cysCommons.cysPrefs.setBoolPref('download.details.hide', document.getElementById("cys-save-details").hidden);
                //
                if (cysSaveDialog.listmode === 'history' || document.getElementById('folderlist').selectedIndex === -1 || cysCommons.cysPrefs.getBoolPref('folders.custom.track')) {
                    var fl = decodeURIComponent(cysCommons.cysPrefs.getCharPref("folders.list.history")).split('**', cysSaveDialog.maxfolders);
                    for (var i = fl.length - 1; i >= 0; i--) {
                        if (fl[i].toLowerCase() === path.toLowerCase()) {
                            fl.splice(i, 1);
                            break;
                        }
                    }
                    if (fl.length >= cysSaveDialog.maxfolders)
                        fl.pop();
                    var a = path + '**' + fl.join('**')
                    cysCommons.cysPrefs.setCharPref("folders.list.history", encodeURIComponent(a));
                }
                if (document.getElementById("savevideo").hasAttribute('checked')) {
                    var videoFile = projDir.clone();
                    videoFile.append(cysSaveDialog.params.videoName + "." + cysCommons.getVideoFormatByUrl(cysSaveDialog.params.videoUrl, false, cysSaveDialog.params.convert).toLowerCase());
                    cysSaveDialog.params.videoFile = videoFile;
                }

                cysSaveDialog.params.useDTA = false;
                if (document.getElementById("save-dta").hasAttribute('checked'))
                    cysSaveDialog.params.useDTA = true;
                cysSaveDialog.params.ok = true;
                return true;
            },
            saveDialog_onload: function () {
                cysCommons.getConverterPath();
                cysSaveDialog.maxfolders = cysCommons.getmaxfolders();
                cysSaveDialog.params = window.arguments[0];
                cysSaveDialog.defaultSaveDir = cysCommons.getCysString('name');
                if (!cysSaveDialog.params.title) {
                    try {
                        cysSaveDialog.params.title = cysCommons.getTitle();
                    } catch (ex) {
                    }
                }
                cysSaveDialog.listmode = 'history'        // fill up folders drop-down list

                if (cysCommons.cysPrefs.getIntPref('folders.custom') == 1)
                    cysSaveDialog.listmode = 'custom';
                cysSaveDialog.setFolderList(cysSaveDialog.listmode);
                if (cysCommons.DTAstatus()) {                           // DTA checkbox
                    document.getElementById("dta-row").hidden = false;
                    document.getElementById("dta-row-sep").hidden = false;
                    document.getElementById("save-dta").checked = cysCommons.cysPrefs.getBoolPref('download.dta.complete');
                }
                document.getElementById("savestats").checked = false;//cysCommons.cysPrefs.getBoolPref("download.statistic");
                document.getElementById("savesubtitles").checked = cysCommons.cysPrefs.getBoolPref("download.subtitles");
                document.getElementById("ignoreautosubtitles").checked = cysCommons.cysPrefs.getBoolPref("ignore.auto.subtitles");
                document.getElementById("cys-subtitle-language").value = cysCommons.cysPrefs.getCharPref("subtitle.language");
                if (cysCommons.cysPrefs.getBoolPref("download.subtitles") == true) {
                    document.getElementById("ignoreautosubtitles").hidden = false;
                    document.getElementById("cys-subtitle-language").hidden = false;
                } else {
                    document.getElementById("ignoreautosubtitles").hidden = true;
                    document.getElementById("cys-subtitle-language").hidden = true;
                }

                document.getElementById("pageurl").value = cysSaveDialog.params.pageUrl;
                document.getElementById("videourl").value = cysSaveDialog.params.videoUrl;
                if (cysSaveDialog.params.videoUrl) {
                    cysOverlay.vid = cysSaveDialog.params.vid;
                    var t = cysCommons.getVideoFormatByUrl(cysSaveDialog.params.videoUrl, true, cysSaveDialog.params.convert, cysSaveDialog.params.age);
                    if (cysSaveDialog.params.size)
                        t += ('    -    ' + cysSaveDialog.params.size);
                    document.getElementById("format").value = t;
                    if (cysSaveDialog.params.convert != null) {
                        if (cysSaveDialog.params.convert)
                            document.getElementById("cys-format-label").value = 'Audio:';
                    }
                    //       } else {   EYVD sniffer
                    //          document.getElementById("format").value = cysSaveDialog.params.formatStr;
                    //          document.getElementById("cys-format-label").value = 'Audio:';
                    //          document.getElementById("cys-SaveDialog").getButton('accept').disabled=true;
                    //          cysSniffer.regListener();
                }
                document.getElementById("pname").value = cysSaveDialog.params.title;
                var panel = document.getElementById("cys-save-details");
                var toggle = document.getElementById("cys-save-toggle");
                panel.hidden = true;
                document.getElementById("cys-save-toggle-more").hidden = !panel.hidden;
                document.getElementById("cys-save-toggle-less").hidden = panel.hidden;
                if (!panel.hidden)
                    toggle.setAttribute('class', 'cys-toggle-up');
                document.getElementById("savecomments").checked = cysCommons.cysPrefs.getBoolPref('download.comments');
                document.getElementById("savecommentscount").value = cysCommons.cysPrefs.getCharPref('save.comments.count');
                //document.getElementById("savecommentstype").value = cysCommons.cysPrefs.getBoolPref('download.comments.relevant');
                //document.getElementById("saveavatars").checked = cysCommons.cysPrefs.getBoolPref('download.comments.avatars');
                //var it = document.getElementById("numcomments"), cc = cysSaveDialog.params.ccount;
                //if (cysSaveDialog.params.ccount > -1) it.value = (cc > 700)?cysCommons.getCysString('savecommentcountof',700,cc):cysCommons.getCysString('savecommentcount',cc);
                //       var i = cysCommons.cysPrefs.getIntPref('download.comments.all');
                //       var j = (i*(-1))+1
                //       document.getElementById("savecommentsall").getItemAtIndex(j).setAttribute('selected', true);
                //       document.getElementById("savecommentsall").getItemAtIndex(i).setAttribute('selected', false);
                //       cysSaveDialog.params.commentPages = -1;
                //       if (cysSaveDialog.params.ccount > -1) cysSaveDialog.params.commentPages = Math.ceil(cysSaveDialog.params.ccount / 500);
                //       if (cysSaveDialog.params.commentPages < 0 && cysSaveDialog.params.curpage) cysSaveDialog.params.commentPages = cysSaveDialog.getCommentCount(true);
                //       if (cysSaveDialog.params.commentPages > -1) {
                //          cysSaveDialog.setCommentPages();
                //       }
                //       else if (!cysSaveDialog.params.curpage) {    // need to download video page
                //          cysCommons.getAJAX(cysSaveDialog.params.pageUrl, cysSaveDialog.getCommentPages);
                //       }
            },
            setFolderList: function (mode, openlist) {
                cysSaveDialog.listmode = mode;
                var folders = decodeURIComponent(cysCommons.cysPrefs.getCharPref('folders.list.' + mode));
                var fl = document.getElementById('folderlist'), flv = fl.value;
                var dldir = decodeURIComponent(cysCommons.cysPrefs.getCharPref('download.dir'));
                var defdir = decodeURIComponent(cysCommons.cysPrefs.getCharPref('default.download.dir'));
                fl.removeAllItems();
                if (folders) {
                    var folds = folders.split('**', cysSaveDialog.maxfolders)
                    for (var k in folds) {
                        f = folds[k];
                        if (!f)
                            break;
                        fl.appendItem();
                        fl.getItemAtIndex(fl.itemCount - 1).setAttribute('label', f);
                        fl.getItemAtIndex(fl.itemCount - 1).setAttribute('tooltiptext', f);
                        fl.getItemAtIndex(fl.itemCount - 1).setAttribute('crop', 'center');
                    }
                }
                if (flv)
                    fl.value = flv;
                if (!fl.value && dldir)
                    fl.value = dldir;
                if (!fl.value && defdir)
                    fl.value = defdir;
                if (!fl.value)
                    fl.value = cysCommons.getDefaultDir(cysSaveDialog.defaultSaveDir, false);
                fl.setAttribute('tooltiptext', fl.value);
                fl.setAttribute('crop', 'center');
                if (mode === 'history') {
                    document.getElementById('cys-dirlist-2history').hidden = true;
                    document.getElementById('cys-dirlist-2custom').hidden = false;
                } else if (mode === 'custom') {
                    document.getElementById('cys-dirlist-2history').hidden = false;
                    document.getElementById('cys-dirlist-2custom').hidden = true;
                }
                if (openlist)
                    fl.menuBoxObject.openMenu(true);
            },
            setFileURL: function (url) {
                //cysSniffer.unregListener();
                if (url) {
                    document.getElementById("cys-SaveDialog").getButton('accept').disabled = false;
                    document.getElementById("videourl").value = url;
                    cysSaveDialog.params.videoUrl = url;
                } else {
                    cysSaveDialog.doCancel();
                }
            },
            getCommentCount: function (thisdoc, docText) {   // try to find the number of comments in page
                if (thisdoc) {
                    var doc = window.opener.gBrowser.contentDocument;
                } else if (docText !== null || docText !== '' || typeof docText !== 'undefined') {
                    var doc = cysCommons.HTMLParser(docText);
                } else {
                    return;
                }
                var d = doc.getElementById('comments-view'), cc = -1, cnt = '', cn, h;
                if (!d)
                    return;
                if (d.className === 'comments-disabled') {
                    cc = 0;
                } else {
                    for (h in d.getElementsByTagName('h4')) {
                        if (typeof h.innerHTML === 'undefined')
                            continue;
                        cn = h.innerHTML.match(/\([\d,\.]+\)/);
                        if (cn) {
                            cnt = cn[0];
                            if (cnt.length > 2) {
                                cnt = parseInt(cnt.replace(/\(/, '').replace(/\)/, '').replace(/[\,|\.]/, '').replace(/[\,|\.]/, ''));
                                cc = (cnt > 0 ? Math.ceil(cnt / 500) : 0);
                            }
                            if (cc >= 0)
                                break;
                        }
                    }
                }
                //dump ('\nComment count from page: ' + cnt + ' - number of comment pages :' + cc);
                return cc;
            },
            getCommentPages: function (doc) {
                dump('\n\nParsing comment count......\n\n');
                var cp = cysSaveDialog.getCommentCount(false, doc);
                if (cp !== null && cp > -1) {
                    cysSaveDialog.params.commentPages = cp;
                    cysSaveDialog.setCommentPages();
                }
            },
            setCommentPages: function () {
                var cc = cysSaveDialog.params.commentPages
                var i = cysCommons.cysPrefs.getIntPref('download.comments.numpages'), j;
                var spinb = document.getElementById("commentpages");
                document.getElementById("commentpages").setAttribute('max', cc);
                if (cc == 0) {
                    document.getElementById("commentpages").setAttribute('min', cc);
                    document.getElementById("numpages").value = '/  ' + cc;
                    spinb.decrease();
                } else if (cc > 0) {
                    document.getElementById("numpages").value = '/  ' + cc;
                    if (i > cc) {
                        i = cc;
                    }
                    for (j = 0; j < i - spinb.getAttribute('valueNumber') - 1; j++) {
                        spinb.increase();
                    }
                }
            },
            showDirPicker: function () {
                var dir = null;
                var fl = document.getElementById("folderlist");
                var path = fl.getAttribute('label').trim();
                document.getElementById("folderlist").setAttribute('label', path);
                if (path !== "") {
                    try {
                        dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                        dir.initWithPath(path);
                    } catch (ex) {
                        dir = null;
                        cysCommons.cysDump(ex);
                    }
                }
                const nsIFilePicker = Ci.nsIFilePicker;
                var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                fp.init(window, cysSaveDialog.defaultSaveDir, nsIFilePicker.modeGetFolder);
                fp.displayDirectory = dir;
                var rv = fp.show();
                if (rv === nsIFilePicker.returnOK || rv === nsIFilePicker.returnReplace) {
                    fl.selectedIndex = -1;          // un-select items in list!
                    fl.value = fp.file.path;
                    cysSaveDialog.setTooltip();
                }
            },
            toggleDetails: function () {
                var panel = document.getElementById("cys-save-details");
                var toggle = document.getElementById("cys-save-toggle");
                if (panel.hidden) {
                    panel.hidden = false;
                    toggle.setAttribute('class', 'cys-toggle-up');
                    toggle.blur();
                    window.sizeToContent();
                } else {
                    panel.hidden = true;
                    toggle.setAttribute('class', 'cys-toggle-down');
                    toggle.blur();
                    window.sizeToContent();
                }
                document.getElementById("cys-save-toggle-more").hidden = !panel.hidden;
                document.getElementById("cys-save-toggle-less").hidden = panel.hidden;
            },
            toggleSubtitleElem: function () {
                var subtitle = document.getElementById("savesubtitles");
                var ignoresub = document.getElementById("ignoreautosubtitles");
                var sublang = document.getElementById("cys-subtitle-language");
                if (!subtitle.hasAttribute('checked')) {
                    ignoresub.hidden = false;
                    sublang.hidden = false;
                    window.sizeToContent();
                } else {
                    ignoresub.hidden = true;
                    sublang.hidden = true;
                    window.sizeToContent();
                }
            }
        };
} catch (ex) {
    cysCommons.cysDump(ex);
}
