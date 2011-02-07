describe("Snake", function () {

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  describe("Criteria through the Cards Example", function () {
    it("Criteria should be defined", function () {
      expect(Criteria).toBeDefined();
    });

    describe("SELECT Queries", function () {

      // Select All
      it("SELECT * FROM table", function () {
        CardPeer.doSelect(new Criteria(), function (query) {
          expect(query).toEqual("SELECT card.deck_id, card.number, card.suit, card.id, card.created_at FROM card");;
        });
      });

      // Count
      it("SELECT COUNT(*) FROM table", function () {
        CardPeer.doCount(new Criteria(), function (query) {
          expect(query).toEqual("SELECT COUNT(*) AS count FROM card");;
        });
      });

      // Single Where
      it("SELECT * FROM table WHERE", function () {
        var c = new Criteria();
        c.add(CardPeer.ID, 4);
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.deck_id, card.number, card.suit, card.id, card.created_at FROM card WHERE card.id = ?");
          expect(params[0]).toEqual(4);
        });
      });

    });

  });

});
