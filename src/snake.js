/**
  * Snake - A JavaScript ORM/DBAL
  *
  * @author <a href="mailto:josh@goatslacker.com">Josh Perez</a>
  * @version 0.1.4
  */

/**
  * The Snake ORM/DBAL
  *
  * @namespace Snake
  * @this {Snake}
  */
var Snake = {
  version: "0.1.4",
  build: "alpha",
  global: this,
  debug: false,
  config: {},
  log: function (msg) {
    if ('console' in Snake.global) {
      console.log(msg);
    }
  },

  /**
    * Inserts a foreign object into a template.
    *
    * @param {string} str The string to interpolate
    * @param {Object} obj The foreign Object to interpolate into the string
    * @returns {string} The string interpolated with the object's values
    */
  interpolate: function (str, obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
      }
    }

    return str;
  },

  /**
    * Dynamically builds the Models
    *
    * @param {Object} schema The schema in JSON format
    * @param {Function} onComplete The callback function to execute once the schema finishes building
    */
  loadFromJSON: function (schema, onComplete) {
    var table = null,
        column = null,
        def_column = null,
        fk = null,
        model = null;

    for (table in schema) {
      if (schema.hasOwnProperty(table)) {
        model = schema[table];

        model.jsName = table;
        model.columns.id = { type: "INTEGER" };
        model.columns.created_at = { type: "TIME" };

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

        // TODO create relationships for the base objects
        // TODO create doSelectJoins for the relationships

        Snake.venom[schema[table].tableName] = new Snake.venomousObject(model);
        Snake.global[table] = new Snake.base(model);
      }
    }

    if (onComplete) {
      onComplete();
    }

  },

  /**
    * Tests whether an Object is an array or not
    *
    * @param {Array} arrayInQuestion The object to check
    @ @returns {boolean}
    */
  is_array: function (arrayInQuestion) {
    return (Object.prototype.toString.call(arrayInQuestion) === '[object Array]');
  }
};

// dummy func
Snake.define = function (conf) {
  var self = Snake;
  self.config.database = conf;
};
