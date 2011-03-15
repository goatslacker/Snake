// base object
// TODO support versioning
var Snake = {
  version: "0.0.82",
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

/*
  Hydrates a recordset from the database into it's respective models
  @param peer Object
  @param callback Object
*/
Snake.hydrateRS = function (peer, callback, transaction, results) {
  var model = null,
      i = 0,
      model_rs = [];

  // loops through all results in the row
  for (i = 0; i < results.rows.length; i = i + 1) {

    // creates a new model
    model = new Snake.global[peer.jsName]();

    // hydrates the model
    model.hydrate(results.rows.item(i)); // YAY for hydrate

    // pushes the results onto an array
    model_rs.push(model);
  }

  // executes callback with array
  callback(model_rs);
};

Snake.loadFromJSON = function (schema, onSuccess) {
  var table = null,
      column = null,
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
