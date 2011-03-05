// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = function (prop) {

  var name = null,
      Model = function () { };

  Model.prototype = {

    peer: null,
    dontExecuteQuery: false,

    toSQL: function () {
      this.dontExecuteQuery = true;

      return this;
    },

    // saves a record in the database
    save: function (onSuccess, onFailure) {
      var peer = this.peer,
          values = [],
          q = [],
          i = 0,
          val = null,
          sql = "";

      // update
      if (this.id) {
        for (i = 0; i < peer.columns.length; i = i + 1) {
          if (model[peer.columns[i]] !== model['$nk_' + peer.columns[i]]) {
            val = model[peer.columns[i]] || null;
            values.push(val);

            conditions.push(peer.columns[i] + " = ?");
          }
        }

        sql = "UPDATE #{table} SET #{conditions} WHERE id = #{id}".interpose({
          table: peer.tableName,
          conditions: conditions,
          id: model.id
        });

      // insert
      } else {

        // TODO does this mean we can't name a column peer? - TEST
        for (i = 0; i < peer.map.length; i = i + 1) {
          val = this[peer.map[i]] || null;
  
          if (peer.map[i] === 'created_at' && val === null) {
            val = Date.now();
          }

          values.push(val);
          q.push("?");
        }

        sql = "INSERT INTO '#{table}' (#{columns}) VALUES (#{q})".interpose({
          table: peer.tableName,
          columns: peer.map,
          q: q
        });
      }


      if (this.dontExecuteQuery === true) {
        if (onSuccess) {
          onSuccess(sql, values);
        }

      } else {
        Snake.query(sql, values, function (transaction, results) {
          // set an ID
          model.id = results.insertId;

          if (onSuccess) {
            onSuccess(model);
          }
        }, onFailure);
      }

    },

    // deletes a record from the database
    doDelete: function (onSuccess, onFailure) {
      // this.peer.doDeleteRecord(this, onSuccess, onFailure);
    },

    // FIXME, refactor this!
    hydrate: function (obj) {
      var i = null;
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          this[i] = obj[i];
        }
      }
    }
  };

  // Copy the properties over onto the new prototype
  for (name in prop) {
    if (prop.hasOwnProperty(name)) {
      Model.prototype[name] = prop[name];
    }
  }

  return Model;
};
