var express = require('express')
var http = require('http')
var socketio = require('socket.io')
var mongojs = require('mongojs')

var ObjectID = mongojs.ObjectID
var db = mongojs(process.env.MONGO_URL || 'mongodb://localhost:27017/local')
var app = express()
var server = http.Server(app)
var websocket = socketio(server)
server.listen(3000, () => console.log('listening on *:3000'))

// Mapping objects to easily map sockets and users.
var users = {}

// This represents a unique chatroom.
// For this example purpose, there is only one chatroom;
var chatId = 1

websocket.on('connection', (socket) => {
  socket.on('userJoined', (userId) => onUserJoined(userId, socket))
  socket.on('message', (message) => onMessageReceived(message, socket))
})

// Event listeners.
// When a user joins the chatroom.
function onUserJoined (userId, socket) {
  try {
    // The userId is null for new users.
    if (!userId) {
      var user = db.collection('users').insert({}, (err, user) => {
        socket.emit('userJoined', user._id)
        users[socket.id] = user._id
      })
      console.log('User registered!')
    } else {
      users[socket.id] = userId
      console.log('User logged in!')
    }
  } catch (err) {
    console.err(err)
  }
}

// When a user sends a message in the chatroom.
function onMessageReceived (message, senderSocket) {
  console.log('[Message]: ' + message.WPM)
}
