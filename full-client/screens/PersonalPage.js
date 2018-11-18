import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import firebase from 'firebase'

export default class PersonalPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      authenticated: null
    }
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  componentWillMount () {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          user,
          authenticated: true
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
    if (this.state.authenticated === true) {
      return (
        <View style={styles.container}>
          <Text>Hello {this.state.user.uid}</Text>
          <Button title='Sign out' onPress={this.handleSignOut} />
        </View>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
