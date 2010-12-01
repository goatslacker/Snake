// execute setup
// should build all classes and maps...
var schema = {
  database: {
    name: "MyDB",
    version: "0.1", // default this
    displayName: "My Mojo-Driven database", // optional
    size: 200000 // default this
  },
  schema: {
    my_table: {
      jsName: "myTable",
      columns: {
        id: { type: "integer", primaryKey: true }, // make it so you don't have to include this
        num: { type: "real" },
        data: { type: "text" }
      }
    }
  }
};

//build sql
//Snake.db.create(schema);

// build on the fly objects
Snake.Schema(schema);

// execute query ?
function executeQuery () {
  var c = new Snake.Criteria();
  c.add(myTablePeer.NUM, 3, "GREATER_THAN");
  c.addDescendingOrderByColumn(myTablePeer.ID);
  c.setLimit(5);
  myTablePeer.doSelect(c, function (results) {
    console.log(results);
  });
}

function executeInsert () {
  var obj = new myTable();

  obj.num = 3;
  obj.data = 'hello world';
  obj.save();
}

function executeUpdate () {
  //var obj = myTablePeer.retrieveByPK(1);
  var obj = new myTable();
  obj.id = 1;
  obj.data = "Hrrrrrrr";
  obj.save();
}
