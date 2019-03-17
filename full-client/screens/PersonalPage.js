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
    this.updateTextLanguageState()
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

  updateScreen () {
    console.log('update screen!')
    if (this.online) {
      this.getApiDataOnline(firebase.auth().currentUser)
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('userData').then((value) => {
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
      return AsyncStorage.setItem('userData', JSON.stringify(userData)).then(() => {
        console.log(userData)
        console.log(JSON.stringify(userData))
        AsyncStorage.getItem('userData').then((value) => {
          console.log(JSON.parse(value))
        })
        this.setState({
          userData
        })
      })
    }).catch((error) => {
      console.log(error)
    })
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', 'Success', 'Back online')
      if (!this.state.userData) {
        this.getApiDataOnline(firebase.auth().currentUser)
      }
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', 'Warning', 'No internet connection')
    }
  }

  async updateTextLanguageState () {
    const textLanguage = await AsyncStorage.getItem('textLanguage')
    if (!textLanguage) {
      this.setState({
        textLanguage: 'en'
      })
      await AsyncStorage.setItem('textLanguage', 'EN')
    } else {
      this.setState({
        textLanguage: textLanguage.toLowerCase()
      })
    }
  }

  handleSignOut () {
    if (this.online) {
      firebase.auth().signOut().then(function () {
        console.log('Signed out')
      }, function (error) {
        console.log(error)
      })
    } else {
      this.dropdown.alertWithType('error', 'Error', 'Can not sign out during offline mode')
    }
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            Personal Page
          </Text>
        </View>
        {!this.state.userData && <View><Text style={globalStyles.tableHeader}>No data available, check your internet connection</Text></View>}
        {this.state.userData &&
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>General</Text>
            {this.state.userData.userInfo && this.state.userData.userInfo.nickname &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Nickname:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo.nickname}</Text>
            </View>
            }
            {this.state.userData.userInfo && this.state.userData.userInfo.email &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Email:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo.email}</Text>
            </View>
            }
            {this.state.userData.userInfo && this.state.userData.userInfo.country &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Country:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo.country}</Text>
            </View>
            }
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>UID:</Text>
              <Text style={globalStyles.column}>{this.state.userData.userInfo && this.state.userData.userInfo.uid}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Typing language:</Text>
              <Text style={globalStyles.column}>{this.state.textLanguage}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Total games:</Text>
              <Text style={globalStyles.column}>{this.state.userData.totalRaces}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average cpm:</Text>
              <Text style={globalStyles.column}>{this.state.userData.avgCpm} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average accuracy:</Text>
              <Text style={globalStyles.column}>{this.state.userData.avgAccuracy}%</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average cpm (10 games):</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastAvgCpm} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average accuracy (10 games):</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastAvgAccuracy}%</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Games won:</Text>
              <Text style={globalStyles.column}>{this.state.userData.gamesWon}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Best result:</Text>
              <Text style={globalStyles.column}>{this.state.userData.bestResult} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Last game:</Text>
              <Text style={globalStyles.column}>{moment(this.state.userData.lastPlayed).format('HH:mm, D MMMM, YYYY')}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Last game:</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastScore} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Accuracy of last game:</Text>
              <Text style={globalStyles.column}>{this.state.userData.lastAccuracy}%</Text>
            </View>
            {this.state.userData.firstRaceData &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>First game:</Text>
              <Text style={globalStyles.column}>{this.state.userData.firstRaceData.racePlayers[0].cpm} cpm</Text>
            </View>
            }
            {this.state.userData.firstRaceData &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>First game:</Text>
              <Text
                style={globalStyles.column}>{moment(this.state.userData.firstRaceData.date).format('HH:mm, D MMMM, YYYY')}</Text>
            </View>
            }
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={[globalStyles.normalText, { color: 'red' }]}>*Data may not update instantly after the
              race.</Text>
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={() => this.props.navigation.navigate('PersonalCharts')}
              title='Show charts'
              color='#841584'
            />
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.handleSignOut}
              title='Sign out'
              color='#841584'
            />
          </View>
        </ScrollView>}
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
      </LinearGradient>
    )
  }
}
