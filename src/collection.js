// ## Snake.Collection
//
// Used by Snake to create a collection.
//
// A collection contains all the query methods for each table.
Snake.collection = function (schema, snake) {

// Available Selector _constant_ types
  var SELECTORS = {
    "EQUAL":          "=",
    "NOT_EQUAL":      "<>",
    "GREATER_THAN":   ">",
    "LESS_THAN":      "<",
    "GREATER_EQUAL":  ">=",
    "LESS_EQUAL":     "<=",
    "ISNULL":         "IS NULL",
    "ISNOTNULL":      "IS NOT NULL",
    "LIKE":           "LIKE",
    "NOTLIKE":        "NOT LIKE",
    "IN":             "IN",
    "NOTIN":          "NOT IN",
    "LEFT_JOIN":      "LEFT JOIN"
  };

  var Collection = {};

// Resets the query once it's been completed
  var resetObj = function () {
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

// Function used to build the where statement for queries
  var addWhere = function (field, value, selector) {
    var q = [];

    selector = selector || SELECTORS.EQUAL;

    if (field in schema.columns) {
      field = schema.tableName + "." + field;
    }

// Here we treat some selectors as special cases
// like `IN` and `NOTIN` which requires the values to be in a list delimited by commas
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

// Builds the query and passes it onto this.SQL for processing
  var queryBuilder = function (sql, query, onComplete) {
    var params = null,
        interpolate = Snake.interpolate;

    query = query || {};

// Adds the `FROM` portion of the SQL query
    query.from = schema.tableName;

    if (Collection.sql.joins.length > 0) {
      sql = sql + " " + Collection.sql.joins.join(" ");
    }

// Creates the `WHERE` part by joining all of the where with `AND` keyword
    if (Collection.sql.where.criterion.length > 0) {
      sql = sql + " WHERE #{where}";
      query.where = Collection.sql.where.criterion.join(" AND ");

      params = Collection.sql.where.params;
    }

// Adds the `ORDER BY` elements
    if (Collection.sql.orderBy.length > 0) {
      sql = sql + " ORDER BY #{orderBy}";
      query.orderBy = Collection.sql.orderBy;
    }

// Adds the `GROUP BY` elements
    if (Collection.sql.groupBy.length > 0) {
      sql = sql + " GROUP BY #{groupBy}";
      query.groupBy = Collection.sql.groupBy;
    }

// Adds any `LIMIT`s && `OFFSET`s
    if (Collection.sql.limit) {
      if (Collection.sql.offset) {
        sql = sql + " LIMIT #{offset}, #{limit}";
        query.offset = Collection.sql.offset;
      } else {
        sql = sql + " LIMIT #{limit}";
      }

      query.limit = Collection.sql.limit;
    }

// Now we run the query
// and use the callback to return the results
// and then we make sure to reset all the fields
    if (Collection.sql.persist) {
      snake.SQL(interpolate(sql, query), params, onComplete);

    } else {
      if (onComplete) {
        onComplete(null, interpolate(sql, query), params);
      }
    }

    resetObj();
  };

// The Collection constructor
//
// returns _this_ in order to chain calls
  Collection = {
// ### Select
//
// #### Adds select columns to the query
//
// Example:
//
//     SELECT nebulas, black_holes, stars FROM galaxies;
//
// is
//
//     db
//      .galaxies
//      .select("nebulas", "black_holes", "stars")
//      .doSelect(callback);
//
// returns {Object} this
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

// ### Distinct
//
// #### Prefixes the SQL statement with DISTINCT in order to filter out the duplicate entries
//
// Example:
//
//     SELECT DISTINCT nebulas, black_holes, stars FROM galaxies;
//
// is
//
//     db
//      .galaxies
//      .distinct("nebulas", "black_holes", "stars")
//      .doSelect(callback);
//
// returns {Object} this
    distinct: function () {
      this.sql.distinct = true;
      this.select.apply(this, arguments);
      return this;
    },

// ### Find
//
// #### Filters the results by the criteria specified
//
// Example:
//
//     SELECT * FROM fruits WHERE name = 'mango';
//
// is
//
//     db.fruits.find({ name: "mango" }).doCount(callback);
//
// or
//
//     db.fruits.find("name", "mango").doCount(callback);
//
// returns {Object} this
    find: function () {
      var args = Array.prototype.slice.call(arguments, 0),
          field = null,
          value = null,
          selector = null;

// If we're passing in each argument then
// the first argument is the field
// the second argument _should_ be the value
// unless the second argument is actually a selector
// otherwise the third argument is the selector
      if (args.length > 1) {
        field = args[0];
        value = args[1];

        if (value in SELECTORS) {
          selector = SELECTORS[value];

        } else {
          selector = SELECTORS[args[2]] || SELECTORS.EQUAL;
        }

        addWhere(field, value, selector);

// If we're not passing in each argument then
// we check if the first argument is a number and if so then
// we retrieve by PK
// otherwise we assume it's an object and we loop through each field
// the value of `args[0][field]` is the property of the field.
      } else {

        if (typeof(args[0]) === "number") {

          addWhere("_id", args.shift());

        } else {

          Object.keys(args[0]).forEach(function (field) {
            var tmp = null;

            value = args[0][field];

// Here we determine which selector we'll be using
// and that depends on the DataType of the value
//
// * If the value is an Array then we perform an IN query
// * If the value is a Regular Expression then we perform a LIKE query
// * If the value is an Object then we need to loop through all the items in the object and set them for the current field
// * By default the selector is `EQUAL`
            switch (Object.prototype.toString.call(value)) {
            case "[object Array]":
              selector = SELECTORS.IN;
              addWhere(field, value, selector);
              break;

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

            case "[object Object]":
              Object.keys(value).forEach(function (tmp) {
                selector = SELECTORS[tmp] || SELECTORS.EQUAL;
                addWhere(field, value[tmp], selector);
              });
              break;

            default:
              selector = SELECTORS.EQUAL;
              addWhere(field, value, selector);
            }
          });

        } // typeof num

      } // endif

      return this;
    },

// ### Order By
//
// #### Orders the result set in ascending or descending order by a column
//
// * __obj__ are the fields to order by along with their order
//
// Example
//
//     SELECT * FROM tasks ORDER BY priority DESC;
//
// is
//
//     db.tasks.orderBy({ priority: 'desc' }).doSelect(callback);
//
// returns {Object} this
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

// ### Group By
//
// #### Groups results by a column specified
//
// Example:
//
//     SELECT * FROM population GROUP BY ethnicity;
//
// is
//
//     db.population.groupBy('ethnicity');
//
// returns {Object} this
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

// ### Join
//
// #### Joins two tables together using the table's primary and foreign keys
//
// * __table__ is the table to join on
//
// * __on__ is an Array which contains the primary key and the foreign key [pk, fk]
//
// * __join_method__ is the method we'll use to join the tables, defaults to `LEFT_JOIN`
//
// returns {Object} this
    join: function (table, on, join_method) {
      var interpolate = Snake.interpolate;

      join_method = SELECTORS[join_method] || SELECTORS.LEFT_JOIN;

      if (!on) {
        if ("foreign" in schema && table in schema.foreign) {
          this.sql.joins.push(interpolate("#{join_method} #{foreign_table} ON #{table}.#{primary_key} = #{foreign_table}.#{foreign_key}", {
            join_method: join_method,
            foreign_table: table,
            table: schema.tableName,
            primary_key: schema.foreign[table][0],
            foreign_key: schema.foreign[table][1]
          }));
        }
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

// ### Offset
//
// #### Provides an offset or 'skips' a number of records
//
// * __offset__ is the number of records we'll skip
//
// Example
//
//     SELECT * FROM cars LIMIT 5, 10;
//
// is
//
//     db
//      .cars
//      .offset(5)
//      .limit(10)
//      .doSelect(callback);
//
// returns {Object} this
    offset: function (offset) {
      this.sql.offset = offset;
      return this;
    },

// ### Limit
//
// #### Limits the return result set to a set number of records
//
// * __limit__ The number of records to return
//
// Example
//
// `SELECT * FROM cars LIMIT 10;`
//
// is
//
//     vql.cars.limit(10).doSelect(callback);
//
// returns {Object} this
    limit: function (limit) {
      this.sql.limit = limit;
      return this;
    },

// ### retrieveByPK
//
// #### Asynchronous call that retrieves one record by the current collection's primary key
//
// * __pk__ is the primary key to retrieve from the database
// * __onComplete__ is the function to callback once the operation completes successfully
    retrieveByPK: function (pk, onComplete) {
      this.find(pk).doSelectOne(onComplete);
    },

// ### doSelectOne
//
// #### Retrieves one record from the database from the specified criteria
//
// * __onComplete__ is the function to callback once the operation completes successfully
    doSelectOne: function (onComplete) {
      this.limit(1).doSelect(this.sql.persist ? function (err, rows) {
        if (onComplete) {
          try {
            if (rows.length > 0) {
              onComplete(err, rows[0]);
            } else {
              onComplete(null, null);
            }
          } catch (e) {
            onComplete(e);
          }
        }
      } : onComplete);
    },

// ### doCount
//
// #### Returns the number of records for a given criteria
//
// * __onComplete__ is the function to callback once the operation completes successfully
// * __useDistinct__ is a boolean parameter, if true the `COUNT` is performed using distinct
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

// ### doDelete
//
// #### Deletes an object from the database
//
// * __onComplete__ is the function to callback once the operation completes successfully
    doDelete: function (onComplete) {
      queryBuilder("DELETE FROM #{from}", null, onComplete);
    },

// ### doSelect
//
// #### Returns an Array of objects for the specified criteria
//
// * __onComplete__ is the function to callback once the operation completes successfully
    doSelect: function (onComplete) {
      var sql = "SELECT #{select} FROM #{from}",
          query = {};

      if (this.sql.select.length === 0) {
        query.select = "*";
      } else {
        query.select = this.sql.distinct ? "DISTINCT " : "";
        query.select = query.select + this.sql.select;
      }

      queryBuilder(sql, query, onComplete);
    },

// ### save
//
// #### Saves a record to the database
//
// * __onComplete__ is the callback to execute if the transaction completes successfully
    save: function (obj, onComplete) {
      obj = (typeof obj)[0] === "f" ? obj() : obj;

      var sql = "",
          q = [],
          params = [],
          interpolate = Snake.interpolate;

// Here we iterate through the schema's map and push all the values into a parameters Array
// and then we create the `INSERT OR REPLACE INTO` query and pass that along with the parameters to this.SQL
// if the primary key already exists then it's replaced, otherwise the row is inserted.
      schema.map.forEach(function (map) {
        var val = obj[map] || null;

        if (map === '_date' && val === null) {
          val = Date.now();
        }

        params.push(val);
        q.push("?");
      });

      sql = interpolate("INSERT OR REPLACE INTO '#{table}' (#{columns}) VALUES (#{q})", {
        table: schema.tableName,
        columns: schema.map,
        q: q
      });

      if (this.sql.persist === true) {
        snake.SQL(sql, params, onComplete);
      } else {
        if (onComplete) {
          onComplete(null, sql, params);
        }
      }

      resetObj();
    },

// ### destroy
//
// #### Deletes a record from the database
//
// * __onComplete__ is the callback to execute if the transaction completes successfully
    destroy: function (obj, onComplete) {
      var val = "";

      switch (typeof obj) {
      case "function":
        val = obj();
        val = val._id;
        break;
      case "object":
        val = obj._id;
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
