var sys = require("sys")
  , path = require("path")
  , fs = require("fs");

fs.readFile("schema.js", 'utf8', function (err, data) {
  var json = JSON.parse(data)
    , o = null
    , jsFile = "build/#{fileName}.js"
    , sql = []
    , columns = []
    , objName = ""
    , tableName = ""
    , table = null
    , columnName = ""
    , column = null
    , foreign = []
    , foreignTable = ""
    , foreignKey = "";

  o = json.snake;

  jsFile = jsFile.replace(/#{fileName}/g, o.fileName);
 
  // if file exists, unlink

  // open handle to write to file? Not yet.

  var sql = [];

  for (tableName in o.schema) {
    if (o.schema.hasOwnProperty(tableName)) {
      table = o.schema[tableName];
      objName = table.jsName;

      var _sql = "";
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
            var table_id = column.foreign.split(".");
            foreignTable = table_id[0];
            foreignKey = table_id[1];
            foreign.push("FOREIGN KEY (" + columnName + ") REFERENCES " + foreignTable + "(" + foreignKey + ")");
          }
        }
      }

      // joins the columns to the sql
      var innerSql = columns.join(", ");
      if (foreign.length > 0) {
        innerSql = innerSql + ", " + foreign.join(", ");
      }
/*
var {$table['jsName']}Peer = new Snake.BasePeer({
  tableName: '$tableName',
  jsName: '{$table['jsName']}',
  ID: '$tableName.id',
  CREATED_AT: '$tableName.created_at',
  " . implode(",\n  ", $innerCodePeer) . "
});
{$model}

var Dream = Snake.Base.extend({
  init: function () {
    this._super(DreamPeer);
  },
  id: null,
  created_at: null,
  title: null,
  summary: null,
  dream_date: null
});
*/

//var test = objName + "Peer = new Snake.BasePeer({});";
//TODO
var Peer = "var " + objName + "Peer = new Snake.BasePeer({" + JSON.stringify(json.peer) + "})";
var Model = "var " + objName + " = new Snake.Base.extend({ init: function () { this._super(" + objName + "Peer); }, " + JSON.stringify(json.model) + "})";
console.log(Model);

      // push into sql Array
      sql.push(_sql + "(" + innerSql + ")");
    }
  }


  //console.log(sql);
});


/*
  $jsfile = "build/" . $o['fileName'] . ".js";
  if (file_exists($jsfile)) {
    unlink($jsfile);
  }
  $handle = fopen($jsfile, 'w');

  $code = array();
  $sql = array();

  foreach ($o['schema'] as $tableName => $table) {

    $_sql = "CREATE TABLE IF NOT EXISTS '$tableName' ";

    $innerCode = array();
    $innerCodePeer = array();

    $columns = array();
    $columnTypes = array();
    $fields = array();

    $sqlColumns = array();

    $foreign = array();

    $foreignObj = array();



    $fields[] = "id: { type: 'INTEGER' }, created_at: { TYPE: 'INTEGER' }"; 

    foreach ($table['columns'] as $columnName => $column) {

      $columns[] = "'" . $columnName . "'";

      $columnTypes[$columnName] = array();
    
      $sqlColumns[] = "$columnName " . strtoupper($column['type']);

      if (array_key_exists('foreign', $column)) {
        list($foreign_table, $foreign_reference) = explode(".", $column['foreign']);

        $foreign[] = "FOREIGN KEY ({$columnName}) REFERENCES {$foreign_table}({$foreign_reference})";
        $foreignObj[] = $foreign_table . ": {}";
      }
>>>>>>>>>>POINTER     >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      $innerCode[] = "{$columnName}: null";
      $innerCodePeer[] = strtoupper($columnName) . ": '{$tableName}.{$columnName}'";
      $fields[] = "{$columnName}: { type: '{$column['type']}' }";
    }

$model = "var {$table['jsName']} = Snake.Base.extend({
  init: function () {
    this._super({$table['jsName']}Peer);
  },
  id: null,
  created_at: null,
  " . implode(",\n  ", $innerCode);
  if (count($foreignObj) > 0) { $model .= ",
  " . implode(",\n ", $foreignObj);
  }
$model .= "
});";

$innerCodePeer[] = "
  fields: {
    " . implode(",\n    ", $fields) . "
  }";

    $innerCodePeer[] = "columns: [ 'id', " . implode(", ", $columns) . ", 'created_at' ]";

    //$sql[] = "DROP TABLE '$tableName'"; // TODO add flag for drop existing
    if (count($foreign)) {
      $foreign = ", " . implode(", ", $foreign);
    }
    $sql[] = $_sql . "(id INTEGER PRIMARY KEY, " . implode(", ", $sqlColumns) . ", created_at INTEGER{$foreign})";

$code[] = "
var {$table['jsName']}Peer = new Snake.BasePeer({
  tableName: '$tableName',
  jsName: '{$table['jsName']}',
  ID: '$tableName.id',
  CREATED_AT: '$tableName.created_at',
  " . implode(",\n  ", $innerCodePeer) . "
});
{$model}
";

  }


  $o['sql'] = $sql;
  $new_json = json_encode($o);

$data = "Snake.init({$new_json});
" . implode("", $code);

  fwrite($handle, $data);
  fclose($handle);
*/
