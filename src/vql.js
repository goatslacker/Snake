Snake.VQL = {

  _venom: function (table) {
    var vql = {
      sql: {
        select: [],
        from: table,
        where: [],
        orderBy: [],
        limit: false
      },

      find: function (obj) {
        for (var i in obj) {
          this.sql.where.push(i + " = ?");
        }

        return this;
      },

      orderBy: function (obj) {
        for (var column in obj) {
          this.sql.orderBy.push(column + " " + obj[column].toUpperCase());
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

      toSQL: function () {

        var sql = "SELECT #{select} FROM #{from}"
          , query = {};

        // SELECT
        query.select = "*";

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

        return sql.interpose(query);
      }
    };

    return vql;
  },

  _createPeer: function (schema, onSuccess) {
    for (var table in schema) {
      this[schema[table].jsName] = new this._venom(table);
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
  Venom = Snake.VQL;
  Venom._createPeer({"player":{"jsName":"Player","columns":{"name":{"type":"text"},"chips":{"type":"integer"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"deck":{"jsName":"Deck","columns":{"name":{"type":"text"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"card":{"jsName":"Card","columns":{"deck_id":{"type":"integer","foreign":"deck.id"},"face":{"type":"text"},"suit":{"type":"text"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"player_card":{"jsName":"PlayerCard","columns":{"player_id":{"type":"integer","foreign":"player.id"},"card_id":{"type":"integer","foreign":"card.id"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}}}, function () {
    //console.log(venom.Player);
    console.log(Venom.Player.find({ name: 'Josh' }).orderBy({ name: 'desc' }).limit(5).toSQL());
    console.log(Venom.Card.limit(10).toSQL());
  });
})();
