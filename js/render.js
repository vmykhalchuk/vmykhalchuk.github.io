const skins = [
  {
    gridLineStyle: 'black',//'#d3d3d3',
    gridLineWidth: 1
  }
];
let skin = skins[0];

let editorInfo = {
  headerRowHeight: 25,
  headerColumnWidth: 25,
  headerFont: '16px bold sans-serif',
  headerFontStyle: 'black'//'#636363'
}

let metaInfo = {
  defaultFont: {name: 'sans-serif', size: '16px', color: 'black'},
  backgroundColor: 'white',
  defaultColumnWidth: 60,
  defaultRowHeight: 17,
  rowsCount: 3,
  columnsCount: 5 // [A..E]
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
  width:0, height:0, scrollLeft:0, scrollTop:0,
  
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
      const w = this.util.getColumnWidth(i);
      ctx.beginPath();
      ctx.moveTo(x-this.scrollLeft, 0);
      ctx.lineTo(x-this.scrollLeft,this.height);
      ctx.stroke();
      
      x+= w+1;
    }
    
    ctx.beginPath();
    ctx.moveTo(x-this.scrollLeft, 0);
    ctx.lineTo(x-this.scrollLeft,this.height);
    ctx.stroke();
    
    ctx.restore();
  },

  renderHeaderWithoutVerticalLines: function() {
    const ctx = this.ctx;
    const bottom = editorInfo.headerRowHeight;
    ctx.save();
    
    ctx.fillStyle = "#f0ffff";
    ctx.fillRect(0, 0, this.width, bottom);
    
    ctx.strokeStyle = skin.gridLineStyle;
    ctx.lineWidth = skin.gridLineWidth;
    ctx.strokeRect(0, 0, this.width, bottom);

    ctx.font = editorInfo.headerFont;
    ctx.fillStyle = editorInfo.headerFontStyle;
    var x = 0;
    for (var i = 0; i < 5; i++) {
      const colTitle = this.util.getColumnName(i);
      const m = ctx.measureText(colTitle);
      const above = m.fontBoundingBoxAscent;
      const below = m['fontBoundingBoxDescent'];
      //console.log(`above: ${above}, below:${below}`);
      const height = above+below;
      const w = this.util.getColumnWidth(i);
      var dx;
      if (m.width > w) { // clipping will be needed here
        dx = 0;
      } else {
        dx = (w - m.width) / 2;
      }
      var dy;
      if (height > (bottom-2)) {
        dy = 0;
      } else {
        dy = (bottom-2-height) / 2
      }
      ctx.fillText(colTitle, x+dx-this.scrollLeft, bottom - dy - below-this.scrollTop);
      x += w+1;
    }
    
    ctx.restore();
  },

  renderRowsWithoutVerticalLines: function() {
    const ctx = this.ctx;
    // render in order: top->bottom then right to left
    for (var rowI = 0; rowI < dataRows.size; rowI++) {
      
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
