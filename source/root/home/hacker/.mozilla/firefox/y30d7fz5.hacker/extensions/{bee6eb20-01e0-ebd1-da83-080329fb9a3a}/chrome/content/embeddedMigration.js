setTimeout(function() {
    var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    Cu.import("resource://flashVideoDownload/PrefManager.js");

    function getPrefs() {
        var prefKeys = [ 
            "other.firstRun",
            "other.version",
            "general.theme.light",
            "general.theme.dark",
            "general.interface.toolbarButton",
            "general.interface.statusbarButton",
            "general.flashAndVideoFiles.showFlashFiles",
            "general.flashAndVideoFiles.showVideoFiles",
            "general.downloadManagers.dta",
            "general.downloads.downloadsFolder",
            "general.downloads.useLastSavedFolder",
            "general.downloads.useFirefoxDownloadsFolder",
            "general.downloads.downloadImmediately",
            "general.downloads.suggestAlternativeFilenames",
            "yt.formats.mp4",
            "yt.formats.webm",
            "yt.formats.flv",
            "yt.formats.3gp",
            "yt.formats.3dmp4",
            "yt.formats.3dwebm",
            "yt.qualities.144p",
            "yt.qualities.240p",
            "yt.qualities.270p",
            "yt.qualities.360p",
            "yt.qualities.480p",
            "yt.qualities.520p",
            "yt.qualities.720p",
            "yt.qualities.3072p",
            "yt.qualities.3d240p",
            "yt.qualities.3d360p",
            "yt.qualities.3d480p",
            "yt.qualities.3d520p",
            "yt.qualities.3d720p",
            "yt.embeddedVideos.enhancedDetection"
        ];

        var prefs = {};

        for (var key of prefKeys ) {
            prefs[key] = PrefManager.getPref(key);
        }

        return prefs;
    }

    const addonId = "{bee6eb20-01e0-ebd1-da83-080329fb9a3a}";
    const {
        AddonManager,
    } = Components.utils.import("resource://gre/modules/AddonManager.jsm", {});

    AddonManager.getAddonByID(addonId, addon => {
        const baseURI = addon.getResourceURI("/");

        const {
            LegacyExtensionsUtils,
        } = Components.utils.import("resource://gre/modules/LegacyExtensionsUtils.jsm");

        const myOverlayEmbeddedWebExtension = LegacyExtensionsUtils.getEmbeddedExtensionFor({
            id: addonId, resourceURI: baseURI,
        });

        myOverlayEmbeddedWebExtension.startup().then(({browser}) => {
            browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
                sendResponse({ xulPrefs: getPrefs() });
            });

        }).catch(err => {
        });
    });
}, 2000);