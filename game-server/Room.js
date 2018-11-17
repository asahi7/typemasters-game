const uuidv4 = require('uuid/v4')
const _ = require('lodash')

class Room {
  constructor () {
    this.uuid = uuidv4()
    this.started = false
    this.intervalId = 0
    this.text = 'Hello world!'
    this.duration = 30000 // 30 sec
    this.textId = 0
    this.startTime = 0
    // TODO(aibek): add players' ids, aliases, common data
    this.players = []
  }

  getFilteredPlayersData () {
    return _.map(this.players, (player) => {
      return _.omit(player, ['socket'])
    })
  }

  addPlayer (socket) {
    this.players.push({
      socket: socket,
      id: socket.id,
      cpm: 0,
      accuracy: 0
      // TODO(aibek): add more data about players
    })
  }

  setText (text) {
    this.text = text
  }

  setDuration (duration) {
    this.duration = duration
  }

  setTextId (id) {
    this.textId = id
  }

  updatePlayers (update) {
    // TODO(aibek): later change players into map for faster access
    _.forEach(this.players, (player) => {
      const updatedPlayer = _.find(update, ['id', player.id])
      player.cpm = updatedPlayer.cpm
      player.accuracy = updatedPlayer.accuracy
    })
  }

  countPlayers () {
    return this.players.length
  }
}

module.exports = Room
