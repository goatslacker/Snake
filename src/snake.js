/**
  * Snake - A JavaScript DBAL
  *
  * @author <a href="mailto:josh@goatslacker.com">Josh Perez</a>
  */

/**
  * The Snake DBAL
  *
  * @namespace Snake
  * @version 2.0.4
  */
var Snake = function (config, schema) {
  this.SYSTEM = {};
  this.SYSTEM.config = config || {};
  /**
    * Dynamically builds the Models
    *
    * @param {Object} schema The schema in JSON format
    * @param {Function} onComplete The callback function to execute once the schema finishes building
    * @param {boolean} create_tables If set the true the tables will be automatically created for you if they don't exist
    */
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

      this[schema[table].tableName] = new Snake.collection(model);
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

      queries.push(Snake.interpolate("CREATE TABLE IF NOT EXISTS '#{table}' (#{fields})", {
        table: models[i].tableName,
        fields: fields
      }));
    }

    this.SQL(queries, null, onComplete);
  }

/*
  if (create_tables === true) {
    sqlCreateTables(models);
  } else {
    if (onComplete) {
      onComplete();
    }
  }
*/
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

