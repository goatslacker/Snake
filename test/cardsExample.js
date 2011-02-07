Snake.init({"fileName":"cardsExample","database":{"name":"cards","version":"0.1","displayName":"Playing Cards","size":20000},"schema":{"player":{"jsName":"Player","columns":{"name":{"type":"text"},"chips":{"type":"integer"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"deck":{"jsName":"Deck","columns":{"name":{"type":"text"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"card":{"jsName":"Card","columns":{"deck_id":{"type":"integer","foreign":"deck.id"},"face":{"type":"text"},"suit":{"type":"text"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}},"player_card":{"jsName":"PlayerCard","columns":{"player_id":{"type":"integer","foreign":"player.id"},"card_id":{"type":"integer","foreign":"card.id"},"id":{"type":"INTEGER","primaryKey":true},"created_at":{"type":"INTEGER"}}}},"sql":["CREATE TABLE IF NOT EXISTS 'player'(name text, chips integer, id INTEGER PRIMARY KEY, created_at INTEGER)","CREATE TABLE IF NOT EXISTS 'deck'(name text, id INTEGER PRIMARY KEY, created_at INTEGER)","CREATE TABLE IF NOT EXISTS 'card'(deck_id integer, face text, suit text, id INTEGER PRIMARY KEY, created_at INTEGER, FOREIGN KEY (deck_id) REFERENCES deck(id))","CREATE TABLE IF NOT EXISTS 'player_card'(player_id integer, card_id integer, id INTEGER PRIMARY KEY, created_at INTEGER, FOREIGN KEY (player_id) REFERENCES player(id), FOREIGN KEY (card_id) REFERENCES card(id))"]});
var PlayerPeer = new Snake.BasePeer({"tableName":"player","jsName":"Player","columns":["name","chips","id","created_at"],"fields":{"name":{"type":"text"},"chips":{"type":"integer"},"id":{"type":"INTEGER"},"created_at":{"type":"INTEGER"}},"NAME":"player.name","CHIPS":"player.chips","ID":"player.id","CREATED_AT":"player.created_at"});
var DeckPeer = new Snake.BasePeer({"tableName":"deck","jsName":"Deck","columns":["name","id","created_at"],"fields":{"name":{"type":"text"},"id":{"type":"INTEGER"},"created_at":{"type":"INTEGER"}},"NAME":"deck.name","ID":"deck.id","CREATED_AT":"deck.created_at"});
var CardPeer = new Snake.BasePeer({"tableName":"card","jsName":"Card","columns":["deck_id","face","suit","id","created_at"],"fields":{"deck_id":{"type":"integer"},"face":{"type":"text"},"suit":{"type":"text"},"id":{"type":"INTEGER"},"created_at":{"type":"INTEGER"}},"DECK_ID":"card.deck_id","FACE":"card.face","SUIT":"card.suit","ID":"card.id","CREATED_AT":"card.created_at"});
var PlayerCardPeer = new Snake.BasePeer({"tableName":"player_card","jsName":"PlayerCard","columns":["player_id","card_id","id","created_at"],"fields":{"player_id":{"type":"integer"},"card_id":{"type":"integer"},"id":{"type":"INTEGER"},"created_at":{"type":"INTEGER"}},"PLAYER_ID":"player_card.player_id","CARD_ID":"player_card.card_id","ID":"player_card.id","CREATED_AT":"player_card.created_at"});
var Player = new Snake.Base(PlayerPeer,{"name":null,"chips":null,"id":null,"created_at":null});
var Deck = new Snake.Base(DeckPeer,{"name":null,"id":null,"created_at":null});
var Card = new Snake.Base(CardPeer,{"deck_id":null,"face":null,"suit":null,"id":null,"created_at":null});
var PlayerCard = new Snake.Base(PlayerCardPeer,{"player_id":null,"card_id":null,"id":null,"created_at":null});