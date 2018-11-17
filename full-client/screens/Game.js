import React from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import firebase from 'firebase'

export default class Game extends React.Component {
  componentDidMount () {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
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
