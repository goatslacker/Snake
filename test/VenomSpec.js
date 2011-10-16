/* snake.js */
describe("Snake", function () {

  it("Snake exists", function () {
    expect(Snake).toBeDefined();
  });

});

// db.js
describe("VQL", function () {

  var vql = null;

  beforeEach(function () {
    vql = Snake.vql;
  });

  it("VQL should be defined", function () {
    expect(vql).not.toBeNull();
  });

  // Run through venom and return the SQL query
  describe("Venom - Return Queries", function () {

    it("Select. Nothing Special", function () {
      db.cards.toSQL().doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards");
        expect(params).toBeNull();
      });
    });

    it("Specific select column", function () {
      db.cards.toSQL().select("face", "suit").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT cards.face,cards.suit FROM cards");
        expect(params).toBeNull();
      });
    });

    it("DISTINCT", function () {
      db.cards.toSQL().distinct("suit").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT DISTINCT cards.suit FROM cards");
        expect(params).toBeNull();
      });
    });

    it("DISTINCT 2 cols", function () {
      db.cards.toSQL().distinct("face", "suit").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT DISTINCT cards.face,cards.suit FROM cards");
        expect(params).toBeNull();
      });
    });

    it("Using Limit", function () {
      db.cards.toSQL().limit(5).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LIMIT 5");
        expect(params).toEqual(null);
      });
    });

    it("Using Offset and Limit", function () {
      db.cards.toSQL().offset(10).limit(12).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LIMIT 10, 12");
        expect(params).toEqual(null);
      });
    });

    it("Single Where and Limit", function () {
      db.cards.toSQL().find('face', 2).limit(4).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ? LIMIT 4");
        expect(params).toEqual([2]);
      });
    });

    it("Where. No Limit", function () {
      db.cards.toSQL().find({ face: 5 }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ?");
        expect(params).toEqual([5]);
      });
    });

    it("Greater Than", function () {
      db.cards.toSQL().find('face', 'A', 'GREATER_THAN').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ?");
        expect(params).toEqual(['A']);
      });
    });

    it("Greater Than 2", function () {
      db.cards.toSQL().find({ face: { 'GREATER_THAN': 'A' }}).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ?");
        expect(params).toEqual(['A']);
      });
    });

    it("Greater Than/Less Than", function () {
      db.cards.toSQL().find({ face: { 'GREATER_THAN': 2, 'LESS_THAN': 8 }}).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.face < ?");
        expect(params).toEqual([2, 8]);
      });
    });

    it("2 Wheres AND", function () {
      db.cards.toSQL().find({ face: '7', suit: 'hearts' }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ? AND cards.suit = ?");
        expect(params).toEqual(['7', 'hearts']);
      });
    });

    it("IN", function () {
      db.cards.toSQL().find({ face: ['Q', 'J'] }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face IN (?, ?)");
        expect(params).toEqual(['Q', 'J']);
      });
    });

    it("IS NULL", function () {
      db.players.toSQL().find('name', 'ISNULL').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name IS NULL");
      });
    });

    it("IS NOT NULL", function () {
      db.players.toSQL().find('name', 'ISNOTNULL').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name IS NOT NULL");
      });
    });

    it("LIKE using params", function () {
      db.players.toSQL().find('name', '%Josh%', 'LIKE').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%Josh%']);
      });
    });

    it("LIKE Special Chars", function () {
      db.players.toSQL().find('name', '%josh_goatslacker%', 'LIKE').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%josh_goatslacker%']);
      });
    });

    it("NOT LIKE using params", function () {
      db.players.toSQL().find('name', 'Serenity%', 'NOTLIKE').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name NOT LIKE ?");
        expect(params).toEqual(['Serenity%']);
      });
    });

    it("LIKE via obj", function () {
      db.players.toSQL().find({ name: /goatslacker/ }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%goatslacker%']);
      });
    });

    it("LIKE first char", function () {
      db.players.toSQL().find({ name: /^Serena/ }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['Serena%']);
      });
    });

    it("LIKE last char", function () {
      db.players.toSQL().find({ name: /Perez$/ }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
        expect(params).toEqual(['%Perez']);
      });
    });

    it("Multiple Obj Types: Greater Than + IN", function () {
      db.cards.toSQL().find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.suit IN (?, ?)");
        expect(params).toEqual([2, 'hearts', 'spades']);
      });
    });

    it("Multiple Obj Types: Greater Than + IN + Limit + Offset", function () {
      db.cards.toSQL().find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).offset(3).limit(16).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.suit IN (?, ?) LIMIT 3, 16");
        expect(params).toEqual([2, 'hearts', 'spades']);
      });
    });

    it("Group By", function () {
      db.cards.toSQL().groupBy('suit').doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards GROUP BY cards.suit");
      });
    });

    it("Order By", function () {
      db.cards.toSQL().find({ suit: 'hearts' }).orderBy({ suit: 'desc' }).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.suit = ? ORDER BY cards.suit DESC");
        expect(params).toEqual(['hearts']);
      });
    });

    it("doSelectOne", function () {
      db.cards.toSQL().find({ suit: 'clubs', face: 'A' }).doSelectOne(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards.suit = ? AND cards.face = ? LIMIT 1");
        expect(params).toEqual(['clubs', 'A']);
      });
    });

    it("retrieveByPK", function () {
      db.cards.toSQL().retrieveByPK(101, function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards WHERE cards._id = ? LIMIT 1");
        expect(params).toEqual([101]);
      });
    });

    it("doCount", function () {
      db.cards.toSQL().find({ suit: 'spades' }).doCount(function (err, query, params) {
        expect(query).toEqual("SELECT COUNT(*) AS count FROM cards WHERE cards.suit = ?");
        expect(params).toEqual(['spades']);
      }, false);
    });

    it("Count Specific column DISTINCT", function () {
      db.cards.toSQL().select('face').doCount(function (err, query, params) {
        expect(query).toEqual("SELECT COUNT(DISTINCT cards.face) AS count FROM cards");
      }, true);
    });

    it("doDelete", function () {
      db.cards.toSQL().doDelete(function (err, query, params) {
        expect(query).toEqual("DELETE FROM cards");
      });
    });

    it("doDelete WHERE", function () {
      db.cards.toSQL().find({ face: 7 }).doDelete(function (err, query, params) {
        expect(query).toEqual("DELETE FROM cards WHERE cards.face = ?");
        expect(params).toEqual([7]);
      });
    });

    it("Join", function () {
      db.cards.toSQL().join("decks").doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LEFT JOIN decks ON cards.deck_id = decks.id");
      });
    });

    it("Join - Specify On", function () {
      db.cards.toSQL().join("decks", ['deck_id', 'id']).doSelect(function (err, query, params) {
        expect(query).toEqual("SELECT * FROM cards LEFT JOIN decks ON cards.deck_id = decks.id");
      });
    });

    it("Saving an object", function () {
      db.cards.toSQL().save({ face: 5, suit: 'hearts' }, function (err, query, params) {
        expect(query).toEqual("INSERT OR REPLACE INTO 'cards' (deck_id,face,suit,_id,_date) VALUES (?,?,?,?,?)");
        expect(params[1]).toEqual(5);
        expect(params[2]).toEqual('hearts');
      });
    });

  });

  // WebSQL
  describe("WebSQL", function () {

    it("should have 52 cards", function () {
      db.cards.doSelect(function (err, cards) {
        expect(cards.length).toEqual(52);
      });
    });

    it("should be an ace of clubs", function () {
      db.cards.find({ face: "A", suit: "clubs" }).doSelectOne(function (err, card) {
        expect(card.face).toEqual("A");
        expect(card.suit).toEqual("clubs");
      });
    });

    it("should have 4 cards", function () {
      db.cards.find({ face: 7 }).doSelect(function (err, cards) {
        expect(cards.length).toEqual(4);
      });
    });

    it("should have 13 cards", function () {
      db.cards.find({ suit: "hearts" }).doSelect(function (err, cards) {
        expect(cards.length).toEqual(13);
      });
    });

    waits(2000);
  });

});
