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
