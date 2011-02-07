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
  this.offset = false;
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
  ISNULL: "IS NULL",
  ISNOTNULL: "IS NOT NULL",
  LIKE: "LIKE",
  NOTLIKE: "NOT LIKE",
  "IN": "IN",
  NOTIN: "NOT IN",

  add: function (field, value, selector) {
    // check if value is a selector
    if (value in this) {
      selector = this[value]; 
    } else {
      selector = this[selector] || this.EQUAL;
    }

    var i = 0
      , or = []
      , where = "#{field} #{selector} ?";

    // handles IS NULL || IS NOT NULL
    if (selector === this.ISNULL || selector === this.ISNOTNULL) {
      where = "#{field} #{selector}".interpose({
        field: field,
        selector: selector
      });

    // all other queries
    } else {

      // handles Or || IN || NOT IN
      if (Snake.is_array(field) && Snake.is_array(value)) {
        for (i = 0; i < field.length; i = i + 1) {
          or.push("?");
        }

        // IN || NOT IN
        if (selector === this["IN"] || selector === this.NOTIN) {
          where = "#{field} #{selector} (#{rsIn})".interpose({
            field: field[i],
            selector: selector,
            rsIn: q
          });

        // Or
        } else {

          for (i = 0; i < field.length; i = i + 1) {
            where = where.interpose({
              field: field[i],
              selector: selector
            });
            or.push(where);
          }

          this.where.and.push(or);
        }

        // push the params into an Array
        for (i = 0; i < value.length; i = i + 1) {
          this.where.params.push(value[i]);
        }

      // handles And
      } else {
        where = where.interpose({
          field: field,
          selector: selector
        });

        this.where.and.push(where);
        this.where.params.push(value);
      }

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

  setOffset: function (offset) {
    offset = offset || false;

    if (offset) {
      this.offset = offset;
    }
  },

  executeCount: function (peer, callback) {
    this.select.push("COUNT(*) AS count");
    this.from.push(peer.tableName);
    this.buildQuery("SELECT", peer, callback);
  },

  executeSelect: function (peer, callback) {
    this.buildQuery("SELECT", peer, callback);
  },

  buildQuery: function (operation, peer, onSuccess, onFailure) {
    var sql = "";

    // INSERT
    if (operation === "INSERT") {
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

    // SELECT || UPDATE || DELETE
    } else {

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

      if (this.from.length === 0) {
      // add the from
      for (i = 0; i < this.select.length; i = i + 1) {
        field = this.select[i];

        from = field.split(".");
        // tables to select from
        if (!this.from.in_array(from[0])) {
          this.from.push(from[0]);
        }
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

    }    

    if (Snake.debug === true) {
      onSuccess(sql, params);
    }

    // select || update || delete

    // add the froms

    // joins

    // where

    // orderby

    // offset/limit
  }
};

"Criteria" in Snake.global || (Snake.global.Criteria = Snake.Criteria);
