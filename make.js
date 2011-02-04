var sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , inputFile = process.argv[2] || "schema.js"
  , outputFile = process.argv[3] || "build/#{fileName}.js";

fs.readFile(inputFile, 'utf8', function (err, data) {
  if (err) {
    throw err;
  }

  var json = JSON.parse(data)
    , o = null
    , code = []
    , Model = []
    , Peer = []
    , sql = []
    , _sql = ""
    , innerSql = ""
    , columns = []
    , objName = ""
    , tableName = ""
    , table = null
    , columnName = ""
    , column = null
    , tmp = ""
    , foreign = []
    , foreignTable = ""
    , foreignKey = "";

  o = json.snake;

  outputFile = outputFile.replace(/#{fileName}/g, o.fileName);
 
  // TODO future, SQL error handling.
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
      table.columns.id = { type: "INTEGER", primaryKey: true };
      table.columns.created_at = { type: "INTEGER" };

      columns = [];
      foreign = [];

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

          // add the primary key
          if ('primaryKey' in column) {
            tmp = " PRIMARY KEY";
          } else {
            tmp = "";
          }

          // push for sql
          columns.push(columnName + " " + column.type + tmp);

          // TODO test multiple foreigns
          // adds any foreign references
          if ('foreign' in column) {
            tmp = column.foreign.split(".");
            foreignTable = tmp[0];
            foreignKey = tmp[1];
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
  fs.unlink(outputFile);

  // write to the file
  fs.writeFile(outputFile, code.join(""), 'utf8', function (err) {
    if (err) {
      throw err;
    }
  });
  
});
// TODO create BaseOM classes and other model classes that can be user written.
