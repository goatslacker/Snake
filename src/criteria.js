/*
  Criteria Class
  Handles all the dirty SQL work
  // TODO have a buildWhere, buildFrom, buildLimit functions. Separate them into another Object other than Criteria.
*/
Snake.Criteria = function () {
  this.select = [];
  this.from = [];
  this.join = [];
  this.where = {
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

    var i = 0
      , or = []
      , where = "#{field} #{selector} ?";

    if (Snake.is_array(field) && Snake.is_array(value)) {
      for (i = 0; i < field.length; i = i + 1) {
        where = "#{field} #{selector} ?".interpose({
          field: field[i],
          selector: selector
        });
        or.push(where);
      }

      this.where.and.push(or);

      for (i = 0; i < value.length; i = i + 1) {
        this.where.params.push(value[i]);
      }
    } else {
      where = "#{field} #{selector} ?".interpose({
        field: field,
        selector: selector
      });

      this.where.and.push(where);
      this.where.params.push(value);
    }
  },

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

  executeCount: function (peer, callback) {
    var i = 0
      , sql = ""
      , field = null
      , from = null
      , where = null
      , params = null;

    if (this.select.length === 0) {
      this.select.push(peer.tableName + "." + peer.columns[0]);
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

    // build select
    sql = "SELECT COUNT(*) AS count FROM #{from}".interpose({
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
    if (this.where.and.length > 0) {
      for (i = 0; i < this.where.and.length; i = i + 1) {
        if (Snake.is_array(this.where.and[i])) {
          this.where.and[i] = "(" + this.where.and[i].join(" OR ") + ")";
        }
      }

      where = this.where.and.join(" AND ");

      sql = sql + " WHERE " + where;
      params = this.where.params;
    }

    // order by
    if (this.order.length > 0) {
      sql = sql + " ORDER BY #{order}".interpose({ order: this.order });
    }

    Snake.query(sql, params, function (transaction, results) {
      if (callback) {
        var obj = results.rows.item(0);
        callback(obj.count);
      }
    });
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
    if (this.where.and.length > 0) {
      for (i = 0; i < this.where.and.length; i = i + 1) {
        if (Snake.is_array(this.where.and[i])) {
          this.where.and[i] = "(" + this.where.and[i].join(" OR ") + ")";
        }
      }

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
          tmp = new Snake.global[peer.jsName]();

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

    Snake.query(sql, values, function (transaction, results) {
      if (onSuccess) {
        onSuccess(model);
      }
    }, onFailure);
  },

  executeDelete: function (peer, onSuccess, onFailure) {
    var sql = ""
      , where = ""
      , params = null;

    this.from = peer.tableName;  

    // build select
    sql = "DELETE FROM #{from}".interpose({
      from: this.from
    });

    // where
    if (this.where.and.length > 0) {
      for (i = 0; i < this.where.and.length; i = i + 1) {
        if (Snake.is_array(this.where.and[i])) {
          this.where.and[i] = "(" + this.where.and[i].join(" OR ") + ")";
        }
      }

      where = this.where.and.join(" AND ");

      sql = sql + " WHERE " + where;
      params = this.where.params;
    }

    Snake.query(sql, params, onSuccess, onFailure);
  }
};

"Criteria" in Snake.global || (Snake.global.Criteria = Snake.Criteria);
