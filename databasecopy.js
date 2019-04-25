const sqlite3 = require('sqlite3').verbose(); //https://www.npmjs.com/package/sqlite3
const siteconfig = require('./siteconfig');

function Database(name, flags, next) {
  this._message = `Opening SQL database: ${ name }`;
  this._next = next;

  // open the db
  this._db = new sqlite3.Database(name, flags, this._handle_error());
  // check if the file is an actual database file
  this._db.exec('pragma schema_version', this._handle_error());
  // foreign keys!
  this._db.run('PRAGMA foreign_keys=on')

  this._db.on('trace', function(sql) {
    this._message = sql;
    if(siteconfig.trackSql === true) {
      console.log(sql);
    }
  })
}

Database.prototype._handle_error = function(callback) {
  var next = this._next;
  var message = this._message;

  return function(...args) {
    if(args[0]) {
      next(new Error(message));
    }
    if(callback) {
      callback(...args);
    }
  }
}

function register_function(name) {
  Database.prototype[name] = function(...args) {
    this._message = `SQL ${ name } '${ args[0] }'`;

    var last_arg = args[args.length - 1];
    if (typeof last_arg === "function") {
      last_arg = this._handle_error(last_arg);
    }

    this._db[name](...args);
  }
}

register_function('run');
register_function('all');
register_function('get');
register_function('close');
register_function('each');


function determine_mode(readonly) {
  return readonly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE;

}
function load_dict_db(dictID, readonly, next) {
  var mode = determine_mode(readonly);
  var db = new Database(path.join(siteconfig.dataDir, "dicts/" + dictID + ".sqlite"), mode, next);

  if(!readonly) db.run('PRAGMA journal_mode=WAL');
  return db;
}

function load_lexonomy_db(readonly, next) {
  var mode = determine_mode(readonly);
  return new Database(path.join(siteconfig.dataDir, "lexonomy.sqlite"), mode, next);
}

module.exports = {
  dictDB: load_dict_db,
  lexonomyDB: load_lexonomy_db,
  Database: Database
}
