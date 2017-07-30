/******************************************************************************
 *            Copyright (c) 2016, Carlos Garcia. All rights reserved.
 ******************************************************************************/
try {
    if ("undefined" === typeof InstallDialog)
        var InstallDialog = {
            goLink: function (link) {
                if (window.arguments) {
                    window.arguments[0].ok = true;
                    window.arguments[0].golink = true;
                    if (this.isSeaMonkey()) {
                        window.arguments[0].link = link;
                    }
                }
                document.getElementById('cys-dialog').cancelDialog();
                return false;
            },
            isSeaMonkey: function () {
                return navigator.userAgent.toLowerCase().indexOf('seamonkey') > -1;
            },
            onLoad: function () {
                if (!this.isSeaMonkey()) {
                    return false;
                }

                var html = document.getElementById('cys-zone').innerHTML;
                html = html.replace(new RegExp("href=", 'g'), 'link=');
                document.getElementById('cys-dialog').innerHTML = html;
            }
        };
} catch (ex) {
    //cysCommons.cysDump(ex);
}
