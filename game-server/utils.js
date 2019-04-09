const uuidv4 = require('uuid/v4')
const _ = require('lodash')

exports.generateUUID = () => {
  return uuidv4()
}

exports.computeTotalChars = (text) => {
  return text.replace(/\s/g, '').length
}

exports.serializePlayer = (player) => {
  return JSON.stringify(player)
}

exports.deserializePlayer = (player) => {
  return JSON.parse(player)
}

// TODO(aibek): implement this, in order to avoid subtle bugs
exports.deserializeRoom = () => {

}

exports.makePlayer = (socket, playerId) => {
  const uid = _.get(socket, '_serverData.uid')
  return {
    socketId: socket.id,
    uid,
    cpm: 0,
    isWinner: false,
    position: 0,
    accuracy: 100,
    chars: 0,
    playerId
  }
}

// TODO(aibek): add missing fields to player
exports.getPlayers = (room) => {
  let players = []
  _.forEach(room, (value, key) => {
    if (key.startsWith('player_')) {
      players.push(this.deserializePlayer(value))
    }
  })
  return players
}

exports.allDisconnected = (room, io) => {
  return new Promise((resolve, reject) => {
    io.in(room.key).clients((err, clients) => {
      if (err) {
        reject(err)
      }
      console.log('Connected clients')
      console.log(clients)
      if (!clients.length || clients.length === 0) {
        return resolve(true)
      }
      return resolve(false)
    })
  })
}

exports.deleteRoom = (roomKey, redisClient) => {
  redisClient.del(roomKey)
}

/*
* Method to update players' relative positions to each other
* Note: should update the actual Room.players object
*
*  1. Sorts by chars desc,
*  2. If equal, sorts by finishedTime asc
*  Note: if the winner, then sorts by finishedTime
**/
exports.getUpdatedPlayerPositions = (room) => {
  let players = this.getPlayers(room)
  players.sort(function (a, b) {
    if (a.chars < b.chars) {
      return 1
    } else if (a.chars > b.chars) {
      return -1
    } else if (a.isWinner && b.isWinner) {
      return a.finishedTime < b.finishedTime ? -1 : a.finishedTime > b.finishedTime ? 1 : 0
    }
    return 0
  })
  _.forEach(players, (player, index) => {
    player.position = index + 1
  })
  return players
}

exports.getPlayer = (room, playerId) => {
  const player = room[playerId]
  if (!player) {
    return null
  }
  return this.deserializePlayer(player)
}

exports.updatePlayers = (room, players, redisClient) => {
  _.forEach(players, player => {
    redisClient.hset(room.key, player.playerId, this.serializePlayer(player))
  })
}

exports.updatePlayer = (room, player, redisClient) => {
  redisClient.hset(room.key, player.playerId, this.serializePlayer(player))
}

exports.countCpm = (room, chars) => {
  const interval = Date.now() - +room.startTime
  const intervalMinutes = interval / (1000 * 60)
  return chars / intervalMinutes
}

exports.removePlayer = (room, socketId, io, redisClient) => {
  if (io.sockets.connected[socketId]) { io.sockets.connected[socketId].disconnect() }
  const players = this.getPlayers(room)
  const player = _.find(players, ['socketId', socketId])
  if (!player) {
    return
  }
  redisClient.hdel(room.key, player.playerId)
}

exports.removePlayerWithRoomKey = (roomKey, socketId, io, redisClient) => {
  if (io.sockets.connected[socketId]) { io.sockets.connected[socketId].disconnect() }
  redisClient.hgetall(roomKey, (err, room) => {
    if (err) {
      throw err
    }
    if (!room) {
      return
    }
    const players = this.getPlayers(room)
    const player = _.find(players, ['socketId', socketId])
    if (!player) {
      return
    }
    redisClient.hdel(room.key, player.playerId)
  })
}

exports.getPlayerBy = (room, params) => {
  const players = this.getPlayers(room)
  let player = null
  if (params.uid) {
    player = _.find(players, ['uid', params.uid])
  } else if (params.socketId) {
    player = _.find(players, ['socketId', params.socketId])
  }
  if (!player) {
    return null
  }
  return player
}

exports.setPlayerDisconnected = (room, socketId, redisClient) => {
  const player = this.getPlayerBy(room, { socketId })
  if (player) {
    player.disconnected = true
    redisClient.hset(room.key, player.playerId, this.serializePlayer(player))
  }
}

exports.countPlayers = (room) => {
  const players = this.getPlayers(room)
  if (!players) {
    return 0
  }
  return players.length
}

exports.removeRoomParticipants = (roomKey, io) => {
  console.log('Players are being disconnected from room: ' + roomKey)
  io.of('/').in(roomKey).clients(function (error, clients) {
    if (error) {
      throw error
    }
    if (clients.length > 0) {
      console.log('Clients in the room to be disconnected: ')
      console.log(clients)
      clients.forEach(function (socketId) {
        if (io.sockets.sockets[socketId]) {
          io.sockets.sockets[socketId].leave(roomKey)
        }
      })
    }
  })
}
