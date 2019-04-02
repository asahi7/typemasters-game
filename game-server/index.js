const io = require('socket.io')(process.env.PORT || '3000')
const Room = require('./Room')
const inherits = require('inherits')
const LinkedList = require('linked-list')
const AsyncLock = require('async-lock')
const models = require('../models/models')
const firebaseAdmin = require('firebase-admin')
const socketioAuth = require('socketio-auth')
const _ = require('lodash')
const Sentry = require('@sentry/node')

console.log('Running on ' + (process.env.PORT || '3000'))

const serviceAccount = require('./firebase/typemasters-cc028-firebase-adminsdk-ft5e2-a8cacca758.json')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
})

Sentry.init({ dsn: 'https://85893e4c45124030bb065a1184ceb349@sentry.io/1425755' })

// Defining list item wrapper for room object
inherits(RoomItem, LinkedList.Item)
function RoomItem (room) {
  this.room = room
  LinkedList.Item.apply(this)
}

const STARTING_GAME_TIMEOUT = 7000
const MAXIMUM_PLAYERS_IN_ROOM = 7
const SERVER_SEND_DATA_INTERVAL = 500
// Linked list for games which are to be started
const startingGames = new LinkedList()
const startingGamesLock = new AsyncLock()
let startingGamesCnt = 0
let startedGames = {}
const updatingGameDataLock = new AsyncLock()

socketioAuth(io, {
  authenticate: function (socket, data, callback) {
    const firebaseIdToken = data.token
    // TODO(aibek): potential security bottleneck for anonymous user, check IP address
    // TODO(aibek): let anonymous users play only for some period of time per day, otherwise send them the message to register
    if (firebaseIdToken === -1) {
      socket._serverData = {
        // -1 is for anonymous users
        uid: -1
      }
      return callback(null, true)
    }
    return firebaseAdmin.auth().verifyIdToken(firebaseIdToken)
      .then(async (decodedToken) => {
        socket._serverData = {
          uid: decodedToken.uid,
          email: decodedToken.email
        }
        // Inform the callback of auth success/failure
        return callback(null, true)
      }).catch(function (err) {
        Sentry.captureException(err)
        console.log(err)
        return callback(err)
      })
  }
})

io.on('connection', function (socket) {
  console.log('Connected ' + socket.id)
  // TODO(aibek): disallow same ip address from creation of too many rooms
  socket.on('newgame', function (data) {
    console.log('Socket asking for a new game: ' + socket.id)
    if (startingGamesCnt === 0) {
      createNewRoom(socket, data)
    } else {
      console.log('The waiting queue is not empty!')
      let current = startingGames.head
      let addedToGame = false
      while (current !== null && addedToGame === false) {
        if (current.room.countPlayers() < MAXIMUM_PLAYERS_IN_ROOM) {
          const room = current.room
          if (room.language !== data.language) {
            current = current.next
            continue
          }
          startingGamesLock.acquire(room.uuid, function () {
            if (socket._serverData.uid && socket._serverData.uid !== -1 && room.containsPlayer(socket._serverData.uid)) {
              console.log('New player: + ' + socket.id + ' deleted the same player from same room with uid: ' + socket._serverData.uid)
              room.removePlayer(socket._serverData.uid, io)
            }
            if (room.started === false && room.countPlayers() < MAXIMUM_PLAYERS_IN_ROOM) {
              room.addPlayer(socket)
              socket.join(room.uuid)
              addedToGame = true
            }
          }).catch(function (err) {
            Sentry.captureException(err)
            console.log(err)
            throw err
          })
        }
        current = current.next
      }
      if (addedToGame === false) {
        createNewRoom(socket, data)
      }
    }
  })

  // TODO(aibek): check if the data is true, you might want to introduce some inner encryption, or data hiding
  // to disallow players change their cpms and same ones, use some token?
  // TODO(aibek): if authenticated or not user sends data too often, then this is a potential security issue
  // should check for interval of 500ms between each message, or disconnect, also report to Sentry the uid
  socket.on('racedata', function (data) {
    console.log('Race data from socket: ' + socket.id)
    const room = startedGames[data.room.uuid]
    if (room && room.startTime + room.duration >= Date.now()) {
      updatingGameDataLock.acquire(room.uuid, function () {
        if (!room.isWinner(socket.id)) {
          room.setCharsCount(socket.id, data.chars)
          const cpm = room.countCpm(data.chars)
          room.updatePlayerCpm(socket.id, cpm)
          room.updateAccuracy(socket.id, data.accuracy)
        }
        // Player has finished race in time
        if (data.chars === room.totalChars && !room.isWinner(socket.id)) {
          room.setWinner(socket.id)
        }
      }, { skipQueue: true }).catch(function (err) {
        Sentry.captureException(err)
        console.log(err)
        throw err
      })
    }
  })

  socket.on('removeplayer', function (data) {
    console.log('Player is being removed: ' + socket.id + ' from room:' + data.room.uuid)
    const room = startedGames[data.room.uuid]
    if (room) {
      room.setPlayerDisconnected(socket.id)
    }
  })

  socket.on('disconnect', function (reason) {
    console.log(socket.id + ' disconnected because: ' + reason)
    if (reason === 'transport error' || reason === 'ping timeout') {
      const room = _.find(startedGames, (room) => {
        return room.containsPlayer(socket._serverData.uid)
      })
      if (room) {
        console.log('Player is being removed: ' + socket.id + ' from room:' + room.uuid)
        room.setPlayerDisconnected(socket.id)
      }
    }
    console.log('Player disconnected: ' + socket.id)
  })
})

