# Snake: a Javascript ORM #

Snake is English for Orm in Swedish. Snake is inspired by Propel & Criteria.

## Examples ##

The following examples derive from this example schema:

    {
      "snake": {
        "fileName": "dreamcatcher",
        "database": {
          "name": "dreamcatcher",
          "version": "0.1",
          "displayName": "Dreamcatcher Database",
          "size": 1000000
        },
        "schema": {
          "dream": {
            "jsName": "Dream",
            "columns": {
              "title": { "type": "text" },
              "summary": { "type": "text" },
              "dream_date": { "type": "text" }
            }
          },
          "dream_tag": {
            "jsName": "DreamTag",
            "columns": {
              "dream_id": { "type": "integer", "foreign": "dream.id" },
              "tag": { "type": "text" },
              "normalized": { "type": "text" }
            }
          }
        }
      }
    }

### Selecting All Records ###

    DreamPeer.doSelect(new Snake.Criteria(), function (dreams) {
      console.log(dreams);
    });


### Inserting a new Record ###

    var dream = new Dream();
    dream.summary = "Vivamus sed dapibus nibh. Integer sed arcu arcu, a sagittis nulla. Integer tortor eros, luctus vitae eleifend ultrices, dignissim non est. Sed volutpat varius metus nec tempor. Mauris at dui sit amet massa blandit suscipit. Aenean tempus leo ut dui sollicitudin quis rhoncus diam tincidunt. In ac suscipit quam. Pellentesque ut ornare nulla. Morbi accumsan hendrerit lectus ac ullamcorper.";
    dream.save();

### Updating a Record ###

    // first we select a record
    DreamPeer.doSelectOne(new Snake.Criteria(), function (dream) {
      dream.title = "I am updating this record with this title";
      dream.save();

      // now we make sure the record was updated, we test it with a select
      var c = new Snake.Criteria();
      c.add(DreamPeer.ID, 1);
      DreamPeer.doSelectOne(c, function (dream) {
        console.log(dream);
      });
    });


### Select Queries ###

Query will read: SELECT * FROM dream WHERE id = 1;

    var c = new Snake.Criteria();
    c.add(DreamPeer.ID, 1);
    DreamPeer.doSelect(c, function (dream) {
      console.log(dream);
    });

Query will read: SELECT * FROM dream WHERE title = "Hello World" AND id < 20;

    var c = new Snake.Criteria();
    c.add(DreamPeer.TITLE, "Hello World");
    c.add(DreamPeer.ID, 20, "LESS_THAN");
    DreamPeer.doSelect(c, function (dream) {
      console.log(dream);
    });

Query will read: SELECT * FROM dream WHERE created_at > 1293581218811 AND created_at < 1293730000000;

    var c = new Snake.Criteria();
    c.add(DreamPeer.CREATED_AT, 1293581218811, "GREATER_THAN");
    c.add(DreamPeer.CREATED_AT, 1293730000000, "LESS_THAN");
    c.addDescendingOrderByColumn(DreamPeer.TITLE);
    DreamPeer.doSelect(c, function (dream) {
      console.log(dream);
    });

### Joining Tables ###

    var c = new Snake.Criteria();
    c.add(DreamTagPeer.TAG, "school");
    c.addJoin(DreamPeer.ID, DreamTagPeer.DREAM_ID);
    DreamPeer.doSelect(c, function (dreams) {
      console.log(dreams);
    });

### Custom Queries ###

    var query = "SELECT * FROM dream WHERE 1";
    Snake.query(query, params, function (transaction, results) {
      console.log(results);
    });

### Deleting Records ###

Deletes one record

    // first we select the first record we find
    DreamPeer.doSelectOne(new Snake.Criteria(), function (dream) {

      // now we delete that record
      dream.remove();
    });

Delete multiple records

    // delete all records in the database
    DreamPeer.doDelete(new Snake.Criteria());

