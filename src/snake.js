// base object
var Snake = {
  global: this,
  version: "0.0.27",
  $nk_chain: [],
  db: false,
  config: {},
  debug: true,
  has_loaded: false
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
  self.loadSchema(o);

  // connects to database
  // onSuccess, inserts the Sql from the loaded schema
  self.connect(function () {
    self.insertSql();
  }, function (errorText) {
    console.log(errorText);
  });
};

/*
  Functions to execute when Snake is ready.
  @param func Object function
*/
Snake.ready = function (func) {
  var self = Snake;
  if (self.has_loaded) {
    func();
  } else {
    self.$nk_chain.push(func);
  }
};

/*
  Loads the schema into Snake
*/
Snake.loadSchema = function (o) {
  var self = Snake;
  self.config = o;
};
