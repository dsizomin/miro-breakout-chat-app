const express = require('express')
const socketio = require('socket.io');
const cors = require('cors')
const http = require('http')
const path = require('path')

const auth = require('./auth')
const initDB = require('./database')
const socketConfig = require('./config')

const MessagesRepository = require('./repositories/messages')

// TODO (dsizomin) As persistent storage has been implemented, consider using it to store rooms.
const rooms = {}
const roomsCreatedAt = new WeakMap()
const names = new WeakMap()

// TODO (dsizomin) Consider moving db path to config file
const dbPath = path.resolve(__dirname, (process.env.DB || './db/breakout.db'))

initDB(dbPath)
  .catch(err => {
    // If connecting to DB failed - it's a game over. Log the error and exit.
    console.error(err)
    process.exit(0)
  })
  .then(db => {
    console.log('Database is ready. Starting http server...');

    process.on('SIGTERM', () => db.close())
    process.on('exit', () => db.close())

    const app = express()
    const httpServer = http.Server(app)

    const messagesRepository = new MessagesRepository(db)

    app.use(cors())
    app.use(auth.passport.initialize())

    // TODO (dsizomin) Here and below we must check if the user has access to given room.
    app.get('/rooms/:roomId',
      auth.passport.authenticate(auth.STRATEGY_NAME),
      (req, res) => {
        const {roomId} = req.params
        const room = rooms[roomId]

        if (room) {
          res.json({
            createdAt: roomsCreatedAt.get(room),
            users: Object.values(room).map((socket) => names.get(socket)),
          })
        } else {
          res.status(500).end()
        }
      }
    )

    app.get('/rooms',
      auth.passport.authenticate(auth.STRATEGY_NAME),
      (req, res) => {
        res.json(Object.keys(rooms))
      }
    )

    app.get('/rooms/:roomId/messages',
      auth.passport.authenticate(auth.STRATEGY_NAME),
      (req, res) => {
        const {roomId} = req.params

        // TODO (dsizomin) For chats with a lot of messages loading the whole history might become a problem
        // Consider using offset & limit
        messagesRepository.getByRoomId(roomId)
          .then(messages => res.json(messages))
          .catch(err => {
            console.error(err)
            res.sendStatus(500)
          })
      }
    )

    const io = socketio(httpServer, socketConfig)

    io.use(auth.initializeSocketMiddleware)
    io.use(auth.authenticateSocketMiddleware)

    io.on('connection', (socket) => {
      const userContext = socket.request.session.passport.user

      const userName = userContext.user.name
      const userId = userContext.user.id

      let roomId = null

      // TODO (dsizomin) Here and below "magic strings" messages should be moved to enum shared between FE and BE.
      socket.on('join', (_roomId, callback) => {
        if (!_roomId) {
          if (callback) {
            callback('roomId param required')
          }
          console.warn(`${socket.id} attempting to connect without roomId`)
          return
        }

        roomId = _roomId

        if (rooms[roomId]) {
          rooms[roomId][socket.id] = socket
        } else {
          rooms[roomId] = {[socket.id]: socket}
          roomsCreatedAt.set(rooms[roomId], new Date())
        }
        socket.join(roomId)

        names.set(socket, userName)

        io.to(roomId).emit('system message', `${userName} joined ${roomId}`)

        if (callback) {
          callback(null, {success: true})
        }
      })

      socket.on('chat message', (text) => {
        messagesRepository.storeMessage(userId, userName, roomId, text)
          .then((message) => {
            io.to(roomId).emit('chat message', message)
          }).catch((err) => {
          console.error(err)
        })
      })

      socket.on('disconnect', () => {
        io.to(roomId).emit('system message', `${userName} left ${roomId}`)

        const room = rooms[roomId]

        if (room) {
          delete rooms[roomId][socket.id]

          if (!Object.keys(room).length) {
            delete rooms[roomId]
          }
        }
      })
    })

    const port = process.env.PORT || 8081

    httpServer.listen(port, '0.0.0.0', () => {
      console.log('HTTP server is listening on *:' + port)
    })
  })

