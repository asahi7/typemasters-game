import React from 'react'
import { StyleSheet, Text, TextInput, Button, View } from 'react-native'
import firebase from 'firebase'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Commons from '../Commons'
import globalStyles from '../styles'

export default class SignUp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      errorMessage: null
    }
    this.handleSignUp = this.handleSignUp.bind(this)
  }

  handleSignUp () {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((authInfo) => {
        return WebAPI.createUserIfNotExists(authInfo.user.email, authInfo.user.uid)
      })
      .then(() => this.props.navigation.navigate('PersonalPage'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  render () {
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            Sign Up
          </Text>
        </View>
        {this.state.errorMessage &&
        <Text style={{ color: 'red' }}>
          {this.state.errorMessage}
        </Text>}
        <TextInput
          placeholder='Email'
          autoCapitalize='none'
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          placeholder='Password'
          autoCapitalize='none'
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={globalStyles.normalButton}>
          <Button title='Sign up' color={Commons.buttonColor} onPress={this.handleSignUp} />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => this.props.navigation.navigate('SignIn')}
            title='Already have an account? Sign in'
            color={Commons.buttonColor}
          />
        </View>
      </LinearGradient>
    )
  }
}
const styles = StyleSheet.create({
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
