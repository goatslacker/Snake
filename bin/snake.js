#!/usr/bin/env node

var sys = require("sys"),
    path = require("path"),
    fs = require("fs"),
    args = (function () {
      return process.argv.splice(2); 
    }());

// TODO
/*
  - build model from JSON
  - build SQL from model
  - build JSON | model from SQL
  - load fixtures
  - create tables/insert into
*/
