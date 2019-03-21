import React from 'react'
import { StyleSheet, Text, TextInput, Button, View, NetInfo } from 'react-native'
import firebase from 'firebase'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import DropdownAlert from 'react-native-dropdownalert'

export default class SignUp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      errorMessage: null
    }
    this.handleSignUp = this.handleSignUp.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
  }

  async componentDidMount () {
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('User is ' + (isConnected ? 'online' : 'offline'))
      if (!isConnected) {
        this.online = false
      } else {
        this.online = true
      }
    })
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  componentWillUnmount () {
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', 'Success', 'Back online')
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', 'Warning', 'No internet connection')
    }
  }

  handleSignUp () {
    if (this.online) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password).then((authObj) => {
          authObj.user.sendEmailVerification()
        })
        .catch(error => this.setState({ errorMessage: error.message }))
    } else {
      this.dropdown.alertWithType('warn', 'Warning', 'No internet connection. Please try later')
    }
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
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
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