async function createNewRoom (socket, data) {
  const room = new Room()
  console.log('Socket: ' + socket.id + ' created room: ' + room.uuid)
  let text = await models.Text.findOne({
    where: { language: data.language },
    order: [
      models.sequelize.fn('RAND')
    ]
  })
  if (!text) {
    text = {
      text: ':( We are sorry! No text was found. Please, contact our developers team.',
      duration: 30,
      id: -1
    }
    Sentry.captureException('Text with language ' + data.language + ' was asked and was not found')
  }
  room.language = data.language
  room.text = text.text
  room.computeChars()
  room.duration = text.duration * 1000 // converting to milliseconds
  room.textId = text.id
  room.addPlayer(socket)
  socket.join(room.uuid)
  const item = new RoomItem(room)
  startingGames.append(item)
  startingGamesCnt++
  setTimeout(function () {
    startGame(item)
  }, STARTING_GAME_TIMEOUT)
}

function startGame (item) {
  startingGamesLock.acquire(item.room.uuid, function () {
    console.log('Game: ' + item.room.uuid + ' has started')
    console.log(' No of players in room: ' + item.room.countPlayers())
    const room = item.room
    startingGamesCnt--
    item.detach()
    if (room.allDisconnected()) {
      console.log('Game will not start in room: ' + room.uuid + ', all users disconnected')
      // TODO(aibek): following may be unnecessary
      room.closeSockets()
      return
    }
    if (room.countPlayers() <= 2) {
      room.createBots(_.random(0, MAXIMUM_PLAYERS_IN_ROOM - 2))
    }
    room.started = true
    startedGames[room.uuid] = room
    room.startTime = Date.now()
    const data = {
      msg: 'Game in room: ' + room.uuid + ' has started',
      text: room.text,
      duration: room.duration,
      room: room.uuid,
      players: room.getFilteredPlayersData()
    }
    io.to(room.uuid).emit('gamestarted', data)
    room.intervalId = setInterval(function () {
      playGame(room)
    }, SERVER_SEND_DATA_INTERVAL)
  }).catch(function (err) {
    Sentry.captureException(err)
    console.log(err)
    throw err
  })
}

// TODO(aibek): make game finish earlier if all players are disconnected or are winners
function playGame (room) {
  if (room.startTime + room.duration < Date.now() || room.allDisconnected()) {
    clearInterval(room.intervalId)
    console.log('Game ended for room: ' + room.uuid)
    sendGameData(room, 'gameended')
    delete startedGames[room.uuid]
    // Means that the text was not present in DB, then do not save the game data
    if (room.textId !== -1) {
      models.sequelize.transaction((t) => {
        return models.Race.create({ textId: room.textId }, { transaction: t }).then((race) => {
          const playerPromises = []
          _.forEach(room.players, (player, key) => {
            if (!player.isBot && (!player.disconnected || player.isWinner) && player.socket._serverData.uid !== -1) {
              playerPromises.push(models.RacePlayer.create({
                userUid: player.socket._serverData.uid,
                raceId: race.id,
                cpm: player.cpm,
                isWinner: player.isWinner,
                position: player.position,
                points: 0, // TODO(aibek): compute points for game
                accuracy: player.accuracy
              }, { transaction: t }))
            }
          })
          return Promise.all(playerPromises)
        })
      })
    }
    room.removeRoomParticipants(io)
    room.closeSockets()
  } else {
    sendGameData(room, 'gamedata')
  }
}

/**
 * Method to send player game data towards client.
 *
 * @param room
 * @param call - can signify the end of a game or its progress
 *
 * Note: isWinner can still be true, even if a player is not the absolute winner, it means they finished
 * the race.
 */
function sendGameData (room, call) {
  console.log('Sending the game data in room: ' + room.uuid + ' with call ' + call)
  updatingGameDataLock.acquire(room.uuid, function () {
    let timeLeft = (room.startTime + room.duration) - Date.now()
    if (timeLeft < 0) {
      timeLeft = 0
    }
    room.updateBots()
    room.updatePositions()
    const data = {
      room: room.uuid,
      players: room.getFilteredPlayersData(),
      timeLeft
    }
    io.to(room.uuid).emit(call, data)
  }).catch(function (err) {
    Sentry.captureException(err)
    console.log(err)
    throw err
  })
}
