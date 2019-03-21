import React from 'react'
import { StyleSheet, Text, TextInput, Button, View, NetInfo } from 'react-native'
import firebase from 'firebase'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Commons from '../Commons'
import globalStyles from '../styles'
import DropdownAlert from 'react-native-dropdownalert'

export default class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      errorMessage: null
    }
    this.handleSignIn = this.handleSignIn.bind(this)
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

  handleSignIn () {
    const { email, password } = this.state
    if (this.online) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((authObj) => {
          console.log('Signed in')
          if (authObj.user && !authObj.user.emailVerified) {
            this.props.navigation.navigate('EmailVerificationPage')
          } else if (authObj.user) {
            WebAPI.createUserIfNotExists(authObj.user.email, authObj.user.uid).then(() => {
              this.props.navigation.navigate('PersonalPage')
            }).catch(error => {
              console.log(error)
            })
          }
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
        <View style={globalStyles.normalButton}>
          <Button
            onPress={this.handleSignIn}
            title='Sign in'
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => this.props.navigation.navigate('SignUp')}
            title="Don't have an account? Sign Up"
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => this.props.navigation.navigate('ForgotPassword')}
            title='Forgot password?'
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
