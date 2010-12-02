<?php

  $filename = "schema.json";
  $handle = fopen($filename, "r");
  $json = fread($handle, filesize($filename));
  fclose($handle);

  $o = json_decode($json, true);

  if ($o === NULL) {
    die("Cannot decode JSON -- Make sure it's properly formatted\n");
  }

$base = "
function Base (peer) {
  this.peer = peer;
}

Base.prototype = {
  save: function () {
    this.peer.update(this);
  } 
};

function BasePeer (tableName) {
  this.columns = [];
  this.fields = {};

  this.tableName = tableName;
}

BasePeer.prototype = {
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

  echo "\n" . $base . "\n";

  // TODO make a BasePeer object and inherit the peer's from that one
  foreach ($o['schema'] as $tableName => $table) {

    // TODO add the columns
$code = "
var {$table['jsName']}Peer = new BasePeer('{$tableName}');
var {$table['jsName']} = new Base({$table['jsName']}Peer);
";

    $columns = array();     
    foreach ($table['columns'] as $columnName => $column) {

      $columns[] = "'" . $columnName . "'";

      $columnTypes = array();
      foreach ($column as $type => $value) {
        $columnTypes[] = "\"$type\": \"$value\"";
      }

    // try to prototype all this stuff so it looks cleaner
$code .= "{$table['jsName']}Peer." . strtoupper($columnName) . " = '{$tableName}.{$columnName}';
{$table['jsName']}Peer.fields.{$columnName} = { " . implode(", ", $columnTypes) . " };
{$table['jsName']}.{$columnName} = null;
";

    }

$code .= "{$table['jsName']}Peer.columns = [" . implode(", ", $columns) . "];
";
    
    echo $code;
  }

  echo "\n";

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
