describe("Snake", function () {

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  // Venom Obj
  describe("Venom", function () {

    // Run through Venom and return the SQL query
    describe("Venom - Return Queries", function () {

        it("Using Limit", function () {
          Venom.Card.limit(5).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card LIMIT 5");
            expect(params).toEqual(null);
          });
        });

        it("Select. Nothing Special", function () {
          expect(vql.Card.toSQL()).toEqual({ query : "SELECT * FROM card", params : null });
        });

        it("Single Where and Limit", function () {
          vql.Card.find('face', 2).limit(4).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ? LIMIT 4");
            expect(params).toEqual([2]);
          });
        });

        it("Where. No Limit", function () {
          vql.Card.find({ face: 5 }).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ?");
            expect(params).toEqual([5]);
          });
        });

        it("Greater Than", function () {
          vql.Card.find('face', 'A', 'GREATER_THAN').toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ?");
            expect(params).toEqual(['A']);
          });
        });

        it("Greater Than 2", function () {
          vql.Card.find({ face: { 'GREATER_THAN': 'A' }}).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ?");
            expect(params).toEqual(['A']);
          });
        });

        it("Greater Than/Less Than", function () {
          vql.Card.find({ face: { 'GREATER_THAN': 2, 'LESS_THAN': 8 }}).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ? AND card.face < ?");
            expect(params).toEqual([2, 8]);
          });
        });

        it("2 Wheres AND", function () {
          vql.Card.find({ face: '7', suit: 'hearts' }).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face = ? AND card.suit = ?");
            expect(params).toEqual(['7', 'hearts']);
          });
        });

        it("IN", function () {
          vql.Card.find({ face: ['Q', 'J'] }).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face IN (?, ?)");
            expect(params).toEqual(['Q', 'J']);
          });
        });

        it("IS NULL", function () {
          vql.Player.find('name', 'ISNULL').toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name IS NULL");
          });
        });

        it("IS NOT NULL", function () {
          vql.Player.find('name', 'ISNOTNULL').toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM player WHERE player.name IS NOT NULL");
          });
        });

        it("Multiple Obj Types: Greater Than + IN", function () {
          vql.Card.find({ face: { 'GREATER_THAN': 2 }, suit: ['hearts', 'spades']}).toSQL(function (query, params) {
            expect(query).toEqual("SELECT * FROM card WHERE card.face > ? AND card.suit IN (?, ?)");
            expect(params).toEqual([2, 'hearts', 'spades']);
          });
        });



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

    it("Venom should be defined", function () {
      expect(Venom).toBeDefined();
    });

  });

});
