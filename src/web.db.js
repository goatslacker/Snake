// TODO support versioning
Snake.query = (function () {
  var Database = null,
      Query = null;

/*
  @private
  Creates the database connection
  @param onSuccess Object function
  @param onFailure Object function
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

  /*
    Performs a query
    @param query String
    @param params Array
    @param onSuccess Object
    @param onFailure Object
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
            i = 0;

        // convert to single array
        if (!self.is_array(query)) {
          query = [query];
        }

        for (i; i < query.length; i = i + 1) {

          // append semicolon to query
          preparedQuery = query[i] + ";";

          // debugging
          if (self.debug) {
            self.log(preparedQuery);
            if (params) {
              self.log(params);
            }
          } else {
            // perform query
            transaction.executeSql(preparedQuery, params, onSuccess, onFailure);
          }
        }

      });
    }
  };

  return Query;
}());
