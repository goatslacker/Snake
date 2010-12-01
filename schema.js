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
    card: {
      jsName: "Card",
      columns: {
        id: { type: "integer", primaryKey: true }, // TODO make it so you don't have to include this
        card: { type: "text" },
        type: { type: "text" }
      }
    },
    stack: {
      jsName: "Stack",
      columns: {
        id: { type: "integer", primaryKey: true },
        stack_id: { type: "integer", index: true },
        card_id: { type: "integer", foreignReference: "card", foreignKey: "id", foreign: "card.id" }
      }
    },
    player: {
      jsName: "Player",
      columns: {
        id: { type: "integer", primaryKey: true },
        stack_id: { type: "integer", foreignReference: "stack", foreignKey: "id", foreign: "stack.id" },
        name: { type: "text" },
        created_at: { type: "integer" }
      }
    }
  }
};

// build on the fly objects
Snake.buildModel(schema);

//build sql
Snake.buildSql(schema);

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
