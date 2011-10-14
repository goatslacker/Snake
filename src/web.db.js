Snake.driver = "WebSQL";

/**
  * Performs a query on the Web Database
  *
  * @function
  * @param {string} query A prepared statement
  * @param {Array} params The parameters to insert into the prepared statements
  * @param {Function} onComplete The function to callback if the transaction is successfully executed
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
  function connect(onComplete) {
    var self = Snake,
        db = self.config;

    // defaults
    onComplete = onComplete || function () {};

    // HTML5 openDatabase
    database = openDatabase(db.name, db.version, db.displayName, db.size);

    // callbacks
    if (!database) {
      onComplete("Could not open database");
    } else {
      onComplete(null);
    }
  }

  /**
    * @private
    */
  Query = function (query, params, onComplete) {
    if (!Snake.ready) {
      throw "Snake is not ready!";
    }

    var self = Snake;

    // defaults
    params = params || null;

    onComplete = onComplete || function (transaction, results) {};

    if (!database) {
      connect(function () {
        Snake.query(query, params, onComplete);
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
              rows = null,
              i = 0,
              max = 0;

          try {
            result = results.insertId;
          } catch (e) {
            result = [];
            rows = results.rows;

            if (rows.length > 0) {
              for (i, max = rows.length; i < max; i += 1) {
                result.push(rows.item(i));
              }
            }
          }

          onComplete(null, result);
        };

        query.forEach(function (q) {
          // append semicolon to query
          var preparedQuery = q + ";";

          // perform query
          transaction.executeSql(preparedQuery, params, callback, function (transaction, results) {
            onComplete(transaction);
          });
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
Snake.loadFromJSON = function (schema, onComplete) {
  var preQueries = preQueries || [];

  // keep track of the models
  var models = [];
  // keep track of the queries
  var queries = [];

  // pointer to hasOwnProperty, because that word is too long.
  var has = "hasOwnProperty";

  // loop through the schema
  Object.keys(schema).forEach(function (table) {
    var model = schema[table];

    // houses the SQL stmt for each object
    var sql = {
      fields: [],
      foreign: []
    };

    model.jsName = table;

    // the map of the model
    model.map = [];

    // create default properties
    model.columns.id = { type: "INTEGER" };
    model.columns.created_at = { type: "INTEGER" };

    // loop through each column
    Object.keys(model.columns).forEach(function (column) {
      // this houses the field's type and any extra properties
      var field = model.columns[column];

      // add to SQL
      sql.fields.push(column + " " + field.type);

      // if it's a foreign key, then we capture the foreign table
      // and the key it points to
      if ("foreign" in field) {
        model.foreign = {};

        (function applyForeignKey() {
          var fk = field.foreign.split(".");
          model.foreign[fk[0]] = [column, fk[1]];

          // create SQL for the foreign key
          sql.foreign.push("FOREIGN KEY (" + column + ") REFERENCES " + fk[0] + "(" + fk[1] + ")");
        }());
      }

      // store map information
      model.map.push(column);
    });

    // push into queries
    queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{body})", {
      table: model.tableName,
      body: sql.fields.concat(sql.foreign).join(", ")
    }));

    models.push(model);

    // create a VQL Collection Object
    Snake.vql[model.tableName] = new Snake.collection(model);
  });

  // create the tables if they don't exist
  Snake.query(preQueries.concat(queries), null);

  // return callback
  if (onComplete) {
    onComplete();
  }
};
