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

var Snake = function (config, schema) {
  this.SYSTEM = {};
  this.SYSTEM.config = config || {};

  var table = null;
  var column = null;
  var def_column = null;
  var fk = null;
  var models = [];
  var model = null;

  var has = "hasOwnProperty";

  for (table in schema) {
    if (schema[has](table)) {
      model = schema[table];

      model.jsName = table;
      model.columns.id = { type: "INTEGER" };
      model.columns.created_at = { type: "INTEGER" };

      model.map = [];
      for (column in schema[table].columns) {
        if (schema[table].columns[has](column)) {
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

      this[schema[table].tableName] = new Snake.collection(model);
    }
  }

  (function (self, models) {
    var queries = [],
        i = 0,
        max = 0,
        column = null,
        foreign = null,
        foreign_key = null,
        refaction = null,
        ref = [],
        fields = [],
        fk = [];

    for (i, max = models.length; i < max; i = i + 1) {
      fields = [];
      fk = [];

      for (column in models[i].columns) {
        if (models[i].columns[has](column)) {
          if (column !== "id" && column !== "created_at") {
            fields.push(column + " " + models[i].columns[column].type);
          }
        }
      }

      if ("foreign" in models[i]) {
        foreign_key = models[i].foreign;
        for (foreign in foreign_key) {
          if (foreign_key[has](foreign)) {
            ref = [];

            if ("delete" in models[i].columns[foreign_key[foreign][0]]) {
              ref.push("ON DELETE " + models[i].columns[foreign_key[foreign][0]]["delete"]);
            }

            if ("update" in models[i].columns[foreign_key[foreign][0]]) {
              ref.push("ON DELETE " + models[i].columns[foreign_key[foreign][0]]["delete"]);
            }

            fk.push("FOREIGN KEY (" + foreign_key[foreign][0] + ") REFERENCES " + foreign + "(" + foreign_key[foreign][1] + ") " + ref.join(""));
          }
        }

        if ("ref" in models[i]) {
          for (refaction in models[i].ref) {
            if (models[i].ref[has](refaction)) {
              ref.push("ON " + refaction + " " + models[i].ref[refaction]);
            }
          }
        }

      }

      fields = fields.concat(["id INTEGER PRIMARY KEY AUTOINCREMENT", "created_at INTEGER"], fk);

      queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{fields})", {
        table: models[i].tableName,
        fields: fields
      }));
    }

    self.SQL(queries, null);
  }(this, models));
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

