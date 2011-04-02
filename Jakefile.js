// TODO
/*
  - load plug-ins
  - select transport/driver
*/

var gzip = require('gzip'),
    sys = require("sys"),
    fs = require("fs"),
    files = ['MIT-LICENSE', 'snake', 'base', 'vql'],
    output = {
      file: "build/snake.js",
      min: "build/snake.min.js",
      dev: "build/snake.dev.js",
      gzip: "build/snake.js.gz"
    },
    exec = require('child_process').exec,
    Jake = null;

Jake = {
  jshint: function () {
    // Test code using jshint
    // TODO check to make sure jshint is installed
    console.log("Started Lint testing " + output.file);
    exec("jshint " + output.file + " --config jshint.json", function (error, stdout, stderr) {
      if (stdout) {
        console.log("--jshint--");
        console.log(stdout);
      }
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  },

  createDirs: function () {
    // create directory for build
    exec("mkdir build");
  
    // create directory for Docs
    exec("mkdir docs");
  },

  compress: function () {
    // Minimify the code using uglifyJS
    // TODO check that uglify is installed
    console.log("Compressing " + output.file + " using UglifyJS");
    exec("uglifyjs " + output.file + " > " + output.min, function (error, stdout, stderr) {
      if (stdout) {
        console.log("--UglifyJS--");
        console.log(stdout);
      }

      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  },

  main: function () {
    var finishr = function () {
      fs.readFile(output.file, "utf8", function (err, text) {
        if (err) {
          throw err;
        }

        // test code with jshint
        Jake.jshint();

        // minimify using uglifyjs
        Jake.compress();
      });
    },

    writeFile = function (code) {
      Jake.createDirs();

      // delete the file first
      fs.unlink(output.file);

      // write all files into a snake build
      fs.writeFile(output.file, code.join("\n"), 'utf8', function (err) {
        console.log("Wrote to " + output.file);

        if (err) {
          throw err;
        }

        // run minimifier and jshint
        finishr();
      });

      // write files into a dev version
      fs.writeFile(output.dev, code.join("\n") + "\n(function () { Snake.debug = true; }());", 'utf8', function (err) {
        console.log("Wrote to " + output.dev);
      });
    },

    readFile = function (code) {
      if (files.length === 0) {
        writeFile(code);
      } else {
        var inputFile = null;

        switch (files[0]) {
        case "MIT-LICENSE":
          inputFile = files[0];
          break;
        default:
          inputFile = "src/" + files[0] + ".js";
        }
        console.log("Merging " + inputFile);

        fs.readFile(inputFile, 'utf8', function (err, data) {
          if (err) {
            throw err;
          }

          // join all the files
          code.push(data);

          // read the next file...
          readFile(code);
        });

        files.shift();
      }
    };

    readFile([]);
  }
}

/**
  Tasks
  */

/** Web SQL Database */
task("default", [], function () {
  files.push('web.db');
  Jake.main();
}, true);

/** MySQL */
task("mysql", [], function () {
  files.push('mysql.db');
  Jake.main();
}, true);

/** Tasks */

task("docs", [], function () {
  // Build docs
  console.log("Building documentation...");
  exec("java -jar vendor/jsdoc/jsrun.jar vendor/jsdoc/app/run.js -c=jsdoc.conf", function () {
    console.log("Documentation available in docs/");
  });
}, true);

task("jshint", [], function () {
  Jake.jshint();
}, true);

task("uglify", [], function () {
  Jake.compress();
}, true);

task("gzip", [], function () {
  fs.readFile(output.file, "utf8", function (err, text) {
    // NOTE: requires gzip (npm install gzip)
    // TODO check for gzip installed!
    console.log("Compressing " + output.file + " using node-gzip");
    gzip(text, function (err, data) {
      // Save gzip output to a file
      fs.writeFile(output.gzip, data, 'utf8', function (err) {
        console.log("gzipped file: " + output.gzip);
        fs.stat(output.gzip, function (err, stats) {
          console.log("gzipped size: " + stats.size);
        });
      });
    });
  });
}, true);

task("mkdir", [], function () {
  Jake.createDirs();
}, true);

/*
task("node", [], function () {
  console.log("Building node file");
  fs.readFile(output.file, "utf8", function (err, text) {
    fs.writeFile("lib/index.js", text + "\nmodule.exports = Snake", 'utf8', function (err) {
      if (!err) {
        console.log("Wrote to lib/index.js");
      }
    });
  });
}, true);
*/
