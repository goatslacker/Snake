Snake.init({"database":{"fileName":"dreamcatcher","name":"ext:dreamcatcher","version":"0.1","displayName":"Dreamcatcher Database","size":100000000},"schema":{"dream":{"jsName":"Dream","columns":{"title":{"type":"text"},"summary":{"type":"text"},"dream_date":{"type":"text"}}},"dream_search":{"jsName":"DreamSearch","columns":{"dream_id":{"type":"integer","foreign":"dream.id"},"word":{"type":"text"},"stem":{"type":"text"},"weight":{"type":"integer"}}},"dream_tag":{"jsName":"DreamTag","columns":{"dream_id":{"type":"integer","foreign":"dream.id"},"tag":{"type":"text"},"normalized":{"type":"text"}}}},"sql":["CREATE TABLE IF NOT EXISTS 'dream' (id INTEGER PRIMARY KEY, title TEXT, summary TEXT, dream_date TEXT, created_at INTEGERArray)","CREATE TABLE IF NOT EXISTS 'dream_search' (id INTEGER PRIMARY KEY, dream_id INTEGER, word TEXT, stem TEXT, weight INTEGER, created_at INTEGER, FOREIGN KEY (dream_id) REFERENCES dream(id))","CREATE TABLE IF NOT EXISTS 'dream_tag' (id INTEGER PRIMARY KEY, dream_id INTEGER, tag TEXT, normalized TEXT, created_at INTEGER, FOREIGN KEY (dream_id) REFERENCES dream(id))"]});

var DreamPeer = new Snake.BasePeer({
  tableName: 'dream',
  jsName: 'Dream',
  ID: 'dream.id',
  CREATED_AT: 'dream.created_at',
  TITLE: 'dream.title',
  SUMMARY: 'dream.summary',
  DREAM_DATE: 'dream.dream_date',
  
  fields: {
    id: { type: 'INTEGER' }, created_at: { TYPE: 'INTEGER' },
    title: { type: 'text' },
    summary: { type: 'text' },
    dream_date: { type: 'text' }
  },
  columns: [ 'id', 'title', 'summary', 'dream_date', 'created_at' ]
});
var Dream = Snake.Base.extend({
  init: function () {
    this._super(DreamPeer);
  },
  id: null,
  created_at: null,
  title: null,
  summary: null,
  dream_date: null
});

var DreamSearchPeer = new Snake.BasePeer({
  tableName: 'dream_search',
  jsName: 'DreamSearch',
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
  columns: [ 'id', 'dream_id', 'word', 'stem', 'weight', 'created_at' ]
});
var DreamSearch = Snake.Base.extend({
  init: function () {
    this._super(DreamSearchPeer);
  },
  id: null,
  created_at: null,
  dream_id: null,
  word: null,
  stem: null,
  weight: null,
  dream: {}
});

var DreamTagPeer = new Snake.BasePeer({
  tableName: 'dream_tag',
  jsName: 'DreamTag',
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
  columns: [ 'id', 'dream_id', 'tag', 'normalized', 'created_at' ]
});
var DreamTag = Snake.Base.extend({
  init: function () {
    this._super(DreamTagPeer);
  },
  id: null,
  created_at: null,
  dream_id: null,
  tag: null,
  normalized: null,
  dream: {}
});
