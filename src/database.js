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
    console.log(transaction);
    console.log(results);
  };
  onFailure = onFailure || function (transaction, error) {
    console.log(transaction);
    console.log(error);
  };

  if (!self.db) {
    console.log("Database not connected");
    return false;
  } else {
  
    // HTML5 database perform query
    self.db.transaction(function (transaction) {

      // append semicolon to query
      query = query + ";";

      // debugging
      if (self.debug) {
        console.log(query);
        if (params) {
          console.log(params);
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
Snake.insertSql = function () {
  var self = Snake
    , i = 0
    , query = null;

  if (self.config.sql.length > 0) {

    // loop through SQL statements
    for (i = 0; i < self.config.sql.length; i = i + 1) {
      query = self.config.sql[i];
      // run the queries
      self.query(query);
    }
  }

  // execute onloads...
  for (i = 0; i < self.$nk_chain.length; i = i + 1) {
    self.$nk_chain[i]();
  }
  self.$nk_chain = [];

  // set Snake to already loaded.
  self.has_loaded = true;
};
