// base object
var Snake = {
  version: "0.1.3",
  build: "alpha",
  global: this,
  config: {},
  log: function (msg) {
    console.log(msg);
  },
  debug: false
};

// Prototype functions
Snake.is_array = function (arrayInQuestion) {
  return (Object.prototype.toString.call(arrayInQuestion) === '[object Array]');
};

Array.prototype.in_array = function (val) {
  var i = 0;
  for (i = 0; i < this.length; i = i + 1) {
    if (this[i] === val) {
      return true;
    }
  }
  return false;
};

/*
  Inserts a foreign object into a template.
  @param foreign Object
  @return String
*/

String.prototype.interpolation = function (obj) {
  var str = this.toString(),
      prop = null;

  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
    }
  }

  return str;
};

// dummy func
Snake.define = function (conf) {
  var self = Snake;
  self.config.database = conf;
};

Snake.loadFromJSON = function (schema, onSuccess) {
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

      Snake.Venom[table] = new Snake.VenomousObject(model);
      Snake.global[table] = new Snake.Base(model);
    }
  }

  if (onSuccess) {
    onSuccess();
  }

};
