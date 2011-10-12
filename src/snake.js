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

var Snake = function (config, schema, preQueries) {
  var system = this.SYSTEM = {};
  this.ARRAY = [];
  system.config = config || {};

  preQueries = preQueries || [];

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
      if (column !== "id" && column !== "created_at") {
        sql.fields.push(column + " " + field.type);
      }

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
      body: sql.fields.concat(sql.foreign).join(" ")
    }));

    models.push(model);

    // create a VQL Collection Object
    this[model.tableName] = new Snake.collection(model);
  }.bind(this));

  // create the tables if they don't exist
  this.SQL(preQueries.concat(queries), null);
};

/**
* Inserts a foreign object into a template.
  *
  * @param {string} str The string to interpolate
  * @param {Object} obj The foreign Object to interpolate into the string
  * @returns {string} The string interpolated with the object's values
  */
Snake.interpolate = function (str, obj) {
  Object.keys(obj).forEach(function (prop) {
    if (obj.hasOwnProperty(prop)) {
      str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
    }
  });

  return str;
};

