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
  
  $handle = fopen($o['database']['name'] . ".js", 'w');

  $code = array();
  $sql = array();

  foreach ($o['schema'] as $tableName => $table) {

    $peer = "var {$table['jsName']}Peer = new Snake.BasePeer('{$tableName}');";
    $model = "var {$table['jsName']} = new Snake.Base({$table['jsName']}Peer);";

    $_sql = "CREATE TABLE IF NOT EXISTS '$tableName' ";

    $innerCode = array();
    $innerCodePeer = array();

    $columns = array();
    $columnTypes = array();
    $fields = array();

    $sqlColumns = array();

    foreach ($table['columns'] as $columnName => $column) {

      $columns[] = "'" . $columnName . "'";

      $columnTypes[$columnName] = array();
    
      $sqlColumns[] = "$columnName " . strtoupper($column['type']);

      $innerCode[] = "{$columnName}: null";
      $innerCodePeer[] = strtoupper($columnName) . ": '{$tableName}.{$columnName}'";
      $fields[] = "{$columnName}: { " . implode(", ", $columnTypes[$columnName]) . " }";
    }

$innerCodePeer[] = "
  fields: {
    " . implode(",\n    ", $fields) . "
  }";

    $innerCodePeer[] = "columns: [" . implode(", ", $columns) . "]";

    $sql[] = $_sql . "(" . implode(", ", $sqlColumns) . ")";

$code[] = "
{$peer}
{$table['jsName']}Peer.prototype = {
  " . implode(",\n  ", $innerCodePeer) . "
};

{$model}
{$table['jsName']}.prototype = {
  " . implode(",\n  ", $innerCode) . "
};
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
