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
  NetInfo
} from 'react-native'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import firebase from 'firebase'
import Commons from '../Commons'
import globalStyles from '../styles'
import DropdownAlert from 'react-native-dropdownalert'

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
      userData: null
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
  }

  async componentDidMount () {
    await this.updateTextLanguageState()
    NetInfo.isConnected.fetch().then(isConnected => {
      console.log('User is ' + (isConnected ? 'online' : 'offline'))
      if (!isConnected) {
        this.online = false
        this.getPersistentDataOffline().then(() => {
          this.setState({
            loading: false
          })
        })
      } else {
        this.online = true
        this.getApiDataOnline(firebase.auth().currentUser).then(() => {
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
    console.log('update screen!')
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
    if (user) {
      return WebAPI.getUserInfo(user.uid).then((result) => {
        userData = {
          nickname: result.nickname,
          country: result.country
        }
      }).then(() => {
        return AsyncStorage.setItem('settings-userData', JSON.stringify(userData)).then(() => {
          this.setState({
            userData,
            authenticated: true
          })
        })
      }).catch((error) => {
        console.log(error)
      })
    } else {
      this.setState({
        authenticated: false
      })
    }
  }

  handleConnectivityChange (isConnected) {
    if (isConnected) {
      this.online = true
      this.dropdown.alertWithType('success', 'Success', 'Back online')
      this.getApiDataOnline()
    } else {
      this.online = false
      this.dropdown.alertWithType('warn', 'Warning', 'No internet connection')
    }
  }

  async updateTextLanguageState () {
    const textLanguage = await AsyncStorage.getItem('textLanguage')
    console.log('lang ' + textLanguage)
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

  saveSettings () {
    AsyncStorage.setItem('textLanguage', this.state.textLanguage)
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
          }).catch(err => {
            console.log(err.message)
            this.setState({ errorMessage: err.message })
          })
        }
        // TODO(aibek): might be unnecessary call when no change happens
        if (this.state.userData.country !== 'Select') {
          WebAPI.saveCountry(this.state.userData.country).catch(err => {
            console.log(err.message)
            this.setState({ errorMessage: err.message })
          })
        }
        this.setState({ nicknameInput: '' })
      }
    } else {
      this.dropdown.alertWithType('warn', 'Warning', 'No internet connection. Typing laguage successfully updated')
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
              <Text style={globalStyles.column}>{this.state.userData.nickname ? this.state.userData.nickname : 'Not specified'}</Text>
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
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>Typing language:</Text>
              {this.state.textLanguage &&
              <Picker selectedValue={this.state.textLanguage}
                prompt='Select your preferred typing language'
                style={[{ width: 150 }, styles.column]}
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
            {this.state.authenticated &&
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>County:</Text>
              <Picker selectedValue={this.state.userData.country ? this.state.userData.country : 'Select'}
                style={[{ width: 150 }, styles.column]}
                onValueChange={this.countrySelected}>
                {countryList.map((country) => {
                  return <Picker.Item value={country} label={country} key={country} />
                })}
              </Picker>
            </View>
            }
          </View>

          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.saveSettings}
              title='Save'
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
