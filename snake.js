// Prototype
Array.prototype.in_array = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === val) {
      return true;
    }
  }
  return false;
};

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
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
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

// base object
var Snake = {
  _chain: [],
  db: false,
  config: {},
  has_loaded: false
};

// TODO support verisioning!
Snake.init = function (o) {
  var self = Snake;  

  if (!o) {
    console.log("Error, configuration file not loaded");
    return false;
  }

  self.loadSchema(o);
  //Snake.buildSql();

  self.connect(function () {
    self.insertSql();
  }, function (errorText) {
    console.log(errorText);
  });
};

Snake.ready = function (func) {
  var self = Snake;
  if (self.has_loaded) {
    func();
  } else {
    self._chain.push(func);
  }
};

// load all items into a config file
Snake.loadSchema = function (o) {
  var self = Snake;
  // TODO need to load defaults...
  self.config = o;
};

// Create the database connection
Snake.connect = function (onSuccess, onFailure) {
  var self = Snake, db = self.config.database;
  onSuccess = onSuccess || function () {};
  onFailure = onFailure || function () {};
  self.db = openDatabase(db.name, db.version, db.displayName, db.size);

  if (!self.db) {
    onFailure("Could not open database");
  } else {
    onSuccess();
  }
};

// query the database
Snake.query = function (query, onSuccess, onFailure) {
  var self = Snake;

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
    self.db.transaction(function (transaction) {
      console.log('===Excuting Query===');
      query = query + ";";
      console.log(query);

      transaction.executeSql(query, [], onSuccess, onFailure);
    });
  }
};

// loads all the tables into the database
Snake.insertSql = function (drop_existing) {
  var self = Snake;
  if (self.config.sql.length > 0) {
    //drop_existing = drop_existing || false;

    var i = 0; query = null; //drop = drop_existing ? "DROP TABLE IF EXISTS..." : "";

    for (i = 0; i < self.config.sql.length; i = i + 1) {
      query = self.config.sql[i];
      self.query(query);
    }
  }

  // execute onloads...
  for (var i = 0; i < self._chain.length; i = i + 1) {
    console.log('hi');
    console.log(self._chain[i]);
    self._chain[i]();
  }
  self._chain = [];

  self.has_loaded = true;
};


// Base Classes
Snake.Base = Class.extend({
  init: function (peer) {
    this.peer = peer;
  },

  save: function () {
    this.peer.doUpdate(this);
  },

  // delete
  remove: function () {
    this.peer.doDeleteRecord(this);
  }
});

Snake.BasePeer = function (obj) {
  for (var i in obj) {
    this[i] = obj[i];
  }

  return this;
};

Snake.BasePeer.prototype = {
  doSelect: function (criteria, callback) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeSelect(this, callback);
  },

  // TODO test!
  doDeleteRecord: function (model) {
    var criteria = new Snake.Criteria();
    criteria.add(model.ID, model.id);
    this.doDelete(criteria);
  },

  doDelete: function (criteria) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeDelete(this);
  },

  doUpdate: function (model) {
    var criteria = new Snake.Criteria();
    if (model.id === null) {
      criteria.executeInsert(model, this);
    } else {
      criteria.executeUpdate(model, this);
    }
  },

  retrieveByPK: function (pk, callback) {
    var c = new Snake.Criteria();
    c.add(this.ID, pk);
    this.doSelect(c, callback);
  }
};

// Criteria class
Snake.Criteria = function () {
  this.select = [];
  this.from = [];
  this.join = [];
  this.where = [];
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
    selector = this[selector] || this["EQUAL"];

    var where = "#{field} #{selector} '#{value}'".interpolate({
      field: field,
      selector: selector,
      value: value
    });

    // where
    this.where.push(where);
  },

  addJoin: function (join1, join2, join_method) {
    join_method = this[join_method] || this["LEFT_JOIN"];

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

    // add select columns
    if (this.select.length === 0) {
      for (var i = 0; i < peer.columns.length; i = i + 1) {
        this.select.push(peer.tableName + "." + peer.columns[i]);
      }
    }

    // add the from
    for (var i = 0; i < this.select.length; i = i + 1) {
      var field = this.select[i];

      var from = field.split(".");
      // tables to select from
      if (!this.from.in_array(from[0])) {
        this.from.push(from[0]);
      }
    }
    // what happens if there are multiple froms???

    // build select
    var sql = "SELECT #{select} FROM #{from}".interpolate({
      select: this.select,
      from: this.from
    });

    // join FIXME
    if (this.join.length > 0) {
      for (var i = 0; i < this.join.length; i = i + 1) {
        sql = sql + " #{method} #{table} ON #{reference} = #{table}.#{key}".interpolate({
          method: this.join[i].method,
          reference: this.join[i].from.table + "." + this.join[i].from.field,
          table: this.join[i].to.table,
          key: this.join[i].to.field
        });
      }
    }

    // where
    if (this.where.length > 0) {
      sql = sql + " WHERE #{where}".interpolate({ where: this.where });
    }

    // order by
    if (this.order.length > 0) {
      sql = sql + " ORDER BY #{order}".interpolate({ order: this.order });
    }

    if (this.limit) {
      sql = sql + " LIMIT #{limit}".interpolate({ limit: this.limit });
    }

    // reset results ??
    this.select = [];
    this.from = [];
    this.where = [];

    Snake.query(sql, function (transaction, results) {
      var arr = [];

      if (results.rows.length > 0) {
        for (var i = 0; i < results.rows.length; i = i + 1) {

          var obj = results.rows.item(i);
          var tmp = new window[peer.jsName];

          for (var prop in obj) {
            tmp[prop] = obj[prop];
            tmp['_' + prop] = obj[prop];
          }

          arr.push(tmp);
        }
      }

      callback(arr);
    });
  },

  executeInsert: function (model, peer) {
    var values = [];

    for (var i = 0; i < peer.columns.length; i = i + 1) {
      if (peer.columns[i] === 'created_at') {
        var val = Date.now();
      } else {
        var val = model[peer.columns[i]] || false;
      }

      val = val ? "'" + val + "'" : "NULL"; // TODO no quotes if integer...
      values.push(val);
    }

    var sql = "INSERT INTO #{table} (#{columns}) VALUES (#{values})".interpolate({
      table: peer.tableName,
      columns: peer.columns,
      values: values
    });

    Snake.query(sql);
  },

  executeUpdate: function (model, peer) {
    var conditions = [];

    for (var i = 0; i < peer.columns.length; i = i + 1) {
      var val = model[peer.columns[i]] || false;
      val = val ? "'" + val + "'" : "NULL";

      if (model[peer.columns[i]] !== model['_' + peer.columns[i]]) {
        conditions.push(peer.columns[i] + " = " + val);
      }
    }

    var sql = "UPDATE #{table} SET #{conditions} WHERE id = #{id}".interpolate({
      table: peer.tableName,
      conditions: conditions,
      id: model.id
    });

    Snake.query(sql);
  },

  executeDelete: function (peer) {
    this.from = peer.tableName;  

    // build select
    var sql = "DELETE FROM #{from}".interpolate({
      from: this.from
    });

    // where
    if (this.where.length > 0) {
      sql = sql + " WHERE #{where}".interpolate({ where: this.where });
    }

    // reset results
    this.from = [];
    this.where = [];

    console.log(sql);
  }
};
