import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import firebase from 'firebase'
import SignIn from './SignIn'
import WebAPI from '../WebAPI'

export default class PersonalPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      authenticated: false
    }
    this.handleSignOut = this.handleSignOut.bind(this)
    this.updateStatistics = this.updateStatistics.bind(this)
  }

  updateStatistics (user) {
    return Promise.all([
      WebAPI.getRaceCount(user.uid),
      WebAPI.getAverageCpm(user.uid),
      WebAPI.getLatestAverageCpm(user.uid),
      WebAPI.getLastPlayedGame(user.uid)
    ]).then((results) => {
      console.log(results)
      this.setState({
        totalRaces: results[0].result,
        avgCpm: results[1].result.avg,
        lastAvgCpm: results[2].result,
        lastPlayed: results[3].result
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
      return (
        <View style={styles.container}>
          <View style={styles.signOutButton}>
            <Button title='Sign out' onPress={this.handleSignOut} />
          </View>
          <View style={styles.row}>
            <Text>UID:</Text>
            <Text>{this.state.user.uid}</Text>
          </View>
          <View style={styles.row}>
            <Text>Total races:</Text>
            <Text>{this.state.totalRaces}</Text>
          </View>
          <View style={styles.row}>
            <Text>Average CPM:</Text>
            <Text>{this.state.avgCpm}</Text>
          </View>
          <View style={styles.row}>
            <Text>Average CPM for last 10 games:</Text>
            <Text>{this.state.lastAvgCpm}</Text>
          </View>
          <View style={styles.row}>
            <Text>Last played:</Text>
            <Text>{this.state.lastPlayed}</Text>
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  signOutButton: {
    flex: 0.1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  row: {
    flex: 0.1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
