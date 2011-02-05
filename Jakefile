var jake = require("jake")
  , sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , files = ['snake', 'database', 'base', 'criteria']
  , i = 0
  , code = [];

task("default", [], function () {

  var mergeCode = function (data) {
    // join all the files
    code.push(data);

    if (code.length === 4) {
      writeFile();
    }
  }

  , compressor = function () {
    // if uglify JS is installed (otherwise include it!)
    
  },

  , writeFile = function () {
    var outputFile = "build/snake.js";

    // delete the file first
    fs.unlink(outputFile);

    // write all files into a snake build
    fs.writeFile(outputFile, code.join("\n"), 'utf8', function (err) {
      if (err) {
        throw err;
      }

      // run compressor
    });
  };

  for (i = 0; i < files.length; i = i + 1) { 
    fs.readFile("src/" + files[i] + ".js", 'utf8', function (err, data) {
      if (err) {
        throw err;
      }

      mergeCode(data);
    });

  }
});
