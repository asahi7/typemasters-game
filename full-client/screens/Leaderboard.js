import React from 'react'
import { LinearGradient } from 'expo'
import { View, Text, AsyncStorage, ScrollView, NetInfo } from 'react-native'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import Commons from '../Commons'
import globalStyles from '../styles'
import moment from 'moment'
import DropdownAlert from 'react-native-dropdownalert'

export default class Leaderboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      textLanguage: null,
      loading: true,
      data: {
        bestResults: [],
        bestAvgResults: [],
        bestTodayResults: []
      }
    }
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
    if (this.online) {
      this.getApiDataOnline()
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('leaderboard-data').then((value) => {
      if (!value) {
        this.setState({
          data: {
            bestResults: [],
            bestAvgResults: [],
            bestTodayResults: []
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
    return Promise.all([
      WebAPI.getBestResults(this.state.textLanguage),
      WebAPI.getBestAvgResults(this.state.textLanguage),
      WebAPI.getBestTodayResults(this.state.textLanguage)
    ]).then((results) => {
      data = {
        bestResults: results[0],
        bestAvgResults: results[1],
        bestTodayResults: results[2]
      }
    }).then(() => {
      return AsyncStorage.setItem('leaderboard-data', JSON.stringify(data)).then(() => {
        this.setState({
          data
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
      this.getApiDataOnline()
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
      await AsyncStorage.setItem('textLanguage', 'en')
    } else {
      this.setState({
        textLanguage: textLanguage
      })
    }
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            Leaderboard
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>Best Today Results By CPM</Text>
            {this.state.data.bestTodayResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname}</Text>
                  <Text style={globalStyles.column}>{result.user.country}</Text>
                  <Text style={globalStyles.column}>{result.cpm}</Text>
                </View>
              )
            })}
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>Best Average Results By CPM</Text>
            {this.state.data.bestAvgResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname}</Text>
                  <Text style={globalStyles.column}>{result.user.country}</Text>
                  <Text style={globalStyles.column}>{result.avg}</Text>
                </View>
              )
            })}
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>Best Results By CPM</Text>
            {this.state.data.bestResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname}</Text>
                  <Text style={globalStyles.column}>{result.user.country}</Text>
                  <Text style={globalStyles.column}>{result.cpm}</Text>
                  <Text style={globalStyles.column}>{moment(result.race.date).format('HH:mm, D MMMM, YYYY')}</Text>
                </View>
              )
            })}
          </View>
        </ScrollView>
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
      </LinearGradient>
    )
  }
}
