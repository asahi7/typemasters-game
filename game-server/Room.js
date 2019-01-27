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
    this.totalChars = 0
    this.startTime = 0
    // TODO(aibek): add players' ids, aliases, common data
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
          chars: 0
          // TODO(aibek): count player's position not by cpm but by written chars, if equal compare by finishedTime
          // TODO(aibek): add more data about players
        }
    })
  }

  setText (text) {
    this.text = text
  }

  setLanguage (language) {
    this.language = language
  }

  setDuration (duration) {
    this.duration = duration
  }

  setTextId (id) {
    this.textId = id
  }

  setPlayerDisconnected (socketId) {
    this.players[socketId].disconnected = true
  }

  updatePlayerCpm (socketId, cpm) {
    this.players[socketId].cpm = cpm
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
}

module.exports = Room
