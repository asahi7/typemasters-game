import React from 'react'
import { LinearGradient } from 'expo'
import { View, Text, AsyncStorage, ScrollView, NetInfo } from 'react-native'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import Commons from '../Commons'
import globalStyles from '../styles'
import moment from 'moment'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'
import _ from 'lodash'

export default class Leaderboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      textLanguage: null,
      loading: true,
      data: {
        bestResults: [],
        bestAvgResults: [],
        bestCpmTodayResults: [],
        bestAccTodayResults: []
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
    if (__DEV__) {
      console.log('Updated screen')
    }
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
            bestCpmTodayResults: [],
            bestAccTodayResults: []
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
      WebAPI.getBestCpmTodayResults(this.state.textLanguage),
      WebAPI.getBestAccTodayResults(this.state.textLanguage)
    ]).then((results) => {
      data = {
        bestResults: results[0],
        bestAvgResults: results[1],
        bestCpmTodayResults: results[2],
        bestAccTodayResults: results[3]
      }
    }).then(() => {
      return AsyncStorage.setItem('leaderboard-data', JSON.stringify(data)).then(() => {
        this.setState({
          data,
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
      this.getApiDataOnline()
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

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t('leaderboard.header')}
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          {!_.isEmpty(this.state.data.bestCpmTodayResults) &&
          <View style={{ marginTop: 10 }}>

            <Text style={globalStyles.tableHeader}>{i18n.t('leaderboard.bestTodayByCpm')}</Text>
            {this.state.data.bestCpmTodayResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname ? result.user.nickname : 'noname'}</Text>
                  <Text
                    style={globalStyles.column}>{result.user.country ? result.user.country : 'not specified'}</Text>
                  <Text style={globalStyles.column}>{result.cpm}</Text>
                </View>
              )
            })}
          </View>
          }
          {!_.isEmpty(this.state.data.bestAccTodayResults) &&
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('leaderboard.bestTodayByAcc')}</Text>
            {this.state.data.bestAccTodayResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname ? result.user.nickname : 'noname'}</Text>
                  <Text style={globalStyles.column}>{result.user.country ? result.user.country : 'not specified'}</Text>
                  <Text style={globalStyles.column}>{result.accuracy}</Text>
                </View>
              )
            })}
          </View>
          }
          {!_.isEmpty(this.state.data.bestAvgResults) &&
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('leaderboard.bestTodayByAvgCpm')}</Text>
            {this.state.data.bestAvgResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname ? result.user.nickname : 'noname'}</Text>
                  <Text style={globalStyles.column}>{result.user.country ? result.user.country : 'not specified'}</Text>
                  <Text style={globalStyles.column}>{Math.round(result.avg)}</Text>
                </View>
              )
            })}
          </View>
          }
          {!_.isEmpty(this.state.data.bestResults) &&
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('leaderboard.bestByCpm')}</Text>
            {this.state.data.bestResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname ? result.user.nickname : 'noname'}</Text>
                  <Text style={globalStyles.column}>{result.user.country ? result.user.country : 'not specified'}</Text>
                  <Text style={globalStyles.column}>{result.cpm}</Text>
                  <Text style={globalStyles.column}>{moment(result.race.date).format('HH:mm, D MMMM, YYYY')}</Text>
                </View>
              )
            })}
          </View>
          }
        </ScrollView>
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
      </LinearGradient>
    )
  }
}
