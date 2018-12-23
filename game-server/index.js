const io = require('socket.io')(3000) // TODO(aibek): make port configurable
const Room = require('./Room')
const inherits = require('inherits')
const LinkedList = require('linked-list')
const AsyncLock = require('async-lock')
const models = require('../models/models')
const firebaseAdmin = require('firebase-admin')
const socketioAuth = require('socketio-auth')
const _ = require('lodash')

const serviceAccount = require('./firebase/typemasters-cc028-firebase-adminsdk-ft5e2-a8cacca758.json')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
})

socketioAuth(io, {
  // TODO(aibek): consider anonymous players
  authenticate: function (socket, data, callback) {
    console.log(data)
    const firebaseIdToken = data.token
    return firebaseAdmin.auth().verifyIdToken(firebaseIdToken)
      .then(function (decodedToken) {
        const uid = decodedToken.uid
        socket._serverData = {
          uid
        }
        console.log(uid)
        // inform the callback of auth success/failure
        return callback(null, true)
      }).catch(function (error) {
        console.log(error)
        return callback(error)
      })
  }
})

const STARTING_GAME_TIMEOUT = 5000
const MAXIMUM_PLAYERS_IN_ROOM = 5
const SERVER_SEND_DATA_INTERVAL = 500

// Defining list item wrapper for room object
inherits(RoomItem, LinkedList.Item)
function RoomItem (room) {
  this.room = room
  LinkedList.Item.apply(this, arguments)
}

// Linked list for games which are to be started
const startingGames = new LinkedList()
const startingGamesLock = new AsyncLock()
let startingGamesCnt = 0
let startedGames = {}
const updatingGameDataLock = new AsyncLock()

async function createNewRoom (socket) {
  const room = new Room()
  const text = await models.Text.findOne({
    order: [
      models.sequelize.fn('RAND')
    ]
  })
  room.setText(text.text)
  room.setDuration(text.duration * 1000) // converting to milliseconds
  room.setTextId(text.id)
  room.addPlayer(socket)
  // The socket will join a room with uuid
  socket.join(room.uuid)
  const item = new RoomItem(room)
  startingGames.append(item)
  startingGamesCnt++
  setTimeout(function () {
    startGame(item, room)
  }, STARTING_GAME_TIMEOUT)
}

function startGame (item, room) {
  console.log(room.countPlayers())
  startingGamesLock.acquire(item.room.uuid, function () {
    const room = item.room
    console.log('Game ' + room.uuid + ' has started')
    const data = {
      msg: 'game in room: ' + room.uuid + ' has started',
      text: room.text,
      duration: room.duration,
      room: room.uuid,
      players: room.getFilteredPlayersData()
      // TODO(aibek): add more data
    }
    io.to(room.uuid).emit('gamestarted', data)
    room.started = true
    startedGames[room.uuid] = room
    startingGamesCnt--
    item.detach()
    room.startTime = Date.now()
    console.log('Game start time ' + room.startTime)
    room.intervalId = setInterval(function () {
      playGame(room)
    }, SERVER_SEND_DATA_INTERVAL)
  }).catch(function (err) {
    // TODO(aibek): make a better error message and handle better
    console.log(err.message)
  })
}

function removeRoomParticipants (room) {
  io.of('/').in(room.uuid).clients(function (error, clients) {
    if (error) {
      throw error
    }
    if (clients.length > 0) {
      console.log('clients in the room:')
      console.log(clients)
      clients.forEach(function (socketId) {
        io.sockets.sockets[socketId].leave(room.uuid)
      })
    }
  })
}

function playGame (room) {
  if (room.startTime + room.duration < Date.now()) {
    clearInterval(room.intervalId)
    // TODO(aibek): delete game and room data
    console.log('game ended for room: ' + room.uuid)
    sendGameData(room, 'gameended')
    delete startedGames[room.uuid]
    // TODO(aibek): save game data into database
    models.sequelize.transaction((t) => {
      return models.Race.create({ textId: room.textId }, { transaction: t }).then((race) => {
        const playerPromises = []
        _.forEach(room.players, (player, key) => {
          // TODO(aibek): consider anonymous users
          playerPromises.push(models.RacePlayer.create({
            // userUid: room.players[i].id, // TODO(aibek): temporarily save socket_id to DB
            userUid: player.socket._serverData.uid, // TODO(aibek): above! and also now only save all the races to one user
            raceId: race.id,
            cpm: player.cpm,
            points: 0, // TODO(aibek): compute points for current game
            accuracy: 0 // TODO(aibek): compute accuracy
          }, { transaction: t }))
        })
        return Promise.all(playerPromises)
      })
    })
    console.log('game ended')
    new Promise(function (resolve, reject) {
      resolve(removeRoomParticipants(room))
    }).then(() => {
      room.closeSockets()
    })
  } else {
    sendGameData(room, 'gamedata')
  }
}

function sendGameData (room, call) {
  updatingGameDataLock.acquire(room.uuid, function () {
    let timeLeft = (room.startTime + room.duration) - Date.now()
    if (timeLeft < 0) {
      timeLeft = 0
    }
    const data = {
      room: room.uuid,
      players: room.getFilteredPlayersData(),
      timeLeft
      // TODO(aibek): add more data
    }
    io.to(room.uuid).emit(call, data)
  }).catch(function (err) {
    console.log(err.message)
  })
}

function countCpm (room, chars) {
  const interval = Date.now() - room.startTime
  const intervalMinutes = interval / (1000 * 60) // TODO(aibek): check formula
  return chars / intervalMinutes
}

io.on('connection', function (socket) {
  console.log('connected')
  socket.on('racedata', function (data) {
    // TODO(aibek): check for authentication, maybe introduce middleware, maybe use socket.io
    console.log(data)
    const room = startedGames[data.room.uuid]
    if (room && room.startTime + room.duration >= Date.now()) {
      updatingGameDataLock.acquire(room.uuid, function () {
        const cpm = countCpm(room, data.chars)
        console.log(data.chars, cpm)
        room.updatePlayerCpm(socket.id, cpm)
      }, { skipQueue: true }).catch(function (err) {
        console.log(err.message)
      })
    }
  })

  socket.on('newgame', function () {
    console.log('Asking for a new game')
    if (startingGamesCnt === 0) {
      createNewRoom(socket)
    } else {
      console.log('The queue is not empty!')
      let current = startingGames.head
      let addedToGame = false
      while (current !== null && addedToGame === false) {
        if (current.room.countPlayers() < MAXIMUM_PLAYERS_IN_ROOM) {
          // TODO(aibek): isn't here any race condition?
          const room = current.room
          startingGamesLock.acquire(room.uuid, function () {
            if (room.started === false && current.room.countPlayers() < MAXIMUM_PLAYERS_IN_ROOM) {
              current.room.addPlayer(socket)
              socket.join(room.uuid)
              addedToGame = true
            }
          }).catch(function (err) {
            // TODO(aibek): make a better error message and handle better
            console.log(err.message)
          })
        }
        current = current.next
      }
      if (addedToGame === false) {
        createNewRoom(socket)
      }
    }
  })

  socket.on('disconnect', function () {
    io.emit('user disconnected')
  })
})
