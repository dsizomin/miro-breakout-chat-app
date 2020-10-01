const path = require('path')
const sqlite3 = require('sqlite3').verbose()

// TODO (dsizomin) Ideally should come from config or env variable
const dbPath = path.resolve(__dirname, './db/breakout.db')

const init = () => {
  return new Promise((res, rej) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        rej(err)
      } else {
        const initSql = `
          CREATE TABLE IF NOT EXISTS Message(
            AuthorId TEXT NOT NULL,
            AuthorName TEXT NOT NULL,
            RoomId TEXT NOT NULL,
            Text TEXT NOT NULL,
            Timestamp INTEGER NOT NULL)
        `
        db.run(initSql, err => err ? rej(err) : res(db));
      }
    })
  })
}

module.exports = init