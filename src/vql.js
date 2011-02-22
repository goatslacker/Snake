Snake.VenomousObject = function (schema) {
  var Selectors = {},
      Model = {};

  Selectors = {
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
    LEFT_JOIN: "LEFT JOIN"
  };

  Model = {
    add: function () {
      var field = arguments[0],
          value = arguments[1],
          selector = arguments[2];

      if (field in schema.columns) {
        field = schema.tableName + "." + field;
      }

      switch (selector) {
      case Selectors.ISNULL:
      case Selectors.ISNOTNULL:
        this.sql.where.criterion.push(field + " " + selector);
        break;
  
      case Selectors.IN:
      case Selectors.NOTIN:
        var q = [];

        for (var i = 0; i < value.length; i = i + 1) {
          q.push("?");
        }

        this.sql.where.criterion.push(field + " " + selector + " (" + q.join(", ") + ")");
        break;

/*
      case Selectors.LIKE:
      case Selectors.NOTLIKE:
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
        if (value in Selectors) {
          selector = Selectors[value];

        // otherwise the third argument is the selector
        } else {
          selector = Selectors[arguments[2]] || Selectors.EQUAL;
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
                selector = Selectors.IN;
                this.add(field, value, selector);
                break;

              // if the value is a Regular Expression then we perform a LIKE query
              case "[object RegExp]": // TODO not 100% happy with this
                // TODO - NOT LIKE
                selector = Selectors.LIKE;
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
                    selector = Selectors[tmp] || Selectors.EQUAL;

                    this.add(field, value[tmp], selector);
                  }
                }
                break;

              // by default the selector is =
              default:
                selector = Selectors.EQUAL;
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

    // returns Array of objs
    doSelect: function (onSuccess, onFailure) {
    },

    // limits 1, returns obj
    doSelectOne: function (onSuccess, onFailure) {
    },

    // returns count
    doCount: function (onSuccess, onFailure, useDistinct) {
    },

    // deletes objects
    doDelete: function (onSuccess, onFailure) {
    },

    // retrieves by the current models primary key
    retrieveByPk: function (pk) {
    },

    toSQL: function (onComplete) {
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
};

Snake.createPeer = function (schema, onSuccess) {
  var table = null,
      model = null;

  for (table in schema) {
    if (schema.hasOwnProperty(table)) {
      model = schema[table];
      model.tableName = table;
      Snake.Venom[model.jsName] = new Snake.VenomousObject(model);
      Snake.global[model.jsName].prototype.schema = model;
    }
  }

  if (onSuccess) {
    onSuccess();
  }
};

Snake.Venom = {};

var Venom = Snake.Venom,
    vql = Venom;
