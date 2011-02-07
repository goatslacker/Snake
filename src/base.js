// Base Classes
/*
  Base Class for the ORM
*/
Snake.Base = function (peer, prop) {
  var name = null
    , Model = function () { };

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

Snake.BasePeer.prototype = {
  doCount: function (criteria, distinct, onSuccess, onFailure) {
    if (typeof(distinct) === "function") {
      onSuccess = distinct;
      onFailure = onSuccess;
      distinct = false;
    } else {
      distinct = distinct || false;
    }

    criteria = criteria || new Snake.Criteria();
    criteria.executeCount(this, distinct, onSuccess, onFailure);
  },

  // executes a SELECT query
  doSelect: function (criteria, onSuccess, onFailure) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeSelect(this, onSuccess, onFailure);
  },

  // executes a SELECT query and returns 1 result
  doSelectOne: function (criteria, onSuccess, onFailure) {
    criteria = criteria || new Snake.Criteria();
    criteria.setLimit(1);
    criteria.executeSelect(this, function (result) {
      if (onSuccess && result.length >= 0) {
        onSuccess(result[0]);
      }
    }, onFailure);
  },

  // deletes 1 record
  doDeleteRecord: function (model, onSuccess, onFailure) {
    var criteria = new Snake.Criteria();
    criteria.add(this.ID, model.id);
    this.doDelete(criteria, onSuccess, onFailure);
  },

  // deletes multiple records
  doDelete: function (criteria, onSuccess, onFailure) {
    criteria = criteria || new Snake.Criteria();
    criteria.executeDelete(this, onSuccess, onFailure);
  },

  // executes an INSERT || UPDATE depending on the model
  doUpdate: function (model, onSuccess, onFailure) {
    var criteria = new Snake.Criteria();
    if (model.id === null) {
      criteria.executeInsert(model, this, onSuccess, onFailure);
    } else {
      criteria.executeUpdate(model, this, onSuccess, onFailure);
    }
  },

  // retrieves an item by it's PRIMARY KEY
  retrieveByPK: function (pk, onSuccess, onFailure) {
    var c = new Snake.Criteria();
    c.add(this.ID, pk);
    this.doSelect(c, onSuccess, onFailure);
  }
};
