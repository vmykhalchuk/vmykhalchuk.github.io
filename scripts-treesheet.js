/*

Displays tree grid with simple Table
 - First column is for system flags
 - Second column is for tree structure
 - Third column is for name and indentation

Example tree structure
// symbols are here: https://en.wikipedia.org/wiki/Code_page_437

// v1
- ROOT
- ├─Node A
  │ ├─Leaf A.1
+ │ └─Node A.2
- └─Node B
+   └─Node B.1
     
     
// v2
~ROOT
├~Node A
│├ Leaf A.1
│└+Node A.2
└~Node B
└+Node B.1
     
// v2-open
 -ROOT
 ├ -Node A
 │ ├  Leaf A.1
 │ └ -Node A.2
 │   └  Leaf A.2.1
 └ -Node B
   └ +Node B.1
     

// v3
~ROOT
╠~Node A
║├-Leaf A.1
║├~Node A.2
║│╚-Leaf A.2.1
║└+Node A.3
╚~Node B
 └~Node B.1
  ╚-Leaf

// v4
║│║│▼ RNODE
║│║│╠▼ Node A
║│║│║├ Leaf A.1
║│║│║└▼ Node A.2
║│║│║ ╚ Leaf A.2.1
║│║│╚▼Node B
║│║│ └►Node B.1
║│║├ Leaf X.53


.
└── Edit me to generate/
    ├── a/
    │   └── nice/
    │       └── tree/
    │           ├── diagram!
    │           └── :)
    └── Use indentation/
        ├── to indicate/
        │   ├── file
        │   ├── and
        │   ├── folder
        │   └── nesting.
        └── You can even/
            └── use/
                ├── markdown
                └── bullets!

*/

const debugTree = true;

const treeNodesList = [
"~",
"╠~",
"║├",
"║└-",
"║ ╚",
"╚~",
" └"
];

const treeNodesList2 = [
"ROOT",
"Node A",
"Leaf A.1",
"Node A.2",
"Leaf A.2.1",
"Node B",
"Node B.1"
];

window.ctx = {
  isMobile: false,
  x: 0,
  y: 0, // "top" - top row (load more); "bottom" - bottom row (load more)
  width: 4, height: 5,
  
  rootId: 0,
  // nodes Map consists of objects {id, parentId, descr, data}, and is mapped by every object id
  nodes: new Map(), // id => node
  nodeIdsByParentId: new Map(), // parentId => set of nodeIds
  openNodeIds: new Set(),
  nextNodeId: new Map(), // nodeId => nodeId
  prevNodeId: new Map(), // nodeId => nodeId
  
  editingCell: false
}

function deselectCell(x, y) {
  if (y === "top" || y === "bottom") {
    var cellTd = document.getElementById("navi_"+y);
  } else {
    var cellTd = document.getElementById("data_"+y+"_"+x);
  }
  cellTd.className = "cellNotSelected";
  cellTd.parentElement.className = "rowNotSelected";
}

function selectCell(x, y, movingUp) {
  if (y === "top" || y === "bottom") {
    var cellTd = document.getElementById("navi_"+y);
  } else {
    var cellTd = document.getElementById("data_"+y+"_"+x);
  }
  cellTd.className = "cellSelected";
  cellTd.parentElement.className = "rowSelected";
  
  if (!ctx.isMobile) scrollIntoViewIfNeeded(cellTd.parentElement);
}

function _pos(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === id) return i;
  }
  return null;
}

// find latest node of {id} subtree (take into account closed nodes)
function findLatestOpenNodeFor(id) {
  while (true) {
    let n = ctx.nodes.get(id);
    if (n.children.length === 0 || !ctx.openNodeIds.has(id)) return id;
    id = n.children[n.children.length - 1];
  }
}

function findNavigatedPreviousId(id) {
  if (id === ctx.rootId) {
    return ctx.rootId;
  }
  let parent = ctx.nodes.get(ctx.nodes.get(id).parentId);
  let pos = _pos(parent.children, id);
  if (pos === 0) {
    return parent.id;
  } else {
    id = parent.children[pos - 1];
    return findLatestOpenNodeFor(id);
  }
}

