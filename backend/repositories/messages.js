function MessagesRepository(db) {
  this.db = db
}

MessagesRepository.prototype.storeMessage = function(authorId, authorName, roomId, text) {
  return new Promise((res, rej) => {
    const sql = `
      INSERT INTO Message(AuthorId, AuthorName, RoomId, Text, Timestamp) 
      VALUES(?, ?, ?, ?, ?)
    `
    const timestamp = Date.now();
    const values = [authorId, authorName, roomId, text, timestamp]

    this.db.run(sql, values, (err) => {
      if (err) {
        rej(err)
      } else {
        res({
          authorId,
          authorName,
          roomId,
          text,
          timestamp
        })
      }
    })
  })
}

MessagesRepository.prototype.getByRoomId = function(roomId) {
  return new Promise((res, rej) => {
    const sql = `
      SELECT 
        AuthorId as authorId,
        AuthorName as authorName,
        RoomId as roomId,
        Text as text,
        Timestamp as timestamp
      FROM Message
      WHERE RoomId = ?
      ORDER BY Timestamp ASC
    `
    const params = [roomId]

    this.db.all(sql, params, (err, rows) => {
      if (err) {
        rej(err)
      } else {
        res(rows)
      }
    })
  })
}

module.exports = MessagesRepository