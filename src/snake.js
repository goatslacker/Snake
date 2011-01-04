/*global window openDatabase Snake.Class */
/*jslint white: true, browser: true, devel: true, evil: true, laxbreak: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, indent: 2 */

// base object
var Snake = {
  version: "0.0.22",
  $nk_chain: [],
  db: false,
  config: {},
  debug: true,
  has_loaded: false
};

// Prototype functions
Array.prototype.in_array = function (val) {
  for (var i = 0; i < this.length; i = i + 1) {
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
      value = (Object.prototype.toString.call(foreign[i]) === '[object Array]') ? foreign[i].join(", ") : foreign[i];
      str = str.replace(regexpx, value);
    }
  }
  return str;
};

// TODO
// document

// jslint comply this?
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Snake.Class implementation (does nothing)
  Snake.Class = function(){};
  
  // Create a new Snake.Class that inherits from this class
  Snake.Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    Snake.Class = function () {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Snake.Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Snake.Class.constructor = Snake.Class;

    // And make this class extendable
    Snake.Class.extend = arguments.callee;
    
    return Snake.Class;
  };
})();

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

/*
  Creates the database connection
  @param onSuccess Object function
  @param onFailure Object function
*/
Snake.connect = function (onSuccess, onFailure) {
  var self = Snake, db = self.config.database;

  // defaults
  onSuccess = onSuccess || function () {};
  onFailure = onFailure || function () {};

  // HTML5 openDatabase
  self.db = openDatabase(db.name, db.version, db.displayName, db.size);

  // callbacks
  if (!self.db) {
    onFailure("Could not open database");
  } else {
    onSuccess();
  }
};

/*
  Performs a query
  @param query String
  @param params Array
  @param onSuccess Object
  @param onFailure Object
*/
Snake.query = function (query, params, onSuccess, onFailure) {
  var self = Snake;

  // defaults
  params = params || null;

  onSuccess = onSuccess || function (transaction, results) {
    console.log(transaction);
    console.log(results);
  };
  onFailure = onFailure || function (transaction, error) {
    console.log(transaction);
    console.log(error);
  };

  if (!self.db) {
    console.log("Database not connected");
    return false;
  } else {
  
    // HTML5 database perform query
    self.db.transaction(function (transaction) {

      // append semicolon to query
      query = query + ";";

      // debugging
      if (self.debug) {
        console.log(query);
        if (params) {
          console.log(params);
        }
      }

      // perform query
      transaction.executeSql(query, params, onSuccess, onFailure);
    });
  }
};

/*
  Inserts specified SQL on init
  TODO drop_existing flag?
*/
Snake.insertSql = function () {
  var self = Snake
    , i = 0
    , query = null;

  if (self.config.sql.length > 0) {

    // loop through SQL statements
    for (i = 0; i < self.config.sql.length; i = i + 1) {
      query = self.config.sql[i];
      // run the queries
      self.query(query);
    }
  }

  // execute onloads...
  for (i = 0; i < self.$nk_chain.length; i = i + 1) {
    self.$nk_chain[i]();
  }
  self.$nk_chain = [];

  // set Snake to already loaded.
  self.has_loaded = true;
};


// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = Snake.Class.extend({

  // adds the peer to the model
  init: function (peer) {
    this.peer = peer;
  },

  // saves a record in the database
  save: function (onSuccess, onFailure) {
    this.peer.doUpdate(this, onSuccess, onFailure);
  },

  /*
    Hydrates the model with data from the object, usually returned in a transaction
    @param obj Object
  */
  hydrate: function (obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this[i] = obj[i];
      }
    }
  },

  // deletes a record from the database
  remove: function () {
    this.peer.doDeleteRecord(this);
  }
});

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
    model = new window[peer.jsName]();

    // hydrates the model
    model.hydrate(results.rows.item(i)); // YAY for hydrate

    // pushes the results onto an array
    model_rs.push(model);
  }

  // executes callback with array
  callback(model_rs);
};

