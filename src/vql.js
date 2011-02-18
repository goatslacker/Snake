Snake.VQL = {
  EQUAL: "=", 
  NOT_EQUAL: "<>",
  GREATER_THAN: ">", 
  LESS_THAN: "<", 
  GREATER_EQUAL: ">=", 
  LESS_EQUAL: "<=",
  ISNULL: "IS NULL",
  ISNOTNULL: "IS NOT NULL",
  LIKE: "LIKE",
  NOTLIKE: "NOT LIKE",
  "IN": "IN",
  NOTIN: "NOT IN",
  LEFT_JOIN: "LEFT JOIN",

  _venom: function (table, schema) {

    var Model = {

      find: function () {
        var field = null,
            value = null,
            selector = null;

        if (arguments.length > 1) {
          field = arguments[0];
          value = arguments[1];

          if (value in Snake.VQL) {
            selector = Snake.VQL[value];
          } else {
            selector = Snake.VQL[arguments[2]] || Snake.VQL.EQUAL;
          }

          if (field in schema.columns) {
            field = table + "." + field;
          }
  
          if (selector === Snake.VQL.ISNULL || selector === Snake.VQL.ISNOTNULL) {
            this.sql.where.push(field + " " + selector);
          } else {
            this.sql.where.push(field + " " + selector + " ?");
          }

        } else {
          for (field in arguments[0]) {
            if (arguments.hasOwnProperty(field)) {
              value = arguments[0][field];

              switch (Object.prototype.toString.call(value)) {
              case "[object Array]":
                selector = Snake.VQL.IN;
                break;
              case "[object RegExp]":
                selector = Snake.VQL.LIKE;
                //console.log(value.toString()); // TODO
                break;
              case "[object Object]":
                // need to loop through each item and set it
                //console.log(value[0]); // TODO
                break;
              default:
                selector = Snake.VQL.EQUAL;
              }

              // IN || NOT IN
              if (selector === Snake.VQL.IN || selector === Snake.VQL.NOTIN) {
                var q = [];

                for (var i = 0; i < value.length; i = i + 1) {
                  q.push("?");
                }

                if (field in schema.columns) {
                  field = table + "." + field;
                }

                this.sql.where.push(field + " " + selector + " (" + q.join(", ") + ")");
              } else {

                if (field in schema.columns) { // TODO refactor
                  field = table + "." + field;
                }

                this.sql.where.push(field + " " + selector + " ?");
              }
            }
          }
        }

        return this;
      },

      orderBy: function (obj) {
        var column = null;
        for (column in obj) {
          if (obj.hasOwnProperty(column)) {
            this.sql.orderBy.push(column + " " + obj[column].toUpperCase());
          }
        }

        return this;
      },

      offset: function (offset) {
        this.sql.offset = offset;
        return this;
      },

      limit: function (limit) {
        this.sql.limit = limit;
        return this;
      },

      toSQL: function () { // TODO - pass onSuccess, onFailure
        var sql = "SELECT #{select} FROM #{from}",
            query = {};

        // SELECT
        query.select = "*";

        if (this.sql.select.length === 0) {
          query.select = "*";
/*
// this adds all the columns
          query.select = [];
          for (var column in schema.columns) {
            query.select.push(table + "." + column);
          }
        } else {
*/
        } else {
          query.select = this.sql.select;
        }

        // FROM
        query.from = table;

        // WHERE
        if (this.sql.where.length > 0) {
          sql = sql + " WHERE #{where}";
          query.where = this.sql.where.join(" AND ");
        }
    
        // ORDER BY
        if (this.sql.orderBy.length > 0) {
          sql = sql + " ORDER BY #{orderBy}";
          query.orderBy = this.sql.orderBy;
        }

        // LIMIT && OFFSET
        if (this.sql.limit) {
          if (this.sql.offset) {
            sql = sql + " LIMIT #{offset}, #{limit}";
            query.offset = this.sql.offset;
          } else {
            sql = sql + " LIMIT #{limit}";
          }

          query.limit = this.sql.limit;
        }

        this.resetQuery();

        return sql.interpose(query); // TODO return query and params
      },

      resetQuery: function () {
        this.sql = {
          select: [],
          from: table,
          where: [],
          orderBy: [],
          limit: false
        };
      }

    };

    Model.resetQuery();

    return Model;
  },

  _createPeer: function (schema, onSuccess) {
    var table = null;

    for (table in schema) {
      if (schema.hasOwnProperty(table)) {
        this[schema[table].jsName] = new this._venom(table, schema[table]);
      }
    }

    if (onSuccess) {
      onSuccess();
    }
  }
};

var Venom = Snake.VQL,
    vql = Venom;
