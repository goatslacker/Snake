describe("Snake", function () {

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  // Venom Obj
  describe("Venom", function () {

    // Run through Venom and return the SQL query
    describe("Venom - Return Queries", function () {
      Snake.debug = true;

        // LIMIT
        it("SELECT * FROM card LIMIT 10", function () {
          expect(Venom.Card.limit(10).toSQL()).toEQUAL("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LIMIT 10");
        });

      });

    });

    it("Venom should be defined", function () {
      expect(Venom).toBeDefined();
    });

  });

});