/*
  The peer class of an object. Handles multiple records of items.
  @param obj Object
  TODO doCount
*/
Snake.BasePeer = function (obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      this[i] = obj[i];
    }
  }

  return this;
};

Snake.BasePeer.prototype = {

  // executes a SELECT query
  doSelect: function (criteria, callback) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeSelect(this, callback);
  },

  // executes a SELECT query and returns 1 result
  doSelectOne: function (criteria, callback) {
    criteria = criteria || new Snake.Criteria();
    criteria.setLimit(1);
    criteria.executeSelect(this, function (result) {
      if (callback && result.length >= 0) {
        callback(result[0]);
      }
    });
  },

  // deletes 1 record
  doDeleteRecord: function (model) {
    var criteria = new Snake.Criteria();
    criteria.add(this.ID, model.id);
    this.doDelete(criteria);
  },

  // deletes multiple records
  doDelete: function (criteria) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeDelete(this);
  },

  // executes an INSERT || UPDATE depending on the model
  doUpdate: function (model, onSuccess, onFailure) {
    var criteria = new Snake.Criteria();
    if (model.id === null) {
      criteria.executeInsert(model, this, onSuccess, onFailure);
    } else {
      criteria.executeUpdate(model, this, onSuccess, onFailure);
    }
  },

  // retrieves an item by it's PRIMARY KEY
  retrieveByPK: function (pk, callback) {
    var c = new Snake.Criteria();
    c.add(this.ID, pk);
    this.doSelect(c, callback);
  }

};

/*
  Criteria Class
  Handles all the dirty SQL work
*/
Snake.Criteria = function () {
  this.select = [];
  this.from = [];
  this.join = [];
  this.where = {
    hasWhere: false,
    and: [],
    params: []
  };
  this.order = [];
  this.limit = false;
  this.group = [];
};

