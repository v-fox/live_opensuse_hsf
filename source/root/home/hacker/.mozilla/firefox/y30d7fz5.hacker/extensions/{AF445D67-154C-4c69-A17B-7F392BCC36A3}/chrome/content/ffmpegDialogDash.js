/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
try {
    if ("undefined" === typeof ffmpegDialogDash)
        var ffmpegDialogDash = {
            params: null,
            dialog_onload: function () {
                document.getElementById('ffmpeg').value = window.arguments[0].ffmpeg;
            },
            doCancel: function () {
                window.arguments[0].ok = false;
                window.close();
                return true;
            },
            doOK: function () {
                window.arguments[0].ok = true;
                window.arguments[0].ffmpeg = Number(document.getElementById('ffmpeg').value);
                window.close();
                return true;
            }
        };
} catch (ex) {
    //cysCommons.cysDump(ex);
}