function findNavigatedNextId(id) {
  let n = ctx.nodes.get(id);
  if (n.children.length > 0 && ctx.openNodeIds.has(id)) {
    return n.children[0];
  }
  
  while (true) {
    if (n.id === ctx.rootId) return null;
    
    let p = ctx.nodes.get(n.parentId);
    let nPos = _pos(p.children, n.id);
    if (nPos < (p.children.length - 1)) {
      return p.children[nPos + 1];
    } else {
      n = p;
    }
  }
}

function myMove(dir) {
  deselectCell(ctx.x, ctx.y);
  if (dir === "right" && ctx.y !== "top" && ctx.y !=="bottom" && ctx.x < (ctx.width-1)) {
    ctx.x++;
  } else if (dir === "left" && ctx.y !== "top" && ctx.y !=="bottom" && ctx.x > 0) {
    ctx.x--;
  } else if (dir === "up") {
    if (ctx.y === "top") {
    } else if (ctx.y === "bottom") {
      ctx.y = findLatestOpenNodeFor(ctx.rootId);
    } else {
      ctx.y = (ctx.y === ctx.rootId) ? "top" : findNavigatedPreviousId(ctx.y);
    }
  } else if (dir === "down") {
    if (ctx.y === "top") {
      ctx.y = ctx.rootId;
    } else if (ctx.y === "bottom") {
    } else {
      let nextId = findNavigatedNextId(ctx.y);
      if (nextId === null) {
        ctx.y = "bottom";
      } else {
        ctx.y = nextId;
      }
    }
  }
  selectCell(ctx.x, ctx.y);
}

function myCellClickHandlerBasic(cell) {
  const idSegments = cell.id.split('_');
  if (idSegments.length == 2 && idSegments[0] == "navi") {
    if (idSegments[1] === "top" || idSegments[1] === "bottom") {
      deselectCell(ctx.x, ctx.y);
      ctx.y = idSegments[1];
      selectCell(ctx.x, ctx.y);
    }
  } else if (idSegments.length == 3 && idSegments[0] == "data") {
    const newX = parseInt(idSegments[2]);
    const newY = parseInt(idSegments[1]);
    if (isNaN(newX) || isNaN(newY)) {
      if (cell.parentElement !== document) {
        myCellClickHandlerBasic(cell.parentElement);
      } else {
        console.log("ERROR: Reached root: " + cell);
      }
    } else {
      deselectCell(ctx.x, ctx.y);
      ctx.x = newX;
      ctx.y = newY;
      selectCell(ctx.x, ctx.y);
    }
  } else {
    if (cell.parentElement !== document) {
      myCellClickHandlerBasic(cell.parentElement);
    } else {
      console.log("Bad ID! " + cell.id + "/" + cell);
      alert("Bad ID! " + cell.id + "/" + cell);
    }
  }
}

function myCellClickHandler(e) {
 	e = e || window.event;

  if (ctx.editingCell) return;
  
  myCellClickHandlerBasic(e.target);

  var cellWasAlreadySelected = (ctx.lastCellClickedX === ctx.x) && (ctx.lastCellClickedY === ctx.y);
  ctx.lastCellClickedX = ctx.x;
  ctx.lastCellClickedY = ctx.y;

  if (cellWasAlreadySelected) editCellStart();
}

function myCellDblClickHandler(e) {
 	e = e || window.event;
  const cell = e.target;

  if (ctx.editingCell) return;

  ctx.lastCellClickedX = null; ctx.lastCellClickedY = null;
  myCellClickHandlerBasic(cell);
  editCellStart();
}

function myNaviCellOnKeyDown(e) {
}

function myDataCellOnBlur(e) {
  //myDataCellOnKeyDown({keyCode: '130'});
  if (ctx.editingCell) {
    var cellTd = getCurrentEditableElement();
    if (cellTd._type === "treeNodeConstruct") {
      cellTd._nodeNameHTML = cellTd.innerHTML;
      cellTd.innerHTML = cellTd._nodeConstructHTML + cellTd._nodeNameHTML;
    }
    cellTd.contentEditable = false;
    ctx.editingCell = false;
    
    if (!ctx.isMobile) { cellTd.blur(); document.getElementById("mainTable").focus(); }
  }
}

