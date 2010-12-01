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


// setup the models
var Snake = {};

Snake.db = {};

// creates on the fly objects
Snake.db.create = function (o) {

  // build sql
  for (var tableName in o.schema) {
    if (o.schema.hasOwnProperty(tableName)) {

      // init sql
      var sql = "CREATE TABLE IF NOT EXISTS '#{table}' (#{columns});";

      // table object
      var table = o.schema[tableName];

      // columns array
      var columns = [];

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

        }
      }

      // interpolate the sql
      var sql = sql.interpolate({
        table: tableName,
        columns: columns
      });

      console.log(sql);
    }
  }

};

Snake.buildModel = function (o) {

  // build sql and objects?
  for (var tableName in o.schema) {
    if (o.schema.hasOwnProperty(tableName)) {

      // table object
      var table = o.schema[tableName];

      // create the model
      window[table.jsName] = function () { };
      var model = window[table.jsName];

      // create the peer class
      window[table.jsName + 'Peer'] = function () { };
      var peer = window[table.jsName + 'Peer'];
      peer.columns = [];
      peer.fields = {};

      // loop through each column
      for (var columnName in table.columns) {
        if (table.columns.hasOwnProperty(columnName)) {

          // column object
          var column = table.columns[columnName];

          model.prototype[columnName] = null;

//prototype
/*
          model.prototype[columnName] = null;
          model.prototype['set' + columnName] = function (value) {
            this[columnName] = value;
          }
          model.prototype['get' + columnName] = function () {
            console.log(tmp);
            return this[columnName];
          }
*/

// method
/*
          model.method(columnName, null);
          model.method('set' + columnName, function (value) {
            this[columnName] = value;
          });
          model.method('get' + columnName, function () {
            return this[columnName];
          });
*/

          // column names (although I could just pull these from the columns)
          peer[columnName.toUpperCase()] = tableName + "." + columnName;
          peer.columns.push(columnName);
          peer.fields[columnName] = column;
        }
      }

      // build peer
      peer.tableName = tableName;
      peer.doSelect = function (criteria, callback) {
        criteria = criteria || new Snake.Criteria();
       
        criteria.executeQuery(this);
      };
      peer.update = function (model) {
        var criteria = new Snake.Criteria();
        if (model.id === null) {
          criteria.executeInsert(model);
        } else {
          criteria.executeUpdate(model);
        }

/*
        for (var i = 0; i < peer.columns.length; i = i + 1) {
          //console.log(peer.columns[i]);
          console.log(model[peer.columns[i]]);
        }
*/
      };
      peer.retrieveByPK = function (pk, callback) {
        var c = new Snake.Criteria();
        c.add(this.ID, pk);
        this.doSelect(c, callback);
      };

      // model native methods
      model.prototype.getPeer = function () {
        return peer;
      };
      model.prototype.save = function () {
        this.getPeer().update(this);
      };
/*
      model.method('getPeer', function () {
        return peer;
      });
      model.method('save', function () {
        this.getPeer().buildInsert(this);
      });
*/

    }
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

    var from = field.split(".");

    // tables to select from
    if (!this.from.in_array(from[0])) {
      this.from.push(from[0]);
    }

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

  executeQuery: function (peer) {

    // add select columns
    if (this.select.length === 0) {
      for (var i = 0; i < peer.columns.length; i = i + 1) {
        this.select.push(peer.tableName + "." + peer.columns[i]);
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

    console.log(sql);
  },

  executeInsert: function (model) {
    var peer = model.getPeer();

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

    console.log(sql);
  },

  executeUpdate: function (model) {
    var peer = model.getPeer();

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

    console.log(sql);
  }
};
