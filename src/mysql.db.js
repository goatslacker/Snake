/*global require module */
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

/**
  * @private
  */
  var self = Snake,
      Query = null,
      Client = require('mysql').Client,
      client = new Client(),
      database = false;

/**
  * @private
  */
  function connect(onComplete) {
    var self = Snake;

    client.user = self.config.database.username;
    client.password = self.config.database.password;

    client.connect();
    client.query('USE ' + self.config.database.database);

    database = true;

    onComplete();
  }

  /**
    * @private
    */
  Query = function (query, params, onSuccess, onFailure) {

    if (!database) {
      self.log("Connecting to the database");
      connect(function () {
        Snake.query(query, params, onSuccess, onFailure);
      });
    } else {
      params = params || [];

      onSuccess = onSuccess || function (transaction, results) {
        self.log(transaction);
        self.log(results);
      };
      onFailure = onFailure || function (transaction, error) {
        self.log(transaction);
        self.log(error);
      };

      client.query(query, params, function (err, results) {
        if (err) {
          if (onFailure) {
            onFailure(err);
          }
        } else {
          if (onSuccess) {
            onSuccess(results);
          }
        }
      });
    }
  };

  return Query;
}());

//FIXME move this from here?
//FIXME finish building
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
      model.columns.id = { type: "INTEGER PRIMARY KEY AUTO_INCREMENT" };
      model.columns.created_at = { type: "BIGINT" };

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
      Snake.global[table] = new Snake.base(model);
    }
  }
};

/* for node */
module.exports = Snake;
