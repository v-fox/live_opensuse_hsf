/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
try {
    if ("undefined" === typeof ffmpegDialogAudio)
        var ffmpegDialogAudio = {
            params: null,
            dialog_onload: function () {
                document.getElementById('ffmpeg').value = window.arguments[0].ffmpeg;
                var format = window.arguments[0].format.toLowerCase();

                var elem;
                if (format === 'mp3') {
                    elem = document.getElementById('audio_wav');
                    elem.parentNode.removeChild(elem);
                    elem = document.getElementById('audio_ext');
                    elem.parentNode.removeChild(elem);
                } else if (format === 'wav') {
                    elem = document.getElementById('audio_mp3');
                    elem.parentNode.removeChild(elem);
                    elem = document.getElementById('audio_ext');
                    elem.parentNode.removeChild(elem);
                } else {
                    elem = document.getElementById('audio_wav');
                    elem.parentNode.removeChild(elem);
                    elem = document.getElementById('audio_mp3');
                    elem.parentNode.removeChild(elem);
                }

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
