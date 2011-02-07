// base object
var Snake = {
  global: this,
  version: "0.0.27",
  db: false,
  config: {},
  debug: false,
  runSql: true
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
String.prototype.interpose = function (foreign) {
  var str = this.toString()
    , regexpx = null
    , value = null
    , i = false;

  for (i in foreign) {
    if (foreign.hasOwnProperty(i)) {
      regexpx = eval("/#{" + i + "}/g");
      value = (Snake.is_array(foreign[i])) ? foreign[i].join(", ") : foreign[i];
      str = str.replace(regexpx, value);
    }
  }
  return str;
};

/*
  Initializes Snake with a schema, connects to the database and creates necessary tables.
  @param o Object
  TODO support versioning
*/
Snake.init = function (o) {
  var self = Snake;  

  if (!o) {
    console.log("Error, configuration file not loaded");
    return false;
  }

  // loads the schema into Snake
  self.config = o;

  // connects to database
  // onSuccess, inserts the Sql from the loaded schema
  self.connect(function () {
    self.createTables();
  }, function (errorText) {
    console.log(errorText);
  });
};

/*
  Hydrates a recordset from the database into it's respective models
  @param peer Object
  @param callback Object
*/
Snake.hydrateRS = function (peer, callback, transaction, results) {
  var model = null
    , i = 0
    , model_rs = [];

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
