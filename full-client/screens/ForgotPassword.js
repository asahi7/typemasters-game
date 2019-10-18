import React from 'react'
import {
  Text,
  Button,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import firebase from 'firebase'
import Commons from '../Commons'
import globalStyles from '../styles'
import Loading from './Loading'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'

export default class ForgotPassword extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
    }
    this.sendResetLink = this.sendResetLink.bind(this)
  }

  sendResetLink () {
    const auth = firebase.auth()
    auth.sendPasswordResetEmail(this.state.email).then(() => {
      this.dropdown.alertWithType(
        'info',
        i18n.t('common.info'),
        i18n.t('forgotPassowrd.linkSent'),
      )
    }).catch(error => {
      // TODO(aibek): handle better
      this.dropdown.alertWithType(
        'error',
        i18n.t('common.error'),
        i18n.t('forgotPassword.somethingWrong'),
      )
      if (__DEV__) {
        console.log(error)
      }
      throw error
    })
  }

  render () {
    if (this.state.loading) return <Loading/>
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.inside_container}>
          <Text style={globalStyles.normalText}>
            {i18n.t('forgotPassword.text')}
          </Text>
          <TextInput
            style={globalStyles.commonInformationTextInput}
            autoCapitalize="none"
            placeholder={i18n.t('common.email')}
            onChangeText={email => this.setState({email})}
            value={this.state.email}
          />
          <View style={globalStyles.smallButtonContainer}>
            <TouchableOpacity
              onPress={this.sendResetLink}
            >
              <Text style={globalStyles.smallButton}>{i18n.t(
                'forgotPassword.resetPassword')}</Text>
            </TouchableOpacity>
          </View>
          <DropdownAlert
            ref={ref => {
              this.dropdown = ref
            }}
          />
        </View>
      </View>
    )
  }
}