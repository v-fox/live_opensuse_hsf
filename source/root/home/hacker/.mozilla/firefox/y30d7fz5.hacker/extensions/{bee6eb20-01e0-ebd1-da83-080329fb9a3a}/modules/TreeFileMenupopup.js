var EXPORTED_SYMBOLS = ["TreeFileMenupopup"];

function _TreeFileMenupopup() {
    var self = this;
    
    // fields
    this.menupopup = null;  // holds reference to the XUL element "<menupopup>" for the Tree File Menupopup
    this.Dm = null;         // reference to Dm.js module
    this.TreeDOM = null;    // reference to TreeDom.js module
    
    // conts
    this.MENU_ITEMS_ID = {
        START               : "fileStart",
        PAUSE               : "filePause",
        STOP                : "fileStop",
        COPY_FILE_URL       : "fileCopyFileUrl",
        COPY_PAGE_URL       : "fileCopyPageUrl",
        REMOVE_COMPLETED    : "fileRemoveCompleted",
        REMOVE_SELECTED     : "fileRemoveSelected",
        MOVE_TOP            : "fileMoveTop",
        MOVE_UP             : "fileMoveUp",
        MOVE_DOWN           : "fileMoveDown",
        MOVE_BOTTOM         : "fileMoveBottom",
        SELECT_ALL          : "fileSelectAll",
        INVERT_SELECTION    : "fileInvertSelection"
    }
    
    var log = function(logInfo) { return self.Dm.main.log(logInfo); }
    
    this.setMenupopup = function(XMLDOMMenupopup) {
        this.menupopup = XMLDOMMenupopup;
        
        this.setEvents();
    }
    
    this.getMenupopup = function() { return this.menupopup; }
    
    this.getElementById = function(id) {
        return this.TreeDOM.getElementById(id, this.menupopup);
    }
    
    this.setEvents = function() {
        this.getElementById(this.MENU_ITEMS_ID.COPY_FILE_URL).addEventListener("click", function() {
            var fileUrl = self.TreeDOM.getSelectedTreeItem().getTreeCellValueByCol("fileUrl");
            self.copyToClipBoard(fileUrl);
        }, false);
        this.getElementById(this.MENU_ITEMS_ID.COPY_PAGE_URL).addEventListener("click", function() {
            var pageUrl = self.TreeDOM.getSelectedTreeItem().parentNode.parentNode.getTreeCellValueByCol("pageUrl");
            self.copyToClipBoard(pageUrl);
        }, false);
        this.getElementById(this.MENU_ITEMS_ID.SELECT_ALL).addEventListener("click", function() {
            self.TreeDOM.selectAll();
        }, false);
        this.getElementById(this.MENU_ITEMS_ID.INVERT_SELECTION).addEventListener("click", function() {
            self.TreeDOM.invertSelection();
        }, false);
        this.getElementById(this.MENU_ITEMS_ID.MOVE_UP).addEventListener("click", function() {
            self.TreeDOM.moveRowUp();
        }, false);
        this.getElementById(this.MENU_ITEMS_ID.MOVE_DOWN).addEventListener("click", function() {
            self.TreeDOM.moveRowDown();
        }, false);            
        this.getElementById(this.MENU_ITEMS_ID.MOVE_TOP).addEventListener("click", function() {
            self.TreeDOM.moveRowTop();
        }, false);
        this.getElementById(this.MENU_ITEMS_ID.MOVE_BOTTOM).addEventListener("click", function() {
            self.TreeDOM.moveRowBottom();
        }, false);          
    }
    
    this.copyToClipBoard = function(str) {
        var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
            getService(Components.interfaces.nsIClipboardHelper);
        clipboard.copyString(str);
    }
}

var TreeFileMenupopup = new _TreeFileMenupopup();