var EXPORTED_SYMBOLS = ["TreeDOM"];

function _TreeDOM() {
    var self = this;
    
    this.tree = null;               // holds the tree in
    this.Dm = null                  // reference to Dm.js module
    this.TreeFileMenupopup = null;  // reference to TreeFileMenupopup.js module
    
    var log = function(logInfo) { return self.Dm.main.log(logInfo); }
    
    this.setTree = function(XMLDOMTree) {
        this.tree = XMLDOMTree;
        this.tree.addEventListener("click", this.openMenupopup, false);
    };
    
    this.getTree = function() { return this.tree; }
    
    // these prototype functions were added after writing "convertFilesListToXUL" in the Dm module.
    // so "convertFilesListToXUL" is still using the old functions. 
    this.setProtoTypeFunctions = function() {        
        var tree = this.Dm.doc.createElement("tree");
        this.setProtoType_getElementById(tree);
        this.setProtoType_getTreeCellByCol(tree);
        this.setProtoType_getTreeCellValueByCol(tree);
        
        var treeitem = this.Dm.doc.createElement("treeitem");
        this.setProtoType_isContainer(treeitem);
        
        var treecell = this.Dm.doc.createElement("treecell");
        this.setProtoType_getParentTreeItem(treecell);
    };
    
    this.setProtoType_getElementById = function(XULElement) {
        XULElement.__proto__.getElementById = function(id) {
            return self.getElementById(id, this);
        }
    };
    
    this.setProtoType_getTreeCellByCol = function(XULElement) {
        XULElement.__proto__.getTreeCellByCol = function(col) {
            return self.getTreeCellByCol(this, col);
        }
    };
    
    this.setProtoType_getTreeCellValueByCol = function(XULElement) {
        XULElement.__proto__.getTreeCellValueByCol = function(col) {
            return this.getTreeCellByCol(col).getAttribute("value");
        }
    };
    
    this.setProtoType_isContainer = function(XULElement) {
        XULElement.__proto__.isContainer = function() {
            return self.isContainer(this);
        }
    };
    
    this.setProtoType_getParentTreeItem = function(XULElement) {
        XULElement.__proto__.getParentTreeItem = function() {
            return this.parentNode.parentNode;
        }
    };
    
    this.getElementById = function(id, elementToLookIn) {
        elementToLookIn = elementToLookIn ? elementToLookIn : this.tree;        
        var allElements = elementToLookIn.getElementsByTagName("*");
        for (var i in allElements) {
            if (typeof allElements[i].hasAttributes === 'function' && allElements[i].hasAttributes()) {
                if (allElements[i].getAttribute("id") == id) {
                    return allElements[i];
                }
            }
        }
        return null;
    };
    
    this.getTreeCellByCol = function(parentElement, col) {        
        var treeCells = parentElement.getElementsByTagName("treecell");
        for (var i in treeCells) {
            if (typeof treeCells[i].hasAttributes === 'function' && treeCells[i].hasAttributes()) {
                if (treeCells[i].getAttribute("col") == col) {
                    return treeCells[i];
                }
            }
        }
        return false;
    };
    
    this.getTreeCellValueByCol = function(parentElement, col) {
        return this.getTreeCellByCol(parentElement, col).getAttribute("value");
    };
    
    this.getTopMostTreeChildrenNode = function() {
        return this.tree.getElementsByTagName("treechildren")[0];
    };
    
    this.isContainer = function(treeItem) {
        return treeItem.getAttribute("container") == "true" ? true : false;
    };
    
    this.getTreeItemAtIndex = function(index) {
        var treeItem = this.tree.view.getItemAtIndex(index);
        return treeItem;
    };
    
    /**
     * Gets the Tree Item for the selected row in the tree.
     * (This method works on the actual tree - the tree GUI)
     * @returns {XULElement} The selected Tree Item.
     */
    this.getSelectedTreeItem = function() {
        var selectedIndex = this.tree.view.selection.currentIndex; //returns -1 if the tree is not focused
        return this.getTreeItemAtIndex(selectedIndex);
    };
    
    this.isRowSelected = function() {
        return this.tree.view.selection.currentIndex != -1;
    };
    
    /**
     * Gets all the selected rows' indexes.
     * @returns {Array} An array of integers, each representing an index of the selected row.
     */
    this.getSelectedRowsIndexes = function() {
        var start = new Object();
        var end = new Object();
        var numRanges = this.tree.view.selection.getRangeCount();
        var selectedIndexes = new Array();
        
        for (var t = 0; t < numRanges; t++) {
            this.tree.view.selection.getRangeAt(t,start,end);
            for (var v = start.value; v <= end.value; v++){
                selectedIndexes.push(v);
            }
        }
        return selectedIndexes;
    }
    
    /**
     * Opens the file/download popup menu when clicking anywhere on the tree.
     * If not clicking on a specific row, then the menu will apply to the current selected row, if no row has been selected, some options in the
     * popup menu will be disabled.
     * @param {Event} event The "click" event.
     */
    this.openMenupopup = function(event) {
        var treeItem = self.getSelectedTreeItem();
        var cellData = self.getCellRowColPart(event);
        
        // here we check if a row has been clicked or not, if the user clicked on the tree but not on a row, the cellData.row will have a value of -1.
        // in such case, the popup would be irrelevant because the purpose of this popup is to display options regarding a clicked row.
        if (event.button == 2) {
            if (event.clientX && event.clientY) {
                var menuPopup = self.TreeFileMenupopup.getMenupopup();
                log(self.isRowSelected());
                if (!self.isRowSelected()) {
                    log("hry");
                    menuPopup.getElementsByTagName("menuitem")[0].disabled = true;
                }
                menuPopup.openPopupAtScreen(event.clientX + 100, event.clientY + 70, true);                
            }
        }
    };
    
    /**
     * Gets a cell Row, Column and Part in an object.
     * @param {Event} event The "click" event must be passed here.
     * The returned data object will have 3 properties:
     *  1. data.row = The row number - value will be -1 if no row was selected.
     *  2. data.col = A column XUL DOM object.
     *  3. data.part = The part of the cell the coordinate is at ("cell", "text", "twisty")
     * @returns {Object} 
     */
    this.getCellRowColPart = function(event) {
        var row = {}, column = {}, part = {};
        var boxobject = self.tree.boxObject;
        boxobject.QueryInterface(Components.interfaces.nsITreeBoxObject);
        boxobject.getCellAt(event.clientX, event.clientY, row, column, part);
        
        var data = new Object();
        data.row = row.value;
        data.column = column.value;
        data.part = part.value;
        
        return data;
    };
    
    this.selectAll = function() { this.tree.view.selection.selectAll(); }
    this.invertSelection = function() {
        log(this.getSelectedTreeItem().previousSibling);
        var selectedRows = this.getSelectedRowsIndexes();
        this.tree.view.selection.selectAll();
        for (var i in selectedRows) {
            this.tree.view.selection.clearRange(selectedRows[i], selectedRows[i]);
        }
    };
    
    this.moveRowUp = function() {
        var selectedTreeItem = this.getSelectedTreeItem();
        var selectedTreeItemIndex = this.getSelectedRowsIndexes()[0];
        var previousTreeItem = this.getSelectedTreeItem().previousSibling;  // returns null if no sibling found
        if (previousTreeItem) {
            selectedTreeItem.parentNode.insertBefore(selectedTreeItem, previousTreeItem);
            this.tree.view.selection.select(selectedTreeItemIndex - 1);
            return true;
        }
        return false;
    };
    
    this.moveRowDown = function() {
        var selectedTreeItem = this.getSelectedTreeItem();
        var nextTreeItem = this.getSelectedTreeItem().nextSibling;  // returns null if no sibling found
        if (nextTreeItem) {
            selectedTreeItem.parentNode.insertBefore(nextTreeItem, selectedTreeItem);
            return true;
        }
        return false;
    };
    
    this.moveRowTop = function() {
        while ( this.moveRowUp() ) { }
    };
    
    this.moveRowBottom = function() {
        while ( this.moveRowDown() ) { }
    };
}

var TreeDOM = new _TreeDOM();