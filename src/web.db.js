Snake.driver = "WebSQL";

Snake.prototype.connect = function (onComplete) {
  var db = this.SYSTEM.config;

  // defaults
  onComplete = onComplete || function () {};

  // HTML5 openDatabase
  this.SYSTEM.database = openDatabase(db.name, db.version, db.displayName, db.size);

  // callbacks
  if (!this.SYSTEM.database) {
    onComplete("Could not open database");
  } else {
    onComplete(null, true);
    this.SYSTEM.isReady = true;
    Object.freeze(this.SYSTEM);
  }
};

/**
  * Performs a query on the Web Database
  *
  * @function
  * @param {string} query A prepared statement
  * @param {Array} params The parameters to insert into the prepared statements
  * @param {Function} onComplete The function to callback if the transaction is successfully executed
  */
Snake.prototype.SQL = function (query, params, onComplete) {
  if (!this.SYSTEM.isReady) {
// FIXME
//    this.SQL.cache = this.SQL.cache || [];
//    this.SQL.cache.push(query);
    return false;
  }

  // defaults
  params = params || null;

  onComplete = onComplete || function (transaction, results) {};

  if (!this.SYSTEM.database) {
    connect(function () {
      this.SQL(query, params, onComplete);
    }.bind(this));
  } else {

    // HTML5 database perform query
    this.SYSTEM.database.transaction(function (transaction) {

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
