/**
  * The base objects which we'll base our Models from
  *
  * @constructor
  * @param {Object} table The model's schema
  * @returns {Object} The model to use
  */
Snake.base = function (table) {
  var proto = null,
      Model = null;

  /**
    @private
    */
  function getForeignObj(that, ref, onSuccess, onFailure, output_sql) {
    // test
    Snake.venom[ref].retrieveByPK(that[table.foreign[ref][0]], function (result) {

      // change the func
      that[ref] = function (onSuccess) {
        onSuccess(result);
      };

      onSuccess.apply(null, arguments);
    }, onFailure, output_sql);
  }

  function bindGetForeignObject(context, ref) {
    return function (onSuccess, onFailure, output_sql) {
      getForeignObj(context, ref, onSuccess, onFailure, output_sql);
    };
  }

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

    if ("foreign" in table) {
      for (name in table.foreign) {
        if (table.foreign.hasOwnProperty(name)) {
          this[name] = bindGetForeignObject(this, name);
        }
      }
    }

    this.old = {};

    //Object.seal(this); // Not sealing it for now
  };

  /**
    * Hydrates or populates a result set into the specified Model
    *
    * @public
    * 
    * @param {Array} row The result set of objects to populate into the model
    * @param {Object} model_obj Object that will be populated
    * @example
    * Model.allocate(result, new Fruits());
    * fruits.allocate(result);
    * @returns {Object} model The hydrated model
    */
  Model.allocate = function (row, model_obj) { // TODO - also handle multiple rows
    var model = (this instanceof Model) ? model_obj : new Model(),
        prop = null;

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

  proto = {
  /** @lends Model.prototype */

    /**
      * Saves a record to the database
      *
      * @param {Function} onSuccess The callback to execute if the transaction completes successfully
      * @param {Function} onFailure The callback to execute if the transaction fails
      * @param {boolean} output_sql If true the SQL is returned to the onSuccess callback as a string, otherwise the data is persisted to the database
      */
    save: function (onSuccess, onFailure, output_sql) {
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
        for (i = 0, max = table.map.length; i < max; i = i + 1) {
          if (this[table.map[i]] !== this.old[table.map[i]]) {
            val = this[table.map[i]] || null;
            values.push(val);

            q.push(table.map[i] + " = ?");
          }
        }

        sql = interpolate("UPDATE #{table} SET #{conditions} WHERE id = ?", {
          table: table.tableName,
          conditions: q
        });

        values.push(this.id);

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


      if (output_sql === true) {
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
      * @param {boolean} output_sql If true the SQL is returned to the onSuccess callback as a string, otherwise the data is persisted to the database
      */
    doDelete: function (onSuccess, onFailure, output_sql) {
      Snake.venom[table.tableName].find(this.id).doDelete(onSuccess, onFailure, output_sql);
    }
  };

  Model.is(proto);

  Model.prototype.$super = proto;

  return Model;
};
