describe("Snake", function () {

  it("Snake is proper version", function () {
    expect(Snake.version).toEqual("0.0.82");
  });

  // Venom Obj
  describe("Venom", function () {

    // Run through Venom and return the SQL query
    describe("Venom - Return Queries", function () {

        it("Using Limit", function () {
          Venom.Card.limit(5).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card LIMIT 5");
            expect(params).toEqual(null);
          });
        });

        it("Select. Nothing Special", function () {
          vql.Card.toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card");
            expect(params).toBeNull();
          });
        });

        it("Single Where and Limit", function () {
          vql.Card.find('face', 2).limit(4).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ? LIMIT 4");
            expect(params).toEqual([2]);
          });
        });

        it("Where. No Limit", function () {
          vql.Card.find({ face: 5 }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ?");
            expect(params).toEqual([5]);
          });
        });

        it("Greater Than", function () {
          vql.Card.find('face', 'A', 'GREATER_THAN').toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ?");
            expect(params).toEqual(['A']);
          });
        });

        it("Greater Than 2", function () {
          vql.Card.find({ face: { 'GREATER_THAN': 'A' }}).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ?");
            expect(params).toEqual(['A']);
          });
        });

        it("Greater Than/Less Than", function () {
          vql.Card.find({ face: { 'GREATER_THAN': 2, 'LESS_THAN': 8 }}).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ? AND card.face < ?");
            expect(params).toEqual([2, 8]);
          });
        });

        it("2 Wheres AND", function () {
          vql.Card.find({ face: '7', suit: 'hearts' }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ? AND card.suit = ?");
            expect(params).toEqual(['7', 'hearts']);
          });
        });

        it("IN", function () {
          vql.Card.find({ face: ['Q', 'J'] }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face IN (?, ?)");
            expect(params).toEqual(['Q', 'J']);
          });
        });

        it("IS NULL", function () {
          vql.Player.find('name', 'ISNULL').toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name IS NULL");
          });
        });

        it("IS NOT NULL", function () {
          vql.Player.find('name', 'ISNOTNULL').toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name IS NOT NULL");
          });
        });

        it("LIKE using params", function () {
          vql.Player.find('name', '%Josh%', 'LIKE').toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name LIKE ?");
            expect(params).toEqual(['%Josh%']);
          });
        });

        it("NOT LIKE using params", function () {
          vql.Player.find('name', 'Serenity%', 'NOTLIKE').toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name NOT LIKE ?");
            expect(params).toEqual(['Serenity%']);
          });
        });

        it("LIKE via obj", function () {
          vql.Player.find({ name: /Joshua/ }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name LIKE ?");
            expect(params).toEqual(['%Joshua%']);
          });
        });

        it("LIKE first char", function () {
          vql.Player.find({ name: /^Serena/ }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name LIKE ?");
            expect(params).toEqual(['Serena%']);
          });
        });

        it("LIKE last char", function () {
          vql.Player.find({ name: /Perez$/ }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name LIKE ?");
            expect(params).toEqual(['%Perez']);
          });
        });

        it("Multiple Obj Types: Greater Than + IN", function () {
          vql.Card.find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ? AND card.suit IN (?, ?)");
            expect(params).toEqual([2, 'hearts', 'spades']);
          });
        });

/*
        it("OR", function () {
          vql.Card.find({ or: { face: 5, suit: 'clubs' } }).toSQL().doSelect(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ? OR card.suit = ?");
            expect(params).toEqual([5, 'clubs']);
          });
        });
*/

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
}).toSQL().doSelect())
*/

    });

    it("Venom should be defined", function () {
      expect(Venom).toBeDefined();
    });

  });
 
  // Model testing 
  describe("Model testing", function () {

    it("New Model", function () {
      var player1 = new Player();
      player1.name = "Mosuke Hiroshi-san";
      expect(player1.name).toEqual("Mosuke Hiroshi-san");
    });

    it("Inserting a new item", function () {
      var card = new Card();
      // how about we do card.doSelect() ?
      card.face = 6;
      card.suit = 'clubs';
      card.toSQL().save(function (query, params) {
        expect(query).toEqual("INSERT INTO 'card' (deck_id, face, suit, id, created_at) VALUES (?, ?, ?, ?, ?)");
        expect(params[1]).toEqual(6);
        expect(params[2]).toEqual('clubs');
      });
    });

  });


});
