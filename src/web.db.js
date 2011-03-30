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
  var Database = null,
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
    Database = openDatabase(db.name, db.version, db.displayName, db.size);

    // callbacks
    if (!Database) {
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

    if (!Database) {
      self.log("Connecting to the database");
      connect(function () {
        Snake.query(query, params, onSuccess, onFailure);
      });
    } else {
    
      // HTML5 database perform query
      Database.transaction(function (transaction) {
        var preparedQuery = null,
            i = 0,
            max = 0;

        // convert to single array
        if (!self.is_array(query)) {
          query = [query];
        }

        for (i, max = query.length; i < max; i = i + 1) {

          // append semicolon to query
          preparedQuery = query[i] + ";";

          // debugging
          if (self.debug) {
            self.log(preparedQuery);
            if (params) {
              self.log(params);
            }
          }

          // perform query
          transaction.executeSql(preparedQuery, params, onSuccess, onFailure);
        }

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
  * @param {boolean} createTables If set the true the tables will be automatically created for you if they don't exist
  */
Snake.loadFromJSON = function (schema, onComplete, createTables) {
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
      model.columns.created_at = { type: "INTEGER" }; // based off of sqlite 3

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

      // TODO create relationships for the base objects
      // TODO create doSelectJoins for the relationships
     
      models.push(model);

      Snake.venom[schema[table].tableName] = new Snake.venomousObject(model);
      Snake.global[table] = new Snake.base(model);
    }
  }

  function sqlCreateTables(models) {
    var queries = [],
        i = 0,
        max = 0,
        column = null,
        foreign = null,
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

      // FIXME - multiple foreign keys?
      if ("foreign" in models[i]) {
        for (foreign in models[i].foreign) {
          if (models[i].foreign.hasOwnProperty(foreign)) {
            fk.push("FOREIGN KEY (" + models[i].foreign[foreign][0] + ") REFERENCES " + foreign + "(" + models[i].foreign[foreign][1] + ")");
          }
        }
      }

      fields = fields.concat(["id INTEGER PRIMARY KEY", "created_at INTEGER"]);
      
      queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{fields} #{refs})", {
        table: models[i].tableName,
        fields: fields,
        refs: fk
      }));
    }

    Snake.query(queries, null, onComplete);
  }

  if (createTables === true) {
    sqlCreateTables(models);
  } else {
    if (onComplete) {
      onComplete();
    }
  }
};
