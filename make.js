var sys = require("sys")
  , path = require("path")
  , fs = require("fs");

fs.readFile("schema.js", 'utf8', function (err, data) {
  if (err) {
    throw err;
  }

  var json = JSON.parse(data)
    , o = null
    , code = []
    , Model = []
    , Peer = []
    , jsFile = "build/#{fileName}.js"
    , sql = []
    , _sql = ""
    , innerSql = ""
    , columns = []
    , objName = ""
    , tableName = ""
    , table = null
    , columnName = ""
    , column = null
    , table_id = ""
    , foreign = []
    , foreignTable = ""
    , foreignKey = "";

  o = json.snake;

  jsFile = jsFile.replace(/#{fileName}/g, o.fileName);
 
  for (tableName in o.schema) {
    if (o.schema.hasOwnProperty(tableName)) {
      table = o.schema[tableName];
      objName = table.jsName;

      _sql = "";
      _sql = "CREATE TABLE IF NOT EXISTS '" + tableName + "'";

      // create the JS file obj
      json = {};
      json.model = {};
      json.peer = {};
      json.peer.tableName = tableName;
      json.peer.jsName = objName;
      json.peer.columns = [];
      json.peer.fields = {};

      // Adding id and created_at to all tables
      // TODO add ID to beginning and created_at to end.
      table.columns.id = { type: "INTEGER" };
      table.columns.created_at = { type: "INTEGER" };

      // loop through each column
      for (columnName in table.columns) {

        if (table.columns.hasOwnProperty(columnName)) {
          column = table.columns[columnName];

          // add to json
          json.model[columnName] = null;

          json.peer[columnName.toUpperCase()] = tableName + "." + columnName;
          json.peer.columns.push(columnName);

          json.peer.fields[columnName] = {};
          json.peer.fields[columnName].type = column.type;

          // push into fields && columns

          // push for sql
          columns.push(columnName + " " + column.type);

          // TODO test multiple foreigns
          // adds any foreign references
          if ('foreign' in column) {
            table_id = column.foreign.split(".");
            foreignTable = table_id[0];
            foreignKey = table_id[1];
            foreign.push("FOREIGN KEY (" + columnName + ") REFERENCES " + foreignTable + "(" + foreignKey + ")");
          }
        }
      }

      // joins the columns to the sql
      innerSql = columns.join(", ");
      if (foreign.length > 0) {
        innerSql = innerSql + ", " + foreign.join(", ");
      }

      Peer.push("var " + objName + "Peer = new Snake.BasePeer(" + JSON.stringify(json.peer) + ");");
      Model.push("var " + objName + " = new Snake.Base(" + objName + "Peer," + JSON.stringify(json.model) + ");");

      // push into sql Array
      sql.push(_sql + "(" + innerSql + ")");
    }
  }

  // Add the init sql queries to the object
  o.sql = sql;

  // push into the code output
  code.push("Snake.init(" + JSON.stringify(o) + ");");
  code.push("\n" + Peer.join("\n"));
  code.push("\n" + Model.join("\n"));

  // delete the file first
  fs.unlink(jsFile);

  // write to the file
  fs.writeFile(jsFile, code.join(""), 'utf8', function (err) {
    if (err) {
      throw err;
    }
  });
  
});
// TODO create BaseOM classes and other model classes that can be user written.
