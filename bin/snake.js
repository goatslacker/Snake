#!/usr/bin/env node

var sys = require("sys"),
    path = require("path"),
    fs = require("fs"),
    args = (function () {
      var args = process.argv.splice(2),
          i = 0,
          max = 0,
          key = null,
          val = null,
          arg = null,
          obj = {};

      for (i, max = args.length; i < max; i = i + 1) {
        arg = args[i].split("=");
        key = arg[0];
        val = arg[1] || true;

        if (key) {
          obj[key] = val;
        }
      }

      return obj;
    }());

console.log(args);

// TODO
/*
  - build model from JSON
  - build SQL from model
  - build JSON | model from SQL
  - load fixtures
  - create tables/insert into
*/
