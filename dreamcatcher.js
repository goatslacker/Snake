Snake.init({"database":{"name":"dreamcatcher","version":"0.1","displayName":"Dreamcatcher Database","size":100000000},"schema":{"dream":{"jsName":"Dream","columns":{"title":{"type":"text"},"summary":{"type":"text"},"dreamDate":{"type":"text"}}},"dream_search":{"jsName":"DreamSearch","columns":{"dream_id":{"type":"integer","foreign":"dream.id"},"word":{"type":"text"},"stem":{"type":"text"},"weight":{"type":"integer"}}},"dream_tag":{"jsName":"DreamTag","columns":{"dream_id":{"type":"integer","foreign":"dream.id"},"tag":{"type":"text"},"normalized":{"type":"text"}}}},"sql":["CREATE TABLE IF NOT EXISTS 'dream' (title TEXT, summary TEXT, dreamDate TEXT)","CREATE TABLE IF NOT EXISTS 'dream_search' (dream_id INTEGER, word TEXT, stem TEXT, weight INTEGER)","CREATE TABLE IF NOT EXISTS 'dream_tag' (dream_id INTEGER, tag TEXT, normalized TEXT)"]});

var DreamPeer = new Snake.BasePeer('dream');
DreamPeer.prototype = {
  TITLE: 'dream.title',
  SUMMARY: 'dream.summary',
  DREAMDATE: 'dream.dreamDate',
  
  fields: {
    title: {  },
    summary: {  },
    dreamDate: {  }
  },
  columns: ['title', 'summary', 'dreamDate']
};

var Dream = new Snake.Base(DreamPeer);
Dream.prototype = {
  title: null,
  summary: null,
  dreamDate: null
};

var DreamSearchPeer = new Snake.BasePeer('dream_search');
DreamSearchPeer.prototype = {
  DREAM_ID: 'dream_search.dream_id',
  WORD: 'dream_search.word',
  STEM: 'dream_search.stem',
  WEIGHT: 'dream_search.weight',
  
  fields: {
    dream_id: {  },
    word: {  },
    stem: {  },
    weight: {  }
  },
  columns: ['dream_id', 'word', 'stem', 'weight']
};

var DreamSearch = new Snake.Base(DreamSearchPeer);
DreamSearch.prototype = {
  dream_id: null,
  word: null,
  stem: null,
  weight: null
};

var DreamTagPeer = new Snake.BasePeer('dream_tag');
DreamTagPeer.prototype = {
  DREAM_ID: 'dream_tag.dream_id',
  TAG: 'dream_tag.tag',
  NORMALIZED: 'dream_tag.normalized',
  
  fields: {
    dream_id: {  },
    tag: {  },
    normalized: {  }
  },
  columns: ['dream_id', 'tag', 'normalized']
};

var DreamTag = new Snake.Base(DreamTagPeer);
DreamTag.prototype = {
  dream_id: null,
  tag: null,
  normalized: null
};
