#!/usr/bin/env node

var sys = require("sys"),
    path = require("path"),
    fs = require("fs"),
    args = (function () {
      var args = process.argv.splice(2),
          i = 0,
          max = 0,
          key = null,
          val = null,
          arg = null,
          obj = {};

      for (i, max = args.length; i < max; i = i + 1) {
        arg = args[i].split("=");
        key = arg[0];
        val = arg[1] || true;

        if (key) {
          obj[key] = val;
        }
      }

      return obj;
    }());

function loadFromJSON(json, onComplete, create_tables) {
  json = JSON.parse(json);

  var schema = json.schema,
      table = null,
      column = null,
      def_column = null,
      fk = null,
      models = [],
      model = null,
      data = [],
      model_str = "";

  data.push("Snake.config.database = " + JSON.stringify(json.database) + ";");

  for (table in schema) {
    if (schema.hasOwnProperty(table)) {
      model = schema[table];

      model.jsName = table;
      model.columns.id = { type: "INTEGER" };
      model.columns.created_at = { type: "INTEGER" };

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

      model_str = JSON.stringify(model);

      data.push(interpolate("Snake.venom.#{table} = new Snake.venomousObject(#{model});", {
        table: schema[table].tableName,
        model: model_str
      }));
      data.push(interpolate("Snake.global.#{table} = new Snake.base(#{model});", {
        table: table,
        model: model_str
      }));
    }
  }

  function sqlCreateTables(models) {
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
        if (models[i].columns.hasOwnProperty(column)) {
          if (column !== "id" && column !== "created_at") {
            fields.push(column + " " + models[i].columns[column].type);
          }
        }
      }

      if ("foreign" in models[i]) {
        foreign_key = models[i].foreign;
        for (foreign in foreign_key) {
          if (foreign_key.hasOwnProperty(foreign)) {
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
            if (models[i].ref.hasOwnProperty(refaction)) {
              ref.push("ON " + refaction + " " + models[i].ref[refaction]);
            }
          }
        }
      }

      fields = fields.concat(["id INTEGER PRIMARY KEY AUTOINCREMENT", "created_at INTEGER"], fk);
      
      queries.push(interpolate("\"CREATE TABLE IF NOT EXISTS '#{table}' (#{fields})\"", {
        table: models[i].tableName,
        fields: fields
      }));
    }

    data.splice(1, 0, "Snake.query(" + queries.join(",") + ");");

    onComplete(json.fileName, data);
  }

  sqlCreateTables(models);
}

if ("schema" in args) {
  fs.readFile(args.schema, "utf8", function (err, text) {

    loadFromJSON(text, function (filename, data) {
      fs.writeFile(filename + ".js", data.join("\n"), 'utf8', function (err) {
        console.log(err);
      });
    });
  });
}

console.log(args);

// TODO
/*
  x build model from JSON
  x build SQL from model
  - build JSON | model from SQL
  - load fixtures
  - create tables/insert into
*/

function interpolate(str, obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
      }
    }

    return str;
};

