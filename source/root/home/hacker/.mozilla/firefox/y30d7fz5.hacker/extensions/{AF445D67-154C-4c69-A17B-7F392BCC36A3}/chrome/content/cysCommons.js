/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/

if ('undefined' == typeof Cc)
    var Cc = Components.classes;
if ('undefined' == typeof Ci)
    var Ci = Components.interfaces;
if ('undefined' == typeof Cu)
    var Cu = Components.utils;
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
try {
    Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
} catch (e) {}
try {
    Cu.import("resource://gre/modules/Downloads.jsm");
    Cu.import("resource://gre/modules/osfile.jsm")
    Cu.import("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/Task.jsm");
    Cu.import("resource://gre/modules/Promise.jsm");
    Cu.import("resource://gre/modules/devtools/Console.jsm");
    Cu.import("resource://services-common/async.js");
} catch (e) {}

var downloadedFile = "",
    downloadedExt = "",
    advancedFFmpedcommandCalled = 0,
    openedFolder = 0,
    muxfmt22 = false;
if ("undefined" == typeof cysCommons)
    var cysCommons = {
        cysPrefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.cys."), // @type nsIPrefBranch
        cysBundle: null, // @type nsIStringBundleService
        maxfoldercount: null,
        OS: null,
        canConvert: false,
        convertPath: null,
        convertPath2: null, // cmdproxy for Windows-only!
        conversions: [],
        cysVideoFormatStr: "",
        videoAuthor: "",
        videoPublished: "",
        videoUpdated: "",
        // YT video format codes currently supported:
        validFormats: [38, 138, 315, 272, 313, 266, 264, 308, 271, 37, 299, 137, 303, 248, 46, 22, 298, 136, 302, 247, 45, 102, 84, 85, 35, 135, 59, 78, 246, 245, 244, 44, 101, 18, 243, 43, 100, 82, 34, 134, 83, 6, 133, 242, 5, 36, 160, 278, 17, 13],
        dashVideo: { 138: 0, 266: 0, 264: 0, 299: 0, 137: 0, 298: 0, 136: 0, 135: 0, 134: 1, 133: 1, 160: 2, 272: 3, 315: 3, 313: 3, 308: 3, 303: 3, 302: 3, 271: 3, 248: 3, 247: 3, 246: 3, 245: 3, 244: 3, 243: 4, 242: 4, 278: 4 }, // video:audio in pre-matched format
        dashAudio: [141, 140, 139, 172, 171, 251, 250, 249],
        validOutputs: ['WebM', 'MP4', 'FLV', '3GP'],
        convertFormats: [1, 2, 3, 11, 12, 13, 14, 21, 31, 32, 33, 34, 41, 42, 43, 51, 52, 53, 54, 61, 62, 63, 71, 72, 81, 82, 83], // valid format conversions
        requiredFFmpegAudio: [1, 2, 3, 11, 12, 13, 14, 21, 31, 32, 33, 34, 51, 52, 53, 54],
        dashAudioFormats: {
            41: 141,
            42: 140,
            43: 139,
            61: 141,
            62: 140,
            63: 139,
            71: 172,
            72: 171,
            81: 251,
            82: 250,
            83: 249
        },
        convertOutputs: ['MP3 (VBR)', 'MP3 (CBR)', 'WAV', 'AAC (VBR)', 'AAC (CBR)', 'M4A (VBR)', 'M4A (CBR)', 'OGG', 'OPUS'],
        // conversion format : [optimal YT video format matchings]
        convertFormatMatch: {
            1: [141, 172, 45, 22, 46, 37, 38],
            2: [141, 172, 45, 22, 43, 44],
            3: [141, 172, 43, 44, 34, 18],
            11: [141, 172, 45, 22, 46, 37, 38],
            12: [141, 172, 45, 22, 43, 44],
            13: [141, 172, 43, 44, 34, 18],
            14: [141, 172, 171, 140, 43, 44, 34, 18],
            21: [141, 172, 45, 22, 46, 37, 38, 43, 44, 34, 18],
            31: [22, 37, 38, 85, 84],
            33: [34, 35],
            34: [18],
            41: [141],
            42: [140],
            43: [139],
            51: [22, 37, 38, 85, 84],
            53: [34, 35],
            54: [18],
            61: [141],
            62: [140],
            63: [139],
            71: [172, 45, 46, 102],
            72: [171, 43, 44, 100],
            81: [251],
            82: [250],
            83: [249]
        },
        convertFormatMatch1: {
            1: [141, 172, 45, 46, 22, 37, 38],
            2: [141, 172, 45, 22, 43, 44],
            3: [141, 172, 43, 44, 34, 18],
            11: [141, 172, 45, 46, 22, 37, 38],
            12: [141, 172, 45, 22, 43, 44],
            13: [141, 172, 43, 44, 34, 18],
            14: [141, 172, 171, 140, 43, 44, 34, 18],
            21: [141, 172, 45, 46, 22, 37, 38, 43, 44, 34, 18],
            32: [22, 37, 38, 85, 84],
            33: [34, 35],
            34: [18],
            41: [141],
            42: [140],
            43: [139],
            52: [22, 37, 38, 85, 84],
            53: [34, 35],
            54: [18],
            61: [141],
            62: [140],
            63: [139],
            71: [172, 45, 46, 102],
            72: [171, 43, 44, 100],
            81: [251],
            82: [250],
            83: [249]
        },
        convertFormatMatch2: {
            1: [141, 172, 45, 46],
            2: [141, 172, 45, 43, 44, 22, 37],
            3: [141, 172, 43, 44, 22, 18, 34],
            11: [141, 172, 45, 46],
            12: [141, 172, 45, 43, 44, 22, 37],
            13: [141, 172, 43, 44, 22, 18, 34],
            14: [141, 172, 171, 140, 43, 44, 22, 18, 34],
            21: [141, 172, 45, 46, 43, 44, 22, 18, 34],
            33: [22, 37, 38, 85, 84],
            34: [18, 34],
            41: [141],
            42: [140],
            43: [139],
            53: [22, 37, 38, 85, 84],
            54: [18, 34],
            61: [141],
            62: [140],
            63: [139],
            71: [172, 45, 46, 102],
            72: [171, 43, 44, 100],
            81: [251],
            82: [250],
            83: [249]
        },
        getFormats: function(quick, defaults) {
            var fstr,
                dformats = [],
                i,
                ffmpeginstall = 0;
            try {
                ffmpeginstall = cysCommons.cysPrefs.getIntPref('ffmpeg.install.status') !== 0 ? 1 : 0;
            } catch (ex) {}

            if (quick) {
                dformats = ['Fmt38', 'Fmt138', 'Fmt272', 'Fmt266', 'Fmt264', 'Fmt271', 'Fmt46', 'Fmt37', 'Fmt299', 'Fmt303', 'Fmt137', 'Fmt248', 'Fmt45', 'Fmt22', 'Fmt298', 'Fmt302', 'Fmt136', 'Fmt247', 'sep']; // prepend featured header formats
                dformats = dformats.concat(cysCommons.validOutputs);
                dformats = dformats.concat(['sep'], cysCommons.convertOutputs);
                fstr = cysCommons.cysPrefs.getCharPref('menu.quickmenu.order.' + ffmpeginstall);
            } else {
                for (i = 0; i < cysCommons.validFormats.length; i++)
                    dformats.push('Fmt' + cysCommons.validFormats[i]); // default list - complete!
                dformats.push('sep');
                for (i = 0; i < cysCommons.convertFormats.length; i++) {
                    var fmt = cysCommons.convertFormats[i];
                    if (fmt == 11 || fmt == 21 || fmt == 31 || fmt == 41 || fmt == 51 || fmt == 61 || fmt == 71 || fmt == 81) {
                        dformats.push('sep');
                    }
                    dformats.push('Cnv' + cysCommons.convertFormats[i]);
                }
                fstr = cysCommons.cysPrefs.getCharPref('menu.dropdown.order.' + ffmpeginstall);
            }
            if (fstr && !defaults) {
                dformats = cysCommons.mergeArrays(dformats, fstr.split(','));
            }
            // merge options not in custom but in default into returned array
            return dformats;
        },
        getSubMenu: function() {
            var def = '1,2,3,4,5';
            def += ',sep,6,7,8,9';
            var menus = def.split(','),
                ffmpeginstall = 0;
            try {
                ffmpeginstall = cysCommons.cysPrefs.getIntPref('ffmpeg.install.status') !== 0 ? 1 : 0;
            } catch (ex) {}

            var mstr = cysCommons.cysPrefs.getCharPref('menu.dropdown.submenu.order.' + ffmpeginstall);

            if (mstr)
                menus = cysCommons.mergeArrays(menus, mstr.split(','));

            return menus;
        },
        mergeArrays: function(def, custom) { // merge additional options from defaults array into custom array
            var pf = custom.slice(0),
                df,
                i;
            for (i = 0; i < pf.length; i++) {
                if (pf[i].substr(0, 1) == '-')
                    pf[i] = pf[i].substr(1);
            } // consider formats disabled by user...
            for (var d in def.slice(0)) {
                df = def[d];
                if (pf.indexOf(df) == -1 && df != 'sep' && df !== '0' && df !== '') {
                    custom.push(df);
                }
            }

            return custom;
        },
        executeInSandbox: function(scrp, gBrowser1) {
            if (gBrowser1 != null) {
                gBrowser = gBrowser1;
            }
            try {
                var sandbox = Components.utils.Sandbox(gBrowser.contentWindow, {
                    sandboxPrototype: gBrowser.contentWindow,
                    wantXrays: false
                });
                return Components.utils.evalInSandbox(scrp, sandbox);
            } catch (ex) {
                cysCommons.cysDump("error in sandbox:" + scrp + ":" + ex, ex.stack)
            }
            return false;
        },
        getImages: function(path, commentshtml) {
            try {
                var commentimages = commentshtml.split('src="');
                var imglen = commentimages.length;
                for (var i = 0; i < imglen; i++) {
                    var imn = 'c' + i + '.jpg';
                    var imgfile = cysCommons.getFile([path, "MData", imn]);
                    //cysCommons.writeStringToFile(imgfile,null,'[InternetShortcut]\nURL='+commentimages[i]+'\n','Windows-1252');
                    var imglink = commentimages[i];
                    imglink = imglink.substr(0, imglink.indexOf('"'));
                    if (imglink.indexOf('http') > -1) {
                        cysCommons.download(unescape(imglink), imgfile, true);
                        commentshtml = commentshtml.replace(imglink, "MData/" + imn);
                    }
                }
                return commentshtml;
            } catch (ex) {
                cysCommons.cysDump("Error in GetImages", ex.stack);
            }
        },
        getComments: function(cc, gBrowser1) {
            cysCommons.cysDump("GetComments Call");
            //var cc= cysCommons.cysPrefs.getCharPref("save.comments.count");
            var commentshtml = "";
            try {
                var scrp = "var commentele = document.getElementById('watch-discussion'); if(commentele) { var m = document.getElementsByClassName('comment-thread-renderer'); if(m) { mlen = m.length; if(mlen>" + cc + ") mlen=" + cc + "; if(mlen>0) { var html = \"\";for(var i=0;i<mlen;i++) { html = html+'<section class=\"comment-thread-renderer\">'+m[i].innerHTML+'</section>'; } } else ''; } else ''; }  else { ''; }";
                var allreview = 'var d = document.getElementsByClassName("comment-section-header-renderer"); if(d){ if(d[0]) { d[0].innerHTML;} else{ ""; } } else "";';
                //cysCommons.cysDump(cysCommons.executeInSandbox(scrp,gBrowser1));
                commentshtml = '<div id="watch-discussion" class="branded-page-box yt-card scrolldetect"><div id="comment-section-renderer" class="comment-section-renderer comment-section-renderer-il"><h2 class="comment-section-header-renderer">' + (cysCommons.executeInSandbox(allreview, gBrowser1)) + '</h2><div class="comment-section-renderer-items" class="comment-section-renderer-items">' + (cysCommons.executeInSandbox(scrp, gBrowser1)) + '</div></div></div><div id="cys-comments-sukhvir" style="display:none"></div>';
                cysCommons.cysDump(commentshtml);
            } catch (ex) {
                cysCommons.cysDump("error in getComments:" + ex, ex.stack);
            }
            return commentshtml;
        },
        replaceContent: function(start, end, what, str) {
            return str.substring(0, start) + what + str.substring(end);
        },
        getCysString: function(key, value1, value2, value3) { //dump('\n*getCysString:\n'+key+' - '+value1+' - '+value2+' - '+value3);
            try {
                if (cysCommons.cysBundle == null) {
                    cysCommons.cysBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
                    cysCommons.cysBundle = cysCommons.cysBundle.createBundle("chrome://completeyoutubesaver/locale/strings.properties");
                }
                if (value1 != null) {
                    var params = new Array();
                    params.push(value1);
                    if (value2 != null)
                        params.push(value2);
                    if (value3 != null)
                        params.push(value3);
                    return cysCommons.cysBundle.formatStringFromName(key, params, params.length);
                } else {
                    return cysCommons.cysBundle.GetStringFromName(key);
                }
            } catch (e) {}
            return "";
        },
        getmaxfolders: function() {
            if (cysCommons.maxfoldercount)
                return cysCommons.maxfoldercount;
            var c = cysCommons.cysPrefs.getIntPref("folders.list.max");
            if (c < 5)
                c = 5
            if (c > 50)
                c = 50
            cysCommons.maxfoldercount = c
            return c
        },
        cTime: function() {
            var t = new Date();
            return t.getTime();
        },
        cysConfirm: function(msg) {
            var ps = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
            var rv = ps.confirmEx(window, cysCommons.getCysString("name", null), cysCommons.getCysString(msg, null), ps.STD_YES_NO_BUTTONS, null, null, null, null, {});
            return rv == 0;
        },
        cysAlert: function(msg, arg1) {
            var ps = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
            var rv = ps.alert(window, cysCommons.getCysString("name", null), cysCommons.getCysString(msg, arg1));
        },
        cysDump: function(x, stack) { // combined console error reporting + logging
            var msg,
                debug = cysCommons.cysPrefs.getBoolPref('debug');
            if (debug) {
                console.log(x);
                if (x.stack) {
                    console.log(x.stack);
                } else if (stack) {
                    console.log(stack);
                }
            }
            if (typeof x == 'string') {
                if (debug) {
                    msg = '\n[CYS] - ' + x + '\n';
                    dump(msg);
                    Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService).logStringMessage(msg);
                }
            } else {
                msg = '\n[CYS]\nException/error thrown of type:  ' + x.name + '\nmessage: ' + x.message + '\nfileName: ' + x.fileName + '\nlineNumber: ' + x.lineNumber + '\ncolumnNumber: ' + x.columnNumber + '\nstack trace:\n' + x.stack;
                dump('\n##########' + msg + '##########\n');
                var err = Cc['@mozilla.org/scripterror;1'].createInstance(Ci.nsIScriptError);
                err.init(x.message, x.fileName, x.lineNumber, x.lineNumber, x.columnNumber, 0, null);
                Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService).logMessage(err);
            }

        },
        cysFormatStr: function(str, value) {
            return str.replace(/\%S/g, value);
        },
        getConverterPath: function() {
            cysCommons.canConvert = false;
            cysCommons.convertPath2 = null;
            var ff = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile),
                ffname;
            var extdir = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile),
                extdir2 = extdir.clone();
            extdir.append('extensions');
            extdir.append('{AF445D67-154C-4c69-A17B-7F392BCC36A3}');
            var ffdir = decodeURIComponent(cysCommons.cysPrefs.getCharPref('ffmpeg.dir'));
            if (!ffdir)
                return;
            ff.initWithPath(ffdir);
            cysCommons.OS = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;
            if (cysCommons.OS == 'WINNT') { //window.navigator.platform - "Win32"
                ffname = 'ffmpeg.exe';
                if (cysCommons.cysPrefs.getBoolPref('ffmpeg.hideconsole')) {
                    if (true) {
                        cysCommons.convertPath2 = extdir.clone();
                        cysCommons.convertPath2.append('chrome');
                        cysCommons.convertPath2.append('bin');
                    } else {
                        cysCommons.convertPath2 = ff.clone();
                    }
                    cysCommons.convertPath2.append('cmdproxy.exe');
                }
            } else { //if (cysCommons.OS=='Linux' || cysCommons.OS=='Darwin') {   // enabled for all
                ffname = 'ffmpeg';
            }
            ff.append(ffname);
            if (ff.exists() && ff.isExecutable() && ff.isFile()) {
                cysCommons.convertPath = ff;
                cysCommons.canConvert = true;
                return ff;
            } else { // support for FFmpeg in profile dir for portable FF
                ff = extdir2;
                ff.append(ffname);
                if (ff.exists() && ff.isExecutable() && ff.isFile()) {
                    cysCommons.convertPath = ff;
                    cysCommons.canConvert = true;
                    return ff;
                } else {
                    cysCommons.cysPrefs.setCharPref('ffmpeg.dir', '');
                }
            }
        },
        getDefaultDir: function(defdir, isDefault) {
            var dir = decodeURIComponent(cysCommons.cysPrefs.getCharPref((isDefault) ? "default.download.dir" : "download.dir"));
            if (!dir) {
                try {
                    var ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties),
                        t = '';
                    if (ds.has('DfltDwnld'))
                        t = ds.get('DfltDwnld', Ci.nsIFile);
                    if (!t && ds.has('Home'))
                        t = ds.get('Home', Ci.nsIFile);
                    if (!t && ds.has('Desk'))
                        t = ds.get('Desk', Ci.nsIFile);
                    if (!t)
                        try {
                            t = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("browser.download.").getCharPref('lastDir');
                        } catch (e) {}
                    if (!t && ds.has('TmpD'))
                        t = ds.get('TmpD', Ci.nsIFile);
                    if (t) {
                        dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                        dir.initWithPath((typeof t == 'string') ? t : t.path);
                        if (!dir.exists() || !dir.isDirectory())
                            dir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                        dir.append(defdir);
                        if (!dir.exists() || !dir.isDirectory())
                            dir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                    }
                } catch (ex) {
                    cysCommons.cysDump(ex, ex.stack);
                }
                if (dir)
                    return dir.path;
                return null;
            } else {
                return dir;
            }
        },
        getVersion: function() {
            var version = null;
            try {
                var eManager = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);
                var ext = eManager.getItemForID("{AF445D67-154C-4c69-A17B-7F392BCC36A3}");
                ext.QueryInterface(Ci.nsIUpdateItem);
                version = ext.version;
            } catch (ex) {
                //Firefox 4
                Cu.import("resource://gre/modules/AddonManager.jsm");
                var cb = Async.makeSyncCallback(),
                    addon;
                AddonManager.getAddonByID("{AF445D67-154C-4c69-A17B-7F392BCC36A3}", cb);
                addon = Async.waitForSyncCallback(cb);
                version = addon.version;
                dump("\n" + "version = " + version + "\n");
            }

            return version;
            //return "5.6.62";
        },
        getPrivacy: function() {
            try {
                var privacy = {};
                privacy.context = null, privacy.isprivate = false;
                //win = cysCommons.getDoc().defaultView;
                if (window && typeof PrivateBrowsingUtils != "undefined" && PrivateBrowsingUtils.privacyContextFromWindow) {
                    privacy.context = PrivateBrowsingUtils.privacyContextFromWindow(window);
                    privacy.isprivate = privacy.context.usePrivateBrowsing;
                }
                return privacy;
            } catch (e) {
                //console.log("console.log"+e);
            }
        },
        openTargetFolder: function(openFolderPath) {
            try {
                if (cysCommons.cysPrefs.getBoolPref("open.target.folder") && openFolderPath) {
                    var explorer = openFolderPath;
                    if (explorer.isDirectory() && explorer.leafName != "MData") { //&& !explorer.isExecutable() removed because it's not working for linux/unix
                        try {
                            explorer.launch();
                        } catch (e) { // Unix/Linux work-around
                            var dir = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newFileURI(explorer);
                            var ps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
                            ps.loadUrl(dir);
                        }
                    }
                }
            } catch (ex) {
                cysCommons.cysDump("openTargetFolder:" + ex, ex.stack);
            }
            /*fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker); if (openFolderPath) fp.displayDirectory = openFolderPath;
             fp.init(window, cysCommons.getCysString("downloadingfolder"), Ci.nsIFilePicker.modeOpen);
             rv = fp.show();  */
        },
        saveImagesToLocal: function(page, instr, folder, path, count) { // instr can be string or Regex object!
            var endLinkPos = -1;
            var lastEndLinkPos = 0;
            var startLinkPos = -1;
            var link = null;
            var originalChartLink = "";
            var step = 0,
                rand,
                str,
                t;
            var lastlinkFileName;
            var chart_api_idx = 1;
            var begin,
                start,
                beginTargetChar,
                endTargetChar,
                result;
            do {
                step++;
                if (typeof instr == 'string') {
                    str = instr;
                    start = page.indexOf(str, lastEndLinkPos);
                    if (start == -1)
                        break;
                } else { // instr is RegExp object!!
                    var result = instr.exec(page);
                    if (result == null)
                        break;
                    start = result.index;
                    str = result[0];
                }
                if (lastEndLinkPos == 0)
                    lastEndLinkPos = start;
                begin = page.lastIndexOf("http", start) - 1;
                if (begin < 0) {
                    lastEndLinkPos = start + 1;
                    continue;
                }
                beginTargetChar = page[begin];
                endTargetChar = beginTargetChar;
                if (beginTargetChar == "(")
                    endTargetChar = ")";
                else if (beginTargetChar == "{")
                    endTargetChar = "}";
                endLinkPos = page.indexOf(endTargetChar, start);
                if (lastEndLinkPos == endLinkPos) {
                    lastEndLinkPos++;
                    continue;
                }
                lastEndLinkPos = endLinkPos;
                if (endLinkPos == -1)
                    break;
                link = page.substring(begin + 1, endLinkPos);
                if (link == null || link.indexOf("http") == -1 || link.length > 200)
                    continue;
                var filenamestart,
                    linkFileName;
                filenamestart = link.lastIndexOf("/");
                if (filenamestart == -1)
                    filenamestart = link.lastIndexOf("%2F") + 2;
                linkFileName = link.substring(filenamestart + 1);
                if (linkFileName.lastIndexOf(str) != (linkFileName.length - str.length))
                    continue;
                if (folder.substring(0, 2) == 'MD') {
                    t = linkFileName.substring(linkFileName.length - 3);
                    if (t == 'jpg')
                        linkFileName = rand = Math.floor(Math.random() * 999999).toString() + linkFileName;
                }
                var repStr = (linkFileName.indexOf("chart_api_img") == -1 || originalChartLink == "") ? link : originalChartLink;
                var regexStr = new RegExp(cysCommons.escRegex(repStr), 'g'); // new regex solution
                if (linkFileName == lastlinkFileName) {
                    page = page.replace(regexStr, folder + "/" + step + linkFileName);
                } else {
                    page = page.replace(regexStr, folder + "/" + linkFileName);
                }
                originalChartLink = "";
                var linkFile = cysCommons.getFile([path, folder]);
                if (!linkFile.exists() || !linkFile.isDirectory())
                    linkFile.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("777", 8));
                if (linkFileName == lastlinkFileName) {
                    linkFile.append(step + linkFileName);
                } else {
                    lastlinkFileName = linkFileName;
                    linkFile.append(linkFileName);
                }
                if (!linkFile.exists()) {
                    cysCommons.download(unescape(link), linkFile);
                }
            } while (step < count || endLinkPos > 0);
            return page;
        },
        download: function(url1, file1, isHiddenDownload, useDTA, ref, convertTo, noCookie, url2, file2, ext, stopConvert, muxAudio) {
            file1.path = cysCommons.extToLower(file1.path);
            if (file2) {
                file2.path = cysCommons.extToLower(file2.path);
            }
            cysCommons.cysDump('\n\n* Start Downloading!!\nurl1: ' + url1 + '\nfile1: ' + file1.path + '\nurl2: ' + url2 + '\nfile2: ' + ((typeof file2 == 'object') ? file2.path : file2) + '\n');
            if (cysCommons.OS == 'WINNT' && file1.path.length > 259) { // Long path Windows alert!
                var PS = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
                PS.alert(null, cysCommons.getCysString('name'), cysCommons.getCysString('pathtoolong'));
                return false;
            }

            if (useDTA) {
                if (cysCommons.doDTA(url1, file1, ref) === true)
                    return null;
            } //  try DTA if set, else download in browser
            // dump('\nReferrer for download:\n'+ref+'\n');
            const wp = Ci.nsIWebBrowserPersist;
            ref = null;
            var io_service = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService),
                privacy = cysCommons.getPrivacy(),
                ha = cysCommons.cysPrefs.getBoolPref('download.dash.hideaudio');
            if (openedFolder == 0) {
                cysCommons.openTargetFolder(file1.parent);
                openedFolder = 1;
            }
            //cysCommons.cysDump("url2:"+url2+":::file2:"+file2+":::url1:"+url1+":::file1")
            if (url2 && file2) {
                convertTo = [file1.path, file2.path];
                setTimeout(function() {
                    return dl(url1, file1, isHiddenDownload, ref, convertTo, noCookie, io_service, privacy, wp, ext, stopConvert);
                }, 1000);
                if (cysCommons.getVideoFormatByUrl(url1) === 'MP4' && muxAudio) {
                    convertTo = [file2.path];
                    cysCommons.doConversion.jobs = {};
                    cysCommons.doConversion.jobs[convertTo.join()] = [
                        [convertTo[0], 0]
                    ];
                    var ext2 = (cysCommons.cysPrefs.getBoolPref('download.aac.as.m4a')) ? 'm4a' : 'aac';
                    return dl(url2, file2, false, ref, convertTo, noCookie, io_service, privacy, wp, ext2, false);
                }
                return dl(url2, file2, ha, ref, convertTo, noCookie, io_service, privacy, wp, ext, stopConvert);
            }
            //if (url2 && file2) {convertTo = [file1.path,file2.path]; setTimeout(function(){ return dl(url2,file2,ha,ref,convertTo,noCookie,io_service,privacy,wp,ext);}, 1000);}
            return dl(url1, file1, isHiddenDownload, ref, convertTo, noCookie, io_service, privacy, wp, ext, stopConvert);

            function dl(url, file, isHiddenDownload, ref, convertTo, noCookie, io_service, privacy, wp, ext, stopConvert) { // download in browser
                /* check if newer version of Download method is allowed and it is not a "Save Complete Youtube Page", also it is not SeaMonkey Browser because newer download functions are still not properly supported call*/
                var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
                if (typeof ext != 'undefined' && ext != null && Downloads.getList && xulAppInfo.name != 'SeaMonkey' && xulAppInfo.name != 'Pale Moon') { //
                    return Task.spawn(function() {
                        let list = yield Downloads.getList(Downloads.ALL);
                        var outputfilepath = file.path;
                        //cysCommons.cysDump("convertTo:"+convertTo);
                        if ((convertTo == false || typeof convertTo == 'undefined') && ext != "" && ext != null && outputfilepath.indexOf("." + ext.toLowerCase()) == -1) {
                            outputfilepath = outputfilepath + "." + ext;
                        }
                        let download = yield Downloads.createDownload({
                            source: {
                                url: url,
                                isPrivate: privacy.isprivate
                            },
                            target: OS.Path.join(OS.Constants.Path.tmpDir, outputfilepath)
                        });
                        let view = {
                            onDownloadAdded: function(d) {},
                            onDownloadChanged: function(d) {},
                            onDownloadRemoved: function(d) {}
                        };
                        yield list.addView(view);
                        try {
                            let res = download.whenSucceeded().then(function() {
                                if (stopConvert) {
                                    cysCommons.doConversion(file, convertTo, ext, true);
                                } else if (convertTo) {
                                    cysCommons.doConversion(file, convertTo, ext);
                                } else {
                                    cysCommons.applyAdvancedFFmpedCommand(file, ext);
                                }
                            });
                            if (!isHiddenDownload) {
                                list.add(download);
                            }
                            try {
                                yield download.start();
                                yield res;
                            } finally {
                                yield download.finalize(true);
                            }
                        } catch (ex) {
                            //console.log("dl::error::8");
                            //console.log(ex.stack);
                            //cysCommons.cysDump("error Task.spawn", ex.stack);
                        } finally {}
                    }).then(null, Components.utils.reportError);
                } else {
                    try {
                        var wbPersist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(wp),
                            pl;
                        wbPersist.persistFlags = wp.PERSIST_FLAGS_REPLACE_EXISTING_FILES | wp.PERSIST_FLAGS_BYPASS_CACHE |
                            wp.PERSIST_FLAGS_FIXUP_LINKS_TO_DESTINATION | wp.PERSIST_FLAGS_FIXUP_ORIGINAL_DOM |
                            wp.PERSIST_FLAGS_NO_BASE_TAG_MODIFICATIONS | wp.PERSIST_FLAGS_DONT_CHANGE_FILENAMES;
                        var source_uri = io_service.newURI(url, null, null);
                        if (!isHiddenDownload) {
                            var transfer = Cc["@mozilla.org/transfer;1"].createInstance(Ci.nsITransfer);
                            transfer.init(source_uri, io_service.newFileURI(file), "", null, null, null, wbPersist, privacy.isprivate);
                            pl = {
                                onLocationChange: function(a, b, c, d) {
                                    transfer.onLocationChange(a, b, c, d)
                                },
                                onSecurityChange: function(a, b, c) {
                                    transfer.onSecurityChange(a, b, c)
                                },
                                onStatusChange: function(a, b, c, d) {
                                    transfer.onStatusChange(a, b, c, d)
                                },
                                onProgressChange: function(a, b, c, d, e, f) {
                                    transfer.onProgressChange(a, b, c, d, e, f)
                                },
                                onStateChange: function(wp, req, fl, st) {
                                    transfer.onStateChange(wp, req, fl, st);
                                    const nw = Ci.nsIWebProgressListener,
                                        nr = Ci.nsIRequest;
                                    if (req && (fl & nw.STATE_START || fl & nw.STATE_STOP)) {
                                        const chn = req.QueryInterface(Ci.nsIHttpChannel);
                                        if ((fl & nw.STATE_START) && noCookie) { //try{var ck; ck = chn.getRequestHeader('Cookie');} catch(e){}; dump ('\nCookie was: '+ck+'\n');
                                            chn.setRequestHeader('Cookie', '', false);
                                            req.loadFlags |= nr.LOAD_ANONYMOUS;
                                        }
                                        if (((fl & nw.STATE_STOP) && st == 0 && chn.responseStatus < 400) && !convertTo) {
                                            cysCommons.applyAdvancedFFmpedCommand(file, ext);
                                        }
                                        if ((fl & nw.STATE_STOP) && convertTo && st == 0 && chn.responseStatus < 400)
                                            cysCommons.doConversion(file, convertTo, ext, stopConvert);
                                    }
                                }
                            }
                        } else {
                            pl = {
                                onLocationChange: function(a, b, c, d) {},
                                onSecurityChange: function(a, b, c) {},
                                onStatusChange: function(a, b, c, d) {},
                                onProgressChange: function(a, b, c, d, e, f) {},
                                onStateChange: function(wp, req, fl, st) {
                                    const nw = Ci.nsIWebProgressListener,
                                        nr = Ci.nsIRequest;
                                    if (req && (fl & nw.STATE_START || fl & nw.STATE_STOP)) {
                                        const chn = req.QueryInterface(Ci.nsIHttpChannel);
                                        if ((fl & nw.STATE_START) && noCookie) {
                                            //try{var ck; ck = chn.getRequestHeader('Cookie');} catch(e){}; dump ('\nCookie was: '+ck+'\n');
                                            chn.setRequestHeader('Cookie', '', false);
                                            req.loadFlags |= nr.LOAD_ANONYMOUS;
                                        }
                                        if (((fl & nw.STATE_STOP) && st == 0 && chn.responseStatus < 400) && !convertTo) {
                                            cysCommons.applyAdvancedFFmpedCommand(file, ext);
                                        }
                                        if ((fl & nw.STATE_STOP) && convertTo && st == 0 && chn.responseStatus < 400)
                                            cysCommons.doConversion(file, convertTo, ext, stopConvert);
                                    }
                                }
                            };
                        } //dump('\nsaving file: '+file.path+'\nconvertTo: '+convertTo);
                        wbPersist.progressListener = pl;
                        try {
                            wbPersist.saveURI(source_uri, null, ref, null, null, file, privacy.context);
                        } catch (ex) {
                            //above code is not working in mac os>firefox version 36
                            wbPersist.saveURI(source_uri, null, null, ref, null, null, file, privacy.context);
                        }

                        return wbPersist;
                    } catch (ex) {
                        console.log("error in download function dl");
                        console.log(ex);
                        console.log(ex.stack);
                        cysCommons.cysDump("" + ex, ex.stack);
                    }
                }
            }
            return null;
        },
        applyAdvancedFFmpedCommand: function(file, ext) {
            if (file == null)
                return;
            if (ext == "" || ext == null)
                return;
            var commandtemp = cysCommons.cysPrefs.getCharPref('ffmpeg.advanced.input');
            if (commandtemp == "")
                return;
            if (!cysCommons.convertPath)
                cysCommons.getConverterPath();
            if (!cysCommons.convertPath)
                return;
            var filepath = file.path;
            var filename = file.leafName;
            if (filepath.indexOf(".tmp")) {
                filepath = filepath.replace(".tmp", "");
                filename = filename.replace(".tmp", "");
            }
            if (ext != null && ext != "" && filepath.indexOf("." + ext) == -1) {
                filepath = filepath + "." + ext;
                filename = filename + "." + ext;
            }
            var outputfile = filename.replace("." + ext, "_out." + ext);
            var outputpath = filepath.replace(filename, outputfile);
            var commandarr = commandtemp.split(" ");
            var commandlen = commandarr.length;
            if (commandlen == 0)
                return;
            for (var i = 0; i < commandlen; i++) {
                if (commandarr[i] == "*input") {
                    commandarr[i] = filepath;
                } else if (commandarr[i] == "*output") {
                    commandarr[i] = outputpath;
                }
            }

            var ffmpeg = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
            if (!cysCommons.convertPath2) {
                ffmpeg.init(cysCommons.convertPath);
            } else { // on Windows
                ffmpeg.init(cysCommons.convertPath2);
                commandarr = [cysCommons.convertPath.path].concat(commandarr);
            }

            cysCommons.cysDump('\nadvanced-args: ' + commandarr + '\n\n');
            setTimeout(function() {
                ffmpeg.runwAsync(commandarr, commandarr.length, cysCommons);
                cysOverlay.updateButtonTooltip();
            }, 500);
        },
        doConversion: function(file, fmt, ext, stopConvert) {
            // dump ('\n\n* doConversion\nformat: '+fmt+'\nfile: '+file.path);
            if (stopConvert) {
                return false;
            }
            console.log('doConversion');
            if (file == null || fmt == null)
                return;
            if (!cysCommons.convertPath)
                cysCommons.getConverterPath();
            if (!cysCommons.convertPath)
                return;
            var opt,
                files,
                fs,
                jobs;
            if (fmt instanceof Array) {
                if (typeof cysCommons.doConversion.jobs == 'undefined')
                    cysCommons.doConversion.jobs = {};
                jobs = cysCommons.doConversion.jobs;
                fs = fmt.join();
                if (fs in jobs) {
                    files = jobs[fs];
                    if (files[0][1] && files[1][1]) {
                        /*dump('\n\ndoConversion stopped! This job set looks already complete...');*/
                        return;
                    }

                    if (file.path == fmt[0]) {
                        files[0][1] = file;
                    } else if (file.path == fmt[1]) {
                        files[1][1] = file;
                    }

                    if (files.length === 1 && files[0][1]) {
                        fmt = 999;
                    } else if (files[0][1] && files[1][1]) {
                        fmt = 999;
                    } else {
                        /*dump('\n\ndoConversion stopped! Job set still incomplete?...');*/
                        return;
                    }
                } else {
                    jobs[fs] = [
                        [fmt[0], 0],
                        [fmt[1], 0]
                    ];
                    files = jobs[fs];
                    if (file.path == fmt[0]) {
                        files[0][1] = file;
                    } else if (file.path == fmt[1]) {
                        files[1][1] = file;
                    }
                    return;
                }
            }

            switch (parseInt(fmt)) {
                case 1:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-aq', '1'];
                    break;
                case 2:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-aq', '3'];
                    break;
                case 3:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-aq', '5'];
                    break;
                case 11:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-ab', '256k'];
                    break;
                case 12:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-ab', '192k'];
                    break;
                case 13:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-ab', '128k'];
                    break;
                case 14:
                    opt = ['-vn', '-acodec', 'libmp3lame', '-ac', '2', '-ar', '32000', '-ab', '64k', '-f', 'mp3'];
                    break;
                case 21:
                    opt = ['-vn'];
                    break;
                    /*case 247:
                     case 242:
                     case 278:
                     opt=[]; break;*/
                case 999:
                    //check preference mux.dash.video.highest.audio is true and Fmt22 audio is given in audio url
                    var muxfmt22 = false;
                    var videoCheck = (ext.toLowerCase() == "mp4");
                    if (files) {
                        var ff;
                        if (files.length === 1) {
                            ff = files[0][1];
                            videoCheck = true;
                        } else {
                            ff = files[1][1];
                        }
                        var audiourl = ff.path;
                        if (audiourl && (audiourl.toLowerCase().indexOf("_fmt22audio.mp4") !== -1)) {
                            muxfmt22 = true;
                        }
                    }
                    opt = ['-vcodec', 'copy', '-acodec', 'copy'];
                    if (cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio") == true && cysCommons.cysPrefs.getCharPref("ffmpeg.dir") != "" && muxfmt22 == true && videoCheck) { //&& muxfmt22==true
                        if (files.length === 1) {
                            opt = ['-vn', '-ac', '1', '-ab', '192k'];
                        } else {
                            opt = ['-c', 'copy', '-map', '0:v:0', '-map', '1:a:0', '-shortest']; //-map 0:v:0 -map 1:a:0 -shortest
                        }
                    }
                    break;
                default:
                    opt = ['-vn', '-acodec', 'copy'];
            }

            try { //dump ('\nStarting conversion. Format: '+fmt+'\noptions: '+opt);
                if (files)
                    file = files[0][1];
                downloadedExt = ext;
                downloadedFile = file;
                advancedFFmpedcommandCalled = 0;
                file.moveTo(null, file.leafName + '.tmp');
                var filet = cysCommons.getFile(file.path.substr(0, file.path.length - 4));

                setTimeout(function() {
                    if (filet.exists()) {
                        filet.remove(false);
                        dump('\n\n' + filet.path + ' still exists, deleting it now...\n\n');
                    }
                }, 200); // FF29 bug work-around!!
                cysCommons.conversions.push(file);
                var args = ['-i', file.path];
                if (files && files.length > 1) {
                    args.push('-i', files[1][1].path);
                    cysCommons.conversions.push(files[1][1]);
                    delete jobs[fs];
                }
                //resolve overwrite prompt
                opt.push('-y');
                args = args.concat(opt);
                var outputfilepath = file.path.substr(0, file.path.length - 4);
                if (ext != "" && ext != null && outputfilepath.indexOf("." + ext.toLowerCase()) == -1) {
                    outputfilepath = outputfilepath + "." + ext.toLowerCase();
                }

                if (files && files.length === 1) {
                    outputfilepath = outputfilepath.replace('_fmt22audio.mp4', '');
                }

                args.push(outputfilepath);

                //args.push('-loglevel');
                //args.push('debug');
                //args.push("-report");
                //args.push("file='" + cysCommons.getDefaultDir('', true) + "\\testwesdfasd.txt':level=48");

                var ffmpeg = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
                if (!cysCommons.convertPath2) {
                    ffmpeg.init(cysCommons.convertPath);
                } else { // on Windows
                    ffmpeg.init(cysCommons.convertPath2);
                    args = [cysCommons.convertPath.path].concat(args);
                }
                cysCommons.cysDump('\nargs111: ' + args + '\n\n');
                cysCommons.cysDump(args);

                try {
                    setTimeout(function() {
                        ffmpeg.runwAsync(args, args.length, cysCommons);
                        cysOverlay.updateButtonTooltip();
                    }, 500);
                } catch (ex2) {
                    console.log('ex2', ex2, ex2.stack);
                }
            } catch (ex) {
                cysCommons.cysDump(ex, ex.stack);
            }
        },
        observe: function(subject, topic, data) {
            if (topic == 'process-finished') {
                for (var fi in cysCommons.conversions) {
                    try {
                        var file = cysCommons.conversions[fi];
                        file.remove(false);
                        if (!file.exists())
                            delete cysCommons.conversions[fi];
                    } catch (e) {}
                }
                if (downloadedFile != '' && downloadedExt != '') {
                    if (advancedFFmpedcommandCalled == 0) {
                        advancedFFmpedcommandCalled = 1;
                        cysCommons.applyAdvancedFFmpedCommand(downloadedFile, downloadedExt);
                    }
                }
                cysOverlay.updateButtonTooltip();
            }
        },
        doDTA: function(furl, file, ref) { // download with DownThemAll!
            if (!cysCommons.DTAstatus())
                return false;
            if (typeof(DTA) == 'undefined') {
                var DTA = {};
                Cu.import("resource://dta/api.jsm", DTA);
            }
            var dtapref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.dta.");
            var dir = file.parent.path,
                ps = '//',
                dtadirs,
                dtanew,
                dtamask;
            try {
                dtamask = dtapref.getCharPref('renaming');
            } catch (e) {}
            dtapref.setCharPref('renaming', '["*name*.*ext*"]'); // reset renaming mask to default
            if (dir != null && dir != '') {
                if (dir.indexOf('\\') > -1) {
                    ps = '\\\\';
                    dir = dir.replace(/\\/g, '\\\\');
                }
                dir = dir + ps;
                try {
                    dtadirs = dtapref.getCharPref('directory');
                } catch (e) {
                    dtadirs = '';
                }
                dtanew = '[' + '\"' + dir + '\"]'; // set default save folder
                dtapref.setCharPref('directory', dtanew);
            }
            var ftext = file.leafName.substring(0, file.leafName.lastIndexOf('.'));
            var IO = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
            //dump('\n\nURL:\n' + furl + '\n\nRef:\n' + ref);
            furl = new DTA.URL(IO.newURI(furl, 'UTF-8', null));
            if (ref != null)
                ref = new DTA.URL(IO.newURI(ref, 'UTF-8', null));
            var dl = {
                fileName: file.leafName,
                title: ftext,
                url: furl,
                referrer: ref,
                description: ftext
            };
            try {
                DTA.saveSingleItem(window, true, dl);
            } catch (e) {
                return false;
            }
            if (dtadirs != null && dtadirs != '')
                dtapref.setCharPref('directory', dtadirs);
            if (dtamask != null)
                dtapref.setCharPref('renaming', dtamask);
            return true;
        },
        DTAstatus: function() { // check if DTA is available
            if (!cysCommons.cysPrefs.getBoolPref('dta.enabled'))
                return false;
            try {
                Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newChannel2("resource://dta/support/filtermanager.jsm", null, null);
                return true;
            } catch (e) {}
            return "dtaIFilterManager" in Ci || "@downthemall.net/privacycontrol;1" in Cc;
        },
        HTMLParser: function(a) {
            var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
            var body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
            html.documentElement.appendChild(body);
            try { // FF14+
                body.appendChild(Cc["@mozilla.org/parserutils;1"].getService(Ci.nsIParserUtils).parseFragment(a, 0, false, null, body));
            } catch (e) {
                body.appendChild(Cc["@mozilla.org/feed-unescapehtml;1"].getService(Ci.nsIScriptableUnescapeHTML).parseFragment(a, false, null, body));
            }
            return body.ownerDocument;
        },
        getAJAX: function(url, callBack, rtype, info, info2, info3) { //cysCommons.cysDump('\ngetAJAX - '+url);                        
            var req = new XMLHttpRequest(),
                rtype = rtype || 'GET',
                data;
            req.open(rtype, url, true);
            req.onreadystatechange = function() {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        if (rtype == 'HEAD') {
                            if (info) {
                                callBack(req.getResponseHeader(info), true, info2, info3);
                            } else {
                                callBack(req.getAllResponseHeaders(), true);
                            }
                        } else {
                            callBack(req.responseText, true, info2, info3);
                        }
                    } else if (req.status >= 400) { //dump('\n\n***** getAJAX - HTTP status code: '+req.status+'\nExplanation: \n'+req.responseText);
                        callBack(0, true, info2, info3);
                    }
                }
            }
            if (rtype == 'POST') {
                data = info;
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                req.setRequestHeader('Content-Length', data.length);
            }
            req.send(data);
        },
        getVideoFormatByUrl: function(url, longformat, convertTo, age) {
            try {
                var fstr,
                    convert,
                    fmt,
                    tt,
                    t = [],
                    d = '',
                    af,
                    audioHighest = cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio"),
                    muxWebM = cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.apply.webm");
                quality = parseInt(cysCommons.getCysString(fmt + '.5'));
                var ffmpegstatus = -1;
                try {
                    ffmpegstatus = cysCommons.cysPrefs.getIntPref('ffmpeg.install.status');
                } catch (ex) {}

                if (quality < 720 && cysCommons.cysPrefs.getBoolPref("mux.dash.video.highest.audio.all") === false) {
                    audioHighest = false;
                }
                if (convertTo != null) { // local conversion - ffmpeg
                    convert = parseInt(convertTo);
                    if (convert > 0) {
                        url = '';
                        fmt = 'Cnv' + convert;
                        fstr = cysCommons.getCysString(fmt + '.1');
                    }
                }
                if (url) {
                    if (!fmt) {
                        t = /[?&]itag=(133|134|135|136|137|138|160|266|264|299|298)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(133|134|135|136|137|138|160|266|264|299|298)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = (cysCommons.canConvert || ffmpegstatus === 1 || ffmpegstatus === 2) ? 'MP4' : "MP4V";
                            if (convert === 0)
                                fstr = (cysCommons.cysPrefs.getBoolPref('download.aac.as.m4a')) ? 'M4A' : 'AAC';
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(139|140|141)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(139|140|141)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "M4A";
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(18|22|37|38|82|83|84|85|59|78)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(18|22|37|38|82|83|84|85|59|78)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "MP4";
                            if (convert === 0)
                                fstr = (cysCommons.cysPrefs.getBoolPref('download.aac.as.m4a')) ? 'M4A' : 'AAC';
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(242|243|244|245|246|247|248|271|272|278|302)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(242|243|244|245|246|247|248|271|272|278|302)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = (cysCommons.canConvert || ffmpegstatus === 1 || ffmpegstatus === 2) ? 'WebM' : "WebMV";
                            if (convert === 0)
                                fstr = "OGG";
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(43|44|45|46|100|101|102|303|308|313|315)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(43|44|45|46|100|101|102|303|308|313|315)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "WebM";
                            if (convert === 0)
                                fstr = "OGG";
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(171|172)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(171|172)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "OGG";
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(34|35)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(34|35)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "FLV";
                            if (convert === 0)
                                fstr = (cysCommons.cysPrefs.getBoolPref('download.aac.as.m4a')) ? 'M4A' : 'AAC';
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(5|6)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(5|6)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "FLV";
                            if (convert === 0)
                                fstr = "MP3";
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(251|250|249)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(251|250|249)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "OPUS";
                        }
                    }
                    if (!fmt) {
                        t = /[?&]itag=(13|17|36)\D/.exec(url);
                        if (!t) {
                            t = /[?\/]itag\/(13|17|36)\D/.exec(url);
                        }
                        if (t) {
                            fmt = 'Fmt' + t[1];
                            fstr = "3GP";
                            if (convert === 0)
                                fstr = (cysCommons.cysPrefs.getBoolPref('download.aac.as.m4a')) ? 'M4A' : 'AAC';
                        }
                    }
                }
                //cysCommons.cysDump ('\n'+fstr+'  -  '+fmt+'  -  '+longformat+'  -  '+age+' - url:'+url);
                /*
                 if (longformat && fstr) {
                 if (cysCommons.canConvert && t && t[1] in cysCommons.dashVideo) d = 1; // dash with audio
                 tt = cysCommons.getCysString(fmt + ".4" + (d || age), null);
                 af = cysOverlay.muxOpusIfAvailable(t[1]);
                 if (tt == "")   tt = cysCommons.getCysString(fmt + ".4", null);
                 if (convert === 0) {
                 fstr += ' (' + tt + ')';
                 } else {
                 fstr = fmt + ' :  ' + cysCommons.getCysString(fmt + ".1" + d, null) + ' - ' + cysCommons.getCysString(fmt + ".5", null) + ' (' + cysCommons.getCysString(fmt + ".2", null) + ', ' + cysCommons.getCysString(fmt + ".3", null) + ', ' + tt + ')';
                 }
                 
                 if (('Fmt' + af) in cysOverlay.vid.bitrates) {
                 tt = tt.substr(0, tt.indexOf('/') + 1) + cysOverlay.vid.bitrates[('Fmt' + af)];
                 }
                 tt = cysOverlay.getOpusStringIfApplicable(fmt, tt);
                 }
                 */

                if (longformat && fstr) {
                    //if ((cysCommons.canConvert || ffmpegstatus === 2) && t && t[1]in cysCommons.dashVideo)
                    d = 1; // dash with audio
                    tt = cysCommons.getCysString(fmt + ".4" + (d || age), null);
                    if (audioHighest || (cysCommons.getCysString(fmt + '.11').toLowerCase() === 'webm' && !muxWebM)) {
                        af = cysOverlay.muxOpusIfAvailable(t[1]);
                        if (('Fmt' + af) in cysOverlay.vid.bitrates) {
                            tt = tt.substr(0, tt.indexOf('/') + 1) + cysOverlay.vid.bitrates[('Fmt' + af)];
                        }
                        tt = cysOverlay.getOpusStringIfApplicable(fmt, tt);
                    }
                    if (tt == "")
                        tt = cysCommons.getCysString(fmt + ".4", null);
                    if (convert === 0) {
                        fstr += ' (' + tt + ')';
                    } else {
                        var ff = cysCommons.getCysString(fmt + ".1" + d, null);
                        if (!ff) {
                            ff = cysCommons.getCysString(fmt + ".1", null);
                        }
                        fstr = fmt + ' :  ' + ff + ' - ' + cysCommons.getCysString(fmt + ".5", null) + ' (' + cysCommons.getCysString(fmt + ".2", null) + ', ' + cysCommons.getCysString(fmt + ".3", null) + ', ' + tt + ')';
                    }
                }

                return fstr;
            } catch (ex) {
                cysCommons.cysDump("error in getVideoFormatByUrl:" + ex, ex.stack);
            }
        },
        fmtFromUrl: function(a) {
            var b = a;
            a = /[?&]itag=(\d+)\D/.exec(a);
            if (!a) {
                a = /[?\/]itag\/(\d+)\D/.exec(b);
            }
            if (a) {
                return a[1];
            } else {
                return null;
            }
        },
        isYouTubeUrl: function(url, dir) {
            if (cysOverlay) {
                this.cysOverlay = cysOverlay;
            }
            if (url && dir) {
                dir = "^https?:\\/\\/(www\\.)?youtube\\.com/" + dir;
                if (url.match(dir))
                    return true;
            }
            return cysCommons.isYouTubeChannelUrl(url);
        },
        isYouTubeChannelUrl: function(url) {
            doclocationhref = cysCommons.getLink();
            var doc, t;
            if (!url) { url = doclocationhref; }
            if (!url) return;
            if (url.search(/https?:\/\/(www\.)?youtube\.com\/(user\/|channel\/)/) > -1) return true;
            if (url.search(/https?:\/\/(www\.)?youtube\.com\/[\w-]+\/?$/) > -1) return true;
            //if (!doc) doc = cysCommons.getDoc(); if (doc) {t = doc.getElementById("watch-container" ); if (t && t.getAttribute('itemtype') == 'http://schema.org/YoutubeChannelV2') return true;}
        },
        getPageUrlFromID: function(id) {
            return 'http://www.youtube.com/watch?v=' + id;
        },
        getTopWin: function() {
            try {
                var windowManager = Cc['@mozilla.org/appshell/window-mediator;1'].getService();
                var windowManagerInterface = windowManager.QueryInterface(Ci.nsIWindowMediator);
                var topWindowOfType = windowManagerInterface.getMostRecentWindow("navigator:browser");
                if (topWindowOfType)
                    return topWindowOfType;
            } catch (ex) {}
            return null;
        },
        getLink: function() {
            return gBrowser.currentURI.spec;
        },
        gethtmldata: function() {
            try {
                if (cysCommons.isYouTubeUrl(gBrowser.currentURI.spec, "watch")) {
                    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                        xmlhttp = new XMLHttpRequest();
                    } else { // code for IE6, IE5
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                            var body1 = xmlhttp.responseText.substring(xmlhttp.responseText.indexOf("<body"));
                            var body1 = xmlhttp.responseText.substring(xmlhttp.responseText.indexOf("comment-section-renderer"));
                            // console.log("body content->"+body1);
                            return body1;
                        }
                    }
                    xmlhttp.open("GET", gBrowser.currentURI.spec, false);
                    xmlhttp.send();
                } else
                    return null;
            } catch (ex) { console.log("error" + ex); }
        },
        getDoc: function() {
            try {
                return gBrowser.selectedBrowser.contentDocument;
            } catch (ex) {
                return cysCommons.getTopWin().getBrowser().contentDocument;
            }
        },
        getTitle: function(str) {
            console.log('here 1');
            /*if (cysOverlay.vid && cysOverlay.vid.title && cysOverlay.vid.title!='') {
                console.log('here 2:::'+cysOverlay.vid.title);
                return cysCommons.fixProjectName(cysOverlay.vid.title);
            }*/
            try {
                console.log('here 2');
                let name = cysOverlay.vid.text,
                    title;

                if (name) {
                    title = name.substring(name.indexOf("\<title\>"), name.indexOf("\<\/title\>"));
                    title = title.substring(7);
                    title = title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\//g, '-');
                }

                console.log('GetTitle str: ' + str);
                console.log(title);
                return cysCommons.fixProjectName(str || title);
            } catch (ex) {
                //console.log('here 3');
                //console.log('GetTitle error!:' + ex);
                //console.log(ex.stack);
                if (str) {
                    return cysCommons.fixProjectName(str);
                }
            }

        },
        getReplacingChar: function() {
            var replace_character_with_id = cysCommons.cysPrefs.getIntPref('forreplaced.character');
            var replace_character_with = "";
            if (replace_character_with_id == 1) {
                replace_character_with = "_";
            } else if (replace_character_with_id == 2) {
                replace_character_with = "-";
            } else if (replace_character_with_id == 3) {
                replace_character_with = " - ";
            }
            return replace_character_with;
        },
        getBrowserName: function() {
            var browserName = '';
            var ua = navigator.userAgent;
            if (ua.search(/SeaMonkey/) > -1)
                return "SM";
            if (ua.search(/PaleMoon/) > -1)
                return "PM";
            if (ua.search(/Firefox/) > -1)
                return "FF";
            return 'Browser';
        },
        getFormattedDay: function(day, format_id) {
            if (format_id !== 3) {
                day = String(day);
                if (day.length === 1) {
                    return day = '0' + day;
                } else {
                    return day;
                }
            } else {
                return day;
            }
        },
        getFormattedMonth: function(month, format_id) {
            month = String(month);
            if (format_id === 1) {
                if (month.length === 1) {
                    return month = '0' + month;
                } else {
                    return month;
                }
            } else {
                return month;
            }
        },
        cleanFilename: function(filename) {
            // ***********   feature
            //            if (filename.slice(-1) === '-') {
            //                filename = filename.slice(0, -1);
            //            }
            //            if (filename.slice(0,1) === '-') {
            //                filename = filename.slice(1);
            //            }
            return filename.trim();
        },
        fixProjectName: function(str, fromSaveDialog) { //dump('\nstr: '+str);
            //cysCommons.cysDump("FixProjectName");
            var len,
                R = /\.(MP4|FLV|3GP|WEBM|AVI|WMV|MOV|MPG|MPEG)$/i;
            var replace_character_with = cysCommons.getReplacingChar();
            var data_format_id = cysCommons.cysPrefs.getIntPref('tagoptions.dates');
            var newfilename = cysCommons.cysPrefs.getCharPref('filenaming.tags');
            /*if function is called from save dialog page, then it is called twice so that it is replacing tags twice. so checking in this condition*/
            var d = new Date();
            if (newfilename != "" && fromSaveDialog != true) {
                newfilename = newfilename.replace("[filename]", str.trim());
                var published_date = cysOverlay.vid.published2;
                if (!published_date) {
                    published_date = cysOverlay.vid.published || '';
                }
                var array_published_date = published_date.substr(0, 10).split('-');
                var p_year = String(array_published_date[0]);
                var p_month = Number(array_published_date[1]);
                var p_day = Number(array_published_date[2]);
                var p_week_date = new Date(new Date(published_date).getTime() - d.getTimezoneOffset() * 60000);
                var p_week_day = p_week_date.getUTCDay();
                p_day = p_week_date.getUTCDate();
                //newfilename = newfilename.replace(/\[month-abrv\]/g, cysCommons.getM(d.getMonth()));
                newfilename = newfilename.replace(/\[pub-mmm\]/g, cysCommons.getM(p_month - 1));
                newfilename = newfilename.replace(/\[mmm\]/g, cysCommons.getM(d.getMonth()));
                //newfilename = newfilename.replace(/\[month\]/g, d.getMonth() + 1);
                newfilename = newfilename.replace(/\[pub-mm\]/g, this.getFormattedMonth(p_month, data_format_id));
                newfilename = newfilename.replace(/\[mm\]/g, this.getFormattedMonth(d.getMonth() + 1, data_format_id));
                //newfilename = newfilename.replace(/\[day-abrv\]/g, cysCommons.getW(d.getDay()));
                //newfilename = newfilename.replace(/\[pub-ddd\]/g, cysCommons.getW(p_day-1));
                newfilename = newfilename.replace(/\[pub-ddd\]/g, cysCommons.getW(p_week_day));
                newfilename = newfilename.replace(/\[ddd\]/g, cysCommons.getW(d.getDay()));
                //newfilename = newfilename.replace(/\[day\]/g, d.getDate());
                newfilename = newfilename.replace(/\[pub-dd\]/g, this.getFormattedDay(p_day, data_format_id));
                newfilename = newfilename.replace(/\[dd\]/g, this.getFormattedDay(d.getDate(), data_format_id));
                //newfilename = newfilename.replace(/\[year-xxxx\]/g, d.getFullYear());
                newfilename = newfilename.replace(/\[pub-yyyy\]/g, p_year);
                newfilename = newfilename.replace(/\[yyyy\]/g, d.getFullYear());
                //newfilename = newfilename.replace(/\[year-xx\]/g, d.getFullYear().toString().substr(2, 2));
                newfilename = newfilename.replace(/\[pub-yy\]/g, p_year.substr(2, 2));
                newfilename = newfilename.replace(/\[yy\]/g, d.getFullYear().toString().substr(2, 2));
                if (cysOverlay.vid.duration != null) {
                    newfilename = newfilename.replace(/\[duration\]/g, cysOverlay.vid.duration);
                } else {
                    newfilename = newfilename.replace(/\[duration\]/g, "");
                }
                newfilename = newfilename.replace(/\[video_id\]/g, cysOverlay.vid.id);
                if (cysOverlay.vid.author != null) {
                    newfilename = newfilename.replace(/\[author\]/g, cysOverlay.vid.author);
                } else {
                    newfilename = newfilename.replace(/\[author\]/g, "");
                }

                if (cysOverlay.vid.published != null) {
                    newfilename = newfilename.replace(/\[published_date\]/g, cysOverlay.vid.published);
                } else {
                    newfilename = newfilename.replace(/\[published_date\]/g, "");
                }
                if (cysOverlay.vid.channelid != null) {
                    newfilename = newfilename.replace(/\[channel_id\]/g, cysOverlay.vid.channelid);
                } else {
                    newfilename = newfilename.replace(/\[channel_id\]/g, "");
                }

                var cysVersion = cysCommons.getVersion();
                if (cysVersion) {
                    cysVersion = cysVersion.replace(/\./g, "");
                    newfilename = newfilename.replace(/\[cys_version\]/g, "v" + cysVersion);
                }

                //var format = 'Fmt134';
                /*if (cysOverlay.vid.bitrates[format] != null){
                 newfilename = newfilename.replace(/\[audio_bitrate\]/g, cysOverlay.vid.bitrates[format]);
                 } else{
                 newfilename = newfilename.replace(/\[audio_bitrate\]/g, "");
                 }
                 */
                /*
                 if (cysOverlay.vid.resolutions[format] != null){
                 newfilename = newfilename.replace(/\[resolution\]/g, cysOverlay.vid.resolutions[format].w + 'p');
                 } else{
                 newfilename = newfilename.replace(/\[resolution\]/g, "");
                 }
                 */
                if (typeof(cysOverlay.arrayVideoParams['dash']) != 'undefined') {
                    newfilename = newfilename.replace(/\[dash_video\]/g, cysOverlay.arrayVideoParams['dash'].trim()).trim();
                } else {
                    newfilename = newfilename.replace(/\[dash_video\]/g, '');
                }
                if (typeof(cysOverlay.arrayVideoParams['fmt']) != 'undefined') {
                    newfilename = newfilename.replace(/\[fmt_code\]/g, cysOverlay.arrayVideoParams['fmt']);
                } else {
                    newfilename = newfilename.replace(/\[fmt_code\]/g, '');
                }
                if (typeof(cysOverlay.arrayVideoParams['audio']) != 'undefined') {
                    var arrFromAudio = cysOverlay.arrayVideoParams['audio'].toString().split('/');
                    if (typeof(arrFromAudio[1]) != 'undefined') {
                        //newfilename = newfilename.replace(/\[audio_bitrate\]/g, cysOverlay.arrayVideoParams['audio']);
                        newfilename = newfilename.replace(/\[audio_bitrate\]/g, arrFromAudio[1]);
                    } else {
                        newfilename = newfilename.replace(/\[audio_bitrate\]/g, arrFromAudio[0]);
                    }
                } else {
                    newfilename = newfilename.replace(/\[audio_bitrate\]/g, "");
                }

                if (typeof(cysOverlay.arrayVideoParams['quality']) != 'undefined') {
                    var rfps = "";
                    if (cysOverlay.arrayVideoParams['quality'].indexOf('fps') != -1) {
                        var res = cysOverlay.arrayVideoParams['quality'].match(/(\d{1,3}fps)/i);
                        if (res[1] === "60fps" || res[1] === "50fps") {
                            rfps = res[1]
                        }
                    }
                    newfilename = newfilename.replace(/\[60fps\]/g, rfps);
                } else {
                    newfilename = newfilename.replace(/\[60fps\]/g, "");
                }
                if (typeof(cysOverlay.arrayVideoParams['resolution']) != 'undefined') {
                    newfilename = newfilename.replace(/\[resolution\]/g, cysOverlay.arrayVideoParams['resolution']);
                } else {
                    newfilename = newfilename.replace(/\[resolution\]/g, "");
                }
                newfilename = newfilename.replace(/\[browser\]/g, this.getBrowserName());
                str = this.cleanFilename(newfilename.trim());
            }

            str = str.replace(" - YouTube", "").replace("- YouTube", "").trim().replace("YouTube - ", "").replace("YouTube -", "").trim();
            while (str.length != len) {
                str.replace(R, '');
                len = str.length;
            }
            str = str.replace(/[\u200c-\u200f|\u2028-\u202e|\u25b6]/gi, '').replace(/["|\\|/|:|\*|\?|<|>|\|]/gi, replace_character_with).trim(); //.replace(/\./g,replace_character_with)
            if (str.search(/&\w{2,}/))
                str = cysCommons.entities2char(str);
            var su = str.toUpperCase();
            if (su == "CON" || su == "AUX" || su == "COM1" || su == "COM2" || su == "COM3" || su == "COM4" || su == "LPT1" || su == "LPT2" || su == "LPT3" || su == "PRN" || su == "NUL")
                str += replace_character_with;
            if (!str)
                str = "Title";
            return str.trim();
        },
        getM: function(num) {
            var month = new Array();
            month[0] = "Jan";
            month[1] = "Feb";
            month[2] = "Mar";
            month[3] = "Apr";
            month[4] = "May";
            month[5] = "Jun";
            month[6] = "Jul";
            month[7] = "Aug";
            month[8] = "Sep";
            month[9] = "Oct";
            month[10] = "Nov";
            month[11] = "Dec";
            return month[num];
        },
        getW: function(num) {
            var weekday = new Array(7);
            weekday[0] = "Sun";
            weekday[1] = "Mon";
            weekday[2] = "Tue";
            weekday[3] = "Wed";
            weekday[4] = "Thu";
            weekday[5] = "Fri";
            weekday[6] = "Sat";
            return weekday[num];
        },
        getPublishedDate: function(doc) {
            try {
                var temp = doc.getElementsByClassName("watch-time-text")[0].innerHTML.split(" ");
                var publishdate = temp[2] + " " + temp[3] + " " + temp[4];
                return publishdate;
            } catch (ex) {
                return "";
            }
        },
        getDurationFromYString: function(ystr) {
            var ystr = ystr.replace('PT', '');
            var tmp,
                hour = 0,
                min = 0,
                sec = 0;
            if (ystr.indexOf('H') > -1) {
                tmp = ystr.split("H");
                hour = tmp[0];
                ystr = tmp[1];
            }
            if (ystr.indexOf('M') > -1) {
                tmp = ystr.split("M");
                min = tmp[0];
                ystr = tmp[1];
            }
            if (ystr.indexOf('S') > -1) {
                tmp = ystr.split("S");
                sec = tmp[0];
                ystr = tmp[1];
            }
            //cysCommons.cysDump("duration in sec:"+((hour*60*60)+(min*60)+(sec)));
            //cysCommons.cysDump("cysCommons.getFormattedDuration:"+cysCommons.getFormattedDuration((parseInt(hour)*60*60)+(parseInt(min)*60)+(parseInt(sec))));
            return cysCommons.getFormattedDuration((parseInt(hour) * 60 * 60) + (parseInt(min) * 60) + (parseInt(sec)));
        },
        getFormattedDuration: function(sec) {
            var duration_format_id = cysCommons.cysPrefs.getIntPref('tagoptions.duration');
            var duration = null;
            if (sec != null && sec > 0) {
                var hour = Math.floor(sec / 3600);
                var min = Math.floor(sec / 60) - (hour * 60);
                sec = sec - (min * 60) - (hour * 60 * 60);
                if (duration_format_id !== 3 && duration_format_id !== 6) {
                    min = String(min);
                    if (min.length === 1) {
                        min = '0' + min;
                    }
                }
                duration = min + "m";
                if (duration_format_id === 1 || duration_format_id === 2) {
                    sec = String(sec);
                    if (sec.length === 1) {
                        sec = '0' + sec;
                    }
                }
                if (duration_format_id === 1 || duration_format_id === 2 || duration_format_id === 3) {
                    duration += sec + "s";
                }
                if (hour > 0) {
                    if (duration_format_id === 1 || duration_format_id === 4) {
                        hour = String(hour);
                        if (hour.length === 1) {
                            hour = '0' + hour;
                        }
                    }
                    duration = hour + "h" + duration;
                }
            }
            return duration;
        },
        getVideoIDFromYurl: function(yurl) {
            var video_id = "";
            var tempvideo_id = yurl.split('v=');
            if (typeof tempvideo_id[1] != 'undefined') {
                video_id = tempvideo_id[1];
                var ampersandPosition = video_id.indexOf('&');
                if (ampersandPosition != -1) {
                    video_id = video_id.substring(0, ampersandPosition);
                }
            }
            return video_id;
        },
        getFile: function(fn) { // fn: string or array of strings
            try {
                var i,
                    f = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                if (typeof fn == 'string' && fn) {
                    f.initWithPath(fn);
                } else if (fn instanceof Array) {
                    f.initWithPath(fn[0]);
                    if (fn.length > 1) {
                        for (i = 1; i < fn.length; i++) {
                            f.append(fn[i]);
                        };
                    }
                }
                return f;
            } catch (ex) {
                cysCommons.cysDump(ex, ex.stack);
            }
        },
        readFileToString: function(_file) {
            if (!_file.exists()) {
                cysCommons.cysDump('\n!! readFileToString - file not found: ' + _file.path + '\n');
                return '';
            }
            var lines = [],
                charset = "UTF-8";
            var is = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
            var fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
            fis.init(_file, 0x01, parseInt("444", 8), 0);
            is.init(fis, charset, 8192, 0xFFFD);
            is.QueryInterface(Ci.nsIUnicharLineInputStream);
            if (is instanceof Ci.nsIUnicharLineInputStream) {
                var line = {},
                    cont;
                do {
                    cont = is.readLine(line);
                    if (cont)
                        lines.push(line.value);
                } while (cont);
            }
            fis.close();
            return lines.join("\n");
        },
        writeStringToFile: function(_file, _newFile, _content, charset) {
            if (_file.exists())
                _file.remove(true);
            if (typeof charset == 'undefined')
                charset = "UTF-8";
            var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
            foStream.init(_newFile == null ? _file : _newFile, 0x02 | 0x08 | 0x20, parseInt("666", 8), 0);
            var coStream = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
            coStream.init(foStream, charset, 0, 0);
            coStream.writeString(_content);
            coStream.close();
        },
        getFileNames: function(fp, fn, ext) { // fp: path (string); fn: filename (string); ext: array of file extensions;
            var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile),
                file2,
                files = {},
                x = 0,
                exists,
                i;
            for (i = 0; i < ext.length; i++) {
                do {
                    file.initWithPath(fp);
                    file.append(fn + (x ? "-" + x : '') + "." + ext[i]);
                    exists = file.exists();
                    if (exists)
                        x++;
                } while (exists)
            }
            files.fn = fn + (x ? "-" + x : '');
            for (i = 0; i < ext.length; i++) {
                file2 = file.clone();
                file2.initWithPath(fp);
                file2.append(fn + (x ? "-" + x : '') + "." + ext[i]);
                files['f' + i] = file2;
            }
            return files;
        },
        readFile: function(file, cbModule, cbFunction, d1, d2) { // async file read - callback module (ref) and function (string) needed
            return function() {
                //Cu.import("resource://gre/modules/NetUtil.jsm");
                NetUtil.asyncFetch(file, function(inputStream, status) {
                    if (!Components.isSuccessCode(status))
                        return;
                    var data = NetUtil.readInputStreamToString(inputStream, inputStream.available()); //dump('\n* readfile calling '+cbModule+'['+cbFunction+']');
                    //cbModule[cbFunction](data, d1, d2);
                    cbModule[cbFunction](data, cbFunction, d1, d2);
                });
            };
        },
        writeFile: function(file, str, charset) { // async file write - string to file
            // Cu.import("resource://gre/modules/NetUtil.jsm"); Cu.import("resource://gre/modules/FileUtils.jsm");
            var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            converter.charset = charset;
            var istream = converter.convertToInputStream(str),
                ostream = FileUtils.openSafeFileOutputStream(file);
            NetUtil.asyncCopy(istream, ostream, function(status) {
                if (!Components.isSuccessCode(status))
                    return;
            });
        },
        entities2char: function(str) { // converts HTML entities to respective Unicode characters
            try {

                var data = str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                return data;
            } catch (ex) {
                //console.log("error at entities2char"+ex);
            }
        },
        cloneObject: function(obj) { // use: t = new cysCommons.cloneObject(object);
            for (var i in obj) {
                if (typeof obj[i] == 'obj') {
                    this[i] = new cloneObject(obj[i]);
                } else {
                    this[i] = obj[i];
                }
            }
        },
        escRegex: function(str) {
            return str.replace(/[-\/\\^$\&*+?.()|[\]{}]/g, '\\$&');
        },
        openUrl: function(_url) {
            try {
                var topWin = cysCommons.getTopWin().getBrowser();
                var curLocation = topWin.contentDocument.location;
                if (curLocation == "about:blank") {
                    topWin.loadURI(_url);
                } else {
                    topWin.selectedTab = topWin.addTab(_url);
                }
            } catch (ex) {
                cysCommons.cysDump('error openUrl: ' + ex, ex.stack);
            }
        },
        openWindow: function(_url) {
            try {
                window.open(_url, "cys", "");
            } catch (ex) {
                cysCommons.cysDump('error openWindow: ' + ex, ex.stack);
            }
        },
        setIcon: function() { // show/hide toolbar button when closing pref window
            var btn = cysCommons.getTopWin().document.getElementById("cys-button");
            //var doc = cysCommons.getDoc();
            if (btn != null) {
                if (cysCommons.cysPrefs.getBoolPref("icon.show.always")) {
                    btn.hidden = false;
                } else if (doc != null && typeof(doc.location.href) != 'undefined') {
                    if (cysCommons.isYouTubeUrl(doc.location.href, "watch")) {
                        btn.hidden = false;
                    } else {
                        btn.hidden = true;
                    }
                } else {
                    btn.hidden = true;
                }
            }
        },
        xmlToSrt: function(str) {
            var parser = new DOMParser();
            var dom = parser.parseFromString(str, "application/xml");
            var texts = dom.getElementsByTagName("text");
            var srt = "";
            for (var i = 0; i < texts.length; i++) {
                var times = cysCommons.getTimes(texts[i]);
                srt += (i + 1) + "\n" + times.start + " --> " + times.end + "\n" + texts[i].textContent + "\n\n";
            }
            srt = srt.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            return srt;
        },
        getTimes: function(node) {
            var start = parseFloat(node.getAttribute("start"));
            var end = start + parseFloat(node.getAttribute("dur"));
            return {
                start: cysCommons.toTime(start),
                end: cysCommons.toTime(end)
            }
        },
        toTime: function(secs) {
            var mil = (secs % 1).toFixed(3).replace("0.", "");
            var sec_numb = parseInt(secs, 10);
            var hours = Math.floor(sec_numb / 3600);
            var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
            var seconds = sec_numb - (hours * 3600) - (minutes * 60);
            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return hours + ":" + minutes + ":" + seconds + "," + mil;
        },
        getSubtitleUrl: function(ntry, asr, ignore_auto_sub, ttsurl, lang) {

            var url = "";
            //cysCommons.cysPrefs.getBoolPref("ignore.auto.subtitles");
            //cysOverlay.vid.cc_asr
            switch (ntry) {
                case 1:
                    url = "&type=track&lang=" + lang + "&format=1&name=&kind=asr";
                    break;
                case 2:
                    //cysCommons.cysDump("getSubtitleUrl:2");
                    url = "&type=track&lang=" + lang + "&format=1&name=";
                    break;
                case 3:
                    //cysCommons.cysDump("getSubtitleUrl:3");
                    url = "&type=track&lang=" + lang + "&format=1&name=&kind=asr";
                    break;
                case 4:
                    //cysCommons.cysDump("getSubtitleUrl:3");
                    url = "&lang=" + lang + "&fmt=srv3";
                    break;
                default:
                    url = "&type=track&lang=" + lang + "&format=1&name=";
                    break;
            }
            cysCommons.cysDump(ntry + ":::ttsurl:" + ttsurl + url);
            if (ignore_auto_sub == false && (lang == "en" || lang == "en-GB")) {
                if (ntry == 1) {
                    url = "&type=track&lang=en-GB&format=1&name=";
                } else if (ntry == 2) {
                    url = "&type=track&lang=en&format=1&name=&kind=asr";
                } else if (ntry == 3) {
                    url = "&type=track&lang=en-GB&format=1&name=&kind=asr";
                }
            }
            cysCommons.cysDump(ntry + ":::ttsurl:" + ttsurl + url);
            return ttsurl + url;
            //cysOverlay.vid.ttsurl
        },
        getVideoIdFromEmbeddedURL: function(match, url) {
            try {
                var videoID = null;
                if (match) {
                    var temparr = match.split("/");
                    //cysCommons.cysDump(url+"::"+temparr[3]+":"+temparr[4])
                    if (temparr[0])
                        videoID = temparr[0];
                    if (!videoID && url) {
                        var temp;
                        if (url.indexOf("?v=") > -1) {
                            temp = url.split("?v=");
                        } else if (url.indexOf("/v/") > -1) {
                            temp = url.split("/v/");
                        } else if (url.indexOf("/embed/") > -1) {
                            temp = url.split("/embed/");
                        }
                        if (temp[1]) {
                            videoID = temp[1];
                        }
                    }
                    var sarr;
                    if (videoID.indexOf("?") > -1) {
                        sarr = videoID.split("?");
                        videoID = sarr[0];
                    }
                    if (videoID.indexOf("&") > -1) {
                        sarr = videoID.split("&");
                        videoID = sarr[0];
                    }
                    if (videoID.indexOf("%26") > -1) {
                        sarr = videoID.split("%26");
                        videoID = sarr[0];
                    }
                }
                return videoID;
            } catch (ex) {
                cysCommons.cysDump("error in getting videoID:" + ex, ex.stack);
            }
        },
        videoIsDash: function(fmt) {
            if (typeof fmt === 'string') {
                fmt = fmt.replace(/\D+/gi, '');
            }

            return typeof this.dashVideo[Number(fmt)] === 'number';
        },
        audioIsDash: function(fmt, fromPref) {
            if (typeof fmt === 'string') {
                fmt = fmt.replace(/\D+/gi, '');
            }
            if (fromPref) {
                return this.dashAudio.indexOf(this.dashAudioFormats[Number(fmt)]) !== -1
            }
            return this.dashAudio.indexOf(Number(fmt)) !== -1;
        },
        requiredFFmpeg: function(fmt) {
            if (typeof fmt === 'string') {
                fmt = fmt.replace(/\D+/gi, '');
            }

            return this.requiredFFmpegAudio.indexOf(Number(fmt)) !== -1;
        },
        isDash: function(fmt) {
            return (this.videoIsDash(fmt) || this.audioIsDash(fmt));
        },
        isRequiredFFmpeg: function(fmt) {
            return (this.videoIsDash(fmt) || this.requiredFFmpeg(fmt));
        },
        canShowSubmenu: function(it) {
            let isVideo = (it[0] === 'Fmt');
            let isRequiredFFmpeg = (cysCommons.videoIsDash(it[1]) || cysCommons.requiredFFmpeg(it[1]) || (!isVideo && !cysCommons.audioIsDash(cysCommons.fmtFromUrl(it[2]))));
            return cysCommons.isActiveItem(isVideo, isRequiredFFmpeg);
        },
        isActiveItem: function(isVideo, isRequiredFFmpeg) {
            let ffmpegStatus = -1;
            try {
                ffmpegStatus = cysCommons.cysPrefs.getIntPref("ffmpeg.install.status");
            } catch (ex) {}

            let ffmpegAudioOnly = false;
            try {
                ffmpegAudioOnly = cysCommons.cysPrefs.getBoolPref("ffmpeg.install.audio.only");
            } catch (ex) {}
            if (!cysCommons.canConvert) {
                ffmpegAudioOnly = false;
            }

            if (isVideo) {
                switch (ffmpegStatus) {
                    case 1:
                        if (!cysCommons.canConvert && isRequiredFFmpeg) {
                            return false
                        }
                        return true;
                    case -1:
                        if (isRequiredFFmpeg) {
                            return false
                        }
                        return true;
                    default:
                        return true
                }
            } else {
                switch (ffmpegStatus) {
                    case 1:
                        if (!cysCommons.canConvert && isRequiredFFmpeg) {
                            return false
                        }
                        return true;
                    case 2:
                        if (!isRequiredFFmpeg || ffmpegAudioOnly) {
                            return true
                        }
                        break;
                    case -1:
                        if (isRequiredFFmpeg) {
                            return false
                        }
                        return true;
                    default:
                        return true
                }
            }
            return false;
        },
        getUrlFormat: function(fmt) {
            var qformats = cysCommons.getFormats(true);
            console.log(qformats);
            return fmt;
        },
        stopConvert: function(isVideo, onlyAudio, isRequired, ffmpeg) {
            return !cysCommons.canConvert || ffmpeg === 0 || (ffmpeg === 2 && (isVideo || !onlyAudio)) || (!isVideo && !isRequired)
        },
        extToLower: function(file) {
            let ext = file.split('.').pop();
            return file.replace('.' + ext, '.' + ext.toLowerCase());
        }
    }

cleanEmpty = function(A) {
    for (var i = 0; i < A.length; i++) {
        if (!A[i]) {
            A.splice(i, 1);
            i--;
        }
    }
    return A;
};