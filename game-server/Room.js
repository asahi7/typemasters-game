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

  addPlayer (socket) {
    const uid = _.get(socket, '_serverData.uid')
    Object.assign(this.players, {
      [socket.id]:
        {
          socket: socket,
          cpm: 0,
          uid
          // TODO(aibek): add more data about players
        }
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

  updatePlayerCpm (socketId, cpm) {
    this.players[socketId].cpm = cpm
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
