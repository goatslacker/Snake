var jake = require("jake")
  , sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , files = ['snake', 'database', 'base', 'criteria']
  , i = 0;

jake.task("default", function () {

  for (i = 0; i < files.length; i = i + 1) { 
    fs.readFile("src/" + files[i] + ".js", 'utf8', function (err, data) {
      if (err) {
        throw err;
      }

      // join all the files into one

      // once done compile all the files using uglifyjs
    });
  }
}
