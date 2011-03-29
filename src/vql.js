/**
  * Creates the `Query Building` object which is used to extract data from the database
  *
  * @constructor
  * @param {Object} schema The object's schema
  * @returns {Object}
  */
Snake.venomousObject = function (schema) {
  /**
    * @private
    */
  var Selectors = {},
      Collection = {},
      queryBuilder = null,
      addWhere = null,
      resetObj = null;

  /**
    * @private
    * Resets the Query after it returns a result
    */
  resetObj = function () {
    Collection.sql = {
      select: [],
      from: schema.tableName,
      joins: [],
      where: {
        criterion: [],
        params: []
      },
      orderBy: [],
      limit: false
    };
  };

  /**
    * @private
    * Adds a WHERE statement to the query
    */
  addWhere = function () {
    var field = arguments[0],
        value = arguments[1],
        selector = arguments[2] || Selectors.EQUAL,
        q = [],
        i = 0,
        max = 0;

    if (field in schema.columns) {
      field = schema.tableName + "." + field;
    }

    switch (selector) {
    case Selectors.ISNULL:
    case Selectors.ISNOTNULL:
      Collection.sql.where.criterion.push(field + " " + selector);
      break;

    case Selectors.IN:
    case Selectors.NOTIN:
      for (i = 0, max = value.length; i < max; i = i + 1) {
        q.push("?");
      }

      Collection.sql.where.criterion.push(field + " " + selector + " (" + q.join(", ") + ")");
      break;

    default:
      Collection.sql.where.criterion.push(field + " " + selector + " ?");
    }

    if (value) {
      if (Snake.is_array(value)) {
        Collection.sql.where.params = Collection.sql.where.params.concat(value);
      } else {
        Collection.sql.where.params.push(value);
      }
    }
  };

  /**
    * @private
    * Builds the query and passes it onto Snake.query for processing
    */
  queryBuilder = function (persist, sql, query, onSuccess, onFailure) {
    var params = null,
        interpolate = Snake.interpolate;

    query = query || {};

    // FROM
    query.from = schema.tableName;

    if (Collection.sql.joins.length > 0) {
      sql = sql + " " + Collection.sql.joins.join(" ");
    }

    // WHERE
    if (Collection.sql.where.criterion.length > 0) {
      sql = sql + " WHERE #{where}";
      // build the where...
      query.where = Collection.sql.where.criterion.join(" AND ");

      params = Collection.sql.where.params;
    }

    // ORDER BY
    if (Collection.sql.orderBy.length > 0) {
      sql = sql + " ORDER BY #{orderBy}";
      query.orderBy = Collection.sql.orderBy;
    }

    // LIMIT && OFFSET
    if (Collection.sql.limit) {
      if (Collection.sql.offset) {
        sql = sql + " LIMIT #{offset}, #{limit}";
        query.offset = Collection.sql.offset;
      } else {
        sql = sql + " LIMIT #{limit}";
      }

      query.limit = Collection.sql.limit;
    }

    // We run the query
    if (persist) {
      Snake.query(interpolate(sql, query), params, onSuccess, onFailure);

    // use the callback to return the query
    } else {
      if (onSuccess) {
        onSuccess(interpolate(sql, query), params);
      }
    }

    resetObj();
  };

  /**
    * @private
    * @constant
    */
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

  /**
    * @public
    * @constructor
    * @this {Collection} The collection object - in order to chain calls
    */
  Collection = {

    /**
      * Adds select columns to the query
      *
      * @param {string} args The field names to select
      * @example
      * vql.fruits.select(id, tree_id, name, description).doSelect(callback);
      * @returns {Object} this 
      */
    select: function () {
      for (var i = 0, max = arguments.length; i < max; i = i + 1) {
        if (arguments[i] in schema.columns) {
          this.sql.select.push(schema.tableName + "." + arguments[i]);
        }
      }

      return this;
    },

    /**
      * Filters the results by the criteria specified
      *
      * @param {string} args The field names to select
      * @example
      * vql.fruits.find({ name: "mango" }).doCount(callback);
      * vql.fruits.find("name", "mango").doCount(callback);
      * @returns {Object} this 
      */
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

    /**
      * Orders the result set in ascending or descending order by a column
      *
      * @param {Object} obj The fields to order by along with their order
      * @example
      * vql.fruits.orderBy({ id: 'desc' }).doSelect(callback);
      * @returns {Object} this 
      */
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

    /**
      * Joins two tables together using the table's primary and foreign keys
      * TODO params
      * @returns {Object} this 
      */
    join: function (table, on, join_method) {
      var interpolate = Snake.interpolate;

      join_method = Selectors[join_method] || Selectors.LEFT_JOIN;

      // find relationship and join the tables
      if (!on) {
        // this.join(vql.Deck);
        if ("foreign" in schema && table in schema.foreign) {
          this.sql.joins.push(interpolate("#{join_method} #{foreign_table} ON #{table}.#{primary_key} = #{foreign_table}.#{foreign_key}", {
            join_method: join_method,
            foreign_table: table,
            table: schema.tableName,
            primary_key: schema.foreign[table][0],
            foreign_key: schema.foreign[table][1]
          }));
        }
      // join it on the parameters provided
      } else {
        this.sql.joins.push(interpolate("#{join_method} #{foreign_table} ON #{table}.#{primary_key} = #{foreign_table}.#{foreign_key}", {
          join_method: join_method,
          foreign_table: table,
          table: schema.tableName,
          primary_key: on[0],
          foreign_key: on[1]
        }));
      }

      return this;
    },

    /**
      * Provides an offset or 'skips' a number of records
      *
      * @param {number} offset The number of records to skip
      * @returns {Object} this
      */
    offset: function (offset) {
      this.sql.offset = offset;
      return this;
    },

    /**
      * Limits the return result set to a set number of records
      *
      * @param {number} limit The number of records to return
      * @returns {Object} this
      */
    limit: function (limit) {
      this.sql.limit = limit;
      return this;
    },

    /**
      * Retrieves one record by the current collection's primary key
      *
      * @param {number} pk The primary key to retrieve from the database
      * @param {Function} onSuccess The function to callback once the operation completes successfully
      * @param {Function} onFailure The function to callback if the operation fails
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise we attempt to retrieve the data from the database
      */
    retrieveByPK: function (pk, onSuccess, onFailure, outputSql) {
      this.find(pk).doSelectOne(onSuccess, onFailure, outputSql);
    },

    /**
      * Retrieves one record from the database from the specified criteria 
      *
      * @param {Function} onSuccess The function to callback once the operation completes successfully
      * @param {Function} onFailure The function to callback if the operation fails
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise we attempt to retrieve the data from the database
      */
    doSelectOne: function (onSuccess, onFailure, outputSql) {
      var callback = null;

      if (outputSql === true) {
        callback = onSuccess;
      } else {
        /** @private */
        callback = function (rows) {
          if (onSuccess) {
            if (rows.length > 0) {
              onSuccess(rows[0]);
            } else {
              onSuccess(null);
            }
          }
        };
      }

      this.limit(1).doSelect(callback, onFailure, outputSql);
    },

    /**
      * Returns the number of records for a given criteria
      *
      * @param {Function} onSuccess The function to callback once the operation completes successfully
      * @param {Function} onFailure The function to callback if the operation fails
      * @param {boolean} useDistinct If true the COUNT is performed as distinct
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise we attempt to retrieve the data from the database
      */
    doCount: function (onSuccess, onFailure, useDistinct, outputSql) {
      useDistinct = (useDistinct && this.sql.select.length > 0) ? "DISTINCT " : "";
      var sql = "SELECT COUNT(" + useDistinct + "#{select}) AS count FROM #{from}",
          callback = null,
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.select;
      }

      if (outputSql === true) {
        callback = onSuccess;
      } else {
        /** @private */
        callback = function (transaction, results) {
          var obj = results.rows.item(0);

          if (onSuccess) {
            onSuccess(obj.count);
          }
        };
      }

      queryBuilder(!outputSql, sql, query, callback, onFailure);
    },

    /**
      * Deletes an object from the database
      *
      * @param {Function} onSuccess The function to callback once the operation completes successfully
      * @param {Function} onFailure The function to callback if the operation fails
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise we attempt to retrieve the data from the database
      */
    doDelete: function (onSuccess, onFailure, outputSql) {
      queryBuilder(!outputSql, "DELETE FROM #{from}", null, onSuccess, onFailure);
    },

    /**
      * Returns an Array of objects for the specified criteria
      *
      * @param {Function} onSuccess The function to callback once the operation completes successfully
      * @param {Function} onFailure The function to callback if the operation fails
      * @param {boolean} outputSql If true the SQL is returned to the onSuccess callback as a string, otherwise we attempt to retrieve the data from the database
      */
    doSelect: function (onSuccess, onFailure, outputSql) {
      var sql = "SELECT #{select} FROM #{from}",
          callback = null,
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.select;
      }

      if (outputSql === true) {
        callback = onSuccess;
      } else {
        /** @private */
        callback = function (transaction, results) {
          var arr = [],
              i = 0,
              max = 0,
              model = null,
              rows = results.rows;
          
          if (rows.length > 0) {
            for (i = 0, max = rows.length; i < max; i = i + 1) {
              model = Snake.global[schema.jsName].allocate(rows.item(i));
              arr.push(model);
            }
          }

          if (onSuccess) {
            onSuccess(arr);
          }
        };
      }

      queryBuilder(!outputSql, sql, query, callback, onFailure);
    }

  };

  resetObj();

  return Collection;
};

Snake.venom = {};

var venom = Snake.venom,
    vql = venom;
