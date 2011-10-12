# Snake: asynchronous JavaScript DBAL for web storage

- Snake is English for Orm in Swedish.

- Mongo-like syntax for database abstraction, eliminates the need to write any SQL for the most part.

- Supports [HTML Web SQL Database](http://dev.w3.org/html5/webdatabase/), which no longer receives love from the W3C but it's implemented in current Webkit browsers and mobile Webkit browsers like the iPhone and WebOS.

- Great solution for storage on WebOS, Android or iPhone applications.

- Key/Value storage like all the popular NoSQL. Pure JSON!

- Clean and simple schema building in JSON.

- Small library ~6kb minimified.

## Installing

Clone the `Snake` repository from github

    $ git clone git://github.com/goatslacker/Snake.git

Run `make`

    $ make && make install

## How to Use

Copy `build/snake.min.js` into your project`s directory, you can load the files like this:

    <script src="snake.js" type="application/javascript"></script>

## Defining a Schema

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
      data.name; // Hello World
    });

## SQL to VQL Map

SELECT * FROM sports;

    vql.sports.doSelect(function (err, sports) {
      console.log(sports);
    });

SELECT * FROM fruits WHERE name = 'mango' LIMIT 1;

    vql.fruits.find({ name: 'mango' }).doSelectOne(function (err, mango) {
      console.log(mango);
    });

SELECT * FROM cars WHERE doors > 2 LIMIT 10;

    vql.cars.find("doors", 2, "GREATER_THAN").limit(10).doSelect(function (err, cars) {
      console.log(cars);
    });

    vql.cars.find({ doors: { "GREATER_THAN": 2 }}).limit(10).doSelect(function (err, cars) {
      console.log(cars);
    });

SELECT nebulas, black_holes, stars FROM galaxies WHERE galaxy_name = "Milky Way";

    vql.galaxies.select("nebulas", "black_holes", "stars").find({ galaxy_name: "Milky Way" }).doSelect(function (err, space) {
      console.log(space);
    });

SELECT * FROM pizza WHERE toppings > 2 AND toppings < 4 ORDER BY slices DESC;

    vql.pizza.find({ toppings: { "GREATER_THAN": 2, "LESS_THAN": 4 }}).orderBy({ slices: 'desc' }).doSelect(function (err, pizzas) {
      console.log(pizzas);
    });

SELECT family, genus, species FROM animals WHERE genus IN("felis", "canis");

    vql.animals.select("family", "genus", "species").find({ genus: ["felis", "canis"] }).doSelect(function (err, animals) {
      console.log(animals);
    });

SELECT * FROM beer WHERE name LIKE "%ale%";

    vql.beer.find({ name: /ale/ }).doSelect(function (err, beer) {
      console.log(beer);
    });

    vql.beer.find("name", "%ale%", "LIKE").doSelect(function (err, beer) {
      console.log(beer);
    });

SELECT count(coins) FROM fountain;

    vql.fountain.select('coins').doCount(function (err, num_coins) {
      console.log(num_coins);
    });

DELETE FROM desktop WHERE icon = "old_file.txt";

    vql.desktop.find({ icon: "old_file.txt" }).doDelete();
