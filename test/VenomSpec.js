/* snake.js */
describe("Snake", function () {

  it("Snake is proper version", function () {
    expect(Snake.version).toEqual("2.0.2");
  });

  it("Driver is WebSQL", function () {
    expect(Snake.driver).toEqual("WebSQL");
  });

});

// vql.js
describe("VQL", function () {

  it("Venom should be defined", function () {
    expect(venom).toBeDefined();
  });

  // Run through venom and return the SQL query
  describe("Venom - Return Queries", function () {

    it("Select. Nothing Special", function () {
      vql.cards.toSQL().doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards");
        expect(params).toBeNull();
      });
    });

    it("Specific select column", function () {
      vql.cards.toSQL().select("face", "suit").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT cards.face,cards.suit FROM cards");
        expect(params).toBeNull();
      });
    });

    it("DISTINCT", function () {
      vql.cards.toSQL().distinct("suit").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT DISTINCT cards.suit FROM cards");
        expect(params).toBeNull();
      });
    });

    it("DISTINCT 2 cols", function () {
      vql.cards.toSQL().distinct("face", "suit").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT DISTINCT cards.face,cards.suit FROM cards");
        expect(params).toBeNull();
      });
    });

    it("Using Limit", function () {
      vql.cards.toSQL().limit(5).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LIMIT 5");
        expect(params).toEqual(null);
      });
    });

    it("Using Offset and Limit", function () {
      vql.cards.toSQL().offset(10).limit(12).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LIMIT 10, 12");
        expect(params).toEqual(null);
      });
    });

    it("Single Where and Limit", function () {
      vql.cards.toSQL().find('face', 2).limit(4).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ? LIMIT 4");
        expect(params).toEqual([2]);
      });
    });

    it("Where. No Limit", function () {
      vql.cards.toSQL().find({ face: 5 }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ?");
        expect(params).toEqual([5]);
      });
    });

    it("Greater Than", function () {
      vql.cards.toSQL().find('face', 'A', 'GREATER_THAN').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ?");
        expect(params).toEqual(['A']);
      });
    });

    it("Greater Than 2", function () {
      vql.cards.toSQL().find({ face: { 'GREATER_THAN': 'A' }}).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ?");
        expect(params).toEqual(['A']);
      });
    });

    it("Greater Than/Less Than", function () {
      vql.cards.toSQL().find({ face: { 'GREATER_THAN': 2, 'LESS_THAN': 8 }}).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.face < ?");
        expect(params).toEqual([2, 8]);
      });
    });

    it("2 Wheres AND", function () {
      vql.cards.toSQL().find({ face: '7', suit: 'hearts' }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ? AND cards.suit = ?");
        expect(params).toEqual(['7', 'hearts']);
      });
    });

    it("IN", function () {
      vql.cards.toSQL().find({ face: ['Q', 'J'] }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face IN (?, ?)");
        expect(params).toEqual(['Q', 'J']);
      });
    });

    it("IS NULL", function () {
      vql.players.toSQL().find('name', 'ISNULL').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name IS NULL");
      });
    });

    it("IS NOT NULL", function () {
      vql.players.toSQL().find('name', 'ISNOTNULL').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name IS NOT NULL");
      });
    });

    it("LIKE using params", function () {
      vql.players.toSQL().find('name', '%Josh%', 'LIKE').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%Josh%']);
      });
    });

    it("LIKE Special Chars", function () {
      vql.players.toSQL().find('name', '%josh_goatslacker%', 'LIKE').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%josh_goatslacker%']);
      });
    });

    it("NOT LIKE using params", function () {
      vql.players.toSQL().find('name', 'Serenity%', 'NOTLIKE').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name NOT LIKE ?");
        expect(params).toEqual(['Serenity%']);
      });
    });

    it("LIKE via obj", function () {
      vql.players.toSQL().find({ name: /goatslacker/ }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%goatslacker%']);
      });
    });

    it("LIKE first char", function () {
      vql.players.toSQL().find({ name: /^Serena/ }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['Serena%']);
      });
    });

    it("LIKE last char", function () {
      vql.players.toSQL().find({ name: /Perez$/ }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%Perez']);
      });
    });

    it("Multiple Obj Types: Greater Than + IN", function () {
      vql.cards.toSQL().find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.suit IN (?, ?)");
        expect(params).toEqual([2, 'hearts', 'spades']);
      });
    });

    it("Multiple Obj Types: Greater Than + IN + Limit + Offset", function () {
      vql.cards.toSQL().find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).offset(3).limit(16).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.suit IN (?, ?) LIMIT 3, 16");
        expect(params).toEqual([2, 'hearts', 'spades']);
      });
    });

    it("Group By", function () {
      vql.cards.toSQL().groupBy('suit').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards GROUP BY cards.suit");
      });
    });
    
    it("Order By", function () {
      vql.cards.toSQL().find({ suit: 'hearts' }).orderBy({ suit: 'desc' }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.suit = ? ORDER BY cards.suit DESC");
        expect(params).toEqual(['hearts']);
      });
    });
    
    it("doSelectOne", function () {
      vql.cards.toSQL().find({ suit: 'clubs', face: 'A' }).doSelectOne(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.suit = ? AND cards.face = ? LIMIT 1");
        expect(params).toEqual(['clubs', 'A']);
      });
    });

    it("retrieveByPK", function () {
      vql.cards.toSQL().retrieveByPK(101, function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.id = ? LIMIT 1");
        expect(params).toEqual([101]);
      });
    });

    it("doCount", function () {
      vql.cards.toSQL().find({ suit: 'spades' }).doCount(function (err, query, params) {
        expect(query).toEqual("SELECT COUNT(*) AS count FROM cards WHERE cards.suit = ?");
        expect(params).toEqual(['spades']);
      }, false);
    });

    it("Count Specific column DISTINCT", function () {
      vql.cards.toSQL().select('face').doCount(function (err, query, params) {
        expect(query).toEqual("SELECT COUNT(DISTINCT cards.face) AS count FROM cards");
      }, true);
    });

    it("doDelete", function () {
      vql.cards.toSQL().doDelete(function (err, query, params) {
        expect(query).toEqual("DELETE FROM cards");
      });
    });

    it("doDelete WHERE", function () {
      vql.cards.toSQL().find({ face: 7 }).doDelete(function (err, query, params) {
        expect(query).toEqual("DELETE FROM cards WHERE cards.face = ?");
        expect(params).toEqual([7]);
      });
    });

    it("Join", function () {
      vql.cards.toSQL().join("decks").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LEFT JOIN decks ON cards.deck_id = decks.id");
      });
    });

    it("Join - Specify On", function () {
      vql.cards.toSQL().join("decks", ['deck_id', 'id']).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LEFT JOIN decks ON cards.deck_id = decks.id");
      });
    });

    it("Saving an object", function () {
      vql.cards.toSQL().save({ face: 5, suit: 'hearts' }, function (err, query, params) {
        expect(query).toEqual("INSERT INTO 'cards' (deck_id,face,suit,id,created_at) VALUES (?,?,?,?,?)");
        expect(params[1]).toEqual(5);
        expect(params[2]).toEqual('hearts');
      });
    });

    it("Updating a record", function () {
      vql.cards.toSQL().save({ id: 2, face: 2, suit: 'spades' }, function (err, query, params) {
        expect(query).toEqual("UPDATE cards SET face = ?,suit = ?,id = ? WHERE id = ?");
        expect(params[0]).toEqual(2);
        expect(params[1]).toEqual('spades');
        expect(params[2]).toEqual(2);
      });
    });

  });

});
