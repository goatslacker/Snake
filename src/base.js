/**
  * The base objects which we'll base our Models from
  *
  * @constructor
  * @param {Object} table The model's schema
  * @returns {Object} The model to use
  */
Snake.base = function (table) {
  var Proto = null,
      Model = null;

  /**
    * @constructor
    */
  Model = function () {

    for (var name in table.columns) {
      if (table.columns.hasOwnProperty(name)) {
        // FIXME -- should add to object and then lock the obj
        this[name] = null;
      }
    }

    //Object.seal(this); // Not sealing it for now
  };

  /**
    * Hydrates or populates a result set into the specified Model
    *
    * @public
    * 
    * @param {Array} row The result set of objects to populate into the model
    * @returns {Object} model The hydrated model
    */
  Model.allocate = function (row) { // TODO - also handle multiple rows
    // FIXME - if called as (instanceOf) Model.allocate then Model will need to be provided as the second param 
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

  /**
    * Allows a Model to have Mixins
    * 
    * @param {Object} extend The object to mix into the model
    */
  Model.is = function (extend) {
    // Copy the properties over onto the new prototype
    for (var name in extend) {
      if (extend.hasOwnProperty(name)) {
        this.prototype[name] = extend[name];
      }
    }
  };

  Proto = {
  /** @lends Model.prototype */

    /**
      * Saves a record to the database
      *
      * @param {Function} onSuccess The callback to execute if the transaction completes successfully
      * @param {Function} onFailure The callback to execute if the transaction fails
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise the data is persisted to the database
      */
    save: function (onSuccess, onFailure, outputSql) {
      var model = this,
          values = [],
          interpolate = Snake.interpolate,
          q = [],
          i = 0,
          max = 0,
          val = null,
          sql = "";

      // update
      if (this.id) {
        for (i = 0, max = table.columns.length; i < max; i = i + 1) {
          if (this[table.columns[i]] !== this.old[table.columns[i]]) {
            val = this[table.columns[i]] || null;
            values.push(val);

            q.push(table.columns[i] + " = ?");
          }
        }

        sql = interpolate("UPDATE #{table} SET #{conditions} WHERE id = #{id}", {
          table: table.tableName,
          conditions: q,
          id: this.id
        });

      // insert
      } else {

        for (i = 0, max = table.map.length; i < max; i = i + 1) {
          val = this[table.map[i]] || null;
  
          if (table.map[i] === 'created_at' && val === null) {
            val = Date.now();
          }

          values.push(val);
          q.push("?");
        }

        sql = interpolate("INSERT INTO '#{table}' (#{columns}) VALUES (#{q})", {
          table: table.tableName,
          columns: table.map,
          q: q
        });
      }


      if (outputSql === true) {
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

    /**
      * Deletes a record from the database
      *
      * @param {Function} onSuccess The callback to execute if the transaction completes successfully
      * @param {Function} onFailure The callback to execute if the transaction fails
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise the data is persisted to the database
      */
    doDelete: function (onSuccess, onFailure, outputSql) {
      Snake.venom[table.jsName].find(this.id).doDelete(onSuccess, onFailure, outputSql);
    }
  };

  Model.is(Proto);

  Model.prototype.$super = Proto;

  return Model;
};
