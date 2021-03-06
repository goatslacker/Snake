# Snake: asynchronous JavaScript DBAL for web storage

- Snake is English for Orm in Swedish.

- Mongo-like syntax for database abstraction, eliminates the need to write any SQL for the most part.

- Supports [HTML Web SQL Database](http://dev.w3.org/html5/webdatabase/), which no longer receives love from the W3C but it's implemented in current Webkit browsers and mobile Webkit browsers like the iPhone and WebOS.

- Great solution for storage on WebOS, Android or iPhone applications.

- Key/Value storage like all the popular NoSQL. Pure JSON!

- Clean and simple schema building in JSON.

- Small library ~6kb minimified.

## Annotated source

Documentation can be found here -> http://goatslacker.github.com/Snake

## Installing

Download `Snake` from here:

__Uncompressed source w/ comments__ https://github.com/downloads/goatslacker/Snake/snake.js

__Compressed__ https://github.com/downloads/goatslacker/Snake/snake.min.js

OR

Clone the `Snake` repository from github and run `make install`

    $ git clone git://github.com/goatslacker/Snake.git && cd Snake && make install

## Getting Started

Create an instance

    var db = new Snake(database_details, schema, queries_to_execute_first);

Save data

    db.table_name.save({ column_name: "value" });

Retrieve saved data

    db.table_name.find({ column_name: "value" }).doSelect(callback_function);

Quick API Reference

Collection sorting methods.

* find (object)
* orderBy (Object)
* groupBy (Object)
* join (String table, Array on, String join_method)
* offset (Number offset)
* limit (Number limit)

Query methods. Queries are lazy, you need to call these methods to execute them.

* retrieveByPk (Function)
* doSelect (Function)
* doSelectOne (Function)
* doDelete (Function)
* doCount (Function)

Single object methods.

* save (Function)
* destroy (Function)

You can find more details on these methods in the documented source: http://goatslacker.github.com/Snake

`database_details` should look something like this:

    { name: DATABASE_NAME, description: OPTIONAL_DESCRIPTION, size: OPTIONAL_SIZE, version: "1.0" }

The schema is defined in JSON format. Here's a sample schema for a deck of playing cards:

    {
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
          "deck_id": { "type": "integer", "foreign": "decks.id" },
          "face": { "type": "text" },
          "suit": { "type": "text" }
        }
      },
      "PlayerCard": {
        "tableName": "player_cards",
        "columns": {
          "player_id": { "type": "integer", "foreign": "players.id" },
          "card_id": { "type": "integer", "foreign": "cards.id" }
        }
      }
    }

## More?

Examples can be found here: https://github.com/goatslacker/Snake/blob/master/EXAMPLES.md

More documentation can be found here: http://goatslacker.github.com/Snake
