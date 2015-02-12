function DownloadManager() {
    var self = this;
    var TreeDOM = null;  // shorthand writing for the 'this.Dm.TreeDOM' object    
    
    // consts
    this.TREE_ID = "dmTree";
    this.TREE_FILE_MENUPOPUP_ID = "fileMenupopup";
    this.EXTENSION_DIRECTORY = "{bee6eb20-01e0-ebd1-da83-080329fb9a3a}2";
    this.XML_FILENAME = "dmTree.xml";
    
    // fields
    this.Dm = null;     // will be imported through a module
    this.main = null;   // reference to the main object (in overlay.js) - will be obtained from Dm.js module
    this.XMLFileDirectory = null;
    this.XMLOutputfile = null; // the XML document that is retrieved from the template (using the xmlhttprequest object)
    
    // consts
    this.KEY_ESC = 27;
    
    log = function(logInfo) { self.main.log(logInfo); }
    
    this.initialization = function() {
        self.loadModules();
        
        // load functions
        window.addEventListener("load", this.onLoad, false);
        window.addEventListener("keypress", this.onKeypress, false);
        
        // unload functions
        window.addEventListener("unload", this.onUnload, false);
    }

    this.loadModules = function() {
        Components.utils.import("resource://flashVideoDownload/Dm.js", this);
        this.main = this.Dm.main;
    }
    
    this.onLoad = function() {
        try {
            self.testWrite();
            self.XMLFileDirectory = self.getXMLFileLocationAsLocalFile();
            self.loadXML();
            self.Dm.window = window;
            self.Dm.TreeDOM.window = window;            // for debugging purposes
            self.Dm.TreeFileMenupopup.window = window;  // for debugging purposes
            self.Dm.TreeFileMenupopup.setMenupopup(document.getElementById(self.TREE_FILE_MENUPOPUP_ID));
        } catch(ex) {alert(ex);}
    }
    
    this.onUnload = function() {
        //self.saveXMLFile();
    }
    
    this.testWrite = function() {
        data = "yeah! it wrote again!";
        var file = Components.classes["@mozilla.org/file/directory_service;1"].  
                getService(Components.interfaces.nsIProperties).  
                get("TmpD", Components.interfaces.nsIFile);
        log(file);
        file.append("yeah.txt");        
        //file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        Components.utils.import("resource://gre/modules/NetUtil.jsm");
        Components.utils.import("resource://gre/modules/FileUtils.jsm");
        
        // file is nsIFile, dataToWrite is a string  
          
        // You can also optionally pass a flags parameter here. It defaults to  
        // FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;  
        var ostream = FileUtils.openSafeFileOutputStream(file);        
          
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].  
                        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);  
        converter.charset = "UTF-8";
        var istream = converter.convertToInputStream(data);  
          
        // The last argument (the callback) is optional.  
        NetUtil.asyncCopy(istream, ostream, function(status) {
            if (Components.isSuccessCode(status)) {
                alert("done!");
            }
            if (!Components.isSuccessCode(status)) {            
              // Handle error!  
              return;  
            }  
          
          // Data has been written to the file.  
        }); 
    }
    
    this.onKeypress = function(event) {
        if (event.keyCode == self.KEY_ESC) { window.close(); }
        
        if (event.keyCode == "13") {
        }
    }    
    
    this.loadXML = function() {        
        var ajax = new window.XMLHttpRequest();
        ajax.open('GET', "file:///" + this.XMLFileDirectory.path, true);
        ajax.setRequestHeader('Cache-Control', 'no-cache');        
        ajax.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
	
	ajax.onreadystatechange = function() {
            try {                
                if (this.readyState == 4) {
                    self.XMLOutputfile = this.responseXML;
                    self.Dm.TreeDOM.setTree(self.setTreeInDocument("mainBox"));  // does 2 things - sets the tree in the document and passes its reference to the TreeDOM module
                    TreeDOM = self.Dm.TreeDOM;  // shorthand writing for the 'TreeDOM' object
                    self.Dm.doc = document;     // sets a reference to a document so that elements can be created from "Dm" module
                    TreeDOM.setProtoTypeFunctions();
                    self.Dm.convertFilesListToXUL(self.Dm.FILE_TYPE.VIDEO);
                    self.Dm.convertFilesListToXUL(self.Dm.FILE_TYPE.FLASH);
                    document.getElementById("addButton").addEventListener("click", function() {
                        log(TreeDOM.getSelectedTreeItem());
                        log(TreeDOM.getSelectedRowsIndexes());
                        log(TreeDOM.getTreeCellValueByCol(TreeDOM.getSelectedTreeItem(), "fileUrl"));
                    } , false);
                    //var treeItemTest = self.Dm.TreeDOM.getElementById("http://www.youtube.com/watch?v=smSiCjYIvrM");
                    //log(treeItemTest.isContainer());
                    //treeItemTest = treeItemTest.getElementById("http://r2---sn-cx1x9-ua8s.c.youtube.com/videoplayback?ratebypass=yes&itag=44&ip=62.219.155.9&key=yt1&upn=B2XBdFyCMFQ&mt=1371485693&newshard=yes&gcr=il&fexp=911403%2C910207%2C900347%2C916626%2C900352%2C921047%2C924605%2C928201%2C901208%2C929117%2C929123%2C929121%2C929915%2C929906%2C929907%2C929125%2C925714%2C929919%2C931202%2C928017%2C912512%2C912515%2C912521%2C906906%2C904488%2C931910%2C931913%2C932227%2C904830%2C919373%2C906836%2C933701%2C904122%2C926403%2C912711%2C930618%2C930621%2C929606%2C910075&id=b264a20a3608beb3&expire=1371511287&sver=3&ipbits=8&cp=U0hWRlVMT19NUUNONl9NRlNDOnhiSWJDaXA3Y0pu&ms=au&source=youtube&sparams=cp%2Cgcr%2Cid%2Cip%2Cipbits%2Citag%2Cratebypass%2Csource%2Cupn%2Cexpire&mv=m&signature=10DFB402B87E828C2D93F64323D6A33970E4C53E.AB4494EA5D47588236065F6C3BE2DC47F5C50A71");
                    //log(treeItemTest.isContainer());
                    //log(TreeDOM.tree.getElementById("dmTree"));
                    //log(TreeDOM.tree.getElementById("http://www.youtube.com/watch?v=S6rtsmjdhJ8"));
                    //log(TreeDOM.tree.getElementById("http://www.youtube.com/yva_video?adformat=2_2_1&agcid=25209146957&autoplay=0&content_v=smSiCjYIvrM&controls=0&iv_load_policy=3&ps=trueview-instream&video_id=MrbXe75QXmU"));
                    //log(treeItemTest.getTreeCellByCol("quality").getParentTreeItem());
                    //log(treeItemTest.getTreeCellValueByCol("quality"));                    
                    //log(treeItemTest.getTreeCellValueByCol("title"));
		}
	    } catch (ex) {alert(ex); }
	}
	try {
	    ajax.send(null);
	} catch(ex) {alert(ex); }   // file not found
    }    
    
    this.getXMLFileLocationAsLocalFile = function() {
        var oFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile); // get profile folder                    
        oFile.append("extensions");
        oFile.append(this.EXTENSION_DIRECTORY);
        oFile.append("chrome");
        oFile.append("content");
        oFile.append(this.XML_FILENAME);
        
        return oFile;
    }
    
    this.saveXMLFile = function() {
        XMLDom = self.XMLOutputfile;
        var documentTree = document.getElementsByTagName("tree")[0];
        var XMLTree = XMLDom.getElementsByTagName("tree")[0];
        var newXMLTree = documentTree.cloneNode(true);
        XMLDom.getElementById("main-window").replaceChild(newXMLTree, XMLTree);
        
        var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        oFOStream.init(this.XMLFileDirectory, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
        (new XMLSerializer().serializeToStream(XMLDom.documentElement, oFOStream, "")); // rememeber, doc is the DOM tree
        oFOStream.close();
    }
    
    this.setTreeInDocument = function(appendTo_ElementId) {
        var XMLTree = self.XMLOutputfile.getElementsByTagName("tree")[0];
        var documentTree = XMLTree.cloneNode(true);
        document.getElementById(appendTo_ElementId).appendChild(documentTree);
        log(document.getElementById(appendTo_ElementId));
        
        return documentTree;
    }
    
    this.initialization();
}

var downloadManager = new DownloadManager();