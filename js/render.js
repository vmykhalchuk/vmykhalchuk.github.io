const skins = [
  {
    gridLineStyle: 'black',//'#d3d3d3',
    gridLineWidth: 1,
    headerBgColor: '#f5f5f5',
    headerSelectedBgColor: '#e0ffff', // when certain row/column belongs to selected area (cursor location is treated as one cell selection area)
    headerFullRowColSelectedBgColor: '#a0ffff', // when certain row/column is fully selected (by clicking on header)
    cursorRectangleColor: '#ffaaaa',
    cursorRectangleLineWidth: 2,
    selectionRectangleColor: '#ffaaaa',
    selectionRectangleLineWidth: 1,
  }
];
let skin = skins[0];

let editorInfo = {
  headerRowHeight: 25,
  headerColumnWidth: 25,
  headerFont: {
    name: 'sans-serif',
    sizePx: 18,
    bold: true, italic: false,
    color: 'black'
  },
  //headerFont: '16px bold sans-serif',
  //headerFontStyle: 'black',//'#636363'
  zoomScale: 1.5,
}

let metaInfo = {
  defaultFont: {
    name: 'sans-serif', 
    sizePx: 16,
    bold: false, italic: true,
    color: 'black'
  },
  backgroundColor: 'white',
  defaultColumnWidth: 60,
  defaultRowHeight: 23,
  rowsCount: 30,
  columnsCount: 5, // [A..E]
  
  cursorRow: 0,
  cursorCol: 0,
  
  selectionRowStart: 0,
  selectionRowsCount: 0,
  selectionColStart: 0,
  selectionColsCount: 0,
  
  fullRowSelectionStart: 0,
  fullRowSelectionCount: 0,
  fullColSelectionStart: 0,
  fullColSelectionCount: 0,
}

let columnsMetaInfo = [
  {width: 50},
  null,
  {hidden: true},
  null,
  null
];

let dataRows = [
  { type: 'GenericNode',
    height: 21,
    data: {
      'A': {text: 'Shopping Lists DB', style: {vAlign: 'right'}},
      'C': {formula:'=\'Lists: \' + count(thisRow.children.size)'}
  }},
  { type: 'GenericNode',
    data: {
      'A': {text: 'Maintenance Lists DB'},
      'B': {formula:'=\'Lists: \' + count(thisRow.children.size)'}
  }},
  { type: 'GenericNode',
    data: {
      'A': {text: 'Maintenance List: Honda CBF600SA'},
      'B': {formula:'=\'Items: \' + count(thisRow.children.size)'}
  }}
];

let dataRowsMetaInfo = [
  { collapsed: true, height: 25 },
  { hidden: true },
  {}
];

let dataRowsRenderData = [
  { dataRendered: {
    columns: {
      'C': { formulaText: 'Lists: 0' }
    }
  }},
  { dataRendered: {
    rowHeight: 17,
    columns: {
      'B': { formulaText: 'Lists: 1' }
    }
  }},
  { dataRendered: {
    rowHeight: 17,
    columns: {
      'B': { formulaText: 'Items: 1' }
    }
  }}
];


const rendererUtil = {
  setCtxFont: function(ctx, fontObj) {
    const boldStr = fontObj.bold ? 'bold' : '';
    const italicStr = fontObj.italic ? 'italic' : '';
    const scaledSizePx = fontObj.sizePx * editorInfo.zoomScale;
    ctx.font = `${boldStr} ${italicStr} ${scaledSizePx}px ${fontObj.name}`;
    ctx.fillStyle = fontObj.color;
  },
  
  setCtxFontStyleOnly: function(ctx, fontObj) {
    ctx.fillStyle = fontObj.color;
  },
  
  getColumnName: function(colNo) {
    return String.fromCharCode('A'.charCodeAt(0)+colNo);
  },

  getColumnWidth: function(colNo) {
    const colMeta = colNo < columnsMetaInfo.length ? columnsMetaInfo[colNo] : null;
    const colWidth = colMeta ? colMeta.width : null;
    return colWidth ? colWidth : metaInfo.defaultColumnWidth;
  }
};

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale
const renderer = {
  util: rendererUtil,
  
  canvas:null, ctx:null,
  width:null, height:null, scrollLeft:null, scrollTop:null,
  
  renderVerticalLines: function() {
    const ctx = this.ctx;
    ctx.save();
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    ctx.strokeStyle = skin.gridLineStyle;
    ctx.lineWidth = skin.gridLineWidth;

    var x = 0;
    for (var i = 0; i < 5; i++) {
      const w = this.util.getColumnWidth(i)*editorInfo.zoomScale;
      ctx.beginPath();
      ctx.moveTo(x-this.scrollLeft+0.5, 0.5);
      ctx.lineTo(x-this.scrollLeft+0.5,this.height+0.5);
      ctx.stroke();
      
      x+= w+1;
    }
    
    ctx.beginPath();
    ctx.moveTo(x-this.scrollLeft+0.5, 0.5);
    ctx.lineTo(x-this.scrollLeft+0.5,this.height+0.5);
    ctx.stroke();
    
    ctx.restore();
  },

  renderHeaderWithoutVerticalLines: function() {
    const { ctx, util, width, height, scrollLeft, scrollTop } = this; // destructuring
    const { setCtxFont, setCtxFontStyleOnly, getColumnName, getColumnWidth } = util;
    const hHeight = editorInfo.headerRowHeight * editorInfo.zoomScale;
    ctx.save();
    
    setCtxFont(ctx, editorInfo.headerFont);
    ctx.fillStyle = skin.headerBgColor;
    ctx.fillRect(0.5, 0.5, width, hHeight);
    
    // Note: there is one pixel margin between columns
    var x = 0;
    for (var i = 0; i < 5; i++) {
      const colTitle = getColumnName(i);
      const {selectionColStart, selectionColsCount, fullColSelectionStart, fullColSelectionCount} = metaInfo;
      const colSelectedF = (col) => {
        if (selectionColsCount > 0) {
          return (col >= selectionColStart && col < (selectionColStart+selectionColsCount));
        }
        return false;
      };
      const colFullySelectedF = (col) => {
        if (fullColSelectionCount > 0) {
          return (col >= fullColSelectionStart && col < (fullColSelectionStart+fullColSelectionCount));
        }
        return false;
      };
      const colSelected = colSelectedF(i);
      const colFullySelected = colFullySelectedF(i);
      const w = getColumnWidth(i) * editorInfo.zoomScale;

      // draw header bg rectangle (if selected || fullColSelected)
      if (colSelected || colFullySelected) {
        if (colFullySelected) {
          ctx.fillStyle = skin.headerFullRowColSelectedBgColor;
        } else {
          ctx.fillStyle = skin.headerSelectedBgColor;
        }
        ctx.fillRect(x+1+0.5, 0.5, w, hHeight);
      }

      // draw text
      const m = ctx.measureText(colTitle);
      const above = m.fontBoundingBoxAscent;
      const below = m['fontBoundingBoxDescent'];
      //console.log(`above: ${above}, below:${below}`);
      const h = above+below;
      var dx;
      if (m.width > w) { // clipping will be needed here
        dx = 0;
      } else {
        dx = (w - m.width) / 2;
      }
      var dy;
      if (h > (hHeight-2)) {
        dy = 0;
      } else {
        dy = (hHeight-2-h) / 2;
      }
      
      setCtxFontStyleOnly(ctx, editorInfo.headerFont);
      ctx.fillText(colTitle, x+dx-scrollLeft+0.5, hHeight-dy-below-scrollTop+0.5);
      x += w+1;
    }
    
    ctx.strokeStyle = skin.gridLineStyle;
    ctx.lineWidth = skin.gridLineWidth;
    ctx.strokeRect(0.5, 0.5, width, hHeight);

    ctx.restore();
  },

  renderRowsWithoutVerticalLines: function() {
    const { ctx, width, height, scrollLeft, scrollTop } = this; // destructuring
    const { setCtxFont, getColumnName, getColumnWidth } = this.util;

    setCtxFont(ctx, metaInfo.defaultFont);
    ctx.strokeStyle = skin.gridLineStyle;
    ctx.lineWidth = skin.gridLineWidth;

    // render in order: top->bottom then right to left
    for (var rowI = 0; rowI < dataRows.size; rowI++) {
      
    }
    
    const rh = metaInfo.defaultRowHeight*editorInfo.zoomScale;
    for (var i = 0; i < 100; i++) {
      let y = (50*editorInfo.zoomScale)+i*rh-scrollTop;
      ctx.fillText("Hgadasioum  bkmasfgk   jhtyu               ljkahsd    asgkfj          hsdgfk j  hasgkfjhsgdjk  asfhgk", 
            (20*editorInfo.zoomScale)-scrollLeft+0.5, y+(rh/4*3)+0.5);
      ctx.beginPath(); ctx.moveTo(0.5,y+rh+0.5); ctx.lineTo(width+0.5,y+rh+0.5); ctx.stroke();
    }
  },
  
  render: function(canvas, ctx, scrollLeft, scrollTop) {
    this.canvas = canvas; this.ctx = ctx;
    this.scrollLeft = scrollLeft; this.scrollTop = scrollTop;
    
    this.width = canvas.width;
    this.height = canvas.height;
    this.renderHeaderWithoutVerticalLines();
    this.renderRowsWithoutVerticalLines();
    this.renderVerticalLines();
  }
 
};
