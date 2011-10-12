Snake.prototype.connect = function (onComplete) {
  var system = this.SYSTEM;
  var db = system.config;

  // defaults
  onComplete = onComplete || function () {};

  // HTML5 openDatabase
  system.database = openDatabase(db.name, db.version, db.displayName, db.size);

  // callbacks
  if (!system.database) {
    onComplete("Could not open database");
  } else {
    // fire up the callback
    onComplete(null, true);

    // we're now connected
    system.connected = true;

    // freeze the system object
    Object.freeze(this.SYSTEM);

    // if there are any queries in the pool
    // query them now
    this.ARRAY.forEach(function (args) {
      this.SQL.apply(this, args);
    }.bind(this));

    delete this.ARRAY;
  }
};

Snake.prototype.SQL = function (query, params, onComplete) {
  var system = this.SYSTEM;
  var array = this.ARRAY;

  if (!system.connected) {
    array.push([query, params, onComplete]);
    return this.connect();
  }

  // defaults
  params = params || null;

  onComplete = onComplete || function (transaction, results) {};

  if (!system.database) {
    connect(function () {
      this.SQL(query, params, onComplete);
    }.bind(this));
  } else {

    // HTML5 database perform query
    system.database.transaction(function (transaction) {

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
