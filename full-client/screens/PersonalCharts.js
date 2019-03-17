import React from 'react'
import { View, Text, AsyncStorage, ScrollView } from 'react-native'
import firebase from 'firebase'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import PureChart from 'react-native-pure-chart'

export default class PersonalCharts extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
    this.data = []
    this.updateScreen = this.updateScreen.bind(this)
  }

  async componentDidMount () {
    await this.updateScreen()
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({ loading: true })
        this.updateScreen()
      }
    )
  }

  componentWillUnmount () {
    this.willFocusSubscription.remove()
  }

  // TODO(aibek): make a chart of increasing average cpm
  updateScreen () {
    const user = firebase.auth().currentUser
    return AsyncStorage.getItem('textLanguage').then((value) => {
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
      return WebAPI.getAllCpmHistory(user.uid, this.state.language)
    }).then(({ result }) => {
      this.data = result.map((res) => {
        return {
          x: res.date,
          y: +res.cpm
        }
      })
      this.setState({
        loading: false
      })
    })
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            Personal Charts
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>Last 100 Days</Text>
            <PureChart data={this.data} type='line' />
          </View>
        </ScrollView>
      </LinearGradient>
    )
  }
}
