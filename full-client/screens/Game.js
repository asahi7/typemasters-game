import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  AsyncStorage
} from 'react-native'
import firebase from 'firebase'
import io from 'socket.io-client'
import _ from 'lodash'
import Config from '../config/Config'

let socket

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: 'To start press Play',
      input: '',
      chars: 0,
      numOfPlayers: 1,
      position: 1,
      gamePlaying: false,
      timeLeft: 0,
      cpm: 0
    }
    this.setSocketBehavior = this.setSocketBehavior.bind(this)
    this.handleUserInput = this.handleUserInput.bind(this)
    this.sendRaceData = this.sendRaceData.bind(this)
    this.playButtonPressed = this.playButtonPressed.bind(this)
    this.handlePlayGamePressed = this.handlePlayGamePressed.bind(this)
    this.findCpmForCurrentUser = this.findCpmForCurrentUser.bind(this)
    this.cleanGameData = this.cleanGameData.bind(this)
    this.findPlayerPosition = this.findPlayerPosition.bind(this)
    this.setGameData = this.setGameData.bind(this)
    this.dicsonnectPlayer = this.dicsonnectPlayer.bind(this)
    this.handleBackPress = this.handleBackPress.bind(this)
  }

  findCpmForCurrentUser (data) {
    return Math.round(_.get(_.find(data.players, ['uid', this.state.currentUser.uid]), 'cpm'))
  }

  setSocketBehavior (idToken) {
    socket = io.connect(Config.GAME_SERVER_API, { reconnect: true })
    socket.on('connect', () => {
      socket.emit('authentication', { token: idToken })
      socket.on('authenticated', () => {
        console.log('Asking for a new game..')
        socket.emit('newgame', { language: this.state.language })
        this.setState({
          gamePlaying: true,
          text: 'Loading..'
        })
        socket.on('gamestarted', (data) => {
          console.log(data.msg)
          this.setState({
            text: data.text,
            uuid: data.room,
            numOfPlayers: data.players.length,
            chars: 0
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
          this.setGameData(data)
        })

        socket.on('gameended', (data) => {
          console.log('game ended')
          console.log(data)
          this.cleanGameData()
          this.setGameData(data)
        })

        socket.on('disconnect', () => {
          console.log('disconnected')
          this.cleanGameData()
        })
      })
    })
  }

  setGameData (data) {
    this.setState({
      timeLeft: data.timeLeft / 1000,
      cpm: this.findCpmForCurrentUser(data),
      position: this.findPlayerPosition(data)
    })
  }

  cleanGameData () {
    this.setState({
      gamePlaying: false,
      chars: 0
    })
    clearInterval(this.state.intervalId)
  }

  findPlayerPosition (data) {
    // TODO(aibek): consider anonymous users too
    return _.find(data.players, { 'uid': this.state.currentUser.uid }).position
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
    console.log(currentUser)
    this.setState({ currentUser })
    // TODO(aibek): check authentication, otherwise redirect to signin
    currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      console.log(idToken)
      this.setSocketBehavior(idToken)
    }).catch(function (error) {
      console.log(error) // TODO(aibek): handle better
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

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    AsyncStorage.getItem('textLanguage').then((value) => {
      if (!value) {
        this.setState({
          language: 'en'
        })
      } else {
        this.setState({
          language: value.toLowerCase()
        })
      }
    })
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress () {
    this.dicsonnectPlayer()
  }

  playButtonPressed () {
    if (this.state.gamePlaying === true) {
      this.dicsonnectPlayer()
    } else {
      AsyncStorage.getItem('textLanguage').then((value) => {
        if (!value) {
          this.setState({
            language: 'en'
          })
        } else {
          this.setState({
            language: value.toLowerCase()
          })
        }
      }).then(() => {
        this.setState({
          gamePlaying: true
        })
        this.handlePlayGamePressed()
      })
    }
  }

  dicsonnectPlayer () {
    if (this.state.uuid) {
      socket.emit('removePlayer', {
        room: {
          uuid: this.state.uuid
        }
      })
    }
    socket.disconnect()
    this.setState({
      gamePlaying: false
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.gameStatusBar}>
          <View style={styles.gameStatusBarItem}>
            {this.state.gamePlaying === true
              ? <TouchableOpacity
                style={[styles.playButton, styles.playButtonBgStop]}
                onPress={this.playButtonPressed}
              >
                <Text style={styles.playButtonText}>Stop</Text>
              </TouchableOpacity>
              : <TouchableOpacity
                style={[styles.playButton, styles.playButtonBgPlay]}
                onPress={this.playButtonPressed}
              >
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>}
          </View>
          <View
            style={styles.gameStatusBarItem}><Text>{this.state.position}/{this.state.numOfPlayers}</Text></View>
          <View
            style={styles.gameStatusBarItem}><Text>Time: {Math.round(this.state.timeLeft)}</Text></View>
          <View style={styles.gameStatusBarItem}><Text>CPM: {this.state.cpm}</Text></View>
        </View>
        <View style={styles.textInput}>
          <TextInput
            style={styles.textInputStyle}
            autoCapitalize='none'
            placeholder='Start typing here..'
            onChangeText={this.handleUserInput}
            value={this.state.input}
          />
        </View>
        <ScrollView style={styles.raceTextView}>
          <Text style={styles.raceText}>{this.state.text}</Text>
        </ScrollView>
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
  playButton: {
    alignItems: 'center',
    padding: 10
  },
  playButtonBgStop: {
    backgroundColor: '#ff0000'
  },
  playButtonBgPlay: {
    backgroundColor: '#76e77e'
  },
  playButtonText: {
    color: '#fff'
  },
  gameStatusBar: {
    flex: 0.3,
    flexDirection: 'row',
    marginTop: 10
  },
  gameStatusBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'stretch',
    margin: 10
  },
  textInputStyle: {
    flex: 1,
    padding: 5,
    height: 40,
    borderColor: '#449eb2',
    borderWidth: 1
  },
  raceTextView: {
    flex: 3,
    flexDirection: 'column',
    padding: 10
  },
  raceText: {
    fontSize: 20
  }
})
