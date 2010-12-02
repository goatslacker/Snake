<?php

  $filename = "schema.json";
  $handle = fopen($filename, "r");
  $json = fread($handle, filesize($filename));
  fclose($handle);

  $o = json_decode($json, true);

  if ($o === NULL) {
    die("Cannot decode JSON -- Make sure it's properly formatted\n");
  }

  $handle = fopen($o['database']['name'] . ".js", 'w');

// TODO put this in Snake.js
$base = "
function Snake.Base (peer) {
  this.peer = peer;
}

Snake.Base.prototype = {
  save: function () {
    this.peer.update(this);
  } 
};

function Snake.BasePeer (tableName) {
  this.columns = [];
  this.fields = {};

  this.tableName = tableName;
}

Snake.BasePeer.prototype = {
  doSelect: function (criteria, callback) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeSelect(this, callback);
  }, 

  update = function (model) {
    var criteria = new Snake.Criteria();
    if (model.id === null) {
      criteria.executeInsert(model, this);
    } else {
      criteria.executeUpdate(model, this);
    }
  },

  retrieveByPK = function (pk, callback) {
    var c = new Snake.Criteria();
    c.add(this.ID, pk);
    this.doSelect(c, callback);
  }
}
";

  $code = array();
  foreach ($o['schema'] as $tableName => $table) {

    $peer = "var {$table['jsName']}Peer = new Snake.BasePeer('{$tableName}');";
    $model = "var {$table['jsName']} = new Snake.Base({$table['jsName']}Peer);";

    $innerCode = array();
    $innerCodePeer = array();

    $columns = array();
    $columnTypes = array();
    $fields = array();
    foreach ($table['columns'] as $columnName => $column) {

      $columns[] = "'" . $columnName . "'";

      $columnTypes[$columnName] = array();
      foreach ($column as $type => $value) {
        $columnTypes[$columnName][] = "\"$type\": \"$value\"";
      }

      $innerCode[] = "{$columnName}: null";
      $innerCodePeer[] = strtoupper($columnName) . ": '{$tableName}.{$columnName}'";
      $fields[] = "{$columnName}: { " . implode(", ", $columnTypes[$columnName]) . " }";
    }

  $innerCodePeer[] = "
  fields: {
    " . implode(",\n    ", $fields) . "
  }";

    $innerCodePeer[] = "columns: [" . implode(", ", $columns) . "]";

$code [] = "
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

  fwrite($handle, implode("", $code));
  fclose($handle);

// TODO foreign stuff
/*
*/
/*
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
