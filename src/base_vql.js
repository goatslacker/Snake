// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = function (peer, prop) {
  var name = null,
      Model = function () { };

  Model.prototype = {

    peer: peer,

    // saves a record in the database
    save: function (onSuccess, onFailure) {
      this.peer.doUpdate(this, onSuccess, onFailure);
    },

    hydrate: function (obj) {
      var i = null;
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          this[i] = obj[i];
        }
      }
    },

    // deletes a record from the database
    remove: function (onSuccess, onFailure) {
      this.peer.doDeleteRecord(this, onSuccess, onFailure);
    }
  };

  // Copy the properties over onto the new prototype
  for (name in prop) {
    if (prop.hasOwnProperty(name)) {
      Model.prototype[name] = prop[name];
    }
  }
   
  return Model;
};

/*
  The peer class of an object. Handles multiple records of items.
  @param obj Object
*/
Snake.BasePeer = function (prop) {
  var name = null;
  for (name in prop) {
    if (prop.hasOwnProperty(name)) {
      this[name] = prop[name];
    }
  }
   
  return this;
};
