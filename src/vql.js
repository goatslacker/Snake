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

  VenomousObject: function (schema) {
    var Model = {
      add: function () {
        var field = arguments[0],
            value = arguments[1],
            selector = arguments[2];

        if (field in schema.columns) {
          field = schema.tableName + "." + field;
        }

        switch (selector) {
        case Snake.VQL.ISNULL:
        case Snake.VQL.ISNOTNULL:
          this.sql.where.criterion.push(field + " " + selector);
          break;
    
        case Snake.VQL.IN:
        case Snake.VQL.NOTIN:
          var q = [];

          for (var i = 0; i < value.length; i = i + 1) {
            q.push("?");
          }

          this.sql.where.criterion.push(field + " " + selector + " (" + q.join(", ") + ")");
          break;

/*
        case Snake.VQL.LIKE:
        case Snake.VQL.NOTLIKE:
          //console.log(value);
          break;
*/
        
        default:
          this.sql.where.criterion.push(field + " " + selector + " ?");
        }

        if (value) {
          if (Snake.is_array(value)) {
            this.sql.where.params = this.sql.where.params.concat(value);
          } else {
            this.sql.where.params.push(value);
          }
        }
      },

      find: function () {
        var field = null,
            value = null,
            selector = null,
            tmp = null;

        // if we're passing each argument
        if (arguments.length > 1) {
          // first argument is the field
          field = arguments[0];
          // second argument should be the value
          value = arguments[1];

          // unless the value is actually a selector
          if (value in Snake.VQL) {
            selector = Snake.VQL[value];

          // otherwise the third argument is the selector
          } else {
            selector = Snake.VQL[arguments[2]] || Snake.VQL.EQUAL;
          }

          this.add(field, value, selector);

        // we're not passing each argument
        } else {

          // loop through each field
          for (field in arguments[0]) {

            if (field === 'or' || field === 'and') {
              // do something
              // if the field is an or then we have a problem, specially if there's nesting! :)
              console.log(arguments[0][field]);
              // if we have an and then we should run the code below like normal, except that arguments[0] needs to read arguments[0].and 
            } else {

              if (arguments[0].hasOwnProperty(field)) {
                // the value is the property of the field
                value = arguments[0][field];

                switch (Object.prototype.toString.call(value)) {
                // if the value is an Array then we perform an IN query
                case "[object Array]":
                  selector = Snake.VQL.IN;
                  this.add(field, value, selector);
                  break;

                // if the value is a Regular Expression then we perform a LIKE query
                case "[object RegExp]": // TODO not 100% happy with this
                  // TODO - NOT LIKE
                  selector = Snake.VQL.LIKE;
                  tmp = value.toString();
                  value = tmp;
                  tmp = value.replace(/[^A-Za-z_]/g, "");

                  if (value.substr(1, 1) === '^') {
                    value = tmp + '%';
                  } else if (value.substr(-2, 1) === '$') {
                    value = '%' + tmp;
                  } else {
                    value = '%' + tmp + '%';
                  }

                  this.add(field, value, selector);
                  break;

                // if the value is an Object then we need to loop through all the items in the object and set them for the current field
                case "[object Object]":
                  for (tmp in value) {
                    if (value.hasOwnProperty(tmp)) {
                      selector = Snake.VQL[tmp] || Snake.VQL.EQUAL;

                      this.add(field, value[tmp], selector);
                    }
                  }
                  break;

                // by default the selector is =
                default:
                  selector = Snake.VQL.EQUAL;
                  this.add(field, value, selector);
                }
              }

            } // endif OR || AND

          } // loop

        } // endif

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

      toSQL: function (onComplete) { // TODO - pass onComplete
        var sql = "SELECT #{select} FROM #{from}",
            query = {},
            params = null;

        // SELECT
        query.select = "*";

        if (this.sql.select.length === 0) {
          query.select = "*";
/*
// this adds all the columns
          query.select = [];
          for (var column in schema.columns) {
            query.select.push(schema.tableName + "." + column);
          }
        } else {
*/
        } else {
          query.select = this.sql.select;
        }

        // FROM
        query.from = schema.tableName;

        // WHERE
        if (this.sql.where.criterion.length > 0) {
          sql = sql + " WHERE #{where}";
          // build the where...
          query.where = this.sql.where.criterion.join(" AND ");

          params = this.sql.where.params;
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

        if (onComplete) {
          onComplete(sql.interpose(query), params);
        } else {
          return {
            query: sql.interpose(query),
            params: params
          };
        }
      },

      resetQuery: function () {
        this.sql = {
          select: [],
          from: schema.tableName,
          where: {
            criterion: [],
            params: []
          },
          orderBy: [],
          limit: false
        };
      }

    };

    Model.resetQuery();

    return Model;
  },

  _createPeer: function (schema, onSuccess) {
    var table = null,
        model = null;

    for (table in schema) {
      if (schema.hasOwnProperty(table)) {
        model = schema[table];
        model.tableName = table;
        this[schema[table].jsName] = new this.VenomousObject(model);
      }
    }

    if (onSuccess) {
      onSuccess();
    }
  }
};

var Venom = Snake.VQL,
    vql = Venom;
