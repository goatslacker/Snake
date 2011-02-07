describe("Snake", function () {

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  describe("Criteria through the Cards Example", function () {
    it("Criteria should be defined", function () {
      expect(Criteria).toBeDefined();
    });

    describe("doSelect", function () {

      // Select All
      it("SELECT * FROM card", function () {
        CardPeer.doSelect(new Criteria(), function (query) {
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card");;
        });
      });

      // Single Where
      it("SELECT * FROM card WHERE", function () {
        var c = new Criteria();
        c.add(CardPeer.FACE, "A");
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card WHERE card.face = ?");
          expect(params[0]).toEqual("A");
        });
      });

      // Multiple Where
      it("SELECT * FROM card WHERE J of Spades", function () {
        var c = new Criteria();
        c.add(CardPeer.FACE, "J");
        c.add(CardPeer.SUIT, "spades");
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card WHERE card.face = ? AND card.suit = ?");
          expect(params[0]).toEqual("J");
          expect(params[1]).toEqual("spades");
        });
      });

      // Where And & Or
/*
      it("SELECT * FROM card WHERE K of Hearts OR Q of Diamonds", function () {
        var c = new Criteria();
        c.add([CardPeer.FACE, "K"], [Card.FACE, "Q"]);
        CardPeer.doSelect(c, function (query, params) {
          console.log(query);
        });
      });
*/

      // IS NULL
      it("SELECT * FROM player WHERE name IS NULL", function () {
        var c = new Criteria();
        c.add(PlayerPeer.NAME, "ISNULL");
        PlayerPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT player.name, player.chips, player.id, player.created_at FROM player WHERE player.name IS NULL");
        });
      });

      // IS NOT NULL
      it("SELECT * FROM player WHERE name IS NOT NULL", function () {
        var c = new Criteria();
        c.add(PlayerPeer.NAME, "ISNOTNULL");
        PlayerPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT player.name, player.chips, player.id, player.created_at FROM player WHERE player.name IS NOT NULL");
        });
      });

      // LIKE
      it("SELECT * FROM player WHERE name LIKE", function () {
        var c = new Criteria();
        c.add(PlayerPeer.NAME, '%josh%', "LIKE");
        PlayerPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT player.name, player.chips, player.id, player.created_at FROM player WHERE player.name LIKE ?");
          expect(params[0]).toEqual("%josh%");
        });
      });

/*
      // IN
      it("SELECT * FROM card WHERE face IN", function () {
        var c = new Criteria();
        c.add(CardPeer.FACE, [6, 7, 8, 9, 10], "IN");
        CardPeer.doSelect(c, function (query, params) {
          // TODO does this query execute properly?
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card WHERE card.face IN (?)");
          expect(params[0]).toEqual([6, 7, 8, 9, 10]);
        });
      });
*/
    });

    describe("doCount", function () {
      // Count
      it("SELECT COUNT(*) FROM card", function () {
        CardPeer.doCount(new Criteria(), function (query) {
          expect(query).toEqual("SELECT COUNT(*) AS count FROM card");;
        });
      });
    });

  });

});
