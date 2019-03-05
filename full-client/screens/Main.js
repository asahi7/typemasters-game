import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo'
import globalStyles from '../styles'
import Commons from '../Commons'
import WebAPI from '../WebAPI'
import Loading from './Loading'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      gamesPlayedCnt: null,
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
      WebAPI.countGamesPlayedToday()
    ]).then((results) => {
      this.setState({
        gamesPlayedCnt: results[0].result,
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
        <View style={{ marginTop: 20 }}>
          <Text style={globalStyles.tableHeader}>Today Played Games: {this.state.gamesPlayedCnt}</Text>
        </View>
        {/* TODO(aibek): fill out last played games from API */}
        <View style={{ marginTop: 20 }}>
          <Text style={globalStyles.tableHeader}>Last Played</Text>
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>aibek</Text>
            <Text style={globalStyles.column}>210 cpm</Text>
            <Text style={globalStyles.column}>21 ms ago</Text>
          </View>
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>aibek</Text>
            <Text style={globalStyles.column}>210 cpm</Text>
            <Text style={globalStyles.column}>21 ms ago</Text>
          </View>
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>aibek</Text>
            <Text style={globalStyles.column}>210 cpm</Text>
            <Text style={globalStyles.column}>21 ms ago</Text>
          </View>
        </View>
        {/* TODO(aibek): add link to settings for language */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={globalStyles.normalText}>Choose your typing language and</Text>
          <TouchableOpacity style={styles.playButton} onPress={this.handlePlayPressed}>
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>
        </View>
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
