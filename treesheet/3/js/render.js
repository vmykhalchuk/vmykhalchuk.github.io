
const metaInfo = {
  defaultFont: {name: 'sans-serif', size: '16px', color: 'black'},
  backgroundColor: 'white',
  defaultColumnWidth: 60,
  defaultRowHeight: 17,
  rowsCount: 3,
  columnsCount: 5 // [A..E]
}

const columnsMetaInfo = {
  'A': {width: 50},
  'C': {hidden: true}
};

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

function render(canvas) {
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale
  renderRows(canvas);
}

function renderRows(canvas) {
  // render in order: top->bottom then right to left
  for (var rowI = 0; rowI < dataRows.size; rowI++) {
    
  }
}