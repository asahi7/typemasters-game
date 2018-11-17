import React from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import firebase from 'firebase'
import io from 'socket.io-client'

export default class Game extends React.Component {
  constructor (props) {
    super(props)
    this.setSocketBehavior = this.setSocketBehavior.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  setSocketBehavior (idToken) {
    const socket = io.connect('http://10.64.128.209:3000', { reconnect: true })
    socket.on('connect', function () {
      socket.emit('authentication', { token: idToken })
      socket.on('authenticated', function () {
        console.log('Asking for a new game..')
        socket.emit('newgame')

        socket.on('gamestarted', function (data) {
          console.log(data.msg)
          console.log(data)
        })

        socket.on('gamedata', function (data) {
          console.log(data)
        })

        socket.on('gameended', function (msg) {
          console.log('game ended')
          console.log(msg)
        })
      })
    })
  }

  componentWillMount () {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
      console.log(idToken)
      this.setSocketBehavior(idToken)
    }).catch(function (error) {
      console.log(error) // TODO(aibek): handle better
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
    return (
      <View style={styles.container}>
        {/* TODO(aibek): fetch text from database */}
        <Text>Hello</Text>
        <TextInput
          style={{ height: 40 }}
          placeholder='Start typing here..'
          onChangeText={(text) => this.setState({ text })}
        />
        <Button title='Sign out' onPress={this.handleSignOut} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
