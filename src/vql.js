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
          field = arguments[0]
          value = arguments[1]
          selector = arguments[2] || Snake.VQL.EQUAL;
  
          VQL.sql.where.push(field + " " + selector + " ?");
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

              VQL.sql.where.push(field + " " + selector + " (" + q.join(", ") + ")");
            } else {
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


/*
if (!"venom" in Snake.global) {
  Snake.global.venom = Snake.VQL;
}

if (!"vql" in Snake.global) {
  Snake.global.venom = Snake.VQL;
}
*/

var Player = {"name":null,"chips":null,"id":null,"created_at":null};
var Deck = {"name":null,"id":null,"created_at":null};
var Card = {"deck_id":null,"face":null,"suit":null,"id":null,"created_at":null};
var PlayerCard = {"player_id":null,"card_id":null,"id":null,"created_at":null};

(function () {
  var Venom = vql = Snake.VQL;

  Venom._createPeer({"player":{"jsName":"Player","columns":{"name":{"type":"text"},"chips":{"type":"integer"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"deck":{"jsName":"Deck","columns":{"name":{"type":"text"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"card":{"jsName":"Card","columns":{"deck_id":{"type":"integer","foreign":"deck.id"},"face":{"type":"text"},"suit":{"type":"text"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"player_card":{"jsName":"PlayerCard","columns":{"player_id":{"type":"integer","foreign":"player.id"},"card_id":{"type":"integer","foreign":"card.id"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}}}, function () {

    //console.log(Venom.Player.find({ name: 'Josh' }).orderBy({ name: 'desc' }).limit(5).toSQL());
    //console.log(Venom.Card.limit(10).toSQL());

    // SELECT * FROM card WHERE face = 'A' LIMIT 10; // should clear limit
    console.log(vql.Card.find('face', 'A').limit(10).toSQL());

    // SELECT * FROM card WHERE face = 'A';
    console.log(vql.Card.find({ face: 'A' }).toSQL());

    // SELECT * FROM card WHERE face > 'A';
    console.log(vql.Card.find('face', 'A', vql.GREATER_THAN).toSQL());

    // SELECT * FROM card WHERE face = 'A' AND suit = 'hearts';
    console.log(vql.Card.find({ face: 'A', suit: 'hearts' }).toSQL());

    // SELECT * FROM card WHERE face IN ('A', 'J');
    console.log(vql.Card.find({ face: ['A', 'J'] }).toSQL());

    // SELECT * FROM player WHERE name LIKE 'josh'; // FIXME
    console.log(vql.Player.find({ name: /Josh/ }).toSQL());

/*
// SELECT * FROM card WHERE (face = 'A' and suit = 'hearts') OR (face = 'J' and suit = 'spades');
console.log(vql.Card.find({
  or: {
    and: [{
      face: 'a',
      suit: 'hearts'
    }, {
      face: 'j',
      suit: 'spades'
    }]
  }
}).toSQL())
*/

  });
})();
