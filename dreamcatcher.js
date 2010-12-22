Snake.init({"database":{"name":"dreamcatcher","version":"0.1","displayName":"Dreamcatcher Database","size":100000000},"schema":{"dream":{"jsName":"Dream","columns":{"title":{"type":"text"},"summary":{"type":"text"},"dreamDate":{"type":"text"}}},"dream_search":{"jsName":"DreamSearch","columns":{"dream_id":{"type":"integer","foreign":"dream.id"},"word":{"type":"text"},"stem":{"type":"text"},"weight":{"type":"integer"}}},"dream_tag":{"jsName":"DreamTag","columns":{"dream_id":{"type":"integer","foreign":"dream.id"},"tag":{"type":"text"},"normalized":{"type":"text"}}}},"sql":["CREATE TABLE IF NOT EXISTS 'dream' (title TEXT, summary TEXT, dreamDate TEXT)","CREATE TABLE IF NOT EXISTS 'dream_search' (dream_id INTEGER, word TEXT, stem TEXT, weight INTEGER)","CREATE TABLE IF NOT EXISTS 'dream_tag' (dream_id INTEGER, tag TEXT, normalized TEXT)"]});

var DreamPeer = new Snake.BasePeer('dream');
DreamPeer.prototype = {
  ID: 'dream.id',
  CREATED_AT: 'dream.created_at',
  TITLE: 'dream.title',
  SUMMARY: 'dream.summary',
  DREAMDATE: 'dream.dreamDate',
  
  fields: {
    id: { type: 'INTEGER' }, created_at: { TYPE: 'INTEGER' },
    title: { type: 'text' },
    summary: { type: 'text' },
    dreamDate: { type: 'text' }
  },
  columns: ['title', 'summary', 'dreamDate']
};
var Dream = Snake.Base.extend({
  init: function () {
    this._super(DreamPeer);
  },
  id: null,
  created_at: null,
  title: null,
  summary: null,
  dreamDate: null
});

var DreamSearchPeer = new Snake.BasePeer('dream_search');
DreamSearchPeer.prototype = {
  ID: 'dream_search.id',
  CREATED_AT: 'dream_search.created_at',
  DREAM_ID: 'dream_search.dream_id',
  WORD: 'dream_search.word',
  STEM: 'dream_search.stem',
  WEIGHT: 'dream_search.weight',
  
  fields: {
    id: { type: 'INTEGER' }, created_at: { TYPE: 'INTEGER' },
    dream_id: { type: 'integer' },
    word: { type: 'text' },
    stem: { type: 'text' },
    weight: { type: 'integer' }
  },
  columns: ['dream_id', 'word', 'stem', 'weight']
};
var DreamSearch = Snake.Base.extend({
  init: function () {
    this._super(DreamSearchPeer);
  },
  id: null,
  created_at: null,
  dream_id: null,
  word: null,
  stem: null,
  weight: null
});

var DreamTagPeer = new Snake.BasePeer('dream_tag');
DreamTagPeer.prototype = {
  ID: 'dream_tag.id',
  CREATED_AT: 'dream_tag.created_at',
  DREAM_ID: 'dream_tag.dream_id',
  TAG: 'dream_tag.tag',
  NORMALIZED: 'dream_tag.normalized',
  
  fields: {
    id: { type: 'INTEGER' }, created_at: { TYPE: 'INTEGER' },
    dream_id: { type: 'integer' },
    tag: { type: 'text' },
    normalized: { type: 'text' }
  },
  columns: ['dream_id', 'tag', 'normalized']
};
var DreamTag = Snake.Base.extend({
  init: function () {
    this._super(DreamTagPeer);
  },
  id: null,
  created_at: null,
  dream_id: null,
  tag: null,
  normalized: null
});
