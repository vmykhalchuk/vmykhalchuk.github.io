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
║├Leaf A.1
║└-Node A.2
║ ╚Leaf A.2.1
╚~Node B
 └+Node B.1

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

const treeNodesList = [
"~ROOT",
"╠~Node A",
"║├Leaf A.1",
"║└-Node A.2",
"║ ╚Leaf A.2.1",
"╚~Node B",
" └Node B.1"
];

var func1 = function() {
  const para = document.createElement("td"); para.id="hhh";
	const node = document.createTextNode("This is new.");
	para.appendChild(node);

	const div1 = document.getElementById("div1");
	const child = document.getElementById("p1");
	div1.insertBefore(para, child);
}

var ctx = {
  x: 0,
  y: 0, // -1 - top row (load more); -2 - bottom row (load more)
  width: 4, height: 5,
  
  editingCell: false
}

function deselectCell(x, y) {
  if (y === -1 || y === -2) {
    var cellTd = document.getElementById("navi_"+y);
  } else {
    var cellTd = document.getElementById("d_"+y+"_"+x);
  }
  cellTd.className = "cellNotSelected";
  cellTd.parentElement.className = "rowNotSelected";
}

function selectCell(x, y, movingUp) {
  if (y === -1 || y === -2) {
    var cellTd = document.getElementById("navi_"+y);
  } else {
    var cellTd = document.getElementById("d_"+y+"_"+x);
  }
  cellTd.className = "cellSelected";
  cellTd.parentElement.className = "rowSelected";
  
  scrollIntoViewIfNeeded(cellTd.parentElement);
}

function scrollIntoViewIfNeeded(cellTd) {
  const mainRect = document.getElementById("main01").getBoundingClientRect();
  const rect = cellTd.getBoundingClientRect();
  //console.log("4up: top: " + (rect.top - mainRect.top) + " bottom: " + (rect.bottom - mainRect.top));
  if ((rect.top - mainRect.top)<0 || (rect.bottom - mainRect.top)<0) {
    cellTd.scrollIntoView(true);
  }
  //console.log("4dn: top: " + (mainRect.bottom - rect.top) + " bottom: " + (mainRect.bottom - rect.bottom));
  if ((mainRect.bottom - rect.top)<0 || (mainRect.bottom - rect.bottom)<0) {
    cellTd.scrollIntoView(false);
  }
}
  
function myMove(dx, dy) {
  deselectCell(ctx.x, ctx.y);
  if (dx === 1 && ctx.x < (ctx.width - 1)) {
    ctx.x++;
  } else if (dx === -1 && ctx.x > 0) {
    ctx.x--;
  } else if (dy === 1) {
    if (ctx.y >= 0 && ctx.y < (ctx.height - 1)) {
      ctx.y++;
    } else if (ctx.y === -1) {
      ctx.y = 0;
    } else {
      ctx.y = -2;
    }
  } else if (dy === -1) {
    if (ctx.y > 0) {
      ctx.y--;
    } else if (ctx.y === -2) {
      ctx.y = ctx.height-1;
    } else {
      ctx.y = -1;
    }
  }
  selectCell(ctx.x, ctx.y);
}

function myCellClickHandler(cell) {
  deselectCell(ctx.x, ctx.y);
  ctx.x = parseInt(cell.id.split('_')[2]);
  ctx.y = parseInt(cell.id.split('_')[1]);
  selectCell(ctx.x, ctx.y);
}

function myCellClickHandler_v2(e) {
 	e = e || window.event;

  myCellClickHandler(e.target);

  var cellWasAlreadySelected = (ctx.lastCellClickedX == ctx.x) && (ctx.lastCellClickedY == ctx.y);
  ctx.lastCellClickedX = ctx.x;
  ctx.lastCellClickedY = ctx.y;

  if (cellWasAlreadySelected) editCellStart();
}

function myCellDblClickHandler_v2(e) {
 	e = e || window.event;
  const cell = e.target;
  myCellClickHandler(cell);
  editCellStart();
}

function myCellOnKeyDown(e) {
  e = e || window.event;
  if (e.keyCode == '13') { // Enter
    if (e.shiftKey) {
      return;
    }
    var cellTd = getCurrentEditableElement();
    cellTd.contentEditable = false;
    cellTd.blur();
    ctx.editingCell = false;
    document.getElementById("mainTable").focus();
  } else if (e.keyCode == '27') { // Esc
    var cellTd = getCurrentEditableElement();
    cellTd.contentEditable = false;
    alert(cellTd.innerHTML);
    cellTd.innerHTML = cellTd._savedInnerHTML;
    cellTd.blur();
    ctx.editingCell = false;
    document.getElementById("mainTable").focus();
  }
}

