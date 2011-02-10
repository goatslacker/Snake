describe("Snake", function () {

  it("Snake is version 0.0.27", function () {
    expect(Snake.version).toEqual("0.0.27");
  });

  // Criteria Obj
  describe("Criteria", function () {

    // Run the actual queries on the browser. TODO
    describe("Criteria - Run Queries", function () {
      //Snake.debug = false;
      //Snake.createTables(true);
    });


    // Run through Criteria and return the SQL query
    describe("Criteria - Return Queries", function () {
      Snake.debug = true;

      var c = null;

      // SELECT statements
      describe("doSelect", function () {

        beforeEach(function () {
          c = new Criteria();
          c.returnQuery = true;
        });

        // Select All
        it("SELECT * FROM card", function () {
          CardPeer.doSelect(c, function (query) {
            expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card");;
          });
        });

        // Single Where
        it("SELECT * FROM card WHERE", function () {
          c.add(CardPeer.FACE, "A");
          CardPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card WHERE card.face = ?");
            expect(params[0]).toEqual("A");
          });
        });

        // Custom columns
        it("SELECT card.suit FROM card WHERE face = 'A'", function () {
          c.addSelectColumn(CardPeer.SUIT);
          c.add(CardPeer.FACE, 'A');
          CardPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT card.suit FROM card WHERE card.face = ?");
            expect(params[0]).toEqual("A");
          });
        });

        // Multiple Where
        it("SELECT * FROM card WHERE J of Spades", function () {
          c.add(CardPeer.FACE, "J");
          c.add(CardPeer.SUIT, "spades");
          CardPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card WHERE card.face = ? AND card.suit = ?");
            expect(params[0]).toEqual("J");
            expect(params[1]).toEqual("spades");
          });
        });

        // TODO
        // Where And & Or
/*
        it("SELECT * FROM card WHERE K of Hearts OR Q of Diamonds", function () {
          c.addssssssOr([CardPeer.FACE, "K"], [CardPeer.SUIT, "hearts"]);
          c.addssssssOr([CardPeer.FACE, "Q"], [CardPeer.SUIT, "diamonds"]);
          CardPeer.doSelect(c, function (query, params) {
            console.log(query);
            console.log(params);
          });
        });
*/

        // TODO test addOr

        // IS NULL
        it("SELECT * FROM player WHERE name IS NULL", function () {
          c.add(PlayerPeer.NAME, "ISNULL");
          PlayerPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT player.name, player.chips, player.id, player.created_at FROM player WHERE player.name IS NULL");
          });
        });

        // IS NOT NULL
        it("SELECT * FROM player WHERE name IS NOT NULL", function () {
          c.add(PlayerPeer.NAME, "ISNOTNULL");
          PlayerPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT player.name, player.chips, player.id, player.created_at FROM player WHERE player.name IS NOT NULL");
          });
        });

        // LIKE
        it("SELECT * FROM player WHERE name LIKE", function () {
          c.add(PlayerPeer.NAME, '%josh%', "LIKE");
          PlayerPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT player.name, player.chips, player.id, player.created_at FROM player WHERE player.name LIKE ?");
            expect(params[0]).toEqual("%josh%");
          });
        });

  /*
        // IN
        it("SELECT * FROM card WHERE face IN", function () {
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
          c.setLimit(10);
          CardPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LIMIT 10");
          });
        });

        // LIMIT and OFFSET
        it("SELECT * FROM card LIMIT 10, 10", function () {
          c.setOffset(10);
          c.setLimit(10);
          CardPeer.doSelect(c, function (query, params) {
            expect(query).toEqual("SELECT card.deck_id, card.face, card.suit, card.id, card.created_at FROM card LIMIT 10, 10");
          });
        });

      });

      describe("doCount", function () {

        beforeEach(function () {
          c = new Criteria();
          c.returnQuery = true;
        });

        // Count
        it("SELECT COUNT(*) FROM card", function () {
          CardPeer.doCount(c, function (query) {
            expect(query).toEqual("SELECT COUNT(*) AS count FROM card");;
          });
        });

        // DISTINCT Count
        it("SELECT DISTINCT COUNT(*) FROM card", function () {
          CardPeer.doCount(c, true, function (query) {
            expect(query).toEqual("SELECT DISTINCT COUNT(*) AS count FROM card");;
          });
        });

      });

      describe("doDelete", function () {

        beforeEach(function () {
          c = new Criteria();
          c.returnQuery = true;
        });

        // delete all cards
        it("DELETE FROM card", function () {
          CardPeer.doDelete(c, function (query) {
            expect(query).toEqual("DELETE FROM card");
          });
        });

        // delete a deck
        it("DELETE FROM deck", function () {
          c.add(DeckPeer.ID, 3);
          DeckPeer.doDelete(c, function (query, params) {
            expect(query).toEqual("DELETE FROM deck WHERE deck.id = ?");
            expect(params[0]).toEqual(3);
          });
        });

        // delete 15 players
        it("DELETE FROM player LIMIT 15", function () {
          c.setLimit(15);
          PlayerPeer.doDelete(c, function (query) {
            expect(query).toEqual("DELETE FROM player LIMIT 15");
          });
        });

        // delete 20 players with an offset of 10, but only players beginning with the letter J
        it("DELETE FROM player WHERE name LIKE 'j%' LIMIT 10, 20", function () {
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

    it("Criteria should be defined", function () {
      expect(Criteria).toBeDefined();
    });

  });

});
