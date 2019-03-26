import React from 'react'
import { View, Text, AsyncStorage, ScrollView, NetInfo } from 'react-native'
import firebase from 'firebase'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import PureChart from 'react-native-pure-chart'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'

export default class PersonalCharts extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      data: []
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
    return AsyncStorage.getItem('personalCharts-data').then((value) => {
      if (!value) {
        this.setState({
          data: []
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
    return WebAPI.getAllCpmHistory(user.uid, this.state.textLanguage).then(({ result }) => {
      data = result.map((res) => {
        return {
          x: res.date,
          y: +res.cpm
        }
      })
    }).then(() => {
      return AsyncStorage.setItem('personalCharts-data', JSON.stringify(data)).then(() => {
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
            {i18n.t('personalCharts.header')}
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>{i18n.t('personalCharts.last100Days')}</Text>
            <PureChart data={this.state.data} type='line' />
          </View>
        </ScrollView>
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
      </LinearGradient>
    )
  }
}