function myDataCellOnKeyDown(e) {
  e = e || window.event;
  
  if (ctx.isMobile) return;
  
  if (e.keyCode == '13') { // Enter
    //e.preventDefault();
    if (e.shiftKey) {
      return;
    }
    var cellTd = getCurrentEditableElement();
    if (!ctx.isMobile) cellTd.blur();
    //myDataCellOnBlur();
  /*} else if (e.keyCode == '13') { // Enter
    if (e.shiftKey) {
      return;
    }
    var cellTd = getCurrentEditableElement();
    console.log("ctx.editingCell=" + ctx.editingCell);
    if (cellTd._type === "treeNodeConstruct" && ctx.editingCell) {
      cellTd._nodeNameHTML = cellTd.innerHTML;
      cellTd.innerHTML = cellTd._nodeConstructHTML + cellTd._nodeNameHTML;
    }
    cellTd.contentEditable = false;
    ctx.editingCell = false;
    
    cellTd.blur();
    if (!ctx.isMobile) document.getElementById("mainTable").focus();*/
  /*} else if (e.keyCode == '27') { // Esc
    var cellTd = getCurrentEditableElement();
    if (cellTd._type === "treeNodeConstruct") {
      cellTd.innerHTML = cellTd._nodeConstructHTML + cellTd._nodeNameHTML;
    } else {
      cellTd.innerHTML = cellTd._savedInnerHTML;
    }
    cellTd.contentEditable = false;
    ctx.editingCell = false;
    
    if (!ctx.isMobile) { cellTd.blur(); document.getElementById("mainTable").focus(); }*/
  }
}

function myCellOnInputHandler(e) {
  // e: {data, dataTransfer, inputType, isComposing}
  //alert(e.inputType);
  // FIXME obfuscate html tags to keep formatting only (remove all tags but <b><i><font> etc)
}

function getCurrentEditableElement() {
  if (isNaN(ctx.y)) return null;
  return document.getElementById("data_"+ctx.y+"_"+ctx.x);
}

function editCellStart() {
  const cellTd = getCurrentEditableElement();
  if (!cellTd) return;
  
  if (cellTd._type === "treeNodeConstruct") {
    cellTd._savedInnerHTML = cellTd._nodeNameHTML;
    cellTd.innerHTML = cellTd._nodeNameHTML;
  } else {
    cellTd._savedInnerHTML = cellTd.innerHTML;
  }
  ctx.editingCell = true;
  cellTd.contentEditable = true; //"plaintext-only" allows only plain text to be entered/inserted
  if (!ctx.isMobile) cellTd.focus();
  setCursorAtEnd(cellTd); //selectElementContents(cellTd); <- to select whole text
}

function myCreateSvg() {
  var svg   = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var svgNS = svg.namespaceURI;
  svg.setAttribute('width',8);
  svg.setAttribute('height',"240");
  svg.setAttribute('display','block');
  svg.setAttribute('object-fit','cover');
  
  //svg.setAttribute('viewBox',[0,0,10,64]);
  //svg.setAttribute('preserveAspectRatio','xMinYMin');

  var rect = document.createElementNS(svgNS,'rect');
  rect.setAttribute('x',3);
  rect.setAttribute('y',0);
  rect.setAttribute('width',2);
  rect.setAttribute('height',240);
  rect.setAttribute('fill','#95B3D7');
  svg.appendChild(rect);
  
  return svg;
}

function insertNaviRow(pos, navi) {
  const mainTable = document.getElementById("mainTable");
  const row = mainTable.insertRow(pos);
  row.naviType = navi.type;
  const cell = row.insertCell(-1);
  cell.colSpan=ctx.width;
  cell.id="navi_"+row.naviType;
  cell.onclick=myCellClickHandler;
  //cell.ondblclick=myCellDblClickHandler;
  cell.onkeydown=myNaviCellOnKeyDown;
  const typeArrow = navi.type === "top" ? "▲▲▲" : "▼▼▼";
  const cellText = document.createTextNode(typeArrow + " LOAD MORE...");
  cell.appendChild(cellText);
}

