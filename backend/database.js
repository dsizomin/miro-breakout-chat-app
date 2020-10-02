const sqlite3 = require('sqlite3').verbose()

/**
 * Open DB connection and return DB instance.
 *
 * @param {string} dbPath
 * @returns {Promise<sqlite3.Database>}
 */
const openDBConnection = (dbPath) => {
  return new Promise((res, rej) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        rej(err)
      } else {
        console.log('Established connection to breakout database.');
        res(db)
      }
    })
  })
}

/**
 * Creates tables in DB, if needed.
 *
 * @param {sqlite3.Database} db
 * @returns {Promise<sqlite3.Database>}
 */
const initializeSchema = (db) => {
  return new Promise((res, rej) => {
    const initSql = `
      CREATE TABLE IF NOT EXISTS Message(
        AuthorId TEXT NOT NULL,
        AuthorName TEXT NOT NULL,
        RoomId TEXT NOT NULL,
        Text TEXT NOT NULL,
        Timestamp INTEGER NOT NULL)
    `
    db.run(initSql, err => {
      if (err) {
        rej(err)
      } else {
        console.log('Database schema is ready.')
        res(db)
      }
    });
  })
}

/**
 * Opens connection to database and initializes the schema, if needed.
 *
 * @param {string} dbPath
 * @returns {Promise<sqlite3.Database>}
 */
const init = (dbPath) => {
  return openDBConnection(dbPath).then(initializeSchema)
}

module.exports = init