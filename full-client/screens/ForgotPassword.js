import React from 'react'
import { Text, Button, View, TextInput, StyleSheet } from 'react-native'
import firebase from 'firebase'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import Loading from './Loading'
import DropdownAlert from 'react-native-dropdownalert'

export default class ForgotPassword extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: ''
    }
    this.sendResetLink = this.sendResetLink.bind(this)
  }

  sendResetLink () {
    const auth = firebase.auth()
    auth.sendPasswordResetEmail(this.state.email).then(() => {
      this.dropdown.alertWithType('info', 'Info', 'The link was successfully sent')
    }).catch((error) => {
      // TODO(aibek): handle better
      this.dropdown.alertWithType('error', 'Error', 'Something is not correct. Please try again')
      console.log(error)
    })
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            Password Reset Page
          </Text>
        </View>
        <Text style={globalStyles.normalText}>Input your email and we will send you the reset link</Text>
        <TextInput
          style={styles.textInput}
          autoCapitalize='none'
          placeholder='Email'
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <View style={globalStyles.normalButton}>
          <Button
            onPress={this.sendResetLink}
            title='Reset password'
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => { this.props.navigation.navigate('SignIn') }}
            title='Return to sign in page'
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
