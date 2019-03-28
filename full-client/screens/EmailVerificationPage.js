import React from 'react'
import { Text, Button, View } from 'react-native'
import firebase from 'firebase'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'
import Loading from './Loading'
import i18n from 'i18n-js'

// TODO(aibek): add offline mode
export default class EmailVerificationPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      loading: true
    }
    this.sendNewLink = this.sendNewLink.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  componentDidMount () {
    this.updateScreen()
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.updateScreen()
      }
    )
  }

  componentWillUnmount () {
    this.willFocusSubscription.remove()
  }

  updateScreen () {
    const user = firebase.auth().currentUser
    this.setState({ user, loading: false })
  }

  sendNewLink () {
    if (this.state.user && !this.state.emailVerified) {
      this.state.user.sendEmailVerification()
    }
  }

  handleSignOut () {
    firebase.auth().signOut().then(function () {
      if (__DEV__) {
        console.log('Signed out')
      }
    }, function (error) {
      if (__DEV__) {
        console.log(error)
      }
    })
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t('emailVerification.header')} {this.state.user.email}
          </Text>
        </View>
        <Text style={globalStyles.normalText}>{i18n.t('emailVerification.text')}</Text>
        <View style={globalStyles.normalButton}>
          <Button
            style={globalStyles.normalButton}
            onPress={() => this.props.navigation.navigate('SignIn')}
            title={i18n.t('common.signIn')}
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={this.sendNewLink}
            title={i18n.t('emailVerification.sendLink')}
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={this.handleSignOut}
            title={i18n.t('emailVerification.signOut')}
            color={Commons.buttonColor}
          />
        </View>
      </LinearGradient>
    )
  }
}
