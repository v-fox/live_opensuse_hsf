var EXPORTED_SYMBOLS = ["Dm"];

function _Dm() {
    var self = this;
    
    // consts
    this.TREE_ID = "dmTree";
    this.TREE_FILE_MENUPOPUP_ID = "fileMenupopup";
    this.FILE_TYPE = {
        VIDEO : 0,
        FLASH : 1
    };
    
    // fields
    this.main                       // main object (in overlay.js)
    this.window;                    // downloadManager.xul window
    this.doc = null;                // should be set from "downloadManager.js" - it represents the XUL document
    this.TreeDOM = null;            // will be imported from a module
    this.TreeFileMenupopup = null;  // will be imported from a module
    this.Queue = null;              // will be imported from a module (a simple queue class that can create queue objects)
    this.videoFilesQueue;           // The queue to hold all video files objects to be converted to XUL
    this.flashFilesQueue;           // The queue to hold all video files objects to be converted to XUL
    
    this.init = function() {
        Components.utils.import("resource://flashVideoDownload/TreeDOM.js", this);
        Components.utils.import("resource://flashVideoDownload/Queue.js", this);
        Components.utils.import("resource://flashVideoDownload/TreeFileMenupopup.js", this);
        this.videoFilesQueue = new this.Queue();
        this.flashFilesQueue = new this.Queue();
        this.TreeDOM.Dm = this;
        this.TreeFileMenupopup.Dm = this;
        
        this.TreeDOM.TreeFileMenupopup = this.TreeFileMenupopup;    // setting a reference to TreeFileMenupopup module within TreeDOM module
        this.TreeFileMenupopup.TreeDOM = this.TreeDOM;              // setting a reference to TreeDOM module within TreeFileMenupopup module        
    };
    
    this.convertFilesListToXUL = function(fileType) {
        var filesList = null;
        
        if (fileType == this.FILE_TYPE.VIDEO) {
            filesList = this.videoFilesQueue.dequeue();
        }
        else if (fileType == this.FILE_TYPE.FLASH) {
            filesList = this.flashFilesQueue.dequeue();
        }        
        if (!filesList) return;
        
        var firstFile;     // the first video file in the filesList, if not in fact an array but only a single video file, then the value is the single video file
        var isSingleFile;  // indicates whether filesList is only a single video file or an array of video files
        
        // checks if a list of video/flash files has been dequeued or just one video/flash object, thus, getting the first video/flash file from the list or just that one video/flash object
        if (filesList.hasOwnProperty("url")) {
            firstFile = filesList;
            isSingleFile = true;
        }
        else {
            firstFile = filesList[0];
            isSingleFile = false;            
        }
        
        // removes the hash from the url in each file (or in a single file)
        // this is important because we want to treat similar web pages urls with different hash as the same url (they act as an id for the Tree Item container)
        this.removeUrlHashFromFiles(filesList, isSingleFile);
        
        /* An explanation behind the logic of the algorithm to add video files:
         * Each Tree Item in the tree can either be a - 
         *  1. Single Tree Item which is not a container
         *  2. Tree Item which is a container
         *  3. Tree Item which is not a container but within a container (Tree Item which is a child of another Tree Item)
         *
         *  Each Tree Item has an Id associated with it as follows respectively:
         *  1. The Id is the video file's Web Page Url.
         *  2. The Id is the video file's Web Page Url.
         *  3. The Id is the video file's File Url.
         *
         *  So before creating and adding Tree Items, we first check for an existing one by looking for Tree Items Ids from the video file's Web Page Url.
         *  If not found, we create one and append it to the tree - the created Tree Item, is of type 1 (Single Tree Item which is not a container).
         *  
         *  In any way, we continue going through the rest of the video files in the "filesList" array (assuming it's an array and not a single video file).
         *  For each element in the array, we look for a Tree Item with the corresponding Id - based on the Web Page Url.
         *  If the Tree Item is found, we check if it's a container and if not we convert it to a container, but before we do that, we check that the video we
         *  want to add is not the same as the Tree Item we wish to convert to a container and we do so by comparing the video file's File Url to the value of
         *  Tree Item's Tree Cell of type "fileUrl", if they match, then we don't add it the video file nor convert the Tree Item to a container.
         *  If they do not match, then we convert the Tree Item to a container (and child) and adding the new video file by creating a Tree Item child based on it.
         *  So now we have a Tree Item which is a container - type 2 - with 2 childs in it -
         *      1. A child created from the Single Tree Item - type 3.
         *      2. A child created from the video file - type 3.
         *
         *  We continue iterating through the array of video files and doing the same thing, only this time when we find the Tree Item, it will be a container.
         *  In such case, we need to match the video files' File Url with the container's Tree Item childs Id.
         *  If no match has been found, we can add another Tree Item child creating it from the current video file - type 3.
         */
        // checks if "firstFile" has a treeItem node in the tree already, based on its id - the id of the treeItem is the "docUrl" property
        var treeItem = this.TreeDOM.getElementById(firstFile.docUrl);
        // i need to remove the hash from all urls to make it work
        if (!treeItem) {
            treeItem = this.createTreeItem(fileType, firstFile, true);   // creates and appends to the tree
        }        
        
        if (isSingleFile) {
            this.insertFileAsTreeItem(fileType, filesList);
        }
        else {
            for (var i in filesList) {
                this.insertFileAsTreeItem(fileType, filesList[i]);
            }
        }
    };
    
    /**
     * Removes the hash from a given url string.
     * @param {string} url The url string to remove the hash from.
     * @returns {string} The url without the hash.
     */
    this.removeUrlHash = function(url) {
        return url.split("#")[0];
    };
    
    /**
     * Removes the hash from a file's docUrl (video or flash), either a single file or an array of files.
     * @param {Object} files The array of files to remove the hash from their docUrl (can also be a single file).
     * @param {bool} singleFile Determines if "files" is an array or a single file - if a single file was sent and not an array, this should be set to true.
     */    
    this.removeUrlHashFromFiles = function(files, singleFile) {
        if (singleFile) {
            files.docUrl = this.removeUrlHash(files.docUrl);
            return;
        }
        for (var i in files) {
            files[i].docUrl = this.removeUrlHash(files[i].docUrl);
        }
    };
    
    /**
     * Read above for the logic behind this method and the "convertFilesListToXUL" method.
     */
    this.insertFileAsTreeItem = function(fileType, file) {
        var fileId = file.docUrl;
        var fileIdAsFileUrl = file.url;
        var existingTreeItem = this.TreeDOM.getElementById(fileId);
        if (existingTreeItem) {
            if (!this.TreeDOM.isContainer(existingTreeItem)) {
                var existingTreeItemIdAsFileUrl = this.TreeDOM.getTreeCellByCol(existingTreeItem, "fileUrl").getAttribute("value");
                if (existingTreeItemIdAsFileUrl == fileIdAsFileUrl) { return; }  // video file already exists as a tree item
                this.convertSingleTreeItemToContainerAndChildNodes(existingTreeItem);   // now the "existingTreeItem" is a container
                treeItem = this.createTreeItem(fileType, file);
                this.convertSingleTreeItemToChildNode(treeItem);
                existingTreeItem.getElementsByTagName("treechildren")[0].appendChild(treeItem);                    
            }
            else {
                // looks inside the "existingTreeItem" for Tree Item childs with the same File Url, if not found, then it creates a new Tree Item child for that video file
                existingTreeItemChild = this.TreeDOM.getElementById(fileIdAsFileUrl, existingTreeItem);
                if (!existingTreeItemChild) {                        
                    treeItem = this.createTreeItem(fileType, file);
                    this.convertSingleTreeItemToChildNode(treeItem);
                    existingTreeItem.getElementsByTagName("treechildren")[0].appendChild(treeItem);
                }
            }
        }        
    };
    
    /**
     * Creates a Tree Item - <treeitem> node - and appends it to the tree.
     * The created Tree Item is a single non-container Tree Item node (which can later be converted to a either a Tree Item child node or a Tree Item container).
     * @param {MediaFile} videoFile The videoFile to create a Tree Item node from.
     * @returns {XULElement} A treeItem XUL element node.
     */
    this.createTreeItem = function(fileType, file, appendToTree) {
        var params = this.getXULParamsForFile(fileType, file);         
        
        var treeChildren = this.TreeDOM.getTopMostTreeChildrenNode();
        var treeItem = this.doc.createElement("treeitem");        
        treeItem.setAttribute("id", params.id);
        treeItem.setAttribute("conversionParams", params.conversionParams);   // parses the entire videoFile object into a string for later usage
        
        var treeRow = this.doc.createElement("treerow");
        
        /* columns */
        // treecell "Title" column - e.g <treecell col="title" label="Metallica - For Whom The Bell Tolls" />        
        var treeCell = this.createTreeCell("title", params.title, params.title);
        treeRow.appendChild(treeCell);
        
        // treecell "Type" column - e.g <treecell col="type" label="" value="" />
        treeCell = this.createTreeCell("type", params.type, params.type);
        treeRow.appendChild(treeCell);
        
        // treecell "Quality" column - e.g <treecell col="quality" label="" value="" />
        treeCell = this.createTreeCell("quality", params.quality, params.quality);
        treeRow.appendChild(treeCell);
        
        // treecell "Host" column - e.g <treecell col="host" label="[www.youtube.com]" value="www.youtube.com" />
        treeCell = this.createTreeCell("host", "[" + params.host + "]", params.host);;
        treeRow.appendChild(treeCell);
        
        // treecell "Page Url" column - e.g <treecell col="pageUrl" value="http://www.youtube.com/v/kdJSAfshenc" label="http://www.youtube.com/v/kdJSAfshenc" />
        treeCell = this.createTreeCell("pageUrl", params.pageUrl, params.pageUrl);;        
        treeRow.appendChild(treeCell);
        
        // treecell "File Url" column - e.g <treecell col="fileUrl" value="http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback" label="http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback" />
        treeCell = this.createTreeCell("fileUrl", params.url, params.url);;        
        treeRow.appendChild(treeCell);
        
        // treecell "Status" column - e.g <treecell col="fileUrl" value="http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback" label="http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback" />
        treeCell = this.createTreeCell("status", params.status + "%", params.status);
        treeRow.appendChild(treeCell);
        
        // treecell "Progress" column - e.g <treecell col="fileUrl" value="http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback" label="http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback" />
        treeCell = this.createTreeCell("progress", params.progress, "0");
        treeCell.setAttribute("totalSize", params.fileSize)
        treeRow.appendChild(treeCell);
        
        treeItem.appendChild(treeRow);
        if (appendToTree) { treeChildren.appendChild(treeItem); }
        return treeItem;        
    };
    
    /**
     * Gets a file (either video file or flash file) and extracts its params, making a new params object containing
     * all the params needed to create a Tree Item.
     * @param {FILE_TYPE} fileType The type of the file, either a video or flash.
     * @param {Object} file A single file taken from the video or or flash queue, containing all the data of a single video/flash file.
     * @returns {Object} The params object for the Tree Item.
     */
    this.getXULParamsForFile = function(fileType, file) {
        // these are the params to use when converting between a normal treeitem to container treeitem
        var params = new Object();
        params.id = file.docUrl;                                       // e.g http://www.youtube.com/v/kdJSAfshenc
        params.pageUrl = params.id;                                    // e.g http://www.youtube.com/v/kdJSAfshenc
        params.fileType = file.fileType.toUpperCase();                 // e.g WEBM        
        params.title = file.title;                                     // e.g Metallica - Master Of Puppets        
        params.host = file.domain;                                     // e.g www.youtube.com
        params.url = file.url;                                         // e.g http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback
        params.fileSize = file.fileSize;                               // e.g 121.02MB
        params.status = "0";                                           // e.g 0
        params.progress = "0MB / " + file.fileSize;                    // e.g 0MB / 121.02MB
        
        // these are the params to use when converting between a normal treeitem to container treeitem
        var conversionParams = new Object();        
        conversionParams.container = new Object();
        conversionParams.child = new Object();        
        conversionParams.container.title = file.title;
        conversionParams.container.id = params.id;
        conversionParams.child.id = params.url;
        conversionParams.child.host = "";
        conversionParams.child.pageUrl = "";
        
        if (fileType == this.FILE_TYPE.VIDEO) {
            params.quality = file.quality ? file.quality : "";                  // e.g 720p
            params.type = "Video / " + params.fileType;                         // e.g Video / WEBM
            params.title += file.quality ? " [" + file.quality + "]" : "";      // title with quality - e.g Metallica - Master Of Puppets [720p]
            
            conversionParams.child.title = params.fileType;
            conversionParams.child.title += file.quality ? " [" + file.quality + "]" : "";
        }
        else if (fileType == this.FILE_TYPE.FLASH) {
            params.quality = "";                                                // none applicable
            params.type = "Flash / " + params.fileType;                         // e.g Flash / SWF
            params.title = file.title;                                          // e.g
            
            conversionParams.child.title = file.labelNoFileSize;
        }
        
        conversionParams = JSON.stringify(conversionParams);
        params.conversionParams = conversionParams;
        
        return params;
    };
    
    /**
     * Converts and creates a single non-container Tree Item node to a container Tree Item node and Tree Item node child of a container and
     * appends the created child node to the created container node.
     * (does not return a new node, simply changes the node sent)
     * @param (XULElement) treeItem The Tree Item node to be converted.
     */
    this.convertSingleTreeItemToContainerAndChildNodes = function(treeItem) {
        var treeItemChild = treeItem.cloneNode(true);
        var treeItemContainer = treeItem;
        
        this.convertSingleTreeItemToContainer(treeItem);        
        this.convertSingleTreeItemToChildNode(treeItemChild);
        
        // creates the hierarchy between the treeitems
        var treechildren = this.doc.createElement("treechildren");
        treechildren.appendChild(treeItemChild); 
        treeItemContainer.appendChild(treechildren);
    };
    
    
    /**
     * Converts a single non-container Tree Item node to a container Tree Item node.
     * (does not return a new node, simply changes the node sent)
     * @param (XULElement) treeItem The Tree Item node to be converted.
     * Example -
     * Tree Item node BEFORE conversion -
     * Title -          "Martin 000 15M - How does it sound? - Youtube [720p]"
     * Type -           "Video / WEBM"
     * Quality -        "720p"
     * Host -           "[www.youtube.com]"
     * Web Page URL -   "http://www.youtube.com/watch?v=yUiGaVUjjDU&feature=context&context=G23d2dfcRVAAAAAAAAAw"
     * File URL -       "http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback?id=c948866955238c35&newshard=yes&cp=........"
     * Status -         "0%"
     * Progress -       "0MB / 24.57MB"
     *
     * Tree Item node AFTER conversion -
     * Title -          "Martin 000 15M - How does it sound? - Youtube"
     * Type -           ""
     * Quality -        ""
     * Host -           "[www.youtube.com]"
     * Web Page URL -   "http://www.youtube.com/watch?v=yUiGaVUjjDU&feature=context&context=G23d2dfcRVAAAAAAAAAw"
     * File URL -       ""
     * Status -         ""
     * Progress -       ""
     */
    this.convertSingleTreeItemToContainer = function(treeItem) {
        // the params used for conversion
        var paramsAttrib = treeItem.getAttribute("conversionParams");
        var paramsForConversion = JSON.parse(paramsAttrib);
        treeItem.removeAttribute("conversionParams");    // no need to keep it
        
        this.resetTreeCellsValueLabelAttributesByTypes(treeItem, ["type", "quality", "fileUrl", "status", "progress"]);
        this.TreeDOM.getTreeCellByCol(treeItem, "progress").setAttribute("totalSize", "");        
        this.TreeDOM.getTreeCellByCol(treeItem, "title").setAttribute("value", paramsForConversion.container.title);
        this.TreeDOM.getTreeCellByCol(treeItem, "title").setAttribute("label", paramsForConversion.container.title);
        treeItem.setAttribute("container", "true");
        treeItem.setAttribute("id", paramsForConversion.container.id);
    };

    /**
     * Converts a single non-container Tree Item node to a Tree Item child node of a container.
     * (does not return a new node, simply changes the node sent)
     * @param (XULElement) treeItem The Tree Item node to be converted.
     * Example -
     * Tree Item node BEFORE conversion -
     * Title -          "Martin 000 15M - How does it sound? - Youtube [720p]"
     * Type -           "Video / WEBM"
     * Quality -        "720p"
     * Host -           "[www.youtube.com]"
     * Web Page URL -   "http://www.youtube.com/watch?v=yUiGaVUjjDU&feature=context&context=G23d2dfcRVAAAAAAAAAw"
     * File URL -       "http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback?id=c948866955238c35&newshard=yes&cp=........"
     * Status -         "0%"
     * Progress -       "0MB / 24.57MB"
     *
     * Tree Item node AFTER conversion -
     * Title -          "WEBM [720p]"
     * Type -           "Video / WEBM"
     * Quality -        "720p"
     * Host -           "[www.youtube.com]"
     * Web Page URL -   "http://www.youtube.com/watch?v=yUiGaVUjjDU&feature=context&context=G23d2dfcRVAAAAAAAAAw"
     * File URL -       "http://r1---sn-cx1x9-ua8s.c.youtube.com/videoplayback?id=c948866955238c35&newshard=yes&cp=........"
     * Status -         "0%"
     * Progress -       "0MB / 24.57MB"
     */    
    this.convertSingleTreeItemToChildNode = function(treeItem) {
        // the params used for conversion
        var paramsAttrib = treeItem.getAttribute("conversionParams");
        var paramsForConversion = JSON.parse(paramsAttrib);
        treeItem.removeAttribute("conversionParams");    // no need to keep it
        
        // treeItem child manipulations
        this.TreeDOM.getTreeCellByCol(treeItem, "title").setAttribute("value", paramsForConversion.child.title);
        this.TreeDOM.getTreeCellByCol(treeItem, "title").setAttribute("label", paramsForConversion.child.title);
        this.TreeDOM.getTreeCellByCol(treeItem, "host").setAttribute("label", paramsForConversion.child.host);
        this.TreeDOM.getTreeCellByCol(treeItem, "host").setAttribute("value", paramsForConversion.child.host);
        this.TreeDOM.getTreeCellByCol(treeItem, "pageUrl").setAttribute("label", paramsForConversion.child.pageUrl);
        this.TreeDOM.getTreeCellByCol(treeItem, "pageUrl").setAttribute("value", paramsForConversion.child.pageUrl);        
        treeItem.setAttribute("id", paramsForConversion.child.id);  // the child element's id is set to have the value of the file url instead of the page url
    };
    
    /**
     * Resets any given attributes (setting their values to empty strings) in a Tree Cell node.
     * @param {XULElement} treeCell The Tree Cell to reset its attributes.
     * @param {Array} attributes An array of attributes names.
     */
    this.resetTreeCellAttributes = function(treeCell, attributes) {        
        for (var i = 0; i < attributes.length; i++) {
            treeCell.setAttribute(attributes[i], "");
        }
    };
    
    /**
     * Resets the "value" and "label" attributes in a list of Tree Cells of their parent element.
     * @param {XULElement} parentElem The parent element whom its Tree Cells are to have their "value" and "label" attributes reset.
     * @param {Array} types The types of Tree Cells defined by the attribute "col" in a Tree Cell (such as "type", "quality", "fileUrl", "status", "progress", etc..).
     */    
    this.resetTreeCellsValueLabelAttributesByTypes = function(parentElem, types) {
        for (var i = 0; i < types.length; i++) {
            var treeCell = this.TreeDOM.getTreeCellByCol(parentElem, types[i]);
            this.resetTreeCellAttributes(treeCell, ["value", "label"]);
        }
    };
    
    /**
     * Creates a Tree Cell element - <treecell> - with 3 set attributes - "col", "label", "value".
     * @param {string} colName The name of the type of Tree Cell defined by the "col" attribute.
     * @param {string} label The "label" attribute value
     * @param {string} value The "value" attribute value
     * @returns {XULElement} The created Tree Cell XUL element.
     */
    this.createTreeCell = function(colName, label, value) {
        var treeCell = this.doc.createElement("treecell");
        treeCell.setAttribute("col", colName);
        treeCell.setAttribute("label", label);
        treeCell.setAttribute("value", value);
        return treeCell;       
    };

    this.init();
}

var Dm = new _Dm();