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

    var Base = {
      limit: function (context, limit) {
        context.sql.limit = limit;
        return context;
      },

      offset: function (context, offset) {
        context.sql.offset = offset;
        return context;
      },

      orderBy: function (context, obj) {
        for (var column in obj) {
          context.sql.orderBy.push(column + " " + obj[column].toUpperCase());
        }

        return context;
      },

      toSQL: function (self) {
        var sql = "SELECT #{select} FROM #{from}"
          , query = {};

        // SELECT
        query.select = "*";

        if (self.sql.select.length === 0) {
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
          query.select = self.sql.select;
        }

        // FROM
        query.from = table;

        // WHERE
        if (self.sql.where.length > 0) {
          sql = sql + " WHERE #{where}";
          query.where = self.sql.where.join(" AND ");
        }
    
        // ORDER BY
        if (self.sql.orderBy.length > 0) {
          sql = sql + " ORDER BY #{orderBy}";
          query.orderBy = self.sql.orderBy;
        }

        // LIMIT && OFFSET
        if (self.sql.limit) {
          if (self.sql.offset) {
            sql = sql + " LIMIT #{offset}, #{limit}";
            query.offset = self.sql.offset;
          } else {
            sql = sql + " LIMIT #{limit}";
          }

          query.limit = self.sql.limit;
        }

        return sql.interpose(query);
      }

    };

    var methods = {
      find: function () {

        var VQL = {
          sql: {
            select: [],
            from: table,
            where: [],
            orderBy: [],
            limit: false
          },

          orderBy: function (obj) {
            return Base.orderBy(this, obj);
          },
  
          offset: function (offset) {
            return Base.offset(this, offset);
          },

          limit: function (limit) {
            return Base.limit(this, limit);
          },

          toSQL: function () {
            return Base.toSQL(this);
          }
        };

          var field = null
            , value = null
            , selector = null;

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
            VQL.sql.where.push(field + " " + selector);
          } else {
            VQL.sql.where.push(field + " " + selector + " ?");
          }
        } else {
          for (field in arguments[0]) {
            value = arguments[0][field];

            switch (Object.prototype.toString.call(value)) {
            case "[object Array]":
              selector = Snake.VQL.IN;
              break;
            case "[object RegExp]":
              selector = Snake.VQL.LIKE;
              //console.log(value.toString()); // TODO
              break;
            default:
              selector = Snake.VQL.EQUAL
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

              VQL.sql.where.push(field + " " + selector + " (" + q.join(", ") + ")");
            } else {

              if (field in schema.columns) { // TODO refactor
                field = table + "." + field;
              }

              VQL.sql.where.push(field + " " + selector + " ?");
            }

          }
        }

        return VQL;
      }

    };

    return methods;
  },

  _createPeer: function (schema, onSuccess) {
    for (var table in schema) {
      this[schema[table].jsName] = new this._venom(table, schema[table]);
    }

    if (onSuccess) {
      onSuccess();
    }
  }
};

var Venom = vql = Snake.VQL;
