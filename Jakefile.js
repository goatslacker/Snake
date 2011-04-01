// TODO
/*
  - load plug-ins
  - select transport/driver
*/

var jake = require("jake")
  , gzip = require('gzip')
  , sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , util = require('util')
  , files = ['MIT-LICENSE', 'snake', 'base', 'web.db', 'vql']
  , i = 0
  , code = []
  , outputFile = "build/snake.js"
  , outputMinFile = "build/snake.min.js"
  , outputDevFile = "build/snake.dev.js"
  , gzippedFile = "build/snake.js.gz"
  , sys = require('sys')
  , exec = require('child_process').exec;

function jshint() {
  // Test code using jshint
  // TODO check to make sure jshint is installed
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
}

function createDirs() {
  // create directory for build
  exec("mkdir build");
  
  // create directory for Docs
  exec("mkdir docs");
}

task("default", [], function () {

  var finishr = function () {
    fs.readFile(outputFile, "utf8", function (err, text) {
      if (err) {
        throw err;
      }

      // test code with jshint
      jshint();

      // Minimify the code using uglifyJS
      // TODO check that uglify is installed
      console.log("Compressing " + outputFile + " using UglifyJS");
      exec("uglifyjs " + outputFile + " > " + outputMinFile, function (error, stdout, stderr) {
        if (stdout) {
          console.log("--UglifyJS--");
          console.log(stdout);
        }

        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });

    });
  },

  writeFile = function () {
    createDirs();

    // delete the file first
    fs.unlink(outputFile);

    // write all files into a snake build
    fs.writeFile(outputFile, code.join("\n"), 'utf8', function (err) {
      console.log("Wrote to " + outputFile);

      if (err) {
        throw err;
      }

      // run minimifier, jshint and gzip
      finishr();
    });

    // write files into a dev version
    fs.writeFile(outputDevFile, code.join("\n") + "\n(function () { Snake.debug = true; }());", 'utf8', function (err) {
      console.log("Wrote to " + outputDevFile);
    });
  },

  readFile = function () {
    if (code.length === files.length) {
      writeFile();
    } else {
      var inputFile = null;

      switch (files[i]) {
      case "MIT-LICENSE":
        inputFile = files[i];
        break;
      default:
        inputFile = "src/" + files[i] + ".js";
      }
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

task("docs", [], function () {
  // Build docs
  console.log("Building documentation...");
  exec("java -jar vendor/jsdoc/jsrun.jar vendor/jsdoc/app/run.js -c=jsdoc.conf", function () {
    console.log("Documentation available in docs/");
  });
}, true);

task("jshint", [], function () {
  jshint();
}, true);

task("gzip", [], function () {
  fs.readFile(outputFile, "utf8", function (err, text) {
    // NOTE: requires gzip (npm install gzip)
    // TODO check for gzip installed!
    console.log("Compressing " + outputFile + " using node-gzip");
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
}, true);

task("mkdir", [], function () {
  createDirs();
}, true);
