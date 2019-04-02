const uuidv4 = require('uuid/v4')
const _ = require('lodash')

// TODO(aibek): add good comments to methods, and write unit tests
class Room {
  constructor () {
    this.uuid = uuidv4()
    this.started = false
    this.players = {}
  }

  getFilteredPlayersData () {
    return _.map(this.players, (value, key) => {
      return _.omit({
        ...value,
        id: key
      }, ['socket'])
    })
  }

  computeChars () {
    this.totalChars = this.text.replace(/\s/g, '').length
  }

  addPlayer (socket) {
    const uid = _.get(socket, '_serverData.uid')
    Object.assign(this.players, {
      [socket.id]:
        {
          socket: socket,
          cpm: 0,
          uid,
          isWinner: false,
          position: 0,
          accuracy: 100,
          chars: 0
        }
    })
  }

  getPlayer (uid) {
    const player = _.find(this.players, ['uid', uid])
    return player
  }

  createBots (count) {
    console.log('Number of bots to be created: ' + count)
    for (let i = 1; i <= count; i++) {
      Object.assign(this.players, {
        // negative socket.id is for bots
        [-i]:
          {
            cpm: 0,
            isWinner: false,
            position: 0,
            accuracy: 100,
            chars: 0,
            // followings  fields are only for bots
            socket: null,
            isBot: true,
            id: -i
          }
      })
    }
  }

  containsPlayer (uid) {
    if (_.find(this.players, ['uid', uid]) !== undefined) {
      return true
    }
    return false
  }

  removePlayer (socketId, io) {
    delete this.players[socketId]
    if (io.sockets.connected[socketId]) { io.sockets.connected[socketId].disconnect() }
  }

  setPlayerDisconnected (socketId) {
    if (this.players[socketId]) { this.players[socketId].disconnected = true }
  }

  updatePlayerCpm (socketId, cpm) {
    this.players[socketId].cpm = cpm
  }

  updateAccuracy (socketId, accuracy) {
    this.players[socketId].accuracy = accuracy
  }

  isWinner (socketId) {
    return this.players[socketId].isWinner
  }

  setWinner (socketId) {
    this.players[socketId].isWinner = true
    this.players[socketId].finishedTime = Date.now()
  }

  setCharsCount (socketId, chars) {
    this.players[socketId].chars = chars
  }

  countPlayers () {
    return _.size(this.players)
  }

  closeSockets () {
    _.forEach(this.players, (player) => {
      if (player.socket) { player.socket.disconnect(true) }
    })
  }

  allDisconnected () {
    let result = true
    _.forEach(this.players, (player) => {
      if (player.socket && player.socket.connected) {
        result = false
      }
    })
    return result
  }

  countCpm (chars) {
    const interval = Date.now() - this.startTime
    const intervalMinutes = interval / (1000 * 60)
    return chars / intervalMinutes
  }

  updateBots () {
    _.forEach(this.players, (player) => {
      const chars = player.chars + _.random(0, 2)
      if (player.isBot && !player.isWinner) {
        const accuracy = _.random(60, 100)
        this.setCharsCount(player.id, chars)
        const cpm = this.countCpm(chars)
        this.updatePlayerCpm(player.id, cpm)
        this.updateAccuracy(player.id, accuracy)
      }
      // Bot has finished race in time
      if (player.isBot && chars >= this.totalChars && !this.isWinner(player.id)) {
        this.setWinner(player.id)
      }
    })
  }

  /*
  * Method to update players' relative positions to each other
  * Note: should update the actual Room.players object
  *
  *  1. Sorts by chars desc,
  *  2. If equal, sorts by finishedTime asc
  *  Note: if the winner, then sorts by finishedTime
  **/
  updatePositions () {
    let arr = this.getFilteredPlayersData()
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
      this.players[arr[i].id].position = i + 1
    }
  }

  removeRoomParticipants (io) {
    console.log('Players are being removed from room: ' + this.uuid)
    io.of('/').in(this.uuid).clients(function (error, clients) {
      if (error) {
        throw error
      }
      if (clients.length > 0) {
        console.log('Clients in the room to be removed: ')
        console.log(clients)
        clients.forEach(function (socketId) {
          if (io.sockets.sockets[socketId]) {
            io.sockets.sockets[socketId].leave(this.uuid)
          }
        })
      }
    })
  }
}

module.exports = Room
