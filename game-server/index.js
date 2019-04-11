// TODO(aibek): add sticky sessions to socket.io
const io = require('socket.io')(process.env.PORT || '3000')
const models = require('../models/models')
const firebaseAdmin = require('firebase-admin')
const socketioAuth = require('socketio-auth')
const _ = require('lodash')
const Sentry = require('@sentry/node')
const redis = require('redis')
const socketIoRedis = require('socket.io-redis')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const utils = require('./utils')

// TODO(aibek): study more https://github.com/animir/node-rate-limiter-flexible/wiki/Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  enable_offline_queue: false
})

const anonymousUsersRateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'anonUsers',
  points: 50,
  duration: 24 * 60 * 60 // 1 day
})

const raceDataIntervalRateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'raceDataIntv',
  points: 50, // 25 players may play from one ip
  duration: 1
})

const gameCreationRateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'gameCreation',
  points: 3,
  duration: 1
})

redisClient.on('error', function (err) {
  Sentry.captureException(err)
  console.log('Error ' + err)
})

io.adapter(socketIoRedis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }))

console.log('Running on ' + (process.env.PORT || '3000'))

const serviceAccount = require('./firebase/typemasters-cc028-firebase-adminsdk-ft5e2-a8cacca758.json')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
})

Sentry.init({ dsn: 'https://85893e4c45124030bb065a1184ceb349@sentry.io/1425755' })

const STARTING_GAME_TIMEOUT = 8000
const MAXIMUM_PLAYERS_IN_ROOM = 7
const SERVER_SEND_DATA_INTERVAL = 500

let gamePlayIntervals = {}

setInterval(() => {
  _.forEach(gamePlayIntervals, (interval) => {
    if (interval.startTime + 12 * 60 * 60 * 1000 <= Date.now()) { clearTimeout(interval.gamePlayInterval) }
  })
}, 24 * 60 * 60 * 1000) // runs each day

