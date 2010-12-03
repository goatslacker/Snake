// Prototype
Array.prototype.in_array = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === val) {
      return true;
    }
  }
  return false;
};

// Crockford
/*
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Function.method('inherits', function (parent) {
    var d = {}, p = (this.prototype = new parent());
    this.method('uber', function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }        
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    });
    return this;
});
*/

// base object
var Snake = {};

Snake.init = function (o) {
  
  if (!o) {
    console.log("Error, configuration file not loaded");
    return false;
  }

  Snake.loadSchema(o);
  //Snake.buildModel();
  //Snake.buildSql();

  Snake.connect(function () {
    Snake.insertSql();
  }, function (errorText) {
    console.log(errorText);
  });
};

// load all items into a config file
Snake.loadSchema = function (o) {
  // need to load defaults!
  Snake.config = o;
  return true;
};

// Create the database connection
Snake.connect = function (onSuccess, onFailure) {
  var db = Snake.config.database;
  onSuccess = onSuccess || function () {};
  onFailure = onFailure || function () {};
  Snake.db = openDatabase(db.name, db.version, db.displayName, db.size);

  if (!Snake.db) {
    onFailure("Could not open database");
  } else {
    onSuccess();
  }
};

// query the database
Snake.query = function (query, onSuccess, onFailure) {
  onSuccess = onSuccess || function (transaction, results) {
    console.log(transaction);
    console.log(results);
  };
  onFailure = onFailure || function (transaction, error) {
    console.log(transaction);
    console.log(error);
  };

  if (!Snake.db) {
    Snake.connect(); // TODO need to callback query with same params
  } else {
    Snake.db.transaction(function (transaction) {
      console.log('===Excuting Query===');
      query = query + ";";
      console.log(query);

      transaction.executeSql(query, [], onSuccess, onFailure);
    });
  }
};

// creates the SQL from the schema
Snake.buildSql = function () {

  var o = Snake.config;

  if (!o.sql) {
    o.sql = [];
    // build sql
    for (var tableName in o.schema) {
      if (o.schema.hasOwnProperty(tableName)) {

        // init sql
        var sql = "CREATE TABLE IF NOT EXISTS '#{table}' (#{columns})";

        // table object
        var table = o.schema[tableName];

        // columns array
        var columns = [];
        var foreign = {
          key: [],
          table: [],
          reference: []
        };

        // loop through each column
        for (var columnName in table.columns) {
          if (table.columns.hasOwnProperty(columnName)) {

            // column object
            var column = table.columns[columnName];

            // push into columns array
            columns.push("#{column} #{type} #{constraints}".interpolate({
              column: columnName,
              type: column.type.toUpperCase()
            }));

            if (column.foreign) {
              var foreignItem = column.foreign.split(".");
              foreign.key.push(columnName);
              foreign.table.push(foreignItem[0]);
              foreign.reference.push(foreignItem[1]);
            }

          }
        }

        // interpolate the sql
        sql = sql.interpolate({
          table: tableName,
          columns: columns
        });

        if (foreign.key.length > 0) { // TODO test
          sql = sql + " FOREIGN KEY (#{key}) REFERENCES #{table}(#{reference})".interpolate({
            key: foreign.key,
            table: foreign.table,
            reference: foreign.reference
          });
        }

        // load into config
        Snake.config.sql.push(sql);
      }
    }
  }

};

// creates the objects from the schema
Snake.buildModel = function () {

  var o = Snake.config;

  // build objects?
  for (var tableName in o.schema) {
    if (o.schema.hasOwnProperty(tableName)) {

      // table object
      var table = o.schema[tableName];

      console.log(tableName);
/*
      if (!window[table.jsName] || !window[table.jsName + 'Peer']) {

        // create the peer class
        window[table.jsName + 'Peer'] = new Snake.BasePeer(tableName);
        var peer = window[table.jsName + 'Peer'];
        peer.columns = [];
        peer.fields = {};

        // create the model
        window[table.jsName] = new Snake.Base(peer);
        var model = window[table.jsName];

        console.log(model);

        // TODO autocreate the ID and CREATED_AT


        // store foreign elements
        var foreign = [];

        // loop through each column
        for (var columnName in table.columns) {
          if (table.columns.hasOwnProperty(columnName)) {

            // column object
            var column = table.columns[columnName];

            model.prototype[columnName] = null;

            peer[columnName.toUpperCase()] = tableName + "." + columnName;
            peer.columns.push(columnName);
            peer.fields[columnName] = column;

            if (column.foreign) {
              var foreignItem = column.foreign.split(".");
              foreign.push({
                key: columnName,
                table: foreignItem[0],
                reference: foreignItem[1]
              });
            }
          }
        }

        // build peer
        peer.tableName = tableName;
        peer.doSelect = function (criteria, callback) {
          criteria = criteria || new Snake.Criteria();
         
          criteria.executeSelect(this, callback);
        };
        // build doSelectJoins
        if (foreign.length > 0) {
          for (var i = 0; i < foreign.length; i = i + 1) {
            peer['doSelectJoin' + foreign.table] = function (criteria, callback) {
              criteria = criteria || new Snake.Criteria();

              //criteria.addJoin();
              criteria.executeSelect(this, callback);
            }
          }
        }
        peer.update = function (model) {
          var criteria = new Snake.Criteria();
          if (model.id === null) {
            criteria.executeInsert(model, this);
          } else {
            criteria.executeUpdate(model, this);
          }
        };

        peer.retrieveByPK = function (pk, callback) {
          var c = new Snake.Criteria();
          c.add(this.ID, pk);
          this.doSelect(c, callback);
        };

        // model native methods
        model.prototype.peer = peer;
        model.prototype.save = function () {
          this.peer.update(this);
        };

      }
*/
    }
  }

};

// loads all the tables into the database
Snake.insertSql = function (drop_existing) {
  if (Snake.config.sql.length > 0) {
    drop_existing = drop_existing || false;

    Snake.connect(function () {

      // TODO drop_existing

      for (var i = 0; i < Snake.config.sql.length; i = i + 1) {
        Snake.query(Snake.config.sql[i]);
      }
    });
  }
};


// Base Classes
Snake.Base = function (peer) {
  this.peer = peer;
};

Snake.Base.prototype = {
  save: function () {
    this.peer.update(this);
  } 
};

Snake.BasePeer = function (tableName) {
  this.columns = [];
  this.fields = {};

  this.tableName = tableName;
};

Snake.BasePeer.prototype = {
  doSelect: function (criteria, callback) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeSelect(this, callback);
  }, 

  update: function (model) {
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

    // build select
    var sql = "SELECT #{select} FROM #{from}".interpolate({
      select: this.select,
      from: this.from
    });

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

    // reset results
    this.select = [];
    this.from = [];
    this.where = [];

    Snake.query(sql, callback);
  },

  executeInsert: function (model, peer) {
    var values = [];

    for (var i = 0; i < peer.columns.length; i = i + 1) {
      var val = model[peer.columns[i]] || false;
      //console.log(peer.fields[peer.columns[i]].type);
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
      conditions.push(peer.columns[i] + " = " + val); // TODO compare with previous values, if unchanged don't set them
    }

    var sql = "UPDATE #{table} SET #{conditions} WHERE id = #{id}".interpolate({
      table: peer.tableName,
      conditions: conditions,
      id: model.id
    });

    Snake.query(sql);
  }
};
