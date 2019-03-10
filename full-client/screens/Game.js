import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Modal,
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
import Commons from '../Commons'
import globalStyles from '../styles'
import GameTextInput from '../components/GameTextInput'

let socket

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: 'To start press Play',
      chars: 0,
      numOfPlayers: 1,
      position: 1,
      gamePlaying: false,
      timeLeft: 0,
      cpm: 0,
      modalVisible: false,
      modalText: '',
      authenticated: null
    }
    this.setSocketBehavior = this.setSocketBehavior.bind(this)
    this.sendRaceData = this.sendRaceData.bind(this)
    this.playButtonPressed = this.playButtonPressed.bind(this)
    this.handlePlayGamePressed = this.handlePlayGamePressed.bind(this)
    this.findCpmForCurrentUser = this.findCpmForCurrentUser.bind(this)
    this.cleanGameData = this.cleanGameData.bind(this)
    this.findPlayerPosition = this.findPlayerPosition.bind(this)
    this.setGameData = this.setGameData.bind(this)
    this.dicsonnectPlayer = this.dicsonnectPlayer.bind(this)
    this.setModalVisible = this.setModalVisible.bind(this)
    this.gameInputHandler = this.gameInputHandler.bind(this)
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
    this.dicsonnectPlayer()
    BackHandler.removeEventListener('hardwareBackPress', () => { this.dicsonnectPlayer() })
  }

  /**
   * A method to disconnect from the game server.
   */
  dicsonnectPlayer () {
    if (this.state.uuid) {
      socket.emit('removeplayer', {
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
    this.setState({ gamePlaying: true })
    if (currentUser) {
      this.setState({ authenticated: true })
      currentUser.getIdToken(true).then((idToken) => {
        this.setSocketBehavior(idToken)
      }).catch(function (error) {
        // TODO(aibek): handle better
        console.log(error)
      })
    } else {
      this.setState({ authenticated: false })
      // Anonymous user
      this.setSocketBehavior(-1)
    }
  }

  setSocketBehavior (idToken) {
    // TODO(aibek): study about reconnect behavior
    socket = io.connect(Config.GAME_SERVER_API, { reconnect: false })
    socket.on('connect', () => {
      socket.emit('authentication', { token: idToken })
      socket.on('authenticated', () => {
        console.log('Asking for a new game..')
        console.log(socket.id)
        socket.emit('newgame', { language: this.state.language })
        this.setState({
          text: 'Loading..',
          socketId: socket.id
        })

        socket.on('gamestarted', (data) => {
          console.log('Game started')
          const textArray = data.text.split(' ')
          this.setState({
            textArray,
            text: data.text,
            wordIndex: 0,
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
    // console.log(data)
    const isWinner = _.find(data.players, { 'id': this.state.socketId }).isWinner
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
    return Math.round(_.get(_.find(data.players, ['id', this.state.socketId]), 'cpm'))
  }

  findPlayerPosition (data) {
    // TODO(aibek): consider anonymous users too
    return _.find(data.players, { 'id': this.state.socketId }).position
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

  gameInputHandler (chars, text) {
    this.setState({
      chars: this.state.chars + chars,
      text
    })
  }

  render () {
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
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
              {!this.state.authenticated &&
              <View style={{ marginTop: 10 }}>
                <Text style={[globalStyles.normalText, { color: 'red' }]}>*Sign in to save your progress.</Text>
              </View>
              }
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
        <GameTextInput textArray={this.state.textArray} handler={this.gameInputHandler} refresh={this.state.gamePlaying} />
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
  raceTextView: {
    flex: 3,
    flexDirection: 'column',
    padding: 10
  },
  raceText: {
    fontSize: 20
  }
})
