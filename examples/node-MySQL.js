var Snake = require("../build/snake.dev.js");

Snake.config.database = { username: 'root', password: 'root', database: 'yummy' };

Snake.loadFromJSON({
  "Fruit": {
    "tableName": "fruits",
    "columns": {
      "name": { "type": "varchar(255)" },
      "description": { "type": "text" }
    }
  }
});

// one way
/*
Snake.query("SELECT * FROM fruits LIMIT 1", function (err, info) {
  console.log('query');
  console.log(err);
  console.log(info);
});
*/

// other...
Snake.venom.fruits.doSelect(function (fruits) {
  console.log(fruits);
});
