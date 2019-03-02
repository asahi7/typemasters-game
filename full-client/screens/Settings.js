import React from 'react'
import { Text, StyleSheet, AsyncStorage, Picker, View, TextInput, Button, Keyboard } from 'react-native'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import firebase from 'firebase'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      language: null,
      nickname: null,
      loading: true,
      authenticated: null,
      nicknameInput: '',
      errorMessage: null
    }
    this.languageSelected = this.languageSelected.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.handleNicknameInput = this.handleNicknameInput.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
  }

  componentWillMount () {
    this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({ loading: true })
        this.updateScreen()
      }
    )
  }

  updateScreen () {
    this.setState({ errorMessage: null })
    AsyncStorage.getItem('textLanguage').then((value) => {
      if (!value) {
        this.setState({
          language: 'EN'
        })
      } else {
        this.setState({
          language: value
        })
      }
    }).then(() => {
      const { currentUser } = firebase.auth()
      if (currentUser) {
        WebAPI.getNickname(currentUser.uid).then((result) => {
          this.setState({ nickname: result.nickname, loading: false, authenticated: true })
        })
      } else {
        this.setState({ loading: false, authenticated: false })
      }
    })
  }

  saveSettings () {
    AsyncStorage.setItem('textLanguage', this.state.language)
    const nicknameInput = this.state.nicknameInput
    WebAPI.saveNickname(this.state.nicknameInput).then(() => {
      this.setState({ nickname: nicknameInput })
    }).catch(err => {
      console.log(err.message)
      this.setState({ errorMessage: err.message })
    })
    this.setState({ nicknameInput: '' })
    Keyboard.dismiss()
  }

  languageSelected (itemValue) {
    this.setState({ language: itemValue })
  }

  handleNicknameInput (input) {
    this.setState({
      nicknameInput: input
    })
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={styles.header}>
            Settings
          </Text>
        </View>
        {this.state.errorMessage &&
        <Text style={{ color: 'red' }}>
          {this.state.errorMessage}
        </Text>}
        {this.state.authenticated &&
        <View>
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={styles.normalText}>Your
              nickname: {this.state.nickname ? this.state.nickname : 'Not specified'}</Text>
          </View>
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <TextInput
              style={styles.textInput}
              autoCapitalize='none'
              placeholder='Your nickname'
              onChangeText={this.handleNicknameInput}
              value={this.state.nicknameInput}
            />
          </View>
        </View>
        }
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={styles.normalText}>Select your typing language</Text>
        </View>
        {this.state.language &&
        <Picker selectedValue={this.state.language}
          style={{ height: 50, width: 200 }}
          onValueChange={this.languageSelected}>
          <Picker.Item value='ZH' label='Chinese' />
          <Picker.Item value='EN' label='English' />
          <Picker.Item value='FR' label='French' />
          <Picker.Item value='DE' label='German' />
          <Picker.Item value='HI' label='Hindi' />
          <Picker.Item value='KZ' label='Kazakh' />
          <Picker.Item value='KO' label='Korean' />
          <Picker.Item value='RU' label='Russian' />
          <Picker.Item value='ES' label='Spanish' />
          <Picker.Item value='TR' label='Turkish' />
        </Picker>
        }
        <Button
          onPress={this.saveSettings}
          title='Save'
          color='#841584'
        />
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
  normalText: {
    fontSize: 15,
    color: '#2E322F',
    letterSpacing: 2,
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: '700'
  },
  textInput: {
    height: 40,
    width: '60%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 2,
    paddingRight: 2
  }
})
