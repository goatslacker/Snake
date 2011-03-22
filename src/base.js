// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = function (table) {
  var dontExecuteQuery = false,
      Proto = {},
      Model = null;

  Model = function () {

    for (var name in table.columns) {
      if (table.columns.hasOwnProperty(name)) {
        // FIXME -- should add to object and then lock the obj
        this[name] = null;
      }
    }

    //Object.seal(this); // Not sealing it for now
  };

  // Hydrate || Populate
  Model.allocate = function (row) { // TODO - also handle multiple rows
    var model = new Model(),
        prop = null;

    model.old = {};

    for (prop in row) {
      if (row.hasOwnProperty(prop)) {
        model[prop] = row[prop];
        model.old[prop] = row[prop];
      }
    }

    return model;
  };

  Model.is = function (extend) {
    // Copy the properties over onto the new prototype
    for (var name in extend) {
      if (extend.hasOwnProperty(name)) {
        this.prototype[name] = extend[name];
      }
    }
  };

  Proto = {

    toSQL: function () {
      dontExecuteQuery = true;

      return this;
    },

    // saves a record in the database
    save: function (onSuccess, onFailure) {
      var model = this,
          values = [],
          q = [],
          i = 0,
          val = null,
          sql = "";

      // update
      if (this.id) {
        for (i = 0; i < table.columns.length; i = i + 1) {
          if (this[table.columns[i]] !== this.old[table.columns[i]]) {
            val = this[table.columns[i]] || null;
            values.push(val);

            q.push(table.columns[i] + " = ?");
          }
        }

        sql = "UPDATE #{table} SET #{conditions} WHERE id = #{id}".interpolation({
          table: table.tableName,
          conditions: q,
          id: this.id
        });

      // insert
      } else {

        for (i = 0; i < table.map.length; i = i + 1) {
          val = this[table.map[i]] || null;
  
          if (table.map[i] === 'created_at' && val === null) {
            val = Date.now();
          }

          values.push(val);
          q.push("?");
        }

        sql = "INSERT INTO '#{table}' (#{columns}) VALUES (#{q})".interpolation({
          table: table.tableName,
          columns: table.map,
          q: q
        });
      }


      if (dontExecuteQuery === true) {
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
      Snake.Venom[table.jsName].find(this.id).toSQL().doDelete(onSuccess, onFailure);
    }
  };

  Model.is(Proto);

  Model.prototype.$super = Proto;

  return Model;
};
