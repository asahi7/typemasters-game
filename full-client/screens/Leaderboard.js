import React from 'react'
import { LinearGradient } from 'expo'
import { View, Text, AsyncStorage, ScrollView } from 'react-native'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import Commons from '../Commons'
import globalStyles from '../styles'
import moment from 'moment'

export default class Leaderboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      language: null,
      loading: true,
      bestResults: [],
      bestAvgResults: []
    }
    this.updateScreen = this.updateScreen.bind(this)
  }

  async componentDidMount () {
    await this.updateScreen()
    this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({ loading: true })
        this.updateScreen()
      }
    )
  }

  updateScreen () {
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
      return Promise.all([
        WebAPI.getBestResults(this.state.language),
        WebAPI.getBestAvgResults(this.state.language)
      ]).then((results) => {
        this.setState({
          bestResults: results[0],
          bestAvgResults: results[1],
          loading: false
        })
      }).catch((error) => {
        console.log(error)
      })
    })
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
            <Text style={globalStyles.tableHeader}>Best Results By CPM</Text>
            {this.state.bestResults.map((result, i) => {
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
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>Best Average Results By CPM</Text>
            {this.state.bestAvgResults.map((result, i) => {
              return (
                <View style={globalStyles.row} key={i}>
                  <Text style={globalStyles.column}>{result.user.nickname}</Text>
                  <Text style={globalStyles.column}>{result.user.country}</Text>
                  <Text style={globalStyles.column}>{result.avg}</Text>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    )
  }
}