function myCellOnInputHandler(e) {
  // e: {data, dataTransfer, inputType, isComposing}
  //alert(e.inputType);
  // FIXME obfuscate html tags to keep formatting only (remove all tags but <b><i><font> etc)
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
  cell.id="navi_"+row.naviType;
  const typeArrow = navi.type === -1 ? "▲▲▲" : "▼▼▼";
  const cellText = document.createTextNode(typeArrow + " LOAD MORE...");
  cell.appendChild(cellText);
}

function insertRow(pos, record) {
  const mainTable = document.getElementById("mainTable");
  const row = mainTable.insertRow(pos);
  const recordId = record.id;
  row.record = record;
  for (let j = 0; j < ctx.width; j++) {
    const cell = row.insertCell(-1);
    cell.id="d_" + recordId + "_" + j;
    cell.onclick=myCellClickHandler_v2;
    cell.ondblclick=myCellDblClickHandler_v2;
    cell.onkeydown=myCellOnKeyDown;
    if (j == 0) {
      const elSpan = document.createElement("span");
      if (recordId < treeNodesList.length) {
        const t = treeNodesList[recordId];
        var ht = "<font color='red'>" + t.substr(0,1) + "</font>" + t.substr(1);
        elSpan.innerHTML = ht;
      } else {
        elSpan.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;<b>D</b>um";
      }

      cell.style.fontFamily = "monospace";
      cell.appendChild(elSpan);

      //cell.style.padding="0px 2px 0px 2px";
      cell.style.padding="0px 0px 0px 0px";
      cell.style.borderLeftWidth="2px";
      cell.style.borderLeftStyle="solid";
      
      
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
      if (j == 4) textVal = record.data.value;
      const cellText = document.createTextNode(textVal);
      cell.appendChild(cellText);
      //cell.innerHTML = "<font color='red'>|</font><font color='blue'>|</font><font color='red' weight='bold'>|</font>"

      cell.style.borderWidth="1px";
      cell.style.borderColor="grey";
      cell.style.borderTopStyle="solid";
      cell.style.borderRightStyle="solid";
      cell.oninput = myCellOnInputHandler;
    }
  }
}

function initialize() {
  var page = {from: 00, to: 40, records: []};
  
  var onRecordFn = function(rec) {
    page.records.push(rec);
  }
  
  var onPageLoadedFn = function() {
    ctx.width = 5;
    ctx.height = page.to - page.from;
    for (var i = 0; i < ctx.height; i++) {
      const record = page.records[i];
      insertRow(-1, record);
    }
    
    insertNaviRow(0, {type: -1/*top*/});
    insertNaviRow(ctx.height + 1 /* or -1 */, {type: -2/*bottom*/});

    selectCell(ctx.x, ctx.y);
  }
  
  dsFetch(page.from, page.to, {onRecord: onRecordFn, onCompleted: onPageLoadedFn});
}

function getCurrentEditableElement() {
  const cellTd = document.getElementById("d_"+ctx.y+"_"+ctx.x);
  if (cellTd._t === "treeNode") {
    return cellTd.childNodes[0].childNodes[1];
  } else {
    return cellTd;
  }
}

function editCellStart() {
  ctx.editingCell = true;
  const cellTd = getCurrentEditableElement();
  cellTd.contentEditable = true; //"plaintext-only"
  cellTd._savedInnerHTML = cellTd.innerHTML;
  cellTd.focus();
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
      myMove(0,-1);
      e.preventDefault();
    }
    else if (e.keyCode == '40') { // down arrow
      myMove(0,1);
      e.preventDefault();
    }
    else if (e.keyCode == '37') { // left arrow
      myMove(-1,0);
      e.preventDefault();
    }
    else if (e.keyCode == '39') { // right arrow
      myMove(1,0);
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
      //alert("Pressed: " + e.keyCode);
      console.log("onkeydown:" + e.keyCode);
    }
  };
  
  document.onkeypress = function(e) {
  	e = e || window.event;
    console.log("onkeypress:" + e.keyCode);
  };
}