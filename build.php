<?php

  $filename = "schema.json";
  $handle = fopen($filename, "r");
  $json = fread($handle, filesize($filename));
  fclose($handle);

  $o = json_decode($json, true);

  if ($o === NULL) {
    die("Cannot decode JSON -- Make sure it's properly formatted\n");
  }

  // TODO make a BasePeer object and inherit the peer's from that one
  foreach ($o['schema'] as $table) {

    //$tableName = key of table
    
    // TODO add the columns
    $code = "
      {$table['jsName']}Peer = {
        columns: [],
        fields: {},
        tableName: '{$tableName}',
       
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
        
      };

      function {$table['jsName']} () {
      }
      {$table['jsName']}.prototype = {
        peer: {$table['jsName']}Peer,
       
        save: function () {
          this.peer.update(this);
        } 
      };

    ";
    
    echo "\n" . $code . "\n";
  }

/*
          // column object
          var column = table.columns[columnName];

          model.prototype[columnName] = null;


          // column names (although I could just pull these from the columns)
          peer[columnName.toUpperCase()] = tableName + "." + columnName;
          peer.columns.push(columnName);
          peer.fields[columnName] = column;
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
