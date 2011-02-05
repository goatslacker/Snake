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

  var mergeCode = function (data) {
    // join all the files
    code.push(data);

    if (code.length === 4) {
      writeFile();
    }
  }

  , compressor = function (outputFile) {
    // if uglify JS is installed (otherwise include it!)
    
    console.log("Compressing " + outputFile + " using UglifyJS");
    child = exec('uglifyjs -o build/snake.min.js build/snake.js', function (error, stdout, stderr) {

      console.log("Successfully compressed " + outputFile);

      fs.stat(outputFile, function (err, stats) {
        var preCompressedSize = stats.size;
        fs.stat('build/snake.min.js', function (err, stats) {
          var compressedSize = stats.size
            , ratio = Math.round((compressedSize / preCompressedSize) * 100);

          console.log("Original size: " + preCompressedSize);
          console.log("Compressed size: " + compressedSize);
          console.log("Compression ratio: " + ratio + "%");
        });
      });

      // TODO gzip it as well!

      if (error !== null) {
        console.log('exec error: ' + error);
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
  };

  for (i = 0; i < files.length; i = i + 1) {
    var inputFile = "src/" + files[i] + ".js";
    console.log("Merging " + inputFile);
 
    fs.readFile(inputFile, 'utf8', function (err, data) {
      if (err) {
        throw err;
      }

      mergeCode(data);
    });

  }
});
