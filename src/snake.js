/**
  Copyright (C) 2011 by Josh Perez
  https://github.com/goatslacker/Snake

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

// ##Snake
//
// Constructs a new Snake object
//
// **Config** is an Object with the following parameters:
//
// * __name__ is the name of the database
// * __size__ is the size in bytes the data will take up
// * __description__ (optional)
// * __version__ any number, describe the version of the database. eg: 1.0
//
// **Schema** is an Object representing the model of your data
//
// A typical Schema looks like this:
//
//     {
//       "Siblings": {
//         "tableName": "siblings",
//           "columns": {
//           "name": { "type": "TEXT" },
//           "age": { "type": "INTEGER" }
//         }
//       }
//     }
//
// **preQueries** is an Array of SQL queries that Snake should execute prior to creating the tables
//
//
// Snake will construct the schema as a Collection and create the tables. Once it's finished it will
// return a new Object with direct access to the tables in the schema as well as an **SQL** method in it's prototype.
var Snake = function (config, schema, preQueries) {
// intialize the SYSTEM Object which will house our config and schema
// and ARRAY which will contain all of the queries while the system isn't ready
  var system = this.SYSTEM = {};
  this.ARRAY = [];
  system.config = config || {};

  preQueries = preQueries || [];

// keep track of the models
// and the queries
// and we create a pointer to hasOwnProperty, because that word is too long.
  var models = [];
  var queries = [];

  var has = "hasOwnProperty";

// Now we loop through the schema
// and create a new SQL store for each table
//
// `model.map` is the map of the model
//
// `id` and `created_at` are default properties that each object gets
  Object.keys(schema).forEach(function (table) {
    var model = schema[table];

    var sql = {
      fields: [],
      foreign: []
    };

    model.jsName = table;

    model.map = [];

    model.columns.id = { type: "INTEGER" };
    model.columns.created_at = { type: "INTEGER" };

// Here we loop through each column in the table
// `field` contains the field's type and any extra properties
//
// then we add to SQL
// and store the map information
    Object.keys(model.columns).forEach(function (column) {
      var field = model.columns[column];

      sql.fields.push(column + " " + field.type);

// If it's a foreign key, then we capture the foreign table
// and the key it points to
// and we create SQL for the foreign key
      if ("foreign" in field) {
        model.foreign = {};

        (function applyForeignKey() {
          var fk = field.foreign.split(".");
          model.foreign[fk[0]] = [column, fk[1]];

          sql.foreign.push("FOREIGN KEY (" + column + ") REFERENCES " + fk[0] + "(" + fk[1] + ")");
        }());
      }

      model.map.push(column);
    });

    queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{body})", {
      table: model.tableName,
      body: sql.fields.concat(sql.foreign).join(", ")
    }));

    models.push(model);

// create a VQL Collection Object
    this[model.tableName] = new Snake.collection(model, this);
  }.bind(this));

// create the tables if they don't exist
  this.SQL(preQueries.concat(queries), null);
};

// ### Interpolation
//
// Need I say more? Used internally by Snake.
Snake.interpolate = function (str, obj) {
  Object.keys(obj).forEach(function (prop) {
    if (obj.hasOwnProperty(prop)) {
      str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
    }
  });

  return str;
};

// ### Connect
//
// #### Connects to the database
//
// * __onComplete__ is the callback function
Snake.prototype.connect = function (onComplete) {
  var system = this.SYSTEM;
  var db = system.config;

  onComplete = onComplete || function () {};

// HTML5 openDatabase
  system.database = openDatabase(db.name, db.version, db.displayName, db.size);

// If the database isn't connected then we return an error
// otherwise we return true, set `connected` to true and freeze the `SYSTEM`
// object so we make it immutable.
// If there are any queries in the pool
// we query them now
  if (!system.database) {
    onComplete("Could not open database");
  } else {
    onComplete(null, true);
    system.connected = true;
    Object.freeze(this.SYSTEM);

    this.ARRAY.forEach(function (args) {
      this.SQL.apply(this, args);
    }.bind(this));

    delete this.ARRAY;
  }
};

// ### SQL
//
// #### Performs an SQL query on the database
//
// * __query__ is the String query to perform
// * __params__ is an Array containing the parameters that go along with the query
// * __onComplete__ is the callback function
Snake.prototype.SQL = function (query, params, onComplete) {
  var system = this.SYSTEM;
  var array = this.ARRAY;

// If the system isn't connected yet
// we queue up the queries and then fire them once the system is ready
  if (!system.connected) {
    array.push([query, params, onComplete]);
    return this.connect();
  }

  params = params || null;
  onComplete = onComplete || function (transaction, results) {};

// HTML5 database perform query
  system.database.transaction(function (transaction) {

    if (!Array.isArray(query)) {
      query = [query];
    }

    /** @private */
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

// For each query
// we append a semicolon to query
// and then perform query
// and then we pass the transaction to the callback
    query.forEach(function (q) {
      var preparedQuery = q + ";";

      transaction.executeSql(preparedQuery, params, callback, function (transaction, results) {
        onComplete(transaction);
      });
    });

  });

};
