/*
Example use:
Card.is(Snake.Indexed);

this will look through card's schema and if a field has a $search object then it will index that field

// requires PorterStemmer class...
*/

// TODO -- need to create the Search table beforehand as well -- item needs to check if table exists or not

Snake.Indexed = {
  save: function () {
    this.$super.save();
    this.updateSearchIndex();
  },

  doSearch: function (search_term, callback) {
    var words = search_term.split(" ")
      , stemmed_words = []
      , i = 0
      , query = ""
      , phrase = false
      , q = [];
   
    // there is more than 1 word.
    if (words.length > 1) {

      // we need to execute two queries, one for the entire term stemmed and replaced and then the loop of words
      phrase = stemmer(search_term.toLowerCase().replace(/[^a-zA-Z 0-9]+/g,''));
    }

    // single words
    for (i = 0; i < words.length; i = i + 1) {
      stemmed_words.push(stemmer(words[i].toLowerCase().replace(/[^a-zA-Z 0-9]+/g,'')));
      q.push("?");
    }

    // custom query
// TODO - pull the right feeds...
//    query = "SELECT COUNT(*) AS nb, SUM(weight) AS total_weight, dream.id, dream.title, dream.summary, dream.dream_date, dream.created_at FROM dream_search, dream WHERE dream_id = dream.id AND stem IN (#{words}) GROUP BY dream.id ORDER BY nb DESC, total_weight DESC";
    phrase = false;

    if (phrase !== false) {
      // run first query and the mix with second set of results
      Snake.query(query.interpolation({ words: "?" }), [phrase], Snake.hydrateRS.bind(this, DreamPeer, (function (dreams) {
        var all_dreams = [];
        all_dreams = all_dreams.concat(dreams);

        Snake.query(query.interpolation({ words: q }), stemmed_words, Snake.hydrateRS.bind(this, DreamPeer, (function (dreams) {
          callback(all_dreams);
        }).bind(this)));

      }).bind(this)));
    } else {
      // hydrates a record set
      Snake.query(query.interpolation({ words: q }), stemmed_words, Snake.hydrateRS.bind(this, DreamPeer, function (dreams) {
        callback(dreams);
      }));
    }
  },

  updateSearchIndex: function (dream) {
    console.log(this);

    dream = dream || new Dream();

    dream.title = dream.title || "";
    dream.summary = dream.summary || "";

    // get keywords and push them into an array repeated by weight...
    var summary = dream.summary.split(" ")
      , title = dream.title.split(" ")
      , tags = dream.tags
      , keywords = []
      , stop = [
        'i', 'im', 'ive', 'me', 'my', 'myself', 'we', 'weve', 'our', 'ours', 'ourselves', 'you', 'your',
        'youre', 'youve', 'yours', 'yourself', 'yourselves', 'he', 'hes', 'hay', 'hey', 'him', 'his', 'himself', 'she',
        'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'didnt',
        'can', 'cent', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'los',
        'was', 'take', 'aint', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
        'did', 'cause', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'will',
        'while', 'of', 'hi', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'makes', 'cannot',
        'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'else', 'ever',
        'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'ago', 'give',
        'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'find', 'goes',
        'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'must', 'wed',
        'than', 'too', 'very', 'put', 'also', 'other', 'gave', 'well', 'know', 'make', 'seen', 'shes',
        'let', ''
      ]
      , no_push = false
      , keys = []
      , keyword = null
      , index = {}
      , i = 0
      , j = 0
      , n = []
      , c = null;

    // delete existing keywords
    Snake.Venom.DreamSearch.find({ dream_id: dream.id }).doDelete();

    // remove stop words

    // then remove all the stop words
    // and remove all special chars, stem the words

    for (i = 0; i < summary.length; i = i + 1) {
      keyword = summary[i].replace(/[^a-zA-Z 0-9]+/g,'');

      for (j = 0; j < stop.length; j = j + 1) {
        if (stop[j] === keyword.toLowerCase()) {
          no_push = true;
        }
      }

      if (!no_push) {
        n.push(keyword);
      }

      no_push = false;
    }

    keywords = title.concat(title, title, n, tags, tags, tags);

    for (i = 0; i < keywords.length; i = i + 1) {
      if (keywords[i] && keywords[i].length >= 3) {
        // remove special chars, stem and push into keys
        var no_special_chars = keywords[i].replace(/[^a-zA-Z 0-9]+/g,'')
          , stemmed = stemmer(no_special_chars).toLowerCase();

        index[stemmed] = no_special_chars;
        keys.push(stemmed);
      }
    }

    keys.sort();

    keywords = {};

    // add up the weights

    for (i = 0; i < keys.length; i = i + 1) {
      if (i > 0 && keys[i] === keys[i - 1]) {
        keywords[keys[i]]++;
      } else {
        keywords[keys[i]] = 1;
      }
    }

    // add to database!
    for (i in keywords) {
      if (keywords.hasOwnProperty(i)) {
        var ds = new DreamSearch();
        ds.dream_id = dream.id;
        ds.word = index[i];
        ds.stem = i;
        ds.weight = keywords[i];
        ds.save();
      }
    }
  }
}
