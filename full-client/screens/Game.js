import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  AsyncStorage, NetInfo
} from 'react-native'
import firebase from 'firebase'
import io from 'socket.io-client'
import { AdMobBanner, LinearGradient } from 'expo'
import _ from 'lodash'
import Config from '../config/Config'
import Commons from '../Commons'
import globalStyles from '../styles'
import GameTextInput from '../components/GameTextInput'
import GameEndModal from '../components/GameEndModal'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'
import Sentry from 'sentry-expo'

import * as offlineTexts from '../offline_texts'

const env = process.env.REACT_NATIVE_ENV || 'dev'

if (__DEV__) {
  console.log('REACT_NATIVE_ENV: ' + env)
}

let socket

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: i18n.t('game.initText'),
      chars: 0,
      numOfPlayers: 1,
      position: 1,
      gamePlaying: false,
      timeLeft: 0,
      cpm: 0,
      modalVisible: false,
      modalText: '',
      authenticated: null,
      accuracy: 100
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
    this.accuracyHandler = this.accuracyHandler.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
    this.updateTextLanguageState = this.updateTextLanguageState.bind(this)
    this.countCpm = this.countCpm.bind(this)
    this.setOfflineGameData = this.setOfflineGameData.bind(this)
    this.handlePlayGamePressedOffline = this.handlePlayGamePressedOffline.bind(this)
    this.finishOfflineGame = this.finishOfflineGame.bind(this)
    this.findPlayerId = this.findPlayerId.bind(this)
  }

  async componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', () => { this.dicsonnectPlayer() })
    await this.updateTextLanguageState()
    NetInfo.isConnected.fetch().then(isConnected => {
      if (__DEV__) {
        console.log('User is ' + (isConnected ? 'online' : 'offline'))
      }
      if (!isConnected) {
        this.online = false
      } else {
        this.online = true
      }
    })
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  componentWillUnmount () {
    this.dicsonnectPlayer()
    BackHandler.removeEventListener('hardwareBackPress', () => { this.dicsonnectPlayer() })
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', i18n.t('common.success'), i18n.t('common.backOnline'))
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', i18n.t('common.warn'), i18n.t('common.noInternet'))
      if (this.state.gamePlaying && !this.state.offlineMode) {
        this.dicsonnectPlayer()
      }
    }
  }

  async updateTextLanguageState () {
    const textLanguage = await AsyncStorage.getItem('textLanguage')
    if (__DEV__) {
      console.log('Language ' + textLanguage)
    }
    if (!textLanguage) {
      this.setState({
        textLanguage: 'en'
      })
      await AsyncStorage.setItem('textLanguage', 'en')
    } else {
      this.setState({
        textLanguage: textLanguage.toLowerCase()
      })
    }
  }

  /**
   * A method to disconnect from the game server.
   */
  dicsonnectPlayer () {
    if (this.state.roomKey) {
      socket.emit('removeplayer', {
        roomKey: this.state.roomKey
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
    if (this.state.gamePlaying && this.state.offlineMode) {
      this.cleanGameData()
      return
    } else if (this.state.gamePlaying) {
      this.dicsonnectPlayer()
      return
    }
    if (this.online === false) {
      this.updateTextLanguageState().then(() => {
        this.dropdown.alertWithType('info', i18n.t('game.info'), i18n.t('game.playingOffline'))
        this.handlePlayGamePressedOffline()
      })
    } else {
      this.updateTextLanguageState().then(() => {
        this.handlePlayGamePressed()
      })
    }
  }

  handlePlayGamePressedOffline () {
    if (__DEV__) {
      console.log('Game started in offline mode ' + this.state.textLanguage)
    }
    const data = _.get(offlineTexts[this.state.textLanguage], 'data')
    if (!data) {
      this.dropdown.alertWithType('warn', i18n.t('common.warning'), i18n.t('game.noTextsLang'))
      this.setState({ gamePlaying: false })
      return
    }
    const text = data[_.random(_.size(data) - 1)]
    if (!text) {
      this.dropdown.alertWithType('warn', i18n.t('common.warning'), i18n.t('game.noTextsLangOffline'))
      this.setState({ gamePlaying: false })
    } else {
      const textArray = text.text.split(' ')
      this.setState({
        gamePlaying: true,
        textArray,
        text: text.text,
        wordIndex: 0,
        numOfPlayers: 1,
        chars: 0,
        startTime: Date.now(),
        endTime: text.duration * 1000 + Date.now(),
        offlineMode: true,
        totalChars: text.text.replace(/\s/g, '').length
      }, () => {
        const timer = setTimeout(this.finishOfflineGame, text.duration * 1000)
        const intervalId = setInterval(this.setOfflineGameData, 500)
        this.setState({
          intervalId,
          timer
        })
      })
    }
  }

  finishOfflineGame () {
    const isWinner = this.state.chars === this.state.totalChars
    if (isWinner) {
      this.setState({
        modalText: i18n.t('game.modal.winner')
      })
    } else {
      this.setState({
        modalText: i18n.t('game.modal.timeUp')
      })
    }
    this.setModalVisible(true)
    this.cleanGameData()
  }

  setOfflineGameData () {
    this.setState({
      timeLeft: (this.state.endTime - Date.now()) / 1000,
      cpm: this.countCpm(this.state.chars),
      position: 1
    })
    if (this.state.chars === this.state.totalChars) {
      this.finishOfflineGame()
    }
  }

  countCpm (chars) {
    const interval = Date.now() - this.state.startTime
    const intervalMinutes = interval / (1000 * 60)
    return Math.round(chars / intervalMinutes)
  }

  /**
   * Handler for starting a new game.
   * It fetches a user token from firebase which is needed for authentication on the game server.
   */
  handlePlayGamePressed () {
    const { currentUser } = firebase.auth()
    this.setState({ gamePlaying: true, offlineMode: false })
    if (currentUser && currentUser.emailVerified) {
      this.setState({ authenticated: true })
      currentUser.getIdToken(true).then((idToken) => {
        this.setSocketBehavior(idToken)
      }).catch(function (error) {
        Sentry.captureException(error)
        if (__DEV__) {
          console.log(error)
        }
      })
    } else {
      this.setState({ authenticated: false })
      // Anonymous user
      this.setSocketBehavior(-1)
    }
  }

  setSocketBehavior (idToken) {
    // TODO(aibek): study about reconnect behavior
    socket = io.connect(Config[env].GAME_SERVER_API, { reconnection: false })
    socket.on('connect', () => {
      socket.emit('authentication', { token: idToken })
      socket.on('unauthorized', (err) => {
        if (__DEV__) {
          console.log('There was an error with the authentication: ', err.message)
        }
        if (err.message === 'Anonymous user expired the ability to play more games') {
          this.setState({
            modalText: i18n.t('game.modal.anonymGamesExpiredHeader'),
            modalNormalText: i18n.t('game.modal.anonymGamesExpired')
          }, () => {
            this.setModalVisible(true)
          })
        }
        this.dicsonnectPlayer()
      })
      socket.on('authenticated', () => {
        if (__DEV__) {
          console.log('Asking for a new game..')
          console.log(socket.id)
        }
        socket.emit('newgame', { language: this.state.textLanguage })
        this.setState({
          text: 'Loading..',
          socketId: socket.id,
          accuracy: 100
        })

        socket.on('gamestarted', (data) => {
          if (__DEV__) {
            console.log('Game started')
          }
          const textArray = data.text.split(' ')
          this.setState({
            textArray,
            text: data.text,
            wordIndex: 0,
            roomKey: data.roomKey,
            numOfPlayers: data.players.length,
            chars: 0,
            playerId: this.findPlayerId(data)
          }, () => {
            const intervalId = setInterval(this.sendRaceData, 500)
            this.setState({
              intervalId
            })
          })
        })

        socket.on('gamedata', (data) => {
          if (__DEV__) {
            console.log('Game data')
          }
          this.setGameData(data, false)
        })
        socket.on('gameended', (data) => {
          if (__DEV__) {
            console.log('Game finished')
          }
          this.cleanGameData()
          this.setGameData(data, true)
        })

        socket.on('disconnect', () => {
          if (__DEV__) {
            console.log('Disconnected')
          }
          this.cleanGameData()
        })
      })
    })
  }

  sendRaceData () {
    socket.emit('racedata', {
      chars: this.state.chars,
      accuracy: this.state.accuracy,
      roomKey: this.state.roomKey,
      playerId: this.state.playerId
    })
  }

  setGameData (data, isGameEnded) {
    const player = _.find(data.players, { 'socketId': this.state.socketId })
    if (!player) {
      Sentry.captureException('Server sent data to socket ' + this.state.socketId + ' without playing client')
      this.dicsonnectPlayer()
      // TODO(aibek): will socket.io emit disconnected msg and cleanGameData triggered automatically?
      // this.cleanGameData()
      return
    }
    const isWinner = player.isWinner
    this.setState({
      timeLeft: data.timeLeft / 1000,
      cpm: this.findCpmForCurrentUser(data),
      position: this.findPlayerPosition(data)
    }, () => {
      if (isWinner === true || isGameEnded === true) {
        if (isWinner) {
          this.setState({
            modalText: i18n.t('game.modal.winner')
          })
        } else if (isGameEnded) {
          this.setState({
            modalText: i18n.t('game.modal.timeUp')
          })
        }
        this.dicsonnectPlayer()
        this.setModalVisible(true)
      }
    })
  }

  findCpmForCurrentUser (data) {
    return Math.round(_.get(_.find(data.players, ['socketId', this.state.socketId]), 'cpm'))
  }

  findPlayerId (data) {
    return _.find(data.players, ['socketId', this.state.socketId]).playerId
  }

  findPlayerPosition (data) {
    return _.find(data.players, ['socketId', this.state.socketId]).position
  }

  setModalVisible (visible) {
    this.setState({ modalVisible: visible })
  }

  cleanGameData () {
    if (this.state.offlineMode) {
      clearTimeout(this.state.timer)
    }
    this.setState({
      gamePlaying: false,
      chars: 0,
      roomKey: null,
      modalNormalText: null
    })
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
    if (this.state.timer) {
      clearTimeout(this.state.timer)
    }
  }

  gameInputHandler (chars, text) {
    this.setState({
      chars: this.state.chars + chars,
      text
    })
  }

  accuracyHandler (totalCharsInput, correctCharsInput) {
    if (this.state.gamePlaying) {
      this.setState({
        accuracy: Math.round(correctCharsInput * 100 / totalCharsInput)
      })
    }
  }

  render () {
    const admobBanner = <AdMobBanner
      bannerSize='mediumRectangle'
      adUnitID='ca-app-pub-1048218245279838/9133509327'
      onDidFailToReceiveAdWithError={(error) => { if (__DEV__) { console.log(error) } }} />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <GameEndModal admobBanner={admobBanner} headerText={this.state.modalText} position={this.state.position}
          numOfPlayers={this.state.numOfPlayers} cpm={this.state.cpm} text={this.state.modalNormalText}
          accuracy={this.state.accuracy} authenticated={this.state.authenticated} visible={this.state.modalVisible} closeModalHandler={() => {
            this.setModalVisible(false)
          }}
        />
        <View style={styles.gameStatusBar}>
          <View style={[styles.gameStatusBarItem, { borderLeftWidth: 0 }]}>
            {this.state.gamePlaying === true
              ? <TouchableOpacity
                style={[styles.playButton, styles.playButtonBgStop]}
                onPress={this.playButtonPressed}
              >
                <Text style={styles.playButtonText}>{i18n.t('game.stop')}</Text>
              </TouchableOpacity>
              : <TouchableOpacity
                style={[styles.playButton, styles.playButtonBgPlay]}
                onPress={this.playButtonPressed}
              >
                <Text style={styles.playButtonText}>{i18n.t('game.play')}</Text>
              </TouchableOpacity>}
          </View>
          <View
            style={styles.gameStatusBarItem}><Text>{this.state.position}/{this.state.numOfPlayers} {i18n.t('game.position')}</Text></View>
          <View
            style={styles.gameStatusBarItem}><Text>{Math.round(this.state.timeLeft)} {i18n.t('game.timeLeft')}</Text></View>
          <View style={styles.gameStatusBarItem}><Text>{this.state.cpm} cpm</Text></View>
          <View
            style={[styles.gameStatusBarItem, { borderRightWidth: 0 }]}><Text>{this.state.accuracy ? this.state.accuracy : 100}%
              {i18n.t('game.accuracy')}</Text></View>
        </View>
        <GameTextInput textArray={this.state.textArray} handler={this.gameInputHandler} refresh={this.state.gamePlaying}
          accuracyHandler={this.accuracyHandler} />
        <ScrollView style={styles.raceTextView}>
          <Text style={styles.raceText}>{this.state.text}</Text>
        </ScrollView>
        <TouchableHighlight
          onPress={() => {
            this.setModalVisible(true)
          }} style={{ marginBottom: 20 }}>
          <Text>Show Modal</Text>
        </TouchableHighlight>
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
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
    flex: 0.1,
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 30
  },
  gameStatusBarItem: {
    paddingLeft: 3,
    paddingRight: 3,
    borderRightWidth: 1,
    borderRightColor: '#7f1717',
    borderLeftWidth: 1,
    borderLeftColor: '#7f1717',
    alignItems: 'center',
    justifyContent: 'center'
  },
  raceTextView: {
    flex: 3,
    flexDirection: 'column',
    padding: 10,
    paddingBottom: 30
  },
  raceText: {
    fontSize: 20
  }
})
