import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import firebase from 'firebase'
import SignIn from './SignIn'

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
    if (this.state.authenticated === false) {
      return <SignIn navigation={this.props.navigation} />
    } else {
      return (
        <View style={styles.container}>
          <Text>Hello {this.state.user.uid}</Text>
          <Button title='Sign out' onPress={this.handleSignOut} />
        </View>
      )
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
