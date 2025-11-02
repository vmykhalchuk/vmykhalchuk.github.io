let model = {
  rows: [
  ],
  meta: {
  }
};

let modelChanges = {
  changes: [
    /*
      main concepts:
      colId: A,B,C,...AA,...
      rowId: 111.111.111.111 |  <prices>.123  (here <prices> is for 111.111.111)
      cellId: AXY111.111.111.111
      cellIdRange: ABC111:XYZ999.777
    */

    /*
      Functions:
      - aggregate type
        - SUM(<range>) | SUM, AVG, COUNT
      
    */
  
    /*
      list of operations (see GDocs)
    */
  
    /* t(type): 
          0 - noop,
          111 - add column(s) after {colId}, 112 - add column(s) before {colId}, 113 - add column(s) as a first column
                  cid:colId
                  cc:columnsCount
                  style: {width,bgcolor,leftBorder,rightBorder}
          
          121 - delete column(s) [{colId}]
          
          131 - resize column(s) [{colId}]
          132 - hide column(s) [{colId}]
          133 - show column(s) [{colId}]
          
          141 - modify cells in column {colId}
          
          2 - update, 3 remove
    */
    {
      tmstmp: 347893798734,
      ops: [
        { t: 113, cc: 2, w: 55, bc:'#1155ff', lb:2,lbc:'red' }
      ]
    },
  ]
}