/**
  * Snake - A JavaScript ORM/DBAL
  *
  * @author <a href="mailto:josh@goatslacker.com">Josh Perez</a>
  * @version 0.1.5
  */

/**
  * The Snake ORM/DBAL
  *
  * @namespace Snake
  * @this {Snake}
  */
var Snake = {
  version: "0.1.5",
  build: "alpha",
  global: this,
  debug: false,
  config: {},
  log: function (msg) {
    if (console) {
      console.log(msg);
    }
  },

  /**
    * Inserts a foreign object into a template.
    *
    * @param {string} str The string to interpolate
    * @param {Object} obj The foreign Object to interpolate into the string
    * @returns {string} The string interpolated with the object's values
    */
  interpolate: function (str, obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
      }
    }

    return str;
  },

  /**
    * Tests whether an Object is an array or not
    *
    * @param {Array} array_in_question The object to check
    @ @returns {boolean}
    */
  isArray: function (array_in_question) {
    return (Object.prototype.toString.call(array_in_question) === '[object Array]');
  }
};
