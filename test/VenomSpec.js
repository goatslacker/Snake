describe("Snake", function () {

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  // Venom Obj
  describe("Venom", function () {

    // Run through Venom and return the SQL query
    describe("Venom - Return Queries", function () {

        it("SELECT * FROM card LIMIT 5", function () {
          expect(Venom.Card.limit(5).toSQL()).toEqual("SELECT * FROM card LIMIT 5");
        });

        it("SELECT * FROM card", function () {
          expect(vql.Card.toSQL()).toEqual("SELECT * FROM card");
        });

        it("SELECT * FROM card WHERE face = '2' LIMIT 4", function () {
          expect(vql.Card.find('face', '2').limit(4).toSQL()).toEqual("SELECT * FROM card WHERE card.face = ? LIMIT 4");
        });

        it("SELECT * FROM card WHERE face = '5'", function () {
          expect(vql.Card.find({ face: '5' }).toSQL()).toEqual("SELECT * FROM card WHERE card.face = ?");
        });

        it("SELECT * FROM card WHERE face > 'A'", function () {
          expect(vql.Card.find('face', 'A', 'GREATER_THAN').toSQL()).toEqual("SELECT * FROM card WHERE card.face > ?");
        });

        it("SELECT * FROM card WHERE face > 'A'", function () {
          expect(vql.Card.find({ face: { 'GREATER_THAN': 'A' }}).toSQL()).toEqual("SELECT * FROM card WHERE card.face > ?");
        });

        it("SELECT * FROM card WHERE face = '7' AND suit = 'hearts'", function () {
          expect(vql.Card.find({ face: '7', suit: 'hearts' }).toSQL()).toEqual("SELECT * FROM card WHERE card.face = ? AND card.suit = ?");
        });

        it("SELECT * FROM card WHERE face IN ('Q', 'J')", function () {
          expect(vql.Card.find({ face: ['Q', 'J'] }).toSQL()).toEqual("SELECT * FROM card WHERE card.face IN (?, ?)");
        });

        it("SELECT * FROM player WHERE name IS NULL", function () {
          expect(vql.Player.find('name', 'ISNULL').toSQL()).toEqual("SELECT * FROM player WHERE player.name IS NULL");
        });

        it("SELECT * FROM player WHERE name IS NOT NULL", function () {
          expect(vql.Player.find('name', 'ISNOTNULL').toSQL()).toEqual("SELECT * FROM player WHERE player.name IS NOT NULL");
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
