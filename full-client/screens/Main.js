import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo'
import globalStyles from '../styles'
import Commons from '../Commons'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import moment from 'moment'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      gamesPlayedCnt: null,
      lastGames: [],
      loading: true
    }
    this.handlePlayPressed = this.handlePlayPressed.bind(this)
  }

  async componentDidMount () {
    await this.updateStatistics()
    this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({ loading: true })
        this.updateStatistics()
      }
    )
  }

  updateStatistics () {
    return Promise.all([
      WebAPI.countGamesPlayedToday(),
      WebAPI.getLastPlayedGames()
    ]).then((results) => {
      this.setState({
        gamesPlayedCnt: results[0].result,
        lastGames: results[1].result,
        loading: false
      })
    }).catch((error) => {
      console.log(error)
    })
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
              Compete With Others And Increase Your Typing Speed!
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>Today Played Games: {this.state.gamesPlayedCnt}</Text>
          </View>
          {/* TODO(aibek): fill out last played games from API */}
          <View style={{ marginTop: 20 }}>
            <Text style={globalStyles.tableHeader}>Last Played</Text>
            {
              this.state.lastGames.map((result, i) => {
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
            <Text style={globalStyles.normalText}>Choose your typing language and</Text>
            <TouchableOpacity style={styles.playButton} onPress={this.handlePlayPressed}>
              <Text style={styles.playButtonText}>PLAY</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    width: 150,
    height: 100,
    marginTop: 10,
    backgroundColor: '#ed4747',
    borderRadius: 10
  },
  playButtonText: {
    color: '#fff',
    fontSize: 40
  }
})
