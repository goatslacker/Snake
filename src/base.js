// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = function (prop) {

  var name = null,
      Model = function () { };

  Model.prototype = {

    peer: null,

    toSQL: function () {
      this.no_query = "test";

      return this;
    },

    // saves a record in the database
    save: function (onSuccess, onFailure) {
      // this.peer.doUpdate(this, onSuccess, onFailure);

console.log(this.no_query);

      // insert
      var peer = this.peer,
          values = [],
          q = [],
          i = 0,
          val = null,
          sql = "";

      // update
      if (this.id) {

      // insert
      } else {

        // TODO does this mean we can't name a column peer?
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

        console.log(sql);
        console.log(values);
      }
/*

      Snake.query(sql, values, function (transaction, results) {
        // set an ID
        model.id = results.insertId;

        if (onSuccess) {
          onSuccess(model);
        }
      }, onFailure);
*/

    },

    // deletes a record from the database
    remove: function (onSuccess, onFailure) {
      // this.peer.doDeleteRecord(this, onSuccess, onFailure);
    },

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
