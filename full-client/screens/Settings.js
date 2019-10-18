import React from 'react'
import {
  Text,
  StyleSheet,
  AsyncStorage,
  Picker,
  View,
  TextInput,
  Keyboard,
  FlatList,
  ScrollView,
  Switch,
} from 'react-native'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import firebase from 'firebase'
import Commons from '../Commons'
import { globalStyles, FONTS } from '../styles'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'
import countryList from '../consts/countryList'
import ConnectionContext from '../context/ConnnectionContext'
import TypingLanguageContext from '../context/TypingLanguageContext'
import { Icon, Header } from 'react-native-elements'
import moment from 'moment'
import _ from 'lodash'
import { prepareFlatListElements, renderItem } from '../utils/utils'

export default React.forwardRef((props, ref) => (
  <TypingLanguageContext.Consumer>
    {typingLanguageState => (
      <ConnectionContext.Consumer>
        {online => (
          <Settings
            {...props}
            typingLanguage={typingLanguageState.typingLanguage}
            changeTypingLanguage={typingLanguageState.changeTypingLanguage}
            online={online}
            ref={ref}
          />
        )}
      </ConnectionContext.Consumer>
    )}
  </TypingLanguageContext.Consumer>
))

// TODO(aibek): refactor in future to avoid duplication, maybe use template pattern
export class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      textLanguage: null,
      loading: true,
      authenticated: null,
      nicknameInput: '',
      errorMessage: null,
      userData: null,
      ratedSwitch: true,
      supportedLangs: null,
    }
    this.textLanguageSelected = this.textLanguageSelected.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.handleNicknameInput = this.handleNicknameInput.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
    this.countrySelected = this.countrySelected.bind(this)
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this)
    this.getApiDataOnline = this.getApiDataOnline.bind(this)
    this.getRatedSwitchValue = this.getRatedSwitchValue.bind(this)
    this.handleRatedSwitch = this.handleRatedSwitch.bind(this)
    this.elementMapper = {
      nickname: {
        key: i18n.t('settings.changeYourNickname'),
        accessorObject: () => this.state,
        valuePath: 'userData.nickname',
        executeIf: () => this.state.authenticated,
        wrapIntoElement: val => {
          // TODO(aibek): make textinput more visible
          return (
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              onChangeText={this.handleNicknameInput}
              placeholder={val}
            />
          )
        },
      },
      country: {
        key: i18n.t('common.country'),
        accessorObject: () => this.state,
        valuePath: 'userData.country',
        defaultValue: 'Select',
        executeIf: () => this.state.authenticated && this.state.userData,
        wrapIntoElement: val => {
          return (
            <Picker
              selectedValue={val}
              style={[
                {
                  width: 150,
                  height: 50,
                  color: "white"
                },
                styles.column,
              ]}
              onValueChange={this.countrySelected}
            >
              {countryList.map(country => {
                return (
                  <Picker.Item value={country} label={country} key={country}/>
                )
              })}
            </Picker>
          )
        },
      },
      typingLanguage: {
        key: i18n.t('settings.typingLanguage'),
        accessorObject: () => this.state,
        defaultValue: () => this.props.typingLanguage,
        valuePath: 'textLanguage',
        executeIf: () => this.state.supportedLangs,
        wrapIntoElement: val => {
          return (
            <Picker
              selectedValue={val}
              prompt={i18n.t('settings.selectTypingLanguage')}
              style={[{width: 150, height: 50, color: "white"}, styles.column]}
              onValueChange={this.textLanguageSelected}
            >
              {this.state.supportedLangs.map((lang, index) => {
                return (
                  <Picker.Item
                    value={lang.value}
                    label={lang.label}
                    key={index}
                  />
                )
              })}
            </Picker>
          )
        },
      },
      ratedSwitch: {
        key: i18n.t('settings.ratedSwitch'),
        accessorObject: () => this.state,
        valuePath: 'ratedSwitch',
        wrapIntoElement: val => {
          // TODO(aibek): make textinput more visible
          return <Switch onValueChange={this.handleRatedSwitch} value={val}/>
        },
      },
    }
  }

  async componentDidMount () {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.updateScreen()
      },
    )
    this.props.navigation.setParams({saveSettings: this.saveSettings})
    await this.getRatedSwitchValue()
    if (__DEV__) {
      console.log('User is ' + (this.props.online ? 'online' : 'offline'))
    }
    if (this.props.online) {
      this.getApiDataOnline().then(() => {
        this.setState({
          loading: false,
        })
      })
    } else {
      this.getPersistentDataOffline().then(() => {
        this.setState({
          loading: false,
        })
      })
    }
  }

  componentWillUnmount () {
    this.willFocusSubscription.remove()
  }

  componentDidUpdate (prevProps, prevState) {
    if (
      prevState.userData !== this.state.userData ||
      prevProps.typingLanguage !== this.props.typingLanguage ||
      prevState.ratedSwitch !== this.state.ratedSwitch ||
      prevState.textLanguage !== this.state.textLanguage ||
      prevState.supportedLangs !== this.state.supportedLangs
    ) {
      const listElements = prepareFlatListElements(this.elementMapper)
      this.setState({
        listElements,
      })
    }
  }

  updateScreen () {
    if (__DEV__) {
      console.log('Settings updated screen')
    }
    this.setState({errorMessage: null})
    if (this.props.online) {
      this.getApiDataOnline()
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('settings-userData').then(value => {
      if (!value) {
        this.setState({
          userData: null,
        })
      } else {
        const userData = JSON.parse(value)
        this.setState({
          userData,
        })
      }
    })
  }

  getApiDataOnline () {
    let userData = {}
    const user = firebase.auth().currentUser
    const promises = []
    promises.push(WebAPI.getSupportedLanguages())
    if (user && user.emailVerified) {
      promises.push(WebAPI.getUserInfo(user.uid))
    } else {
      this.setState({
        authenticated: false,
        loading: false,
      })
    }
    Promise.all(promises).then(results => {
      this.setState({
        supportedLangs: results[0],
      })
      if (results[1]) {
        userData = {
          nickname: results[1].nickname,
          country: results[1].country,
        }
        return AsyncStorage.setItem(
          'settings-userData',
          JSON.stringify(userData),
        ).then(() => {
          this.setState({
            userData,
            authenticated: true,
            loading: false,
          })
        })
      }
    }).catch(error => {
      if (__DEV__) {
        console.log(error)
      }
      throw error
    })
  }

  async getRatedSwitchValue () {
    const value = await AsyncStorage.getItem('ratedSwitchValue')
    if (__DEV__) {
      console.log('Rated switch value ' + value)
    }
    if (!value) {
      this.setState({
        ratedSwitch: true,
      })
      await AsyncStorage.setItem('ratedSwitchValue', 'true')
    } else {
      this.setState({
        ratedSwitch: value === 'true',
      })
    }
  }

  saveSettings () {
    this.setState({errorMessage: null})
    this.props.changeTypingLanguage(this.state.textLanguage)
    AsyncStorage.setItem(
      'ratedSwitchValue',
      this.state.ratedSwitch === true ? 'true' : 'false',
    )
    if (this.props.online) {
      if (this.state.authenticated) {
        const nicknameInput = this.state.nicknameInput
        if (nicknameInput.length !== 0) {
          WebAPI.saveNickname(this.state.nicknameInput).then(() => {
            this.setState({
              userData: {
                ...this.state.userData,
                nickname: nicknameInput,
              },
            })
          }).catch(error => {
            // TODO(aibek): add i18n
            if (error.message === 'Validation Error') {
              this.setState({
                errorMessage: error.err[0].msg + ' in ' + error.err[0].param,
              })
              return
            }
            this.setState({errorMessage: error.message})
          })
        }
        // TODO(aibek): might be unnecessary call when no change happens
        if (
          this.state.userData.country !== 'Select' &&
          this.state.userData.country
        ) {
          WebAPI.saveCountry(this.state.userData.country).catch(error => {
            if (__DEV__) {
              console.log(JSON.stringify(error))
            }
            // TODO(aibek): add i18n
            if (error.message === 'Validation Error') {
              this.setState({
                errorMessage: error.err[0].msg + ' in ' + error.err[0].param,
              })
              return
            }
            this.setState({errorMessage: error.message})
          })
        }
        this.setState({nicknameInput: ''})
      }
    } else {
      this.dropdown.alertWithType(
        'warn',
        i18n.t('common.warning'),
        i18n.t('settings.saveSettingsOffline'),
      )
    }
    Keyboard.dismiss()
  }

  textLanguageSelected (textLanguage) {
    this.setState({textLanguage})
  }

  countrySelected (itemValue) {
    this.setState({
      userData: {
        ...this.state.userData,
        country: itemValue,
      },
    })
  }

  handleNicknameInput (input) {
    this.setState({
      nicknameInput: input,
    })
  }

  handleRatedSwitch (value) {
    this.setState({
      ratedSwitch: value,
    })
  }

  render () {
    if (this.state.loading) return <Loading/>
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.inside_container}>
          <ScrollView
            style={globalStyles.scrollView}
            keyboardShouldPersistTaps={'always'}
          >
            <FlatList data={this.state.listElements} renderItem={renderItem}/>
          </ScrollView>
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

const styles = StyleSheet.create({
  textInput: {
    width: 100,
    paddingLeft: 2,
    paddingRight: 2,
  },
  column: {
    marginLeft: 10,
    marginRight: 10,
  },
})
