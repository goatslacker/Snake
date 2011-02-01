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
