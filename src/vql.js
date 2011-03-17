Snake.VenomousObject = function (schema) {
  var Selectors = {},
      Model = {},
      queryBuilder = null,
      addWhere = null,
      resetObj = null;

  resetObj = function () {
    Model.sql = {
      dontExecuteQuery: false,
      select: [],
      from: schema.tableName,
      where: {
        criterion: [],
        params: []
      },
      orderBy: [],
      limit: false
    };
  };

  addWhere = function () {
    var field = arguments[0],
        value = arguments[1],
        selector = arguments[2] || Selectors.EQUAL,
        q = [],
        i = 0;

    if (field in schema.columns) {
      field = schema.tableName + "." + field;
    }

    switch (selector) {
    case Selectors.ISNULL:
    case Selectors.ISNOTNULL:
      Model.sql.where.criterion.push(field + " " + selector);
      break;

    case Selectors.IN:
    case Selectors.NOTIN:
      for (i = 0; i < value.length; i = i + 1) {
        q.push("?");
      }

      Model.sql.where.criterion.push(field + " " + selector + " (" + q.join(", ") + ")");
      break;

    default:
      Model.sql.where.criterion.push(field + " " + selector + " ?");
    }

    if (value) {
      if (Snake.is_array(value)) {
        Model.sql.where.params = Model.sql.where.params.concat(value);
      } else {
        Model.sql.where.params.push(value);
      }
    }
  };

  queryBuilder = function (sql, query, onSuccess, onFailure) {
    var params = null;
    query = query || {};

    // FROM
    query.from = schema.tableName;

    // TODO JOINs

    // WHERE
    if (Model.sql.where.criterion.length > 0) {
      sql = sql + " WHERE #{where}";
      // build the where...
      query.where = Model.sql.where.criterion.join(" AND ");

      params = Model.sql.where.params;
    }

    // ORDER BY
    if (Model.sql.orderBy.length > 0) {
      sql = sql + " ORDER BY #{orderBy}";
      query.orderBy = Model.sql.orderBy;
    }

    // LIMIT && OFFSET
    if (Model.sql.limit) {
      if (Model.sql.offset) {
        sql = sql + " LIMIT #{offset}, #{limit}";
        query.offset = Model.sql.offset;
      } else {
        sql = sql + " LIMIT #{limit}";
      }

      query.limit = Model.sql.limit;
    }

    // if this query is not meant to be executed then we send it back to the onSuccess callback with the parameters Query {String}, Params {Array}
    if (Model.sql.dontExecuteQuery === true) {
      if (onSuccess) {
        onSuccess(sql.interpolation(query), params);
      }

    // We run the query
    } else {
      Snake.query(sql.interpolation(query), params, function (transaction, results) {
        var arr = [],
            i = 0,
            obj = null,
            tmp = null,
            prop = null;
        
        if (results.rows.length > 0) {
          for (i = 0; i < results.rows.length; i = i + 1) {

            obj = results.rows.item(i);
            tmp = new Snake.global[schema.jsName]();

            for (prop in obj) {
              if (obj.hasOwnProperty(prop)) {
                tmp[prop] = obj[prop];
                tmp['$nk_' + prop] = obj[prop];
              }
            }

            arr.push(tmp);
          }
        }

        if (onSuccess) {
          onSuccess(arr);
        }
      }, onFailure);

    }

    resetObj();
  };

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

        addWhere(field, value, selector);

      // we're not passing each argument
      } else {

        // Pull by ID
        if (typeof(arguments[0]) === "number") {

          addWhere("id", arguments[0]);

        // It's an object
        } else {

          // loop through each field
          for (field in arguments[0]) {

            if (arguments[0].hasOwnProperty(field)) {
              // the value is the property of the field
              value = arguments[0][field];

              switch (Object.prototype.toString.call(value)) {
              // if the value is an Array then we perform an IN query
              case "[object Array]":
                selector = Selectors.IN;
                addWhere(field, value, selector);
                break;

              // if the value is a Regular Expression then we perform a LIKE query
              case "[object RegExp]": 
                // TODO - NOT LIKE
                selector = Selectors.LIKE;
                tmp = value.toString();
                value = tmp;
                tmp = value.replace(/\W/g, "");

                if (value.substr(1, 1) === '^') {
                  value = tmp + '%';
                } else if (value.substr(-2, 1) === '$') {
                  value = '%' + tmp;
                } else {
                  value = '%' + tmp + '%';
                }

                addWhere(field, value, selector);
                break;

              // if the value is an Object then we need to loop through all the items in the object and set them for the current field
              case "[object Object]":
                for (tmp in value) {
                  if (value.hasOwnProperty(tmp)) {
                    selector = Selectors[tmp] || Selectors.EQUAL;

                    addWhere(field, value[tmp], selector);
                  }
                }
                break;

              // by default the selector is =
              default:
                selector = Selectors.EQUAL;
                addWhere(field, value, selector);
              }
            }

          } // loop

        } // typeof num

      } // endif

      return this;
    },

    orderBy: function (obj) {
      var column = null,
          sortOrder = "";
      for (column in obj) {
        if (obj.hasOwnProperty(column)) {
          sortOrder = obj[column].toUpperCase();
          if (column in schema.columns) {
            column = schema.tableName + "." + column;
          }
          this.sql.orderBy.push(column + " " + sortOrder);
        }
      }

      return this;
    },

    join: function (table, join_method) {
      join_method = Selectors[join_method] || Selectors.LEFT_JOIN;

      // FIXME -- need to lookup the schema information for the current table and match it up with the primary or foreign key on the other table
      // possible syntax
      // this.join(vql.Deck);
    },

    offset: function (offset) {
      this.sql.offset = offset;
      return this;
    },

    limit: function (limit) {
      this.sql.limit = limit;
      return this;
    },

    // just outputs the sql
    toSQL: function () {
      this.sql.dontExecuteQuery = true;
      return this;
    },

    // retrieves by the current models primary key
    retrieveByPK: function (pk, onSuccess, onFailure) {
      this.find(pk).doSelectOne(onSuccess, onFailure);
    },

    // limits 1, returns obj
    doSelectOne: function (onSuccess, onFailure) {
      this.limit(1).doSelect(onSuccess, onFailure);
    },

    // returns count
    doCount: function (onSuccess, onFailure, useDistinct) {
      useDistinct = useDistinct ? "DISTINCT " : "";
      var sql = "SELECT COUNT(" + useDistinct + "#{select}) FROM #{from}",
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.select;
      }

      queryBuilder(sql, query, onSuccess, onFailure);
    },

    // deletes objects
    doDelete: function (onSuccess, onFailure) {
      queryBuilder("DELETE FROM #{from}", null, onSuccess, onFailure);
    },

    // returns Array of objs
    doSelect: function (onSuccess, onFailure) {
      var sql = "SELECT #{select} FROM #{from}",
          query = {};

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

      queryBuilder(sql, query, onSuccess, onFailure);
    }


  };

  resetObj();

  return Model;
};

Snake.Venom = {};

var Venom = Snake.Venom,
    vql = Venom;
