# Snake: asynchronous Javascript ORM & DBAL #

- Snake is English for Orm in Swedish.

- Currently supports [HTML Web SQL Database](http://dev.w3.org/html5/webdatabase/), although it`s no longer in active maintainance by the W3C it is implemented in current Webkit browsers and mobile Webkit browsers like the iPhone and webOS.

- `Snake` is in Alpha stage right now so it should not be used for production applications.

- Would love some help and/or ideas on this project! If you want to contribute just fork the project.

## Installing

Clone the `Snake` repository from github

    git clone git://github.com/goatslacker/Snake.git

Dependencies:
`jake`

    npm install jake

Run `jake` in terminal to build the project from src

    jake

Copy `build/snake.js` into your project`s directory, you can load the files like this:

    <script src="snake.js" type="application/javascript"></script>

Next, you will need to define a schema.

## Schema

The schema can be defined in JSON format.

## SQL to VQL Map

SELECT * FROM sports;

    vql.sports.doSelect(function (sports) {
      console.log(sports);
    });

SELECT * FROM fruits WHERE name = 'mango' LIMIT 1;

    vql.fruits.find({ name: 'mango' }).doSelectOne(function (mango) {
      console.log(mango);
    });

SELECT * FROM cars WHERE doors > 2 LIMIT 10;

    vql.cars.find("doors", 2, "GREATER_THAN").limit(10).doSelect(function (cars) {
      console.log(cars);
    });

    vql.cars.find({ doors: { "GREATER_THAN": 2 }}).limit(10).doSelect(function (cars) {
      console.log(cars);
    });

SELECT nebulas, black_holes, stars FROM galaxies WHERE galaxy_name = "Milky Way";

    vql.galaxies.select("nebulas", "black_holes", "stars").find({ galaxy_name: "Milky Way" }).doSelect(function (space) {
      console.log(space);
    });

SELECT * FROM pizza WHERE toppings > 2 AND toppings < 4 ORDER BY slices DESC;

    vql.pizza.find({ toppings: { "GREATER_THAN": 2, "LESS_THAN": 4 }}).orderBy({ slices: 'desc' }).doSelect(function (pizzas) {
      console.log(pizzas);
    });

SELECT family, genus, species FROM animals WHERE genus IN("felis", "canis");

    vql.animals.select("family", "genus", "species").find({ genus: ["felis", "canis"] }).doSelect(function (animals) {
      console.log(animals);
    });

SELECT * FROM beer WHERE name LIKE "%ale%";

    vql.beer.find({ name: /ale/ }).doSelect(function (beer) {
      console.log(beer);
    });

    vql.beer.find("name", "%ale%", "LIKE").doSelect(function (beer) {
      console.log(beer);
    });

SELECT count(coins) FROM fountain;

    vql.fountain.select('coins').doCount(function (num_coins) {
      console.log(num_coins);
    });

DELETE FROM desktop WHERE icon = "old_file.txt";

    vql.desktop.find({ icon: "old_file.txt" }).doDelete();
