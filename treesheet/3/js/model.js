let model = {
  rows: [
  ],
  meta: {
  }
};

let modelChanges = {
  snapshots: [
  ],
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
          101 - add column after {colId}, 102 - add column before {colId}, 103 - add column as a first column
          
          
          2 - update, 3 remove
    */
    {
      tmstmp: 347893798734,
      ops: [
        {
          t: 
          // add column
        }
      ]
    },
  ]
}