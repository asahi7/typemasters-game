import React from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import firebase from 'firebase'
import { Badge } from 'react-native-elements'
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
      numOfPlayers: 1
    }
    this.setSocketBehavior = this.setSocketBehavior.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
    this.handleUserInput = this.handleUserInput.bind(this)
    this.sendRaceData = this.sendRaceData.bind(this)
  }

  setSocketBehavior (idToken) {
    socket = io.connect('http://192.168.0.9:3000', { reconnect: true })
    socket.on('connect', () => {
      socket.emit('authentication', { token: idToken })
      socket.on('authenticated', () => {
        console.log('Asking for a new game..')
        socket.emit('newgame')

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
            gameEndMessage: 'Game ended'
          })
          clearInterval(this.state.intervalId)
        })

        socket.on('disconnect', () => {
          console.log('disconnected')
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

  componentWillMount () {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      console.log(idToken)
      this.setSocketBehavior(idToken)
    }).catch(function (error) {
      console.log(error) // TODO(aibek): handle better
    })
  }

  handleSignOut () {
    firebase.auth().signOut().then(function () {
      console.log('Signed out')
    }, function (error) {
      console.log(error)
    })
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

  render () {
    return (
      <View style={styles.container}>
        <Badge style={styles.numOfPlayersContainer}>
          <Text>Players - {this.state.numOfPlayers}</Text>
        </Badge>
        {this.state.gameEndMessage === '' ? null
          : (
            <Badge style={styles.gameEndContainer}>
              <Text>{this.state.gameEndMessage}</Text>
            </Badge>
          )
        }
        {/* TODO(aibek): fetch text from database */}
        <Text>{this.state.text}</Text>
        <TextInput
          style={{ height: 40 }}
          autoCapitalize='none'
          placeholder='Start typing here..'
          onChangeText={this.handleUserInput}
          value={this.state.input}
        />
        <Button title='Sign out' onPress={this.handleSignOut} />
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
  gameEndContainer: {
    backgroundColor: 'red',
    color: 'white',
    margin: 10
  },
  numOfPlayersContainer: {
    top: 10,
    color: 'white',
    backgroundColor: '#000',
    margin: 10
  }
})
