import React from 'react'
import { Text, StyleSheet, AsyncStorage, Picker, View, TextInput, Button, Keyboard, ScrollView } from 'react-native'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import firebase from 'firebase'
import Commons from '../Commons'
import globalStyles from '../styles'

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
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            Settings
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }} keyboardShouldPersistTaps={'always'}>
          {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>
          }
          <View style={{ marginTop: 10 }}>
            {this.state.authenticated &&
              <View style={globalStyles.row}>
                <Text style={globalStyles.column}>Your nickname:</Text>
                <Text style={globalStyles.column}>{this.state.nickname ? this.state.nickname : 'Not specified'}</Text>
              </View>
            }
            {this.state.authenticated &&
              <View style={globalStyles.row}>
                <Text style={globalStyles.column}>Change nickname:</Text>
                <View style={globalStyles.column}>
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
            {this.state.userInfo && this.state.userInfo.nickname &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Nickname:</Text>
              <Text style={globalStyles.column}>{this.state.userInfo.nickname}</Text>
            </View>
            }
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Typing language:</Text>
              {this.state.language &&
              <Picker selectedValue={this.state.language}
                style={[{ width: 150 }, styles.column]}
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
            </View>
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.saveSettings}
              title='Save'
              color={Commons.buttonColor}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  textInput: {
    width: 100,
    paddingLeft: 2,
    paddingRight: 2
  },
  column: {
    marginLeft: 10,
    marginRight: 10
  }
})