// v3
//~ROOT
//╠~Node A
//║├ Leaf A.1
//║├~Node A.2
//║│╚ Leaf A.2.1
//║└+Node A.3
//╚~Node B
// └~Node B.1
//  ╚ Leaf

function createTreeScaffold(record) {
  let res = "";
  if (record.children.length > 0) {
    res = ctx.openNodeIds.has(record.id) ? "-" : "+";
  } else {
    res = " ";//"·";
  }
  let r = record;
  let v1 = true;
  while (true) {
    if (r.id === ctx.rootId) {
      return res;
    }
    
    let s;
    let p = ctx.nodes.get(r.parentId);
    if (p.children[p.children.length - 1] !== r.id) {
      s = v1 ? "├" : "│";
    } else {
      s = v1 ? "└" : " ";
    }
    v1 = false;
    res = s + res;
    
    r = ctx.nodes.get(r.parentId);
  }
  
  return res;
}

const scaffoldColors = ["black", "blue", "orange"];

function enhanceTreeScaffold(txt) {
  
  let res = "<font color='red'>" + txt.substr(txt.length - 1) + "</font>";
  txt = txt.substr(0, txt.length - 1);
  
  let resTxt = "";
  for (let i = 0; i < txt.length; i++) {
    let c = txt.charAt(i);
    if (i % 2 == 0) {
      if      (c === '│') c = '║';
      else if (c === '├') c = '╠';
      else if (c === '└') c = '╚';
    }
    let color = scaffoldColors[i % scaffoldColors.length];
    resTxt += "<font color='" + color + "'>" + c + "</font>";
  }
  
  res = resTxt + res;
  return "<font size='5'>" + res + "</font>";
}

function insertDataRow(pos, record) {
  const mainTable = document.getElementById("mainTable");
  const row = mainTable.insertRow(pos);
  const recordId = record.id;
  row.record = record;
  for (let j = 0; j < ctx.width; j++) {
    const cell = row.insertCell(-1);
    cell.id="data_" + recordId + "_" + j;
    cell.onclick=myCellClickHandler;
    cell.ondblclick=myCellDblClickHandler;
    cell.onkeydown=myDataCellOnKeyDown;
    cell.onblur=myDataCellOnBlur;
    if (j == 0) {
      cell._type = "treeNodeConstruct";
      cell._nodeConstruct = enhanceTreeScaffold(createTreeScaffold(record));//treeNodesList[recordId];
      cell._nodeNameHTML = record.descr;//treeNodesList2[recordId];
      const elSpan = document.createElement("span");
      
      cell._nodeConstructHTML = cell._nodeConstruct;
      elSpan.innerHTML = cell._nodeConstructHTML + cell._nodeNameHTML;

      cell.style.fontFamily = "monospace";
      cell.appendChild(elSpan);

      //cell.style.padding="0px 2px 0px 2px";
      cell.style.padding="0px 0px 0px 0px";
      cell.style.borderLeftWidth="2px";
      cell.style.borderLeftStyle="solid";
      cell.style.whiteSpace="pre"; //nowrap|pre
      
      
      if (false) {
        cell._t = "treeNode";
        
        cell.style.position="relative";
        cell.style.overflow="hidden";
        cell.style.width="20px";
        
        const div = document.createElement("div");
        div.style.display="flex"; div.style.alignItems="flex-start"; div.style.overflow="hidden";
        div.style.position="absolute"; div.style.height="100%"; div.style.top=0;
        div.className = "textNextToSvg";
        var svg = myCreateSvg();
        //svg.style.flexShrink = 0; svg.style.height = "1em"; svg.style.width = "1em";
        svg.style.position="absolute"; svg.style.height="100%";
        const el2 = document.createElement("span");
        el2.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;<b>D</b>um"

        div.appendChild(svg);
        div.appendChild(el2);

        cell.appendChild(div);

        //cell.style.padding="0px 2px 0px 2px";
        cell.style.padding="0px 0px 0px 0px";
        cell.style.borderLeftWidth="2px";
        cell.style.borderLeftStyle="solid";
      }

    } else if (j == 1) {
      if (false) {
        const para = document.createElement("div");
        para.class="monospace";
        para.innerHTML = "<span>|</span><span>|</span><span>+</span>";
        cell.appendChild(para);
        cell.style.padding="0px 0px 0px 0px";
      }
        
    } else {
      var textVal;
      if (j == 2) textVal = record.id;
      if (j == 3) {
        textVal = record.descr;
        if (record.id < treeNodesList.length) {
          textVal = treeNodesList[record.id];
        }
        cell.style.fontFamily = "monospace";
      }
      if (j == 4) textVal = record.data ? record.data.value : "<u><i>empty</i></u>";
      const cellText = document.createTextNode(textVal);
      cell.appendChild(cellText);

      cell.style.borderWidth="1px";
      cell.style.borderColor="grey";
      cell.style.borderTopStyle="solid";
      cell.style.borderRightStyle="solid";
      cell.oninput = myCellOnInputHandler;
    }
  }
}

