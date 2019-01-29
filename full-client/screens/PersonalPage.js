import React from 'react'
import { View, Text, StyleSheet, Button, AsyncStorage, ScrollView } from 'react-native'
import firebase from 'firebase'
import SignIn from './SignIn'
import WebAPI from '../WebAPI'
import { LinearGradient } from 'expo'

export default class PersonalPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      authenticated: false,
      language: null
    }
    this.handleSignOut = this.handleSignOut.bind(this)
    this.updateStatistics = this.updateStatistics.bind(this)
  }

  updateStatistics (user) {
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
        WebAPI.getRaceCount(user.uid, this.state.language),
        // TODO(aibek): average is not fetched
        WebAPI.getAverageCpm(user.uid, this.state.language),
        WebAPI.getLatestAverageCpm(user.uid, this.state.language),
        WebAPI.getLastPlayedGame(user.uid, this.state.language),
        // TODO(aibek): best result is not fetched
        WebAPI.getBestResult(user.uid, this.state.language),
        WebAPI.getGamesWon(user.uid, this.state.language),
        WebAPI.getFirstRace(user.uid, this.state.language),
        WebAPI.getUserInfo(user.uid),
        WebAPI.getLastScore(user.uid, this.state.language)
      ]).then((results) => {
        this.setState({
          // TODO(aibek): what if null
          totalRaces: results[0].result,
          avgCpm: results[1].result.avg,
          lastAvgCpm: results[2].result,
          lastPlayed: results[3].result,
          bestResult: results[4].result,
          gamesWon: results[5].result,
          firstRaceData: results[6].result,
          userInfo: results[7],
          lastScore: results[8].result
        })
      })
    })
  }

  componentDidMount () {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        await this.updateStatistics(user)
        this.setState({
          user,
          authenticated: true
        })
      } else {
        this.setState({
          user: null,
          authenticated: false
        })
        console.log('not logged')
        this.props.navigation.navigate('SignIn')
      }
    })

    // TODO(aibek): do we have to remove listener or it is removed automatically
    // On each tap of Personal Page, it will fetch an updated data from API
    this.props.navigation.addListener(
      'willFocus',
      () => {
        if (this.state.user) {
          this.updateStatistics(this.state.user)
        }
      }
    )
  }

  handleSignOut () {
    // TODO(aibek): remove unnecessary things
    firebase.auth().signOut().then(function () {
      console.log('Signed out')
    }, function (error) {
      console.log(error)
    })
  }

  render () {
    if (this.state.authenticated === false) {
      return <SignIn navigation={this.props.navigation} />
    } else {
      // TODO(aibek): add conditional rendering to everything
      return (
        <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
          <View style={{ marginTop: 30 }}>
            <Text style={styles.header}>
              Personal Page
            </Text>
          </View>
          <ScrollView style={{ flex: 1, marginTop: 10, marginBottom: 10 }}>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.tableHeader}>General</Text>
              <View style={styles.row}>
                <Text style={styles.column}>uid</Text>
                <Text style={styles.column}>{this.state.user.uid}</Text>
              </View>
              {this.state.userInfo.email &&
              <View style={styles.row}>
                <Text style={styles.column}>email</Text>
                <Text style={styles.column}>{this.state.userInfo.email}</Text>
              </View>
              }
              <View style={styles.row}>
                <Text style={styles.column}>total games</Text>
                <Text style={styles.column}>{this.state.totalRaces}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>average cpm</Text>
                <Text style={styles.column}>{this.state.avgCpm}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>average cpm for last 10 games</Text>
                <Text style={styles.column}>{this.state.lastAvgCpm}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>first game data</Text>
                <Text style={styles.column}>{this.state.firstRaceData.racePlayers[0].cpm} cpm</Text>
                <Text style={styles.column}>{this.state.firstRaceData.date}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>last game</Text>
                <Text style={styles.column}>{this.state.lastPlayed}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>last score</Text>
                <Text style={styles.column}>{this.state.lastScore}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>games won</Text>
                <Text style={styles.column}>{this.state.gamesWon}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.column}>best result</Text>
                <Text style={styles.column}>{this.state.bestResult} cpm</Text>
              </View>
            </View>
            <View style={styles.signOutButton}>
              <Button title='Sign out' onPress={this.handleSignOut} />
            </View>
          </ScrollView>
        </LinearGradient>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  header: {
    fontSize: 30,
    color: '#2E322F',
    letterSpacing: 2,
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: '700'
  },
  tableHeader: {
    fontSize: 20,
    color: '#56ABBD',
    letterSpacing: 2,
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: '700'
  },
  row: {
    flex: 0.1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  },
  column: {
    padding: 5,
    color: '#56ABBD',
    fontSize: 15
  },
  signOutButton: {
    marginTop: 10,
    flex: 0.1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
