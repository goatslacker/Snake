var jake = require("jake")
  , sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , util   = require('util')
  //, uglify = require("uglify-js")
  , exec  = require('child_process').exec
  , child
  , files = ['snake', 'database', 'base', 'criteria']
  , i = 0
  , code = [];

task("default", [], function () {

  var compressFile = function (outputFile) {

    console.log("Compressing " + outputFile + " using UglifyJS");
    child = exec('uglifyjs -o build/snake.min.js build/snake.js', function (error, stdout, stderr) {

      if (error !== null) {
        throw error;
      } else {
        console.log("Successfully compressed " + outputFile);

        fs.stat(outputFile, function (err, stats) {
          var preCompressedSize = stats.size;
          fs.stat('build/snake.min.js', function (err, stats) {
            var compressedSize = stats.size
              , ratio = Math.round((compressedSize / preCompressedSize) * 100);

            // TODO gzip it as well!
            console.log("Original size: " + preCompressedSize);
            console.log("Compressed size: " + compressedSize);
            console.log("Compression ratio: " + ratio + "%");
          });
        });
      }
    });
  }
  , compressor = function (outputFile) {
    // check if uglify is installed

    child = exec('type -P foo &>/dev/null || { echo "false" >&2; }', function (error, stdout, stderr) {
      if (error !== null) {
        throw error;
      }

      // uglify is not installed, install via npm
      if (stdout === "false") {
        child = exec('npm install vendor/UglifyJS', function (error, stdout, stderr) {
          if (error !== null) {
            throw error;
          } else {
            // compress file
            compressFile(outputFile);
          }
        });
      } else {
        compressFile(outputFile);
      }
    });
  }

  , writeFile = function () {
    var outputFile = "build/snake.js";

    // delete the file first
    fs.unlink(outputFile);

    // write all files into a snake build
    fs.writeFile(outputFile, code.join("\n"), 'utf8', function (err) {
      console.log("Wrote to " + outputFile);

      if (err) {
        throw err;
      }

      // run compressor
      compressor(outputFile);
    });
  }

  , readFile = function () {
    if (code.length === 4) {
      writeFile();
    } else {
      var inputFile = "src/" + files[i] + ".js";
      console.log("Merging " + inputFile);

      fs.readFile(inputFile, 'utf8', function (err, data) {
        if (err) {
          throw err;
        }

        // join all the files
        code.push(data);

        // read the next file...
        readFile();
      });

      i = i + 1;
    }
  };

  readFile();
}, true);
