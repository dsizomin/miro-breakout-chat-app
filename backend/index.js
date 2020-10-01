const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http').Server(app)
const socketConfig = require('./config')
const io = require('socket.io')(http, socketConfig)

const port = process.env.PORT || 8081

const passport = require('./passport')

const rooms = {}
const roomsCreatedAt = new WeakMap()
const names = new WeakMap()

app.use(cors())

app.get('/rooms/:roomId', (req, res) => {
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
})

app.get('/rooms', (req, res) => {
	res.json(Object.keys(rooms))
})

io.use(passport.initialize)
io.use(passport.authenticate)

io.on('connection', (socket) => {
	const userContext = socket.request.session.passport.user

	const userName = userContext.user.name
	const userId = userContext.user.id

  let roomId

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

  socket.on('chat message', (msg) => {
  	io.to(roomId).emit('chat message', msg, userId, userName)
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

http.listen(port, '0.0.0.0', () => {
  console.log('listening on *:' + port)
})
