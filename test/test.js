// execute setup
// should build all classes and maps...

// TODO create in Node.
// TODO finish card examples
var schema = {
  database: {
    name: "Cards",
    version: "0.1", // default this
    displayName: "cards", // optional
    size: 200000 // default this
  },
  schema: {
    card: {
      jsName: "Card",
      columns: {
        card: { type: "text" },
        type: { type: "text" }
      }
    },
    card_in_stack: {
      jsName: "CardInStack",
      columns: {
        stack_id: { type: "integer", index: true, foreign: "stack.id" },
        card_id: { type: "integer", foreign: "card.id" }
      }
    },
    stack: {
      jsName: "Stack",
      columns: {
        player_id: { type: "integer", foreign: "player.id" }
      }
    },
    player: {
      jsName: "Player",
      columns: {
        name: { type: "text" }
      }
    }
  }
};

// execute query ?
function executeQuery () {
  var c = new Snake.Criteria();
  c.add(CardPeer.TYPE, "spades");
  c.addDescendingOrderByColumn(CardPeer.ID);
  c.setLimit(5);
  CardPeer.doSelect(c, function (transaction, results) {
    console.log('===SQL Results===');
    console.log(results);

    if (results.rows.length > 0) {
      for (var i = 0; i < results.rows.length; i = i + 1) {
        console.log(results.rows.item(i));
      }
    }
  });
}

function executeInsert () {
  // create a player
  var player = new Player();
  player.name = "Josh";
  player.save();

  // create cards
  var card = new Card();
  card.card = "4";
  card.type = "spades";
  card.save();

  var card = new Card();
  card.card = "10";
  card.type = "hearts";
  card.save();

  var card = new Card();
  card.card = "J";
  card.type = "diamonds";
  card.save();

  var card = new Card();
  card.card = "7";
  card.type = "spades";
  card.save();

  var card = new Card();
  card.card = "A";
  card.type = "clubs";
  card.save();

  // create a new stack belonging to player 1
  var stack = new Stack();
  stack.player_id = 1;
  stack.save();

  // add cards to the stack

  // A of clubs added to stack belonging to player 1
  var cardinstack = new CardInStack();
  cardinstack.stack_id = 1;
  cardinstack.card_id = 5;
  cardinstack.save();

  // J of diamonds added to stack belonging to player 1
  var cardinstack = new CardInStack();
  cardinstack.stack_id = 1;
  cardinstack.card_id = 3;
  cardinstack.save();
}

function executeUpdate () {
  // update the 4 of spades to become a Queen of hearts
  var card = CardPeer.retrieveByPK(1);
  card.card = "Q";
  card.type = "hearts";
  card.save();
 
  // change player 1's J of diamonds into the new Q of hearts.
  var cardinstack = CardInStackPeer.retrieveByPK(2);
  cardinstack.card_id = 1;
  cardinstack.save();
}
