# Snake: asynchronous JavaScript DBAL for web storage

- Snake is English for Orm in Swedish.

- Mongo-like syntax for database abstraction, eliminates the need to write any SQL for the most part.

- Supports [HTML Web SQL Database](http://dev.w3.org/html5/webdatabase/), which no longer receives love from the W3C but it's implemented in current Webkit browsers and mobile Webkit browsers like the iPhone and WebOS.

- Great solution for storage on WebOS, Android or iPhone applications.

- Key/Value storage like all the popular NoSQL. Pure JSON!

- Clean and simple schema building in JSON.

- Small library ~6kb minimified.

## Installing

Download `Snake` from here:

__Uncompressed source w/ comments__ https://github.com/downloads/goatslacker/Snake/snake.js

__Compressed__ https://github.com/downloads/goatslacker/Snake/snake.min.js

OR

Clone the `Snake` repository from github

    $ git clone git://github.com/goatslacker/Snake.git

Run `make install`

    $ make install

## Schemas

Sample schema for a deck of playing cards:

    {
      "fileName": "cardsExample",
      "database": {
        "name": "cards",
        "version": "0.1"
      },
      "schema": {
        "Player": {
          "tableName": "players",
          "columns": {
            "name": { "type": "text" },
            "chips": { "type": "integer" }
          }
        },
        "Deck": {
          "tableName": "decks",
          "columns": {
            "name": { "type": "text" }
          }
        },
        "Card": {
          "tableName": "cards",
          "columns": {
            "deck_id": { "type": "integer", "foreign": "decks.id", "delete": "cascade" },
            "face": { "type": "text" },
            "suit": { "type": "text" }
          }
        },
        "PlayerCard": {
          "tableName": "player_cards",
          "columns": {
            "player_id": { "type": "integer", "foreign": "players.id", "delete": "cascade" },
            "card_id": { "type": "integer", "foreign": "cards.id", "delete": "cascade" }
          }
        }
      }
    }

The schema can be defined in JSON format.

## Saving data

    vql.collection.save({
      id: 4,
      name: "Hello World",
      created_at: "2010-11-20"
    });

## Retrieving data

    vql.collection.find(id, 4).doSelect(function (err, data) {
      console.log(data.name); // Hello World
    });
