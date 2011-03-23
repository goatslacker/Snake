describe("webdb.js", function () {

  it("there should be 52 cards", function () {
    vql.Card.doCount(function (ct) {

      // if the count is 0 then load the items from the fixtures
      if (ct === 0) {
        var i = 0,
            row = null,
            card = null;

        // load fixtures by creating a new model for each row
        for (i; i < Snake.Fixtures.Card.length; i = i + 1) {
          row = Snake.Fixtures.Card[i];
          card = new Card();
          card.deck_id = 1;
          card.face = row.face;
          card.suit = row.suit;
          card.save();
        }
      }

      // ensure the amount of cards is 52
      expect(ct).toEqual(52);
    });
  });

  it("select the 2 of diamonds - the first card", function () {
    vql.Card.doSelectOne(function (card) {
      expect(card.face).toEqual(2);
      expect(card.suit).toEqual('diamonds');
    });
  });

  it("select the Ace of spades - the last card in the stack", function () {
    vql.Card.orderBy({ id: 'desc' }).doSelectOne(function (card) {
      expect(card.face).toEqual('A');
      expect(card.suit).toEqual('spades');
    });
  });

});
