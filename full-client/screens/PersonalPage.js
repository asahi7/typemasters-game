import React from 'react'
import { View, Text, Button, AsyncStorage, ScrollView, NetInfo } from 'react-native'
import firebase from 'firebase'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import moment from 'moment'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'

export default class PersonalPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      textLanguage: null,
      loading: true,
      userData: null
    }
    this.handleSignOut = this.handleSignOut.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
    this.getApiDataOnline = this.getApiDataOnline.bind(this)
    this.updateTextLanguageState = this.updateTextLanguageState.bind(this)
  }

  async componentDidMount () {
    await this.updateTextLanguageState()
    NetInfo.isConnected.fetch().then(isConnected => {
      if (__DEV__) {
        console.log('User is ' + (isConnected ? 'online' : 'offline'))
      }
      if (!isConnected) {
        this.online = false
        this.getPersistentDataOffline().then(() => {
          this.setState({
            loading: false
          })
        })
      } else {
        this.online = true
        this.getApiDataOnline(firebase.auth().currentUser).then(() => {
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
    if (__DEV__) {
      console.log('Updated screen')
    }
    await this.updateTextLanguageState()
    if (this.online) {
      this.getApiDataOnline(firebase.auth().currentUser)
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('personalPage-userData').then((value) => {
      if (!value) {
        this.setState({
          userData: null
        })
      } else {
        const userData = JSON.parse(value)
        this.setState({
          userData
        })
      }
    })
  }

  getApiDataOnline (user) {
    let userData = {}
    // This is done because user might not exist on the database and will create it first
    return WebAPI.getUserInfo(user.uid).then((result) => {
      userData.userInfo = result
    }).then(() => {
      return Promise.all([
        WebAPI.getRaceCount(user.uid, this.state.textLanguage),
        WebAPI.getAverageCpm(user.uid, this.state.textLanguage),
        WebAPI.getLatestAverageCpm(user.uid, this.state.textLanguage),
        WebAPI.getLastPlayedGame(user.uid, this.state.textLanguage),
        WebAPI.getBestResult(user.uid, this.state.textLanguage),
        WebAPI.getGamesWon(user.uid, this.state.textLanguage),
        WebAPI.getFirstRace(user.uid, this.state.textLanguage),
        WebAPI.getAverageAccuracy(user.uid, this.state.textLanguage),
        WebAPI.getLastAverageAccuracy(user.uid, this.state.textLanguage)
      ]).then((results) => {
        // TODO(aibek): remove .result from each response
        userData = {
          ...userData,
          totalRaces: results[0].result,
          avgCpm: (results[1].result !== null ? results[1].result : null),
          lastAvgCpm: results[2].result,
          lastPlayed: (results[3].result !== null ? results[3].result.date : null),
          lastScore: (results[3].result !== null ? results[3].result.cpm : null),
          lastAccuracy: (results[3].result !== null ? results[3].result.accuracy : null),
          bestResult: results[4].result,
          gamesWon: results[5].result,
          firstRaceData: results[6].result,
          avgAccuracy: results[7].result,
          lastAvgAccuracy: results[8].result
        }
      })
    }).then(() => {
      return AsyncStorage.setItem('personalPage-userData', JSON.stringify(userData)).then(() => {
        this.setState({
          userData,
          loading: false
        })
      })
    }).catch((error) => {
      if (__DEV__) {
        console.log(error)
      }
      throw error
    })
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', i18n.t('common.success'), i18n.t('common.backOnline'))
      this.getApiDataOnline(firebase.auth().currentUser)
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', i18n.t('common.warn'), i18n.t('common.noInternet'))
    }
  }

  async updateTextLanguageState () {
    const textLanguage = await AsyncStorage.getItem('textLanguage')
    if (!textLanguage) {
      this.setState({
        textLanguage: 'en'
      })
      await AsyncStorage.setItem('textLanguage', 'en')
    } else {
      this.setState({
        textLanguage: textLanguage
      })
    }
  }

  handleSignOut () {
    if (this.online) {
      firebase.auth().signOut().then(function () {
        if (__DEV__) {
          console.log('Signed out')
        }
      }, function (error) {
        if (__DEV__) {
          console.log(error)
        }
      })
    } else {
      this.dropdown.alertWithType('error', i18n.t('common.error'), i18n.t('personalPage.cantSignOutOffline'))
    }
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t('personalPage.header')}
          </Text>
        </View>
        {!this.state.userData && <View><Text style={globalStyles.tableHeader}>{i18n.t('common.noData')}</Text></View>}
        {this.state.userData &&
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('personalPage.general')}:</Text>
            {this.state.userData.userInfo && this.state.userData.userInfo.nickname &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.nickname')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo.nickname}</Text>
            </View>
            }
            {this.state.userData.userInfo && this.state.userData.userInfo.email &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('common.email')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo.email}</Text>
            </View>
            }
            {this.state.userData.userInfo && this.state.userData.userInfo.country &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('common.country')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo.country}</Text>
            </View>
            }
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>UID:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo && this.state.userData.userInfo.uid}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.typingLanguage')}:</Text>
              <Text style={globalStyles.column}>{this.state.textLanguage}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.totalGames')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.totalRaces}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.averageCpm')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.avgCpm} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.averageAccuracy')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.avgAccuracy}%</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.averageCpm10')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastAvgCpm} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.averageAccuracy10')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastAvgAccuracy}%</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.gamesWon')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.gamesWon}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.bestResult')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.bestResult} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.lastGame')}:</Text>
              <Text style={globalStyles.column}>{moment(this.state.userData.lastPlayed).format('HH:mm, D MMMM, YYYY')}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.lastGame')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastScore} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.lastGameAccuracy')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastAccuracy}%</Text>
            </View>
            {this.state.userData.firstRaceData &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.firstGame')}:</Text>
              <Text style={globalStyles.column}>{this.state.userData.firstRaceData.racePlayers[0].cpm} cpm</Text>
            </View>
            }
            {this.state.userData.firstRaceData &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>{i18n.t('personalPage.firstGame')}:</Text>
              <Text
                style={globalStyles.column}>{moment(this.state.userData.firstRaceData.date).format('HH:mm, D MMMM, YYYY')}</Text>
            </View>
            }
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={[globalStyles.normalText, { color: 'red' }]}>{i18n.t('personalPage.dataMayNotUpdate')}</Text>
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={() => this.props.navigation.navigate('PersonalCharts')}
              title={i18n.t('personalPage.showCharts')}
              color='#841584'
            />
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.handleSignOut}
              title={i18n.t('personalPage.signOut')}
              color={Commons.buttonColor}
            />
          </View>
        </ScrollView>}
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
      </LinearGradient>
    )
  }
}
