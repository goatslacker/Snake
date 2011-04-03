Snake.query = (function () {

  var self = Snake,
      Query = null,
      Client = require('mysql').Client,
      client = new Client(),
      database = false;

  function connect(onComplete) {
    var self = Snake;

    client.user = self.config.database.username;
    client.password = self.config.database.password;

    client.connect();
    client.query('USE ' + self.config.database.database);

    database = true;

    onComplete();
  }

  Query = function (query, params, onSuccess, onFailure) {

    if (!database) {
      self.log("Connecting to the database");
      connect(function () {
        Snake.query(query, params, onSuccess, onFailure);
      });
    } else {
      params = params || [];

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
