var jake = require("jake")
  , gzip = require('gzip')
  , sys = require("sys")
  , path = require("path")
  , fs = require("fs")
  , util = require('util')
  , uglify = require("uglify-js")
  , jsp = uglify.parser
  , pro = uglify.uglify
  , files = ['snake', 'base', 'web.db', 'vql']
  , i = 0
  , code = []
  , outputFile = "build/snake.js"
  , outputDevFile = "build/snake.dev.js"
  , gzippedFile = "build/snake.js.gz"
  , jshintComments = "/*jshint white: true, devel: true, evil: true, laxbreak: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, indent: 2, maxerr: 1 */\n/* global openDatabase*/\n"
  , uglifyOptions = {
    ast: false,
    mangle: true,
    mangle_toplevel: false,
    squeeze: true,
    make_seqs: true,
    dead_code: true,
    beautify: false,
    verbose: false,
    show_copyright: true,
    out_same_file: false,
    max_line_length: 32 * 1024,
    unsafe: false,
    beautify_uglifyOptions: {
      indent_level: 2,
      indent_start: 0,
      quote_keys: false,
      space_colon: false
    },
    input: outputFile,
    output: "./build/snake.min.js"
  };

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

      console.log("Compressing " + outputFile + " using UglifyJS");

      output(squeeze_it(text));

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

  // -------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------

  // UglifyJS Functions
  function output(text) {
          var out;
          if (uglifyOptions.out_same_file && outputFile)
                  uglifyOptions.output = outputFile;
          if (uglifyOptions.output === true) {
                  out = process.stdout;
          } else {
                  out = fs.createWriteStream(uglifyOptions.output, {
                          flags: "w",
                          encoding: "utf8",
                          mode: 0644
                  });
          }
          out.write(text);
          compressorDone(outputFile, uglifyOptions.output);
          if (uglifyOptions.output !== true) {
                  out.end();
          }
  };

  // --------- main ends here.

  function show_copyright(comments) {
    var ret = "";
    if (comments) {
          for (var i = 0; i < comments.length; ++i) {
                  var c = comments[i];
                  if (c.type == "comment1") {
                          ret += "//" + c.value + "\n";
                  } else {
                          ret += "/*" + c.value + "*/";
                  }
          }
    }
          return ret;
  };

  function squeeze_it(code) {
          var result = "";
          if (uglifyOptions.show_copyright) {
                  var tok = jsp.tokenizer(code), c;
                  c = tok();
                  result += show_copyright(c.comments_before);
          }
          try {
                  var ast = time_it("parse", function(){ return jsp.parse(code); });
                  if (uglifyOptions.mangle)
                          ast = time_it("mangle", function(){ return pro.ast_mangle(ast, uglifyOptions.mangle_toplevel); });
                  if (uglifyOptions.squeeze)
                          ast = time_it("squeeze", function(){
                                  ast = pro.ast_squeeze(ast, {
                                          make_seqs : uglifyOptions.make_seqs,
                                          dead_code : uglifyOptions.dead_code
                                  });
                                  if (uglifyOptions.unsafe)
                                          ast = pro.ast_squeeze_more(ast);
                                  return ast;
                          });
                  if (uglifyOptions.ast)
                          return sys.inspect(ast, null, null);
                  result += time_it("generate", function(){ return pro.gen_code(ast, uglifyOptions.beautify && uglifyOptions.beautify_uglifyOptions) });
                  if (!uglifyOptions.beautify && uglifyOptions.max_line_length) {
                          result = time_it("split", function(){ return pro.split_lines(result, uglifyOptions.max_line_length) });
                  }
                  return result;
          } catch(ex) {
                  sys.debug(ex.stack);
                  sys.debug(sys.inspect(ex));
                  sys.debug(JSON.stringify(ex));
          }
  };

  function time_it(name, cont) {
          if (!uglifyOptions.verbose)
                  return cont();
          var t1 = new Date().getTime();
          try { return cont(); }
          finally { sys.debug("// " + name + ": " + ((new Date().getTime() - t1) / 1000).toFixed(3) + " sec."); }
  };

}, true);
