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
    this.updateRaceCount = this.updateRaceCount.bind(this)
  }

  updateRaceCount (user) {
    return WebAPI.getRaceCount(user.uid).then((result) => {
      this.setState({
        totalRaces: result.result
      })
    })
  }

  componentDidMount () {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        await this.updateRaceCount(user)
        this.setState({
          user,
          authenticated: true
        })
        console.log(user)
      } else {
        this.setState({
          user: null,
          authenticated: false
        })
        this.props.navigation.navigate('SignIn')
      }
    })

    // TODO(aibek): do we have to remove listener or it is removed automatically
    // On each tap of Personal Page, it will fetch an updated data from API
    this.props.navigation.addListener(
      'willFocus',
      () => {
        if (this.state.user) {
          this.updateRaceCount(this.state.user)
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
