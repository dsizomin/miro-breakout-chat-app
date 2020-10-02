function MessagesRepository(db) {
  this.db = db
}

/**
 * @param {string} authorId
 * @param {string} authorName
 * @param {string} roomId
 * @param {string} text
 * @returns {Promise<{
 *   authorId: string,
 *   authorName: string,
 *   roomId: string,
 *   text: string,
 *   timestamp: string
 * }>}
 */
MessagesRepository.prototype.storeMessage = function(authorId, authorName, roomId, text) {
  return new Promise((res, rej) => {
    const sql = `
      INSERT INTO Message(AuthorId, AuthorName, RoomId, Text, Timestamp) 
      VALUES(?, ?, ?, ?, ?)
    `
    const timestamp = Date.now();
    const values = [authorId, authorName, roomId, text, timestamp]
    const message = {
      authorId,
      authorName,
      roomId,
      text,
      timestamp
    };

    this.db.run(sql, values, err => err ? rej(err) : res(message))
  })
}

/**
 * @param {string} roomId
 * @returns {Promise<Array<{
 *   authorId: string,
 *   authorName: string,
 *   roomId: string,
 *   text: string,
 *   timestamp: string
 * }>>}
 */
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

    this.db.all(sql, params, (err, rows) => err ? rej(err) : res(rows))
  })
}

module.exports = MessagesRepository