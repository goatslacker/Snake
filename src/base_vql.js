// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = function (prop) {

  var name = null,
      Model = function () { };

  Model.prototype = {

    schema: null,

    // saves a record in the database
    save: function (onSuccess, onFailure) {
      // this.schema.doUpdate(this, onSuccess, onFailure);

      // insert
      var schema = this.schema,
          values = [],
          q = [],
          i = 0,
          val = null,
          sql = "";

      for (i = 0; i < schema.columns.length; i = i + 1) {
        val = model[schema.columns[i]] || null;

        if (schema.columns[i] === 'created_at' && val === null) {
          val = Date.now();
        }

        values.push(val);
        q.push("?");
      }

console.log(schema.columns);

      sql = "INSERT INTO '#{table}' (#{columns}) VALUES (#{q})".interpose({
        table: schema.tableName,
        columns: schema.columns,
        q: q
      });

console.log(sql);
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
      // this.schema.doDeleteRecord(this, onSuccess, onFailure);
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
