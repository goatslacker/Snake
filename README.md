# `Snake`: asynchronous Javascript ORM & DBAL #

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

## Query Building

Examples:

SELECT * FROM fruits;

    vql.fruits.doSelect(function (results) {
    });

SELECT * FROM fruits WHERE name = 'mango' LIMIT 1;

    vql.fruits.find({ name: 'mango' }).doSelectOne(function (result) {
    });
