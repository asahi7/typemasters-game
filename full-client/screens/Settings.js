import React from 'react'
import {
  Text,
  StyleSheet,
  AsyncStorage,
  Picker,
  View,
  TextInput,
  Button,
  Keyboard,
  ScrollView,
  NetInfo,
  Switch
} from 'react-native'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import firebase from 'firebase'
import Commons from '../Commons'
import { globalStyles, FONTS } from '../styles'
import DropdownAlert from 'react-native-dropdownalert'
import i18n from 'i18n-js'

const countryList = ['Select', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua &amp; Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia &amp; Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Cook Islands', 'Costa Rica',
  'Cote D Ivoire', 'Croatia', 'Cruise Ship', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Polynesia', 'French West Indies', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyz Republic', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania',
  'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Namibia', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russia', 'Rwanda', 'Saint Pierre &amp; Miquelon', 'Samoa', 'San Marino', 'Satellite', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'St Kitts &amp; Nevis', 'St Lucia', 'St Vincent', 'St. Lucia', 'Sudan',
  'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor L\'Este', 'Togo', 'Tonga', 'Trinidad &amp; Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Turks &amp; Caicos', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'United States Minor Outlying Islands', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Virgin Islands (US)', 'Yemen', 'Zambia', 'Zimbabwe']

// TODO(aibek): refactor in future to avoid duplication, maybe use template pattern
export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      textLanguage: null,
      loading: true,
      authenticated: null,
      nicknameInput: '',
      errorMessage: null,
      userData: null,
      ratedSwitch: true
    }
    this.textLanguageSelected = this.textLanguageSelected.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.handleNicknameInput = this.handleNicknameInput.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
    this.countrySelected = this.countrySelected.bind(this)
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this)
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
    this.getApiDataOnline = this.getApiDataOnline.bind(this)
    this.updateTextLanguageState = this.updateTextLanguageState.bind(this)
    this.getRatedSwitchValue = this.getRatedSwitchValue.bind(this)
    this.handleRatedSwitch = this.handleRatedSwitch.bind(this)
  }

  async componentDidMount () {
    await this.updateTextLanguageState()
    await this.getRatedSwitchValue()
    NetInfo.isConnected.fetch().then(isConnected => {
      if (__DEV__) {
        console.log('User is ' + (isConnected ? 'online' : 'offline'))
      }
      if (!isConnected) {
        this.online = false
        this.getPersistentDataOffline().then(() => {
          this.setState({
            loading: false
          })
        })
      } else {
        this.online = true
        this.getApiDataOnline().then(() => {
          this.setState({
            loading: false
          })
        })
      }
    })
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.updateScreen()
      }
    )
  }

  componentWillUnmount () {
    this.willFocusSubscription.remove()
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange
    )
  }

  async updateScreen () {
    if (__DEV__) {
      console.log('Updated screen')
    }
    await this.updateTextLanguageState()
    this.setState({ errorMessage: null })
    if (this.online) {
      this.getApiDataOnline()
    } else {
      this.getPersistentDataOffline()
    }
  }

  getPersistentDataOffline () {
    return AsyncStorage.getItem('settings-userData').then((value) => {
      if (!value) {
        this.setState({
          userData: null
        })
      } else {
        const userData = JSON.parse(value)
        this.setState({
          userData
        })
      }
    })
  }

  getApiDataOnline () {
    let userData = {}
    const user = firebase.auth().currentUser
    if (user && user.emailVerified) {
      return WebAPI.getUserInfo(user.uid).then((result) => {
        userData = {
          nickname: result.nickname,
          country: result.country
        }
      }).then(() => {
        return AsyncStorage.setItem('settings-userData', JSON.stringify(userData)).then(() => {
          this.setState({
            userData,
            authenticated: true,
            loading: false
          })
        })
      }).catch((error) => {
        if (__DEV__) {
          console.log(error)
        }
        throw error
      })
    } else {
      this.setState({
        authenticated: false,
        loading: false
      })
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', i18n.t('common.success'), i18n.t('common.backOnline'))
      this.getApiDataOnline()
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', i18n.t('common.warning'), i18n.t('common.noInternet'))
    }
  }

  async updateTextLanguageState () {
    const textLanguage = await AsyncStorage.getItem('textLanguage')
    if (__DEV__) {
      console.log('Language ' + textLanguage)
    }
    if (!textLanguage) {
      this.setState({
        textLanguage: 'en'
      })
      await AsyncStorage.setItem('textLanguage', 'en')
    } else {
      this.setState({
        textLanguage: textLanguage.toLowerCase()
      })
    }
  }

  async getRatedSwitchValue () {
    const value = await AsyncStorage.getItem('ratedSwitchValue')
    if (__DEV__) {
      console.log('Rated switch value ' + value)
    }
    if (!value) {
      this.setState({
        ratedSwitch: true
      })
      await AsyncStorage.setItem('ratedSwitchValue', 'true')
    } else {
      this.setState({
        ratedSwitch: (value === 'true')
      })
    }
  }

  saveSettings () {
    this.setState({ errorMessage: null })
    AsyncStorage.setItem('textLanguage', this.state.textLanguage)
    AsyncStorage.setItem('ratedSwitchValue', this.state.ratedSwitch === true ? 'true' : 'false')
    if (this.online) {
      if (this.state.authenticated) {
        const nicknameInput = this.state.nicknameInput
        if (nicknameInput.length !== 0) {
          WebAPI.saveNickname(this.state.nicknameInput).then(() => {
            this.setState({
              userData: {
                ...this.state.userData,
                nickname: nicknameInput
              }
            })
          }).catch((error) => {
            // TODO(aibek): add i18n
            if (error.message === 'Validation Error') {
              this.setState({ errorMessage: error.err[0].msg + ' in ' + error.err[0].param })
              return
            }
            this.setState({ errorMessage: error.message })
          })
        }
        // TODO(aibek): might be unnecessary call when no change happens
        if (this.state.userData.country !== 'Select' && this.state.userData.country) {
          WebAPI.saveCountry(this.state.userData.country).catch(error => {
            if (__DEV__) {
              console.log(JSON.stringify(error))
            }
            // TODO(aibek): add i18n
            if (error.message === 'Validation Error') {
              this.setState({ errorMessage: error.err[0].msg + ' in ' + error.err[0].param })
              return
            }
            this.setState({ errorMessage: error.message })
          })
        }
        this.setState({ nicknameInput: '' })
      }
    } else {
      this.dropdown.alertWithType('warn', i18n.t('common.warning'), i18n.t('settings.saveSettingsOffline'))
    }
    Keyboard.dismiss()
  }

  textLanguageSelected (textLanguage) {
    this.setState({ textLanguage })
  }

  countrySelected (itemValue) {
    this.setState({
      userData: {
        ...this.state.userData,
        country: itemValue
      }
    })
  }

  handleNicknameInput (input) {
    this.setState({
      nicknameInput: input
    })
  }

  handleRatedSwitch (value) {
    this.setState({
      ratedSwitch: value
    })
  }

  render () {
    if (this.state.loading) return <Loading />
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t('settings.header')}
          </Text>
        </View>
        {!this.state.userData &&
        <View><Text style={globalStyles.tableHeader}>{i18n.t('common.noData')}</Text></View>}
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }} keyboardShouldPersistTaps={'always'}>
          {this.state.userData && <View>
            {this.state.errorMessage &&
            <Text style={{ color: 'red' }}>
              {this.state.errorMessage}
            </Text>
            }
            <View style={{ marginTop: 10 }}>
              {this.state.authenticated &&
              <View style={globalStyles.row}>
                <Text style={globalStyles.column}>{i18n.t('settings.yourNickname')}:</Text>
                <Text
                  style={globalStyles.column}>{this.state.userData.nickname ? this.state.userData.nickname : i18n.t('settings.notSpecified')}</Text>
              </View>
              }
              {this.state.authenticated &&
              <View style={globalStyles.row}>
                <Text style={globalStyles.column}>{i18n.t('settings.changeNickname')}:</Text>
                <View style={globalStyles.column}>
                  <TextInput
                    style={styles.textInput}
                    autoCapitalize='none'
                    placeholder={i18n.t('settings.yourNicknameInput')}
                    onChangeText={this.handleNicknameInput}
                    value={this.state.nicknameInput}
                  />
                </View>
              </View>
              }
              {this.state.authenticated &&
              <View style={globalStyles.row}>
                <Text style={globalStyles.column}>{i18n.t('common.country')}:</Text>
                <Picker selectedValue={this.state.userData.country ? this.state.userData.country : 'Select'}
                  style={[{ width: 150, height: 100 }, styles.column]}
                  itemStyle={{ height: 100, fontSize: FONTS.TABLE_HEADER_FONT }}
                  onValueChange={this.countrySelected}>
                  {countryList.map((country) => {
                    return <Picker.Item value={country} label={country} key={country} />
                  })}
                </Picker>
              </View>
              }
            </View>
          </View>}
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>{i18n.t('settings.typingLanguage')}:</Text>
            {this.state.textLanguage &&
            <Picker selectedValue={this.state.textLanguage}
              prompt={i18n.t('settings.selectTypingLanguage')}
              style={[{ width: 150, height: 100 }, styles.column]}
              itemStyle={{ height: 100, fontSize: FONTS.TABLE_HEADER_FONT }}
              onValueChange={this.textLanguageSelected}>
              <Picker.Item value='ar' label='Arabic' />
              <Picker.Item value='en' label='English' />
              <Picker.Item value='fr' label='French' />
              <Picker.Item value='de' label='German' />
              <Picker.Item value='kz' label='Kazakh' />
              <Picker.Item value='ko' label='Korean' />
              <Picker.Item value='pt' label='Portuguese' />
              <Picker.Item value='ru' label='Russian' />
              <Picker.Item value='es' label='Spanish' />
              <Picker.Item value='tr' label='Turkish' />
            </Picker>
            }
          </View>
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>{i18n.t('settings.ratedSwitch')}:</Text>
            <Switch onValueChange={this.handleRatedSwitch} value={this.state.ratedSwitch} />
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.saveSettings}
              title={i18n.t('settings.save')}
              color={Commons.buttonColor}
            />
          </View>
        </ScrollView>
        <DropdownAlert ref={(ref) => { this.dropdown = ref }} />
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
