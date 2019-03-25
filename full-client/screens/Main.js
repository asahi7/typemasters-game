import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, NetInfo, AsyncStorage } from 'react-native'
import { LinearGradient, Localization } from 'expo'
import globalStyles from '../styles'
import Commons from '../Commons'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import moment from 'moment'
import firebase from 'firebase'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'

const en = {
  header: 'Compete With Others And Increase Your Typing Speed!',
  nodata: 'We are sorry, but it seems no data is available, check your internet connection',
  yourgamescount: 'You Played Games Today',
  totalgamescount: 'Total Played Games Today',
  lastgames: 'Last Games Today',
  chooselangtext: 'Choose your typing language and',
  playbutton: 'PLAY',
  signintosave: '*Sign in to save your progress.',
  backonline: 'Back online',
  nointernet: 'No internet connection'
}
const ru = {
  header: 'Повысьте свою скорость печатания, соревнуясь с другими',
  nodata: 'Извините, но необходимые данные не могут быть найдены, проверьте свое интернет подключение',
  yourgamescount: 'Количестов игр за сегодня сыгранных вами',
  totalgamescount: 'Количество всех игр за сегодня',
  lastgames: 'Последние игры',
  chooselangtext: 'Выберите подходящий язык для печатания и',
  playbutton: 'ИГРАЙТЕ',
  signintosave: '*Авторизуйтесь для сохранения вашего прогресса',
  backonline: 'Снова онлайн',
  nointernet: 'Проблема с подключением к сети интернета'
}

// TODO(aibek): check if async call is needed for Android in order to detect language change
i18n.fallbacks = true
i18n.translations = { en, ru, kk: ru }
i18n.locale = Localization.locale

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        gamesPlayedCnt: null,
        lastGames: [],
        gamesPlayedCntUser: null
      },
      loading: true,
      authenticated: null
    }
    this.handlePlayPressed = this.handlePlayPressed.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
    this.getApiDataOnline = this.getApiDataOnline.bind(this)
    this.updateTextLanguageState = this.updateTextLanguageState.bind(this)
  }

  async componentDidMount () {
    await this.updateTextLanguageState()
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('User is ' + (isConnected ? 'online' : 'offline'))
      if (!isConnected) {
        this.online = false
        this.getPersistentDataOffline().then(() => {
          this.setState({
            loading: false
          })
        })
      } else {
        this.online = true
        this.getApiDataOnline().then(() => {
          this.setState({
            loading: false
          })
        })
      }
    })
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.updateScreen()
      }
    )
  }

  componentWillUnmount () {
    this.willFocusSubscription.remove()
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  async updateScreen () {
    console.log('update screen!')
    await this.updateTextLanguageState()
    this.setState({ errorMessage: null })
    if (this.online) {
      this.getApiDataOnline()
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('main-data').then((value) => {
      if (!value) {
        this.setState({
          data: {
            gamesPlayedCnt: null,
            lastGames: [],
            gamesPlayedCntUser: null
          }
        })
      } else {
        const data = JSON.parse(value)
        this.setState({
          data
        })
      }
    })
  }

  getApiDataOnline () {
    let data = {}
    const user = firebase.auth().currentUser
    if (user && user.emailVerified) {
      return Promise.all([
        WebAPI.countGamesPlayedToday(),
        WebAPI.getLastPlayedGames(),
        WebAPI.countUserPlayedToday(user.uid)
      ]).then((results) => {
        data = {
          gamesPlayedCnt: results[0].result,
          lastGames: results[1].result,
          gamesPlayedCntUser: results[2].result
        }
      }).then(() => {
        return AsyncStorage.setItem('main-data', JSON.stringify(data)).then(() => {
          this.setState({
            data,
            authenticated: true
          })
        })
      }).catch((error) => {
        console.log(error)
      })
    } else {
      return Promise.all([
        WebAPI.countGamesPlayedToday(),
        WebAPI.getLastPlayedGames()
      ]).then((results) => {
        data = {
          gamesPlayedCnt: results[0].result,
          lastGames: results[1].result,
          gamesPlayedCntUser: 0
        }
      }).then(() => {
        return AsyncStorage.setItem('main-data', JSON.stringify(data)).then(() => {
          this.setState({
            data,
            authenticated: false
          })
        })
      }).catch((error) => {
        console.log(error)
      })
    }
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', 'Success', i18n.t('backonline'))
      this.getApiDataOnline()
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', 'Warning', i18n.t('nointernet'))
    }
  }

  async updateTextLanguageState () {
    const textLanguage = await AsyncStorage.getItem('textLanguage')
    console.log('lang ' + textLanguage)
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

  handlePlayPressed () {
    this.props.navigation.navigate('Game')
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t('header')}

          </Text>
        </View>
        {!this.state.data && <View><Text style={globalStyles.tableHeader}>{i18n.t('nodata')}</Text></View>}
        {this.state.data && <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          {this.state.authenticated &&
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('yourgamescount')}: {this.state.data.gamesPlayedCntUser}</Text>
          </View>
          }
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('totalgamescount')}: {this.state.data.gamesPlayedCnt}</Text>
          </View>
          {/* TODO(aibek): fill out last played games from API */}
          <View style={{ marginTop: 20 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('lastgames')}</Text>
            {
              this.state.data.lastGames.map((result, i) => {
                return (
                  <View style={globalStyles.row} key={i}>
                    <Text style={globalStyles.column}>{result.user.nickname}</Text>
                    <Text style={globalStyles.column}>{result.user.country}</Text>
                    <Text style={globalStyles.column}>{result.cpm}</Text>
                    <Text style={globalStyles.column}>{moment(result.race.date).fromNow()}</Text>
                  </View>
                )
              })
            }
          </View>
          {/* TODO(aibek): add link to settings for language */}
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={globalStyles.normalText}>{i18n.t('chooselangtext')}</Text>
            <TouchableOpacity style={styles.playButton} onPress={this.handlePlayPressed}>
              <Text style={styles.playButtonText}>{i18n.t('playbutton')}</Text>
            </TouchableOpacity>
          </View>
          {!this.state.authenticated &&
          <View style={{ marginTop: 10 }}>
            <Text style={[globalStyles.normalText, { color: 'red' }]}>{i18n.t('signintosave')}</Text>
          </View>
          }
        </ScrollView>}
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  playButton: {
    borderWidth: 1,
    borderColor: '#7f1717',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    height: 100,
    marginTop: 10,
    backgroundColor: '#ed4747',
    borderRadius: 10,
    paddingLeft: 5,
    paddingRight: 5
  },
  playButtonText: {
    color: '#fff',
    fontSize: 40
  }
})
