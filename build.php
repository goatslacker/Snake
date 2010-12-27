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
  
  $jsfile = $o['database']['name'] . ".js";
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

    $fields[] = "id: { type: 'INTEGER' }, created_at: { TYPE: 'INTEGER' }"; // TODO field types

    foreach ($table['columns'] as $columnName => $column) {

      $columns[] = "'" . $columnName . "'";

      $columnTypes[$columnName] = array();
    
      $sqlColumns[] = "$columnName " . strtoupper($column['type']);

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
  " . implode(",\n  ", $innerCode) . "
});";

$innerCodePeer[] = "
  fields: {
    " . implode(",\n    ", $fields) . "
  }";

    $innerCodePeer[] = "columns: [ 'id', " . implode(", ", $columns) . ", 'created_at' ]";

    //$sql[] = "DROP TABLE '$tableName'"; // TODO add flag for drop existing
    $sql[] = $_sql . "(id INTEGER PRIMARY KEY, " . implode(", ", $sqlColumns) . ", created_at INTEGER)";

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

// TODO foreign stuff
/*
*/
/*


 // init sql
      var columns = [];
      var foreign = {
        key: [],
        table: [],
        reference: []
      };

          if (column.foreign) {
            var foreignItem = column.foreign.split(".");
            foreign.key.push(columnName);
            foreign.table.push(foreignItem[0]);
            foreign.reference.push(foreignItem[1]);
          }

        }
      }

      if (foreign.key.length > 0) { // TODO test
        sql = sql + " FOREIGN KEY (#{key}) REFERENCES #{table}(#{reference})".interpolate({
          key: foreign.key,
          table: foreign.table,
          reference: foreign.reference
        });
      }

      // load into config
      Snake.config.sql.push(sql);

















          if (column.foreign) {
            var foreignItem = column.foreign.split(".");
            foreign.push({
              key: columnName,
              table: foreignItem[0],
              reference: foreignItem[1]
            });
          }
*/

/*
      if (foreign.length > 0) {
        for (var i = 0; i < foreign.length; i = i + 1) {
          peer['doSelectJoin' + foreign.table] = function (criteria, callback) {
            criteria = criteria || new Snake.Criteria();

            //criteria.addJoin();
            criteria.executeSelect(this, callback);
          }
        }
*/
?>
