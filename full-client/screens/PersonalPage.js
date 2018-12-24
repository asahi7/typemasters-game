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
  }

  componentDidMount () {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log(user)
        // TODO(aibek): the race count is fetched only on user's state change BUG
        WebAPI.getRaceCount(user.uid).then((result) => {
          this.setState({
            user,
            authenticated: true,
            totalRaces: result.result
          })
        })
      } else {
        this.setState({
          user: null,
          authenticated: false
        })
        this.props.navigation.navigate('SignIn')
      }
    })
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