Snake.Criteria.prototype = {
  NOT_EQUAL: "<>",
  EQUAL: "=", 
  GREATER_THAN: ">", 
  LESS_THAN: "<", 
  GREATER_EQUAL: ">=", 
  LESS_EQUAL: "<=",
  LEFT_JOIN: "LEFT JOIN",
  RIGHT_JOIN: "RIGHT_JOIN",
  INNER_JOIN: "INNER_JOIN",

  add: function (field, value, selector) {
    selector = this[selector] || this.EQUAL;

    var where = "#{field} #{selector} ?".interpose({
      field: field,
      selector: selector
    });

    this.where.hasWhere = true;
    this.where.and.push(where);
    this.where.params.push(value);
  },

/*
  addOr: function (field, value, selector) {
    selector = this[selector] || this.EQUAL;

    var where = "#{field} #{selector} ?".interpose({
      field: field,
      selector: selector
    });

    this.where.hasWhere = true;
    this.where.or.push(where);
    this.where.params.push(value);
  },
*/
  addJoin: function (join1, join2, join_method) {
    join_method = this[join_method] || this.LEFT_JOIN;

    var db1 = join1.split(".")
      , db2 = join2.split(".")
      , table1 = db1[0]
      , field1 = db1[1]
      , table2 = db2[0]
      , field2 = db2[1];

    this.join.push({
      method: join_method,
      from: {
        table: table1,
        field: field1
      },
      to: {
        table: table2,
        field: field2
      }
    });
  },

  addDescendingOrderByColumn: function (column) {
    if (!this.order.in_array(column)) {
      this.order.push(column + " DESC");
    }
  },

  addAscendingOrderByColumn: function (column) {
    if (!this.order.in_array(column)) {
      this.order.push(column + " ASC");
    }
  },

  setLimit: function (limit) {
    limit = limit || false;

    if (limit) {
      this.limit = limit;
    }
  },

  executeSelect: function (peer, callback) {
    var i = 0
      , sql = ""
      , field = null
      , from = null
      , where = null
      , params = null;

    // add select columns
    if (this.select.length === 0) {
      for (i = 0; i < peer.columns.length; i = i + 1) {
        this.select.push(peer.tableName + "." + peer.columns[i]);
      }
    }

    // add the from
    for (i = 0; i < this.select.length; i = i + 1) {
      field = this.select[i];

      from = field.split(".");
      // tables to select from
      if (!this.from.in_array(from[0])) {
        this.from.push(from[0]);
      }
    }
    // what happens if there are multiple froms??? FIXME/test

    // build select
    sql = "SELECT #{select} FROM #{from}".interpose({
      select: this.select,
      from: this.from
    });

    if (this.join.length > 0) {
      for (i = 0; i < this.join.length; i = i + 1) {
        sql = sql + " #{method} #{table} ON #{reference} = #{table}.#{key}".interpose({
          method: this.join[i].method,
          reference: this.join[i].from.table + "." + this.join[i].from.field,
          table: this.join[i].to.table,
          key: this.join[i].to.field
        });
      }
    }

    // where
    if (this.where.hasWhere) {
      where = this.where.and.join(" AND ");
      sql = sql + " WHERE " + where;
      params = this.where.params;
    }

    // order by
    if (this.order.length > 0) {
      sql = sql + " ORDER BY #{order}".interpose({ order: this.order });
    }

    // limiter
    if (this.limit) {
      sql = sql + " LIMIT #{limit}".interpose({ limit: this.limit });
    }

    Snake.query(sql, params, function (transaction, results) {
      var arr = []
        , i = 0
        , obj = null
        , tmp = null
        , prop = null;

      if (results.rows.length > 0) {
        for (i = 0; i < results.rows.length; i = i + 1) {

          obj = results.rows.item(i);
          tmp = new window[peer.jsName]();

          for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              tmp[prop] = obj[prop];
              tmp['$nk_' + prop] = obj[prop];
            }
          }

          arr.push(tmp);
        }
      }

      callback(arr);
    });
  },

  executeInsert: function (model, peer, onSuccess, onFailure) {
    var values = []
      , q = []
      , i = 0
      , val = null
      , sql = "";

    for (i = 0; i < peer.columns.length; i = i + 1) {
      val = model[peer.columns[i]] || null;

      if (peer.columns[i] === 'created_at' && val === null) {
        val = Date.now();
      }

      values.push(val);
      q.push("?");
    }

    sql = "INSERT INTO '#{table}' (#{columns}) VALUES (#{q})".interpose({
      table: peer.tableName,
      columns: peer.columns,
      q: q
    });

    Snake.query(sql, values, function (transaction, results) {
      // set an ID
      model.id = results.insertId;

      if (onSuccess) {
        onSuccess(model);
      }
    }, onFailure);
  },

  executeUpdate: function (model, peer, onSuccess, onFailure) {
    var conditions = []
      , values = []
      , val = null
      , i = 0
      , sql = "";

    for (i = 0; i < peer.columns.length; i = i + 1) {
      if (model[peer.columns[i]] !== model['$nk_' + peer.columns[i]]) {
        val = model[peer.columns[i]] || null;
        values.push(val);

        conditions.push(peer.columns[i] + " = ?");
      }
    }

    sql = "UPDATE #{table} SET #{conditions} WHERE id = #{id}".interpose({
      table: peer.tableName,
      conditions: conditions,
      id: model.id
    });

    Snake.query(sql, values, onSuccess, onFailure);
  },

  executeDelete: function (peer) {
    var sql = ""
      , where = ""
      , params = null;

    this.from = peer.tableName;  

    // build select
    sql = "DELETE FROM #{from}".interpose({
      from: this.from
    });

    // where
    if (this.where.hasWhere) {
      where = this.where.and.join(" AND ");
      sql = sql + " WHERE " + where;
      params = this.where.params;
    }

    Snake.query(sql, params);
  }
};
