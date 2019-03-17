import React from 'react'
import { View, Text, ActivityIndicator, AsyncStorage } from 'react-native'
import firebase from 'firebase'
import globalStyles from '../styles'

export default class AuthLoading extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentDidMount () {
    // Every time user's log in state changes, this will be triggered.
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        AsyncStorage.clear()
      }
      this.props.navigation.navigate(user ? 'PersonalPage' : 'Auth')
    })
  }

  render () {
    if (this.state.loading) {
      return (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text>Loading</Text>
        </View>
      )
    }
  }
}
