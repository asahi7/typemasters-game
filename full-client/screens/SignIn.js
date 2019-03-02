import React from 'react'
import { StyleSheet, Text, TextInput, Button, View } from 'react-native'
import firebase from 'firebase'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'

export default class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      errorMessage: null
    }
    this.handleSignIn = this.handleSignIn.bind(this)
  }

  handleSignIn () {
    const { email, password } = this.state
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((authInfo) => {
        return WebAPI.createUserIfNotExists(authInfo.user.email, authInfo.user.uid)
      })
      .then(() => {
        this.props.navigation.navigate('PersonalPage')
      })
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  render () {
    return (
      <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={styles.header}>
            Sign In
          </Text>
        </View>
        {this.state.errorMessage &&
        <Text style={{ color: 'red' }}>
          {this.state.errorMessage}
        </Text>}
        <TextInput
          style={styles.textInput}
          autoCapitalize='none'
          placeholder='Email'
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize='none'
          placeholder='Password'
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={{ marginTop: 10 }}>
          <Button
            onPress={this.handleSignIn}
            title='Sign in'
            color='#841584'
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <Button
            onPress={() => this.props.navigation.navigate('SignUp')}
            title="Don't have an account? Sign Up"
            color='#841584'
          />
        </View>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
    paddingLeft: 2,
    paddingRight: 2
  }
})
