Snake.driver = "WebSQL";

/**
  * Performs a query on the Web Database
  *
  * @function
  * @param {string} query A prepared statement
  * @param {Array} params The parameters to insert into the prepared statements
  * @param {Function} onSuccess The function to callback if the transaction is successfully executed
  * @param {Function} onFailure The function to callback if the transaction fails
  */
Snake.query = (function () {
// TODO support versioning

/**
  * @private
  */
  var database = null,
      Query = null;

/**
  * @private
  */
  function connect(onSuccess, onFailure) {
    var self = Snake,
        db = self.config.database;

    // defaults
    onSuccess = onSuccess || function () {};
    onFailure = onFailure || function () {};

    // HTML5 openDatabase
    database = openDatabase(db.name, db.version, db.displayName, db.size);

    // callbacks
    if (!database) {
      onFailure("Could not open database");
    } else {
      onSuccess();
    }
  }

  /**
    * @private
    */
  Query = function (query, params, onSuccess, onFailure) {
    var self = Snake;

    // defaults
    params = params || null;

    onSuccess = onSuccess || function (transaction, results) {
      self.log(transaction);
      self.log(results);
    };
    onFailure = onFailure || function (transaction, error) {
      self.log(transaction);
      self.log(error);
    };

    if (!database) {
      self.log("Connecting to the database");
      connect(function () {
        Snake.query(query, params, onSuccess, onFailure);
      });
    } else {
    
      // HTML5 database perform query
      database.transaction(function (transaction) {

        // convert to single array
        if (!Array.isArray(query)) {
          query = [query];
        }

        /**
          @private
          */
        var callback = function (transaction, results) {
          var result = null,
              i = 0,
              max = 0,
              rows = null;

          try {
            result = results.insertId;
          } catch (e) {
            result = [];
            rows = results.rows;

            if (rows.length > 0) {
              for (i = 0, max = rows.length; i < max; i = i + 1) {
                result.push(rows.item(i));
              }
            }
          }
          
          onSuccess(result);
        };

        query.forEach(function (q) {
          // append semicolon to query
          var preparedQuery = q + ";";

          // debugging
          if (self.debug) {
            self.log(preparedQuery);
            if (params) {
              self.log(params);
            }
          }

          // perform query
          transaction.executeSql(preparedQuery, params, callback, onFailure);
        });

      });
    }
  };

  return Query;
}());

/**
  * Dynamically builds the Models
  *
  * @param {Object} schema The schema in JSON format
  * @param {Function} onComplete The callback function to execute once the schema finishes building
  * @param {boolean} create_tables If set the true the tables will be automatically created for you if they don't exist
  */
Snake.loadFromJSON = function (schema, onComplete, create_tables) {
  var table = null,
      column = null,
      def_column = null,
      fk = null,
      models = [],
      model = null;

  for (table in schema) {
    if (schema.hasOwnProperty(table)) {
      model = schema[table];

      model.jsName = table;
      model.columns.id = { type: "INTEGER" };
      model.columns.created_at = { type: "INTEGER" };

      model.map = [];
      for (column in schema[table].columns) {
        if (schema[table].columns.hasOwnProperty(column)) {
          def_column = schema[table].columns[column];

          if ("foreign" in def_column) {
            if (!model.foreign) {
              model.foreign = {};
            }

            fk = def_column.foreign.split(".");
            model.foreign[fk[0]] = [column, fk[1]];
          }

          model.map.push(column);
        }
      }

      models.push(model);

      Snake.venom[schema[table].tableName] = new Snake.venomousObject(model);
    }
  }

  function sqlCreateTables(models) {
    var queries = [],
        i = 0,
        max = 0,
        column = null,
        foreign = null,
        foreign_key = null,
        refaction = null,
        ref = [],
        fields = [],
        fk = [];

    for (i, max = models.length; i < max; i = i + 1) {
      fields = [];
      fk = [];

      for (column in models[i].columns) {
        if (models[i].columns.hasOwnProperty(column)) {
          if (column !== "id" && column !== "created_at") {
            fields.push(column + " " + models[i].columns[column].type);
          }
        }
      }

      if ("foreign" in models[i]) {
        foreign_key = models[i].foreign;
        for (foreign in foreign_key) {
          if (foreign_key.hasOwnProperty(foreign)) {
            ref = [];

            if ("delete" in models[i].columns[foreign_key[foreign][0]]) {
              ref.push("ON DELETE " + models[i].columns[foreign_key[foreign][0]]["delete"]);
            }

            if ("update" in models[i].columns[foreign_key[foreign][0]]) {
              ref.push("ON DELETE " + models[i].columns[foreign_key[foreign][0]]["delete"]);
            }

            fk.push("FOREIGN KEY (" + foreign_key[foreign][0] + ") REFERENCES " + foreign + "(" + foreign_key[foreign][1] + ") " + ref.join(""));
          }
        }

        if ("ref" in models[i]) {
          for (refaction in models[i].ref) {
            if (models[i].ref.hasOwnProperty(refaction)) {
              ref.push("ON " + refaction + " " + models[i].ref[refaction]);
            }
          }
        }

      }

      fields = fields.concat(["id INTEGER PRIMARY KEY AUTOINCREMENT", "created_at INTEGER"], fk);
      
      queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{fields})", {
        table: models[i].tableName,
        fields: fields
      }));
    }

    Snake.query(queries, null, onComplete);
  }

  if (create_tables === true) {
    sqlCreateTables(models);
  } else {
    if (onComplete) {
      onComplete();
    }
  }
};
