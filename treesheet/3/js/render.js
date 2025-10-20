const skins = [
  {
    gridLineStyle: 'black',//'#d3d3d3',
    gridLineWidth: 1
  }
];
var skin = skins[0];

const editorInfo = {
  headerRowHeight: 25,
  headerColumnWidth: 25,
  headerFont: '16px bold sans-serif',
  headerFontStyle: 'black'//'#636363'
}

const metaInfo = {
  defaultFont: {name: 'sans-serif', size: '16px', color: 'black'},
  backgroundColor: 'white',
  defaultColumnWidth: 60,
  defaultRowHeight: 17,
  rowsCount: 3,
  columnsCount: 5 // [A..E]
}

const columnsMetaInfo = [
  {width: 50},
  null,
  {hidden: true},
  null,
  null
];

const dataRows = [
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

const dataRowsMetaInfo = [
  { collapsed: true, height: 25 },
  { hidden: true },
  {}
];

const dataRowsRenderData = [
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

function render(canvas, ctx, scrollLeft, scrollTop) {
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale
  const width = canvas.width;
  const height = canvas.height;
  renderHeaderWithoutVerticalLines(canvas, ctx, width, height);
  renderRowsWithoutVerticalLines(canvas, ctx);
  renderVerticalLines(canvas, ctx, width, height, scrollLeft, scrollTop);
}

function getColumnName(colNo) {
  return String.fromCharCode('A'.charCodeAt(0)+colNo);
}

function getColumnWidth(colNo) {
  const colMeta = colNo < columnsMetaInfo.length ? columnsMetaInfo[colNo] : null;
  const colWidth = colMeta ? colMeta.width : null;
  return colWidth ? colWidth : metaInfo.defaultColumnWidth;
}

function renderVerticalLines(canvas, ctx, width, height, scrollLeft, scrollTop) {
  ctx.save();
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  
  ctx.strokeStyle = skin.gridLineStyle;
  ctx.lineWidth = skin.gridLineWidth;

  var x = 0;
  for (var i = 0; i < 5; i++) {
    const w = getColumnWidth(i);
    ctx.beginPath();
    ctx.moveTo(x-scrollLeft, 0);
    ctx.lineTo(x-scrollLeft,height);
    ctx.stroke();
    
    x+= w+1;
  }
  
  ctx.beginPath();
  ctx.moveTo(x-scrollLeft, 0);
  ctx.lineTo(x-scrollLeft,height);
  ctx.stroke();
  
  ctx.restore();
}

function renderHeaderWithoutVerticalLines(canvas, ctx, width, height) {
  const bottom = editorInfo.headerRowHeight;
  ctx.save();
  
  ctx.strokeStyle = skin.gridLineStyle;
  ctx.lineWidth = skin.gridLineWidth;
  ctx.strokeRect(0, 0, width, bottom);

  ctx.font = editorInfo.headerFont;
  ctx.fillStyle = editorInfo.headerFontStyle;
  var x = 0;
  for (var i = 0; i < 5; i++) {
    const colTitle = getColumnName(i);
    const m = ctx.measureText(colTitle);
    const above = m.fontBoundingBoxAscent;
    const below = m['fontBoundingBoxDescent'];
    //console.log(`above: ${above}, below:${below}`);
    const height = above+below;
    const w = getColumnWidth(i);
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
    ctx.fillText(colTitle, x+dx, bottom - dy - below);
    x += w+1;
  }
  
  ctx.restore();
}

function renderRowsWithoutVerticalLines(canvas, ctx) {
  // render in order: top->bottom then right to left
  for (var rowI = 0; rowI < dataRows.size; rowI++) {
    
  }
}
