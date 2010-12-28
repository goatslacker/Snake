<?php

  // TODO - error handling

  $filename = "schema.json";
  $handle = fopen($filename, "r");
  $json = fread($handle, filesize($filename));
  fclose($handle);

  $decoded = json_decode($json, true);

  if ($decoded === NULL) {
    die("Cannot decode JSON -- Make sure it's properly formatted\n");
  }

  $o = $decoded['snake'];
  
  $jsfile = $o['database']['fileName'] . ".js";
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
