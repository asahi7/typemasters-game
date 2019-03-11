import React from 'react'
import { View, Text, Button, AsyncStorage, ScrollView } from 'react-native'
import firebase from 'firebase'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import moment from 'moment'

export default class PersonalPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      language: null,
      loading: true
    }
    this.handleSignOut = this.handleSignOut.bind(this)
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
      // This is done because user might not exist on the database and will create it first
      return WebAPI.getUserInfo(user.uid).then((result) => {
        this.setState({ userInfo: result })
      })
    }).then(() => {
      return Promise.all([
        WebAPI.getRaceCount(user.uid, this.state.language),
        WebAPI.getAverageCpm(user.uid, this.state.language),
        WebAPI.getLatestAverageCpm(user.uid, this.state.language),
        WebAPI.getLastPlayedGame(user.uid, this.state.language),
        WebAPI.getBestResult(user.uid, this.state.language),
        WebAPI.getGamesWon(user.uid, this.state.language),
        WebAPI.getFirstRace(user.uid, this.state.language),
        WebAPI.getAverageAccuracy(user.uid, this.state.language),
        WebAPI.getLastAverageAccuracy(user.uid, this.state.language)
      ]).then((results) => {
        this.setState({
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
          lastAvgAccuracy: results[8].result,
          loading: false
        })
      }).catch((error) => {
        console.log(error)
      })
    })
  }

  handleSignOut () {
    firebase.auth().signOut().then(function () {
      console.log('Signed out')
    }, function (error) {
      console.log(error)
    })
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
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>General</Text>
            {this.state.userInfo && this.state.userInfo.nickname &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Nickname:</Text>
              <Text style={globalStyles.column}>{this.state.userInfo.nickname}</Text>
            </View>
            }
            {this.state.userInfo && this.state.userInfo.email &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Email:</Text>
              <Text style={globalStyles.column}>{this.state.userInfo.email}</Text>
            </View>
            }
            {this.state.userInfo && this.state.userInfo.country &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Country:</Text>
              <Text style={globalStyles.column}>{this.state.userInfo.country}</Text>
            </View>
            }
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>UID:</Text>
              <Text style={globalStyles.column}>{this.state.userInfo && this.state.userInfo.uid}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Typing language:</Text>
              <Text style={globalStyles.column}>{this.state.language}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Total games:</Text>
              <Text style={globalStyles.column}>{this.state.totalRaces}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average cpm:</Text>
              <Text style={globalStyles.column}>{this.state.avgCpm} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average accuracy:</Text>
              <Text style={globalStyles.column}>{this.state.avgAccuracy}%</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average cpm (10 games):</Text>
              <Text style={globalStyles.column}>{this.state.lastAvgCpm} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Average accuracy (10 games):</Text>
              <Text style={globalStyles.column}>{this.state.lastAvgAccuracy}%</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Games won:</Text>
              <Text style={globalStyles.column}>{this.state.gamesWon}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Best result:</Text>
              <Text style={globalStyles.column}>{this.state.bestResult} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Last game:</Text>
              <Text style={globalStyles.column}>{moment(this.state.lastPlayed).format('HH:mm, D MMMM, YYYY')}</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Last game:</Text>
              <Text style={globalStyles.column}>{this.state.lastScore} cpm</Text>
            </View>
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Accuracy of last game:</Text>
              <Text style={globalStyles.column}>{this.state.lastAccuracy}%</Text>
            </View>
            { this.state.firstRaceData &&
              <View style={globalStyles.row}>
                <Text style={globalStyles.column}>First game:</Text>
                <Text style={globalStyles.column}>{this.state.firstRaceData.racePlayers[0].cpm} cpm</Text>
              </View>
            }
            { this.state.firstRaceData &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>First game:</Text>
              <Text style={globalStyles.column}>{moment(this.state.firstRaceData.date).format('HH:mm, D MMMM, YYYY')}</Text>
            </View>
            }
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={[globalStyles.normalText, { color: 'red' }]}>*Data may not update instantly after the race.</Text>
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.handleSignOut}
              title='Sign out'
              color='#841584'
            />
          </View>
        </ScrollView>
      </LinearGradient>
    )
  }
}
