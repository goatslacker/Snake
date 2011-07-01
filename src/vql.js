/**
  * Creates the `Query Building` object which is used to extract data from the database
  *
  * @constructor
  * @param {Object} schema The object's schema
  * @returns {Object}
  */
Snake.collection = function (schema) {
  /**
    * @private
    */
  var SELECTORS = {},
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
      distinct: false,
      persist: true,
      select: [],
      from: schema.tableName,
      joins: [],
      where: {
        criterion: [],
        params: []
      },
      orderBy: [],
      groupBy: [],
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
        selector = arguments[2] || SELECTORS.EQUAL,
        q = [];

    if (field in schema.columns) {
      field = schema.tableName + "." + field;
    }

    switch (selector) {
    case SELECTORS.ISNULL:
    case SELECTORS.ISNOTNULL:
      Collection.sql.where.criterion.push(field + " " + selector);
      break;

    case SELECTORS.IN:
    case SELECTORS.NOTIN:
      value.forEach(function (val) {
        q.push("?");
      });

      Collection.sql.where.criterion.push(field + " " + selector + " (" + q.join(", ") + ")");
      break;

    default:
      Collection.sql.where.criterion.push(field + " " + selector + " ?");
    }

    if (value) {
      if (Array.isArray(value)) {
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
  queryBuilder = function (sql, query, onComplete) {
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

    // GROUP BY
    if (Collection.sql.groupBy.length > 0) {
      sql = sql + " GROUP BY #{groupBy}";
      query.groupBy = Collection.sql.groupBy;
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
    if (Collection.persist) {
      Snake.query(interpolate(sql, query), params, onComplete);

    // use the callback to return the query
    } else {
      if (onComplete) {
        onComplete(null, interpolate(sql, query), params);
      }
    }

    resetObj();
  };

  /**
    * @private
    * @constant
    */
  SELECTORS = {
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
      * @param {string} arguments The field names to select
      * @example
      * SELECT nebulas, black_holes, stars FROM galaxies;
      * vql.galaxies.select("nebulas", "black_holes", "stars").doSelect(callback);
      * @returns {Object} this 
      */
    select: function () {
      var self = this;

      Array.prototype.forEach.call(arguments, function (args) {
        if (schema.columns.hasOwnProperty(args)) {
          self.sql.select.push(schema.tableName + "." + args);
        }
      });

      return this;
    },

    toSQL: function (persist) {
      if (typeof persist === "undefined") {
        persist = this.sql.persist;
      }
      this.sql.persist = !persist;
      return this;
    },

    /**
      * Prefixes the SQL statement with DISTINCT in order to filter out the duplicate entries
      *
      * @param {string} arguments The field names to apply select to
      * @example
      * SELECT DISTINCT nebulas, black_holes, stars FROM galaxies;
      * vql.galaxies.distinct("nebulas", "black_holes", "stars").doSelect(callback);
      * @returns {Object} this 
      */
    distinct: function () {
      this.sql.distinct = true;
      this.select.apply(this, arguments);
      return this;
    },

    /**
      * Filters the results by the criteria specified
      *
      * @param {string} arguments
      * @example
      * SELECT * FROM fruits WHERE name = 'mango';
      * vql.fruits.find({ name: "mango" }).doCount(callback);
      * vql.fruits.find("name", "mango").doCount(callback);
      * @returns {Object} this 
      */
    find: function () {
      var args = Array.prototype.slice.call(arguments, 0),
          field = null,
          value = null,
          selector = null;

      // if we're passing each argument
      if (args.length > 1) {
        // first argument is the field
        field = args[0];
        // second argument should be the value
        value = args[1];

        // unless the value is actually a selector
        if (value in SELECTORS) {
          selector = SELECTORS[value];

        // otherwise the third argument is the selector
        } else {
          selector = SELECTORS[args[2]] || SELECTORS.EQUAL;
        }

        addWhere(field, value, selector);

      // we're not passing each argument
      } else {

        // Pull by ID
        if (typeof(args[0]) === "number") {

          addWhere("id", args.shift());

        // It's an object
        } else {

          // loop through each field
          Object.keys(args[0]).forEach(function (field) {
            var tmp = null;

            // the value is the property of the field
            value = args[0][field];

            switch (Object.prototype.toString.call(value)) {
            // if the value is an Array then we perform an IN query
            case "[object Array]":
              selector = SELECTORS.IN;
              addWhere(field, value, selector);
              break;

            // if the value is a Regular Expression then we perform a LIKE query
            case "[object RegExp]": 
              selector = SELECTORS.LIKE;
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
              Object.keys(value).forEach(function (tmp) {
                selector = SELECTORS[tmp] || SELECTORS.EQUAL;
                addWhere(field, value[tmp], selector);
              });
              break;

            // by default the selector is =
            default:
              selector = SELECTORS.EQUAL;
              addWhere(field, value, selector);
            }
          });

        } // typeof num

      } // endif

      return this;
    },

    /**
      * Orders the result set in ascending or descending order by a column
      *
      * @param {Object} obj The fields to order by along with their order
      * @example
      * SELECT * FROM tasks ORDER BY priority DESC;
      * vql.tasks.orderBy({ priority: 'desc' }).doSelect(callback);
      * @returns {Object} this 
      */
    orderBy: function (obj) {
      var self = this;

      Object.keys(obj).forEach(function (column) {
        var sortOrder = obj[column].toUpperCase();
        if (schema.columns.hasOwnProperty(column)) {
          column = schema.tableName + "." + column;
        }
        self.sql.orderBy.push(column + " " + sortOrder);
      });

      return this;
    },

    /**
      * Groups results by a column specified
      *
      * @param {string} arguments The fields to group by
      * @example
      * SELECT * FROM population GROUP BY ethnicity;
      * vql.population.groupBy('ethnicity');
      * @returns {Object} this 
      */
    groupBy: function () {
      var self = this,
          args = Array.prototype.slice.call(arguments, 0);

      args.forEach(function (column) {
        var prepared_column = null;

        if (schema.columns.hasOwnProperty(column)) {
          prepared_column = schema.tableName + "." + column;
          self.sql.groupBy.push(prepared_column);
        }
      });

      return this;
    },

    /**
      * Joins two tables together using the table's primary and foreign keys
      * @param {string} table
      * @param {Array} on
      * @param {string} join_method
      * @returns {Object} this 
      */
    join: function (table, on, join_method) {
      var interpolate = Snake.interpolate;

      join_method = SELECTORS[join_method] || SELECTORS.LEFT_JOIN;

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
      * @example
      * SELECT * FROM cars LIMIT 5, 10;
      * vql.cars.offset(5).limit(10).doSelect(callback);
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
      * @example
      * SELECT * FROM cars LIMIT 10;
      * vql.cars.limit(10).doSelect(callback);
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
      * @param {Function} onComplete The function to callback once the operation completes successfully
      */
    retrieveByPK: function (pk, onComplete) {
      this.find(pk).doSelectOne(onComplete);
    },

    /**
      * Retrieves one record from the database from the specified criteria 
      *
      * @param {Function} onComplete The function to callback once the operation completes successfully
      */
    doSelectOne: function (onComplete) {
      var callback = null;

      if (this.sql.persist === false) {
        callback = onComplete;
      } else {
        /** @private */
        callback = function (err, rows) {
          if (onComplete) {
            if (rows.length > 0) {
              onComplete(err, rows[0]);
            } else {
              onComplete(null, null);
            }
          }
        };
      }

      this.limit(1).doSelect(callback);
    },

    /**
      * Returns the number of records for a given criteria
      *
      * @param {Function} onComplete The function to callback once the operation completes successfully
      * @param {boolean} useDistinct If true the COUNT is performed as distinct
      */
    doCount: function (onComplete, useDistinct) {
      useDistinct = ((useDistinct || this.sql.distinct === true) && this.sql.select.length > 0) ? "DISTINCT " : "";
      var sql = "SELECT COUNT(" + useDistinct + "#{select}) AS count FROM #{from}",
          callback = null,
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.select;
      }

      if (this.sql.persist === false) {
        callback = onComplete;
      } else {
        /** @private */
        callback = function (err, results) {
          var obj = results[0];

          if (onComplete) {
            onComplete(err, obj.count);
          }
        };
      }

      queryBuilder(sql, query, callback);
    },

    /**
      * Deletes an object from the database
      *
      * @param {Function} onComplete The function to callback once the operation completes successfully
      */
    doDelete: function (onComplete) {
      queryBuilder("DELETE FROM #{from}", null, onComplete);
    },

    /**
      * Returns an Array of objects for the specified criteria
      *
      * @param {Function} onComplete The function to callback once the operation completes successfully
      */
    doSelect: function (onComplete) {
      var sql = "SELECT #{select} FROM #{from}",
          callback = null,
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.distinct ? "DISTINCT " : "";
        query.select = query.select + this.sql.select;
      }

      queryBuilder(sql, query, callback);
    },

    /**
      * Saves a record to the database
      *
      * @param {Function} onComplete The callback to execute if the transaction completes successfully
      */

    // TODO obj can be function as well!
    save: function (obj, onComplete) {
      var isNew = (!obj.hasOwnProperty('id')),
          sql = "",
          q = [],
          params = [],
          interpolate = Snake.interpolate;

      if (isNew) {
        schema.map.forEach(function (map) {
          var val = obj[map] || null;

          if (map === 'created_at' && val === null) {
            val = Date.now();
          }

          params.push(val);
          q.push("?");
        });

        sql = interpolate("INSERT INTO '#{table}' (#{columns}) VALUES (#{q})", {
          table: schema.tableName,
          columns: schema.map,
          q: q
        });
      } else {
        schema.map.forEach(function (map) {
          var val = obj[map] || null;

          if (val === null) {
            return;
          }

          params.push(val);
          q.push(map + " = ?");
        });

        // TODO make sure it exists?
        sql = interpolate("UPDATE #{table} SET #{conditions} WHERE id = ?", {
          table: schema.tableName,
          conditions: q
        });

        params.push(obj.id);
      }

      // We run the query
      if (this.sql.persist === true) {
        Snake.query(sql, params, onComplete);

      // use the callback to return the query
      } else {
        if (onComplete) {
          onComplete(null, sql, params);
        }
      }

      resetObj();
    },

    /**
      * Deletes a record from the database
      *
      * @param {Function} onComplete The callback to execute if the transaction completes successfully
      */
    destroy: function (obj, onComplete) {
      var val = "";

      switch (typeof obj) {
      case "function":
        val = obj();
        val = val.id;
        break;
      case "object":
        val = obj.id;
        break;
      default:
        val = obj;
      }

      if (val) {
        this.find(val).doDelete(onComplete);
      }

      resetObj();
    }

  };

  resetObj();

  return Collection;
};

Snake.vql = {};
