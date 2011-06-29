/* snake.js */
describe("Snake", function () {

  it("Snake is proper version", function () {
    expect(Snake.version).toEqual("2.0.0");
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
        vql.cards.doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards");
          expect(params).toBeNull();
        }, null, true);
      });

      it("Specific select column", function () {
        vql.cards.select("face", "suit").doSelect(function (query, params) {
          expect(query).toEqual("SELECT cards.face,cards.suit FROM cards");
          expect(params).toBeNull();
        }, null, true);
      });

      it("DISTINCT", function () {
        vql.cards.distinct("suit").doSelect(function (query, params) {
          expect(query).toEqual("SELECT DISTINCT cards.suit FROM cards");
          expect(params).toBeNull();
        }, null, true);
      });

      it("DISTINCT 2 cols", function () {
        vql.cards.distinct("face", "suit").doSelect(function (query, params) {
          expect(query).toEqual("SELECT DISTINCT cards.face,cards.suit FROM cards");
          expect(params).toBeNull();
        }, null, true);
      });

      it("Using Limit", function () {
        vql.cards.limit(5).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards LIMIT 5");
          expect(params).toEqual(null);
        }, null, true);
      });

      it("Using Offset and Limit", function () {
        vql.cards.offset(10).limit(12).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards LIMIT 10, 12");
          expect(params).toEqual(null);
        }, null, true);
      });

      it("Single Where and Limit", function () {
        vql.cards.find('face', 2).limit(4).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ? LIMIT 4");
          expect(params).toEqual([2]);
        }, null, true);
      });

      it("Where. No Limit", function () {
        vql.cards.find({ face: 5 }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ?");
          expect(params).toEqual([5]);
        }, null, true);
      });

      it("Greater Than", function () {
        vql.cards.find('face', 'A', 'GREATER_THAN').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ?");
          expect(params).toEqual(['A']);
        }, null, true);
      });

      it("Greater Than 2", function () {
        vql.cards.find({ face: { 'GREATER_THAN': 'A' }}).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ?");
          expect(params).toEqual(['A']);
        }, null, true);
      });

      it("Greater Than/Less Than", function () {
        vql.cards.find({ face: { 'GREATER_THAN': 2, 'LESS_THAN': 8 }}).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.face < ?");
          expect(params).toEqual([2, 8]);
        }, null, true);
      });

      it("2 Wheres AND", function () {
        vql.cards.find({ face: '7', suit: 'hearts' }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face = ? AND cards.suit = ?");
          expect(params).toEqual(['7', 'hearts']);
        }, null, true);
      });

      it("IN", function () {
        vql.cards.find({ face: ['Q', 'J'] }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face IN (?, ?)");
          expect(params).toEqual(['Q', 'J']);
        }, null, true);
      });

      it("IS NULL", function () {
        vql.players.find('name', 'ISNULL').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name IS NULL");
        }, null, true);
      });

      it("IS NOT NULL", function () {
        vql.players.find('name', 'ISNOTNULL').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name IS NOT NULL");
        }, null, true);
      });

      it("LIKE using params", function () {
        vql.players.find('name', '%Josh%', 'LIKE').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
          expect(params).toEqual(['%Josh%']);
        }, null, true);
      });

      it("LIKE Special Chars", function () {
        vql.players.find('name', '%josh_goatslacker%', 'LIKE').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
          expect(params).toEqual(['%josh_goatslacker%']);
        }, null, true);
      });

      it("NOT LIKE using params", function () {
        vql.players.find('name', 'Serenity%', 'NOTLIKE').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name NOT LIKE ?");
          expect(params).toEqual(['Serenity%']);
        }, null, true);
      });

      it("LIKE via obj", function () {
        vql.players.find({ name: /goatslacker/ }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
          expect(params).toEqual(['%goatslacker%']);
        }, null, true);
      });

      it("LIKE first char", function () {
        vql.players.find({ name: /^Serena/ }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
          expect(params).toEqual(['Serena%']);
        }, null, true);
      });

      it("LIKE last char", function () {
        vql.players.find({ name: /Perez$/ }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM players WHERE players.name LIKE ?");
          expect(params).toEqual(['%Perez']);
        }, null, true);
      });

      it("Multiple Obj Types: Greater Than + IN", function () {
        vql.cards.find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.suit IN (?, ?)");
          expect(params).toEqual([2, 'hearts', 'spades']);
        }, null, true);
      });

      it("Multiple Obj Types: Greater Than + IN + Limit + Offset", function () {
        vql.cards.find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).offset(3).limit(16).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.face > ? AND cards.suit IN (?, ?) LIMIT 3, 16");
          expect(params).toEqual([2, 'hearts', 'spades']);
        }, null, true);
      });

      it("Group By", function () {
        vql.cards.groupBy('suit').doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards GROUP BY cards.suit");
        }, null, true);
      });
      
      it("Order By", function () {
        vql.cards.find({ suit: 'hearts' }).orderBy({ suit: 'desc' }).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.suit = ? ORDER BY cards.suit DESC");
          expect(params).toEqual(['hearts']);
        }, null, true);
      });
      
      it("doSelectOne", function () {
        vql.cards.find({ suit: 'clubs', face: 'A' }).doSelectOne(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.suit = ? AND cards.face = ? LIMIT 1");
          expect(params).toEqual(['clubs', 'A']);
        }, null, true);
      });

      it("retrieveByPK", function () {
        vql.cards.retrieveByPK(101, function (query, params) {
          expect(query).toEqual("SELECT * FROM cards WHERE cards.id = ? LIMIT 1");
          expect(params).toEqual([101]);
        }, null, true);
      });

      it("doCount", function () {
        vql.cards.find({ suit: 'spades' }).doCount(function (query, params) {
          expect(query).toEqual("SELECT COUNT(*) AS count FROM cards WHERE cards.suit = ?");
          expect(params).toEqual(['spades']);
        }, null, false, true);
      });

      it("Count Specific column DISTINCT", function () {
        vql.cards.select('face').doCount(function (query, params) {
          expect(query).toEqual("SELECT COUNT(DISTINCT cards.face) AS count FROM cards");
        }, null, true, true);
      });

      it("doDelete", function () {
        vql.cards.doDelete(function (query, params) {
          expect(query).toEqual("DELETE FROM cards");
        }, null, true);
      });

      it("doDelete WHERE", function () {
        vql.cards.find({ face: 7 }).doDelete(function (query, params) {
          expect(query).toEqual("DELETE FROM cards WHERE cards.face = ?");
          expect(params).toEqual([7]);
        }, null, true);
      });

      it("Join", function () {
        vql.cards.join("decks").doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards LEFT JOIN decks ON cards.deck_id = decks.id");
        }, null, true);
      });

      it("Join - Specify On", function () {
        vql.cards.join("decks", ['deck_id', 'id']).doSelect(function (query, params) {
          expect(query).toEqual("SELECT * FROM cards LEFT JOIN decks ON cards.deck_id = decks.id");
        }, null, true);
      });

      it("Saving an object", function () {
        vql.cards.save({ face: 5, suit: 'hearts' }, function (query, params) {
          expect(query).toEqual("INSERT INTO 'cards' (deck_id,face,suit,id,created_at) VALUES (?,?,?,?,?)");
          expect(params[1]).toEqual(5);
          expect(params[2]).toEqual('hearts');
        }, null, true);
      });

      it("Updating a record", function () {
        vql.cards.save({ id: 2, face: 2, suit: 'spades' }, function (query, params) {
          expect(query).toEqual("UPDATE cards SET face = ?,suit = ?,id = ? WHERE id = ?");
          expect(params[0]).toEqual(2);
          expect(params[1]).toEqual('spades');
          expect(params[2]).toEqual(2);
        }, null, true);
      });
  });

});
