import React from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import firebase from 'firebase'
import io from 'socket.io-client'

let socket

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: 'Loading..',
      input: '',
      chars: 0,
      gameEndMessage: '',
      numOfPlayers: 1,
      gamePlaying: false
    }
    this.setSocketBehavior = this.setSocketBehavior.bind(this)
    this.handleUserInput = this.handleUserInput.bind(this)
    this.sendRaceData = this.sendRaceData.bind(this)
    this.playButtonPressed = this.playButtonPressed.bind(this)
  }

  setSocketBehavior (idToken) {
    socket = io.connect('http://10.64.128.209:3000', { reconnect: true })
    socket.on('connect', () => {
      socket.emit('authentication', { token: idToken })
      socket.on('authenticated', () => {
        console.log('Asking for a new game..')
        socket.emit('newgame')
        this.setState({
          gamePlaying: true
        })
        socket.on('gamestarted', (data) => {
          console.log(data.msg)
          this.setState({
            text: data.text,
            uuid: data.room,
            numOfPlayers: data.players.length
          }, () => {
            const intervalId = setInterval(this.sendRaceData, 500)
            this.setState({
              intervalId
            })
          })
          console.log(data)
        })

        socket.on('gamedata', (data) => {
          console.log(data)
        })

        socket.on('gameended', (msg) => {
          console.log('game ended')
          console.log(msg)
          this.setState({
            gameEndMessage: 'Game ended',
            gamePlaying: false
          })
          clearInterval(this.state.intervalId)
        })

        socket.on('disconnect', () => {
          console.log('disconnected')
          this.setState({
            gamePlaying: false
          })
          clearInterval(this.state.intervalId)
        })
      })
    })
  }

  sendRaceData () {
    socket.emit('racedata', {
      chars: this.state.chars,
      room: {
        uuid: this.state.uuid
      }
    })
  }

  handlePlayGamePressed () {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    // TODO(aibek): check authentication, otherwise redirect to signin
    currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      console.log(idToken)
      this.setSocketBehavior(idToken)
    }).catch(function (error) {
      console.log(error) // TODO(aibek): handle better
    })
  }

  componentWillMount () {

  }

  handleUserInput (input) {
    this.setState({
      input
    })
    if (input.charAt(input.length - 1) !== ' ') {
      return
    }
    input = input.slice(0, input.length - 1)
    const splitted = this.state.text.split(' ')
    const word = splitted[0]
    if (input === word) {
      this.setState({
        text: splitted.slice(1).join(' '),
        input: '',
        chars: (this.state.chars + word.length)
      })
    }
  }

  playButtonPressed () {
    if (this.state.gamePlaying === true) {
      socket.disconnect()
      this.setState({
        gamePlaying: false
      })
    } else {
      this.setState({
        gamePlaying: true
      })
      this.handlePlayGamePressed()
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.gameStatusBar}>
          <View style={styles.gameStatusBarItem}>
            <Button title={this.state.gamePlaying === true ? 'Stop' : 'Play'} onPress={this.playButtonPressed} />
          </View>
          <View style={styles.gameStatusBarItem}><Text>position / {this.state.numOfPlayers}</Text></View>
          <View style={styles.gameStatusBarItem}><Text>time</Text></View>
          <View style={styles.gameStatusBarItem}><Text>cpm</Text></View>
        </View>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <TextInput
            style={{ height: 40 }}
            autoCapitalize='none'
            placeholder='Start typing here..'
            onChangeText={this.handleUserInput}
            value={this.state.input}
          />
        </View>
        <View style={{ flex: 3, flexDirection: 'column' }}>
          <Text>{this.state.text}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gameStatusBar: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 30
  },
  gameStatusBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