// TODO(aibek): check this library https://www.npmjs.com/package/socketio-auth, timeouts and etc
socketioAuth(io, {
  authenticate: function (socket, data, callback) {
    const firebaseIdToken = data.token
    if (firebaseIdToken === -1) {
      return anonymousUsersRateLimiter.consume(socket.conn.remoteAddress).then(() => {
        socket._serverData = {
          // -1 is for anonymous users
          uid: -1
        }
        return callback(null, true)
      }).catch(() => {
        const error = new Error('Anonymous user expired the ability to play more games')
        error.ip = socket.conn.remoteAddress
        Sentry.captureException(error)
        console.log(error)
        return callback(error)
      })
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

function _findGameToBeAdded (cursor, language) {
  return new Promise((resolve, reject) => {
    redisClient.scan(cursor, 'MATCH', `game:*:${language}`, function (err, games) {
      if (err) {
        return reject(err)
      }
      let requests = []
      if (games[1]) {
        requests = games[1].map(game => {
          return new Promise((resolve) => {
            redisClient.hgetall(game, function (err, reply) {
              if (err) {
                throw err
              }
              return resolve({ game, reply })
            })
          })
        })
      }
      return Promise.all(requests).then((responses) => {
        let game = null
        for (let i = 0; i < responses.length; i++) {
          const response = responses[i]
          if (response.reply && response.reply.started === 'false' && +response.reply.scheduled - 1000 >= Date.now() &&
            utils.countPlayers(response.reply) + 1 <= MAXIMUM_PLAYERS_IN_ROOM) {
            game = response.game
            break
          }
        }
        return game
      }).then((game) => {
        if (!game) {
          const cursor = games[0]
          if (cursor === '0') {
            return resolve({ game, cursor })
          }
          return resolve({ game, cursor })
        } else {
          return resolve({ game })
        }
      })
    })
  }).then((obj) => {
    if (obj.game === null && obj.cursor === '0') {
      return null
    } else if (obj.game === null) {
      // TODO(aibek): check recursion
      return _findGameToBeAdded(obj.cursor, language)
    } else if (obj.game) {
      return obj.game
    }
  })
}

function _addToExistingRoom (socket, roomKey) {
  console.log('Adding player ' + socket.id + ' to existing room ' + roomKey)
  const playerId = 'player_' + socket.id
  const player = utils.makePlayer(socket, playerId)
  redisClient.hgetall(roomKey, function (err, room) {
    if (err) {
      throw err
    }
    const prevPlayer = utils.getPlayerBy(room, { uid: socket._serverData.uid })
    if (socket._serverData.uid && socket._serverData.uid !== -1 && prevPlayer !== null) {
      console.log('New player: ' + socket.id + ' deleted the same player from same room with uid: ' + socket._serverData.uid)
      if (prevPlayer && prevPlayer.socketId) {
        utils.removePlayer(room, prevPlayer.socketId, io, redisClient)
      }
    }
    // TODO(aibek): refactor these methods, create redis model methods
    redisClient.hset(roomKey, playerId, utils.serializePlayer(player), function (err, res) {
      if (err) {
        Sentry.captureException(err)
        console.log(err)
        throw err
      }
    })
    socket._serverData.roomKey = roomKey
    socket._serverData.playerId = playerId
    socket.join(roomKey)
  })
}

io.on('connection', function (socket) {
  console.log('Connected ' + socket.id)
  socket.on('newgame', function (data) {
    return gameCreationRateLimiter.consume(socket.conn.remoteAddress).then(async () => {
      console.log('Socket asking for a new game: ' + socket.id)
      _findGameToBeAdded('0', data.language).then(game => {
        socket._serverData.ratedGames = data.ratedGames
        if (!game) {
          _createNewRoom(socket, data)
        } else {
          _addToExistingRoom(socket, game)
        }
      })
    }).catch(() => {
      const error = new Error('User creates too many games')
      error.ip = socket.conn.remoteAddress
      Sentry.captureException(error)
      console.log(error)
      socket.disconnect()
    })
  })

  // TODO(aibek): check if the data is true, you might want to introduce some inner encryption, or data hiding
  // to disallow players change their cpms and same ones, use some token?
  // TODO(aibek): never rely on data sent by user, only access the fields by socket.id (chars, accuracy)
  // In this case if user fakes the key, and players data, then they may falsify other player's data and affect
  // In this case, we must make sure that user can't falsify the data on his side, encryption?
  socket.on('racedata', function (data) {
    console.log('Race data from socket: ' + socket.id)
    if (
      !_validateClient(socket._serverData.roomKey === data.roomKey, data, socket) ||
      !_validateClient(socket._serverData.playerId === data.playerId, data, socket)) {
      return
    }
    if (socket.conn.remoteAddress) {
      raceDataIntervalRateLimiter.consume(socket.conn.remoteAddress).then(() => {
        redisClient.hgetall(data.roomKey, function (err, room) {
          if (err) {
            Sentry.captureException(err)
            console.log(err)
            throw err
          }
          if (!_validateClient(room, data, socket)) {
            return
          }
          let player = utils.getPlayer(room, data.playerId)
          if (+room.startTime + +room.duration >= Date.now()) {
            if (!player.isWinner) {
              const cpm = utils.countCpm(room, data.chars)
              player.chars = data.chars
              player.cpm = cpm
              player.accuracy = data.accuracy
              utils.updatePlayer(room, player, redisClient)
            }
            // Player has finished race in time
            if (data.chars === +room.totalChars && !player.isWinner) {
              player.isWinner = true
              player.finishedTime = Date.now()
              utils.updatePlayer(room, player, redisClient)
            }
          }
        })
      }).catch(() => {
        const error = new Error('User sending too many racedata requests')
        error.uid = socket._serverData.uid
        error.ip = socket.conn.remoteAddress
        error.roomKey = data.roomKey
        Sentry.captureException(error)
        console.log(error)
        utils.removePlayerWithRoomKey(data.roomKey, socket.id, io, redisClient)
      })
    }
  })

  socket.on('removeplayer', function (data) {
    console.log('Player is being removed: ' + socket.id + ' from room: ' + data.roomKey)
    redisClient.hgetall(socket._serverData.roomKey, function (err, room) {
      if (err) {
        Sentry.captureException(err)
        console.log(err)
        throw err
      }
      if (!room) {
        Sentry.captureException(new Error('Room ' + data.roomKey + ' does not exist, from socket ' + socket.id))
        return
      }
      utils.setPlayerDisconnected(room, socket.id, redisClient)
    })
  })

  socket.on('disconnect', function (reason) {
    console.log(socket.id + ' disconnected because: ' + reason)
    if (reason === 'transport error' || reason === 'ping timeout') {
      const roomKey = socket._serverData.roomKey
      redisClient.hgetall(roomKey, function (err, room) {
        if (err) {
          Sentry.captureException(err)
          console.log(err)
          throw err
        }
        if (!room) {
          Sentry.captureException('Room ' + roomKey + ' does not exist, from socket ' + socket.id)
          return
        }
        const player = utils.getPlayerBy(room, { uid: socket._serverData.uid })
        if (player && !player.disconnected) {
          console.log('Player is being removed: ' + socket.id + ' from room: ' + roomKey)
          utils.setPlayerDisconnected(room, socket.id, redisClient)
        }
      })
    }
    console.log('Player disconnected: ' + socket.id)
  })
})

function _validateClient (result, data, socket) {
  if (!result) {
    const err = new Error('Forbidden action ' + data.roomKey)
    Sentry.captureException(err)
    console.log(err)
    utils.removePlayerWithRoomKey(data.roomKey, socket.id, io, redisClient)
    return false
  }
  return true
}

async function _createNewRoom (socket, data) {
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
  const uuid = utils.generateUUID()
  const roomKey = `game:${uuid}:${data.language}`
  const playerId = 'player_' + socket.id
  const player = utils.makePlayer(socket, playerId)
  // TODO(aibek): make a function which would put all values as String, something like type recognizer
  redisClient.hmset(roomKey,
    {
      text: text.text,
      duration: (text.duration * 1000).toString(),
      textId: String(text.id),
      language: data.language,
      uuid,
      totalChars: String(utils.computeTotalChars(text.text)),
      started: String(false),
      [playerId]: utils.serializePlayer(player),
      scheduled: String(Date.now() + STARTING_GAME_TIMEOUT),
      key: roomKey
    },
    function (err, res) {
      if (err) {
        Sentry.captureException(err)
        console.log(err)
        throw err
      }
      redisClient.expire(roomKey, String(text.duration + (STARTING_GAME_TIMEOUT / 1000) + 10))
      console.log('Socket: ' + socket.id + ' created room: ' + roomKey)
      socket._serverData.roomKey = roomKey
      socket._serverData.playerId = playerId
      socket.join(roomKey)
      setTimeout(function () {
        startGame(roomKey)
      }, STARTING_GAME_TIMEOUT)
    })
}

function startGame (roomKey) {
  console.log('Game: ' + roomKey + ' has started')
  redisClient.hgetall(roomKey, async function (err, room) {
    if (err) {
      Sentry.captureException(err)
      console.log(err)
      throw err
    }
    if (!room) {
      Sentry.captureException(new Error('Game was created but not found in Redis: ' + roomKey))
      return
    }
    const isAllDisconnected = await utils.allDisconnected(room, io)
    if (isAllDisconnected) {
      console.log('Game will not start in room: ' + roomKey + ', all users disconnected')
      utils.deleteRoom(roomKey, redisClient)
      return
    }
    const players = utils.getPlayers(room)
    console.log(' No of players in room ' + roomKey + ': ' + players.length)
    if (players.length <= 2) {
      await utils.createBots(_.random(0, MAXIMUM_PLAYERS_IN_ROOM - 2), roomKey, redisClient, players)
    }
    redisClient.hmset(roomKey, {
      started: String(true),
      startTime: String(Date.now())
    }, function (err, res) {
      if (err) {
        Sentry.captureException(err)
        console.log(err)
        throw err
      }
      const data = {
        msg: 'Game in room: ' + roomKey + ' has started',
        text: room.text,
        roomKey,
        players
      }
      io.to(roomKey).emit('gamestarted', data)
      const gamePlayInterval = setInterval(function () {
        playGame(roomKey)
      }, SERVER_SEND_DATA_INTERVAL)
      gamePlayIntervals[roomKey] = {
        gamePlayInterval,
        startTime: Date.now()
      }
    })
  })
}

function playGame (roomKey) {
  redisClient.hgetall(roomKey, async function (err, room) {
    if (err) {
      throw err
    }
    const isAllDisconnected = await utils.allDisconnected(room, io)
    const players = utils.getUpdatedPlayerPositions(room)
    if (+room.startTime + +room.duration < Date.now() || isAllDisconnected) {
      clearInterval(gamePlayIntervals[roomKey].gamePlayInterval)
      delete gamePlayIntervals[roomKey]
      utils.deleteRoom(roomKey, redisClient)
      sendGameData(room, 'gameended', players)
      // Means that the text was not present in DB, then do not save the game data
      if (room.textId !== -1) {
        models.sequelize.transaction((t) => {
          return models.Race.create({ textId: room.textId }, { transaction: t }).then((race) => {
            const playerPromises = []
            _.forEach(players, (player) => {
              if (!utils.isBot(player) && (!player.disconnected || player.isWinner) && player.uid !== -1 && player.ratedGames) {
                playerPromises.push(models.RacePlayer.create({
                  userUid: player.uid,
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
      utils.removeRoomParticipants(roomKey, io)
    } else {
      sendGameData(room, 'gamedata', players)
    }
  })
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
function sendGameData (room, call, players) {
  console.log('Sending the game data in room: ' + room.key + ' with call ' + call)
  let timeLeft = (+room.startTime + +room.duration) - Date.now()
  if (timeLeft < 0) {
    timeLeft = 0
  }
  utils.updateBots(room, players)
  if (call !== 'gameended') {
    utils.updatePlayers(room, players, redisClient)
  }
  const data = {
    roomKey: room.key,
    players,
    timeLeft
  }
  io.to(room.key).emit(call, data)
}
