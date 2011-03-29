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
