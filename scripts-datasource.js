/*
  record: {
    id: #number,
    parentId: #number, // this parent must be returned in the result list too
    childrenCount: , // how many children this node has
    data: {name,value,...}, // data object
  }

*/
/*
  Change management
  - every change is recorded with its eventId (every source of changes receives its set of ids to be used)
  - this set of ids is received as a resut of every server interaction
  - also every server interaction provides latest amount of changes recorded
*/


/*
    EXAMPLE DATA
    
  100: "MY NOTES" $notes_book
    101: "House" $notes_folder
      105: "Daily" $notes_folder
        111: "Electricity" $text_note
        112: "Electricity" $text_note
        113: "Electricity" $text_note
        114: "Electricity" $text_note
        115: "Electricity" $text_note
    102: "Daily ideas"
      
  500: "MY PROJECTS" $projects_book
    551: "Electronic" $projects_folder
      555: "High voltage" $projects_folder
        556: "ne555 12v to 400v" $project
          558: "idea1: jkhljhj" $text_note
          
  700: "PURCHASES (transactions)"
    701: "Aliexpress"
      702: "2023.10"
        707: "3W Leds @ $5/10pcs"|"received"$status
    710: "Kosmodrom"
      711: "2021.11.17"
        712: "resistors 220k"|"paid"$status

*/
var exampleData = {
  nodes: [
    {id:-100, parentId: null, children:[100,500,700], descr: "ROOT!!!"},
                                                                                                       
    {id: 100, parentId: -100, children:[101,102],       descr: "MY NOTES", meta: {hasChildren: true}, data: {type: "notes_book"}},
    {id: 101, parentId: 100,  children:[105],             descr: "House", data: {type: "notes_folder"}},
    {id: 105, parentId: 101,  children:[111],               descr: "Daily", data: {type: "notes_folder"}},
    {id: 111, parentId: 105,  children:[],                    descr: "Electricity", data: {type: "text_note"}},
    {id: 102, parentId: 100,  children:[],                descr: "Daily ideas", data: {type: "notes_folder"}},
                                                                                                   
    {id: 500, parentId: -100, children:[551],           descr: "MY PROJECTS", data: {type: "projects_book"}},
    {id: 551, parentId: 500,  children:[555],             descr: "Electronic", data: {type: "projects_folder"}},
    {id: 555, parentId: 551,  children:[556],               descr: "High voltage", data: {type: "projects_folder"}},
    {id: 556, parentId: 555,  children:[558],                 descr: "ne555 12v to 400v", data: {type: "project"}},
    {id: 558, parentId: 556,  children:[],                      descr: "idea1: jkhljhj", data: {type: "text_note"}},
                                                                                                     
    {id: 700, parentId: -100, children:[701,710],       descr: "PURCHASES (transactions)", data: {type: "purchase_book"}},
    {id: 701, parentId: 700,  children:[702],             descr: "Aliexpress", data: {type: "purchase_folder"}},
    {id: 702, parentId: 701,  children:[707],               descr: "2023.10", data: {type: "purchase"}},
    {id: 707, parentId: 702,  children:[],                    descr: "3W Leds @ $5/10pcs", data: {type: "product", status: "received"}},
    {id: 710, parentId: 700,  children:[711],             descr: "Kosmodrom", data: {type: "purchase_folder"}},
    {id: 711, parentId: 710,  children:[712],               descr: "2021.11.17", data: {type: "purchase"}},
    {id: 712, parentId: 711,  children:[],                    descr: "resistors 220k", data: {type: "product", status: "paid"}}
  ]
};

var dsCtx = {
  valMap: {}
}

var ds = {
  getRecordById: function(recId) {
    return {id: recId, parentId: 0, descr: "dummy ", data: {}};
  },
  loadRecordsForParent: function(parentId, levelsDeep, fromId, directChildrenLimit) {
    return [ds.getRecordById(100)];
  }
}

function _dsGetValById(id) {
  if (!dsCtx.valMap.hasOwnProperty("_" + id)) {
    dsCtx.valMap["_" + id] = getRandomInt(100);
  }
  return dsCtx.valMap["_" + id];
}

function _dsGetRecordById(id) {
  var val = _dsGetValById(id);
  return {id: id, data: {name: "n#" + id, value: val}};
}

function dsFetch(from, to, dataCallback) {
  f = function() {dataCallback.onCompleted();}
  tCb = function() {
    for (var id = from; id < to; id++) {
      dataCallback.onRecord(ds.getRecordById(id));//_dsGetRecordById(id));
    }
    setTimeout(f, 20);
  }
  setTimeout(tCb, 300);
}

function dsFetchParents(parentIds, dataCallback) {
  f = function() {dataCallback.onCompleted();}
  tCb = function() {
    for (var i = 0; i < parentIds.length; i++) {
      var id = parentIds[i];
      dataCallback.onRecord(_dsGetRecordById(id));
    }
    setTimeout(f, 20);
  }
  setTimeout(tCb, 200);
}
