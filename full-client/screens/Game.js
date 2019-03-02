import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Modal,
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
import { LinearGradient } from 'expo'

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
      cpm: 0,
      modalVisible: false,
      modalText: ''
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
    this.setModalVisible = this.setModalVisible.bind(this)
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', () => { this.dicsonnectPlayer() })
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
    BackHandler.removeEventListener('hardwareBackPress', () => { this.dicsonnectPlayer() })
  }

  /**
   * A method to disconnect from the game server.
   */
  dicsonnectPlayer () {
    if (this.state.uuid) {
      socket.emit('removePlayer', {
        room: {
          uuid: this.state.uuid
        }
      })
    }
    if (this.state.gamePlaying === true && socket) {
      socket.disconnect()
    }
    this.setState({
      gamePlaying: false
    })
  }

  /**
   * Play button handler can have two states, when a game is on or when it is not playing.
   * If it is on, the player gets disconnected, otherwise a new game is started.
   * */
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
        this.handlePlayGamePressed()
      })
    }
  }

  /**
   * Handler for starting a new game.
   * It fetches a user token from firebase which is needed for authentication on the game server.
   */
  handlePlayGamePressed () {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser, gamePlaying: true })
    currentUser.getIdToken(true).then((idToken) => {
      this.setSocketBehavior(idToken)
    }).catch(function (error) {
      // TODO(aibek): handle better
      console.log(error)
    })
  }

  setSocketBehavior (idToken) {
    socket = io.connect(Config.GAME_SERVER_API, { reconnect: true })
    socket.on('connect', () => {
      socket.emit('authentication', { token: idToken })
      socket.on('authenticated', () => {
        console.log('Asking for a new game..')
        socket.emit('newgame', { language: this.state.language })
        this.setState({
          text: 'Loading..'
        })

        socket.on('gamestarted', (data) => {
          console.log('Game started')
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
        })

        socket.on('gamedata', (data) => {
          this.setGameData(data, false)
        })
        socket.on('gameended', (data) => {
          console.log('Game finished')
          this.cleanGameData()
          this.setGameData(data, true)
        })

        socket.on('disconnect', () => {
          console.log('Disconnected')
          this.cleanGameData()
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

  setGameData (data, isGameEnded) {
    const isWinner = _.find(data.players, { 'uid': this.state.currentUser.uid }).isWinner
    this.setState({
      timeLeft: data.timeLeft / 1000,
      cpm: this.findCpmForCurrentUser(data),
      position: this.findPlayerPosition(data)
    }, () => {
      if (isWinner === true || isGameEnded === true) {
        if (isWinner) {
          this.setState({
            modalText: 'You are the winner!'
          })
        } else if (isGameEnded) {
          this.setState({
            modalText: 'Time is up!'
          })
        }
        this.dicsonnectPlayer()
        this.setModalVisible(true)
      }
    })
  }

  findCpmForCurrentUser (data) {
    return Math.round(_.get(_.find(data.players, ['uid', this.state.currentUser.uid]), 'cpm'))
  }

  findPlayerPosition (data) {
    // TODO(aibek): consider anonymous users too
    return _.find(data.players, { 'uid': this.state.currentUser.uid }).position
  }

  setModalVisible (visible) {
    this.setState({ modalVisible: visible })
  }

  cleanGameData () {
    this.setState({
      gamePlaying: false,
      chars: 0
    })
    clearInterval(this.state.intervalId)
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
      <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
        <Modal
          visible={this.state.modalVisible}
          transparent
          onRequestClose={() => {}}
        >
          <View style={{ flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000080' }}>
            <View style={{ backgroundColor: '#fff',
              padding: 20,
              width: 300,
              height: 300,
              alignItems: 'center',
              justifyContent: 'center' }}>
              <Text style={{ color: 'red', fontSize: 20 }}>{this.state.modalText}</Text>
              <View
                style={styles.gameStatusBarItem}><Text>You are {this.state.position} out of {this.state.numOfPlayers}</Text></View>
              <View style={styles.gameStatusBarItem}><Text>Your CPM: {this.state.cpm}</Text></View>
              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible)
                }}>
                <Text style={{ color: 'red', fontSize: 20 }}>Close [X]</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
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
        <TouchableHighlight
          onPress={() => {
            this.setModalVisible(true)
          }} style={{ marginBottom: 20 }}>
          <Text>Show Modal</Text>
        </TouchableHighlight>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
