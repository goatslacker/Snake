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

      // Custom columns
      it("SELECT card.suit FROM card WHERE face = 'A'", function () {
        var c = new Criteria();
        c.addSelectColumn(CardPeer.SUIT);
        c.add(CardPeer.FACE, 'A');
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.suit FROM card WHERE card.face = ?");
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

      // joins. grab all the cards in a deck
      it("SELECT * FROM card LEFT JOIN deck", function () {
        var c = new Criteria();
        c.add(DeckPeer.ID, 2);
        c.addJoin(CardPeer.DECK_ID, DeckPeer.ID);
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LEFT JOIN deck ON card.deck_id = deck.id WHERE deck.id = ?");
          expect(params[0]).toEqual(2);
        });
      });

/*
      // multiple joins. select all of a player's cards
      it("Multiple joins", function () {
        var c = new Criteria();
        c.addJoin(PlayerCardPeer.CARD_ID, CardPeer.ID);
        c.addJoin(PlayerCardPeer.PLAYER_ID, PlayerPeer.ID);
        c.add(PlayerPeer.ID, 1);
        CardPeer.doSelect(c, function (query, params) {
          // TODO test this query
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LEFT JOIN card ON player_card.card_id = card.id LEFT JOIN player ON player_card.player_id = player.id WHERE player.id = ?");
        });
      });
*/

      // LIMIT
      it("SELECT * FROM card LIMIT 10", function () {
        var c = new Criteria();
        c.setLimit(10);
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LIMIT 10");
        });
      });

      // LIMIT and OFFSET
      it("SELECT * FROM card LIMIT 10, 10", function () {
        var c = new Criteria();
        c.setOffset(10);
        c.setLimit(10);
        CardPeer.doSelect(c, function (query, params) {
          expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LIMIT 10, 10");
        });
      });

    });

    describe("doCount", function () {
      // Count
      it("SELECT COUNT(*) FROM card", function () {
        CardPeer.doCount(new Criteria(), function (query) {
          expect(query).toEqual("SELECT COUNT(*) AS count FROM card");;
        });
      });
    });

    describe("doDelete", function () {

      // delete all cards
      it("DELETE FROM card", function () {
        CardPeer.doDelete(new Criteria(), function (query) {
          expect(query).toEqual("DELETE FROM card");
        });
      });

      // delete a deck
      it("DELETE FROM deck", function () {
        var c = new Criteria();
        c.add(DeckPeer.ID, 3);
        DeckPeer.doDelete(c, function (query, params) {
          expect(query).toEqual("DELETE FROM deck WHERE deck.id = ?");
          expect(params[0]).toEqual(3);
        });
      });

      // delete 15 players
      it("DELETE FROM player LIMIT 15", function () {
        var c = new Criteria();
        c.setLimit(15);
        PlayerPeer.doDelete(c, function (query) {
          expect(query).toEqual("DELETE FROM player LIMIT 15");
        });
      });

      // delete 20 players with an offset of 10, but only players beginning with the letter J
      it("DELETE FROM player WHERE name LIKE 'j%' LIMIT 10, 20", function () {
        var c = new Criteria();
        c.add(PlayerPeer.NAME, "j%", "LIKE");
        c.setOffset(10);
        c.setLimit(20);
        PlayerPeer.doDelete(c, function (query, params) {
          expect(query).toEqual("DELETE FROM player WHERE player.name LIKE ? LIMIT 10, 20");
          expect(params[0]).toEqual("j%");
        });
      });

      // delete the queen of herats
      it("DELETE FROM card WHERE face = 'Q' AND suit = 'hearts'", function () {
        var c = new Criteria();
        c.add(CardPeer.FACE, 'Q');
        c.add(CardPeer.SUIT, 'hearts');
        CardPeer.doDelete(c, function (query, params) {
          expect(query).toEqual("DELETE FROM card WHERE card.face = ? AND card.suit = ?");
          expect(params[0]).toEqual("Q");
          expect(params[1]).toEqual("hearts");
        });
      });


    });

  });

});
