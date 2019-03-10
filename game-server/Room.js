const uuidv4 = require('uuid/v4')
const _ = require('lodash')

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

  containsPlayer (uid) {
    if (_.find(this.players, ['uid', uid]) !== undefined) {
      return true
    }
    return false
  }

  removePlayer (uid) {
    const socketId = _.findKey(this.players, ['uid', uid])
    delete this.players[socketId]
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
      player.socket.disconnect(true)
    })
  }

  allDisconnected () {
    let result = true
    _.forEach(this.players, (player) => {
      if (player.socket.connected) {
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
