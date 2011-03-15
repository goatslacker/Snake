var jake = require("jake")
  , gzip = require('gzip')
  , sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , util = require('util')
  , files = ['snake', 'base', 'web.db', 'vql']
  , i = 0
  , code = []
  , outputFile = "build/snake.js"
  , outputMinFile = "build/snake.min.js"
  , outputDevFile = "build/snake.dev.js"
  , gzippedFile = "build/snake.js.gz"
  , sys = require('sys')
  , exec = require('child_process').exec
  , jshintComments = "/*jshint white: true, devel: true, evil: true, laxbreak: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, indent: 2, maxerr: 1 */\n/* global openDatabase*/\n";

task("default", [], function () {

  var compressorDone = function (preMin, postMin) {

    console.log("Successfully compressed " + preMin);

    fs.stat(preMin, function (err, stats) {
      preMin = stats;
      fs.stat(postMin, function (err, stats) {
        postMin = stats;
        var ratio = Math.round((postMin.size / preMin.size) * 100);

        console.log("Original size: " + preMin.size);
        console.log("Compressed size: " + postMin.size);
        console.log("Compression ratio: " + ratio + "%");
      });
    });
  }

  , compressFile = function () {
    // Uglify JS
    fs.readFile(outputFile, "utf8", function (err, text) {
      if (err) {
        throw err;
      }

      console.log("Started Lint testing " + outputFile);

      exec("jshint " + outputFile + " --config jshint.json", function (error, stdout, stderr) {
        if (stdout) {
          console.log("--jshint--");
          console.log(stdout);
        }
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });

      console.log("Compressing " + outputFile + " using UglifyJS");

      exec("uglifyjs " + outputFile + " >> " + outputMinFile, function (error, stdout, stderr) {
        if (stdout) {
          console.log("--UglifyJS--");
          console.log(stdout);
        }

        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });

      console.log("Compressing " + outputFile + " using node-gzip");

      // NOTE: requires gzip (npm install gzip)
      gzip(text, function (err, data) {
        // Save gzip output to a file
        fs.writeFile(gzippedFile, data, 'utf8', function (err) {
          console.log("gzipped file: " + gzippedFile);
          fs.stat(gzippedFile, function (err, stats) {
            console.log("gzipped size: " + stats.size);
          });
        });
      });
    });
  }

  , writeFile = function () {
    // delete the file first
    fs.unlink(outputFile);

    // write all files into a snake build
    fs.writeFile(outputFile, code.join("\n"), 'utf8', function (err) {
      console.log("Wrote to " + outputFile);

      if (err) {
        throw err;
      }

      // run compressor
      compressFile();
    });

    // write files into a dev version with jshint comments
    fs.writeFile(outputDevFile, jshintComments + code.join("\n") + "\n(function () { Snake.debug = true; })();", 'utf8', function (err) {
      console.log("Wrote to " + outputDevFile);
    });
  }

  , readFile = function () {
    if (code.length === files.length) {
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
