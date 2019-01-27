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
        console.log(decodedToken)
        // With this, all players are "safe" and considered authenticated on the server
        socket._serverData = {
          uid: decodedToken.uid,
          email: decodedToken.email
        }
        // TODO(aibek): is it a good way to do it?
        models.User.findOrCreate({
          where: {
            email: decodedToken.email
          },
          defaults: {
            uid: decodedToken.uid,
            // TODO(aibek): change later to fullName
            fullName: decodedToken.uid,
            email: decodedToken.email
          }
        })
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

async function createNewRoom (socket, data) {
  const room = new Room()
  const text = await models.Text.findOne({
    where: { language: data.language },
    order: [
      models.sequelize.fn('RAND')
    ]
  })
  room.setLanguage(data.language)
  room.setText(text.text)
  room.computeChars()
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
  // TODO(aibek): consider players who do not finish in time and save in DB
  // TODO(aibek): if a player finishes not in time, his finishedTime should still be recorded (Date.now())
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
          if (!player.disconnected) {
            playerPromises.push(models.RacePlayer.create({
              // userUid: room.players[i].id, // TODO(aibek): temporarily save socket_id to DB
              userUid: player.socket._serverData.uid, // TODO(aibek): above! and also now only save all the races to one user
              raceId: race.id,
              cpm: player.cpm,
              isWinner: player.isWinner,
              position: player.position,
              points: 0, // TODO(aibek): compute points for current game
              accuracy: 0 // TODO(aibek): compute accuracy
            }, { transaction: t }))
          }
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

/*
* Method to update players' relative positions to each other
* Note: should update the actual Room.players object
**/
function updatePositions (room) {
  /*
    1. sort by chars desc,
    2. if equal, sort by finishedTime asc
    Note: if winner, then sort by finishedTime
  */
  let arr = room.getFilteredPlayersData()
  arr.sort(function (a, b) {
    if (a.chars < b.chars) {
      return 1
    } else if (a.chars > b.chars) {
      return -1
    } else if (a.isWinner && b.isWinner) {
      return a.finishedTime < b.finishedTime ? -1 : a.finishedTime > b.finishedTime ? 1 : 0
    }
    return 0
  })
  for (let i = 0; i < arr.length; i++) {
    room.players[arr[i].id].position = i + 1
  }
}

/*
Format of sent data:

data: {
  id, // socketId
  uid, // firebase-authenticated user uid
  cpm,
  isWinner,
  position, // relative position
  chars // total written chars count
}

Note: isWinner can still be true, even if a player is not the absolute winner, it means they finished
the race.
*/
function sendGameData (room, call) {
  updatingGameDataLock.acquire(room.uuid, function () {
    let timeLeft = (room.startTime + room.duration) - Date.now()
    if (timeLeft < 0) {
      timeLeft = 0
    }
    updatePositions(room)
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
    console.log(data)
    const room = startedGames[data.room.uuid]
    if (room && room.startTime + room.duration >= Date.now()) {
      updatingGameDataLock.acquire(room.uuid, function () {
        if (!room.isWinner(socket.id)) {
          room.setCharsCount(socket.id, data.chars)
          const cpm = countCpm(room, data.chars)
          console.log(data.chars, cpm)
          room.updatePlayerCpm(socket.id, cpm)
        }
        // Player has finished race in time
        if (data.chars === room.totalChars && !room.isWinner(socket.id)) {
          room.setWinner(socket.id)
        }
      }, { skipQueue: true }).catch(function (err) {
        console.log(err.message)
      })
    }
  })

  socket.on('newgame', function (data) {
    console.log('Asking for a new game')
    if (startingGamesCnt === 0) {
      createNewRoom(socket, data)
    } else {
      console.log('The queue is not empty!')
      let current = startingGames.head
      let addedToGame = false
      while (current !== null && addedToGame === false) {
        if (current.room.countPlayers() < MAXIMUM_PLAYERS_IN_ROOM) {
          // TODO(aibek): isn't here any race condition?
          const room = current.room
          if (room.language !== data.language) {
            current = current.next
            continue
          }
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
        createNewRoom(socket, data)
      }
    }
  })

  socket.on('removePlayer', function (data) {
    console.log(data)
    const room = startedGames[data.room.uuid]
    console.log('the player accidentally disconnected')
    room.setPlayerDisconnected(socket.id)
  })

  socket.on('disconnect', function () {
  })
})