function initialize() {
  ctx.isMobile = mobileCheck();
  const appVDiv = document.getElementById("appVersionDiv");
  appVDiv.innerText = appVDiv.innerText + "<" + (ctx.isMobile ? 'm' : 'd') + ">";
  
  let page = {from: 00, to: 40, records: []};
  
  let onRecordFn = function(rec) {
    page.records.push(rec);
  }
    
  let onPageLoadedFn = function() {
    ctx.width = 5;
    /*ctx.height = page.to - page.from;
    for (let i = 0; i < ctx.height; i++) {
      const record = page.records[i];
      insertDataRow(-1, record);
    }*/
    
    ctx.height = 0;
    ctx.rootId = -100; // initialize rootId (load from DataSource)
    const recs = exampleData.nodes;
    for (const r of recs) {
      ctx.nodes.set(r.id, r);
      if (!ctx.nodeIdsByParentId.has(r.parentId)) {
        ctx.nodeIdsByParentId.set(r.parentId, new Set());
      }
      ctx.nodeIdsByParentId.get(r.parentId).add(r.id);
    }
    ctx.openNodeIds.add(ctx.rootId);
    
    for (const r of recs) {
      if (r.id === ctx.rootId) {
        insertDataRow(-1, r);
        ctx.height++;
        ctx.y = ctx.rootId;
        ctx.x = 0;
        break;
      }
    }
    for (const r of recs) {
      if (debugTree || r.parentId === ctx.rootId) {
        if (debugTree) {
          if (r.id === ctx.rootId) continue;
          if (r.children.length > 0) ctx.openNodeIds.add(r.id);
        }
        insertDataRow(-1, r);
        ctx.height++;
      }
    }
    
    insertNaviRow(0, {type: "top"});
    insertNaviRow(ctx.height + 1 /* or -1 */, {type: "bottom"});

    selectCell(ctx.x, ctx.y);
  }
  
  dsFetch(page.from, page.to, {onRecord: onRecordFn, onCompleted: onPageLoadedFn});
}

function onExpandCollapseButtonClick() {
  const cellTd = getCurrentEditableElement();
  if (!cellTd) alert("No cell selected!")
  else alert("cell: " + cellTd.id);
}

window.onload= function() {
  initialize();
  
  document.onkeydown = function(e) {
  	e = e || window.event;
    
    if (ctx.editingCell) {
      return;
    }
    
    if (!document.hasFocus()) return;
    var mainTable = document.getElementById("mainTable");
    //if (!mainTable.hasFocus()) return;
    if (document.activeElement !== mainTable) return;
    
    
    if (e.keyCode == '38') { // up arrow
      myMove("up");
      e.preventDefault();
    }
    else if (e.keyCode == '40') { // down arrow
      myMove("down");
      e.preventDefault();
    }
    else if (e.keyCode == '37') { // left arrow
      myMove("left");
      e.preventDefault();
    }
    else if (e.keyCode == '39') { // right arrow
      myMove("right");
      e.preventDefault();
    }
    else if (e.keyCode == '113') { // F2
      editCellStart();
      e.preventDefault();
    }
    else {
      // F2   -> 113
      // Shft -> 16
      // Ctrl -> 17
      // Alt  -> 18
      //console.log("onkeydown:" + e.keyCode);
    }
  };
  
  document.onkeypress = function(e) {
  	e = e || window.event;
    //console.log("onkeypress:" + e.keyCode);
  };
}