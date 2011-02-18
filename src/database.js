/*
  Creates the database connection
  @param onSuccess Object function
  @param onFailure Object function
*/
Snake.connect = function (onSuccess, onFailure) {
  var self = Snake, db = self.config.database;

  // defaults
  onSuccess = onSuccess || function () {};
  onFailure = onFailure || function () {};

  // HTML5 openDatabase
  self.db = openDatabase(db.name, db.version, db.displayName, db.size);

  // callbacks
  if (!self.db) {
    onFailure("Could not open database");
  } else {
    onSuccess();
  }
};

/*
  Performs a query
  @param query String
  @param params Array
  @param onSuccess Object
  @param onFailure Object
*/
Snake.query = function (query, params, onSuccess, onFailure) {
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

  if (!self.db) {
    self.log("Database not connected");
    return false;
  } else {
  
    // HTML5 database perform query
    self.db.transaction(function (transaction) {

      // append semicolon to query
      query = query + ";";

      // debugging
      if (self.debug) {
        self.log(query);
        if (params) {
          self.log(params);
        }
      } else {
        // perform query
        transaction.executeSql(query, params, onSuccess, onFailure);
      }
    });
  }
};

/*
  Inserts specified SQL on init
  TODO drop_existing flag?
*/
Snake.createTables = function (drop_existing) {
  var self = Snake,
      i = 0,
      table = null,
      query = null;

  drop_existing = drop_existing || false;

  if (!self.debug && self.config.sql.length > 0) {

    if (drop_existing) {
      for (table in self.config.schema) {
        if (self.config.schema.hasOwnProperty(table)) {
          query = "DROP TABLE IF EXISTS '#{table}'".interpose({ table: table });
          self.query(query);
        }
      }
    }

    // loop through SQL statements
    for (i = 0; i < self.config.sql.length; i = i + 1) {
      query = self.config.sql[i];

      // run the query
      self.query(query);
    }
  }
};
