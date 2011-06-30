/**
  * Snake - A JavaScript ORM/DBAL
  *
  * @author <a href="mailto:josh@goatslacker.com">Josh Perez</a>
  */

/**
  * The Snake ORM/DBAL
  *
  * @namespace Snake
  * @this {Snake}
  */
var Snake = {
  version: "2.0.2",
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
    Object.keys(obj).forEach(function (prop) {
      if (obj.hasOwnProperty(prop)) {
        str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
      }
    });

    return str;
  }
};
