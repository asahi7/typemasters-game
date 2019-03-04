import React from 'react'
import { Text, StyleSheet, AsyncStorage, Picker, View, TextInput, Button, Keyboard, ScrollView } from 'react-native'
import { LinearGradient } from 'expo'
import WebAPI from '../WebAPI'
import Loading from './Loading'
import firebase from 'firebase'
import Commons from '../Commons'
import globalStyles from '../styles'

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

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      language: null,
      nickname: null,
      loading: true,
      authenticated: null,
      nicknameInput: '',
      errorMessage: null,
      country: null
    }
    this.languageSelected = this.languageSelected.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.handleNicknameInput = this.handleNicknameInput.bind(this)
    this.updateScreen = this.updateScreen.bind(this)
    this.countrySelected = this.countrySelected.bind(this)
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
        return Promise.all([
          WebAPI.getUserInfo(currentUser.uid)
        ]).then((results) => {
          this.setState({
            nickname: results[0].nickname,
            country: results[0].country,
            loading: false,
            authenticated: true
          })
        }).catch((error) => {
          console.log(error)
        })
      } else {
        this.setState({ loading: false, authenticated: false })
      }
    })
  }

  saveSettings () {
    AsyncStorage.setItem('textLanguage', this.state.language)
    const nicknameInput = this.state.nicknameInput
    if (nicknameInput.length !== 0) {
      WebAPI.saveNickname(this.state.nicknameInput).then(() => {
        this.setState({ nickname: nicknameInput })
      }).catch(err => {
        console.log(err.message)
        this.setState({ errorMessage: err.message })
      })
    }
    if (this.state.country !== 'Select') {
      WebAPI.saveCountry(this.state.country).catch(err => {
        console.log(err.message)
        this.setState({ errorMessage: err.message })
      })
    }
    this.setState({ nicknameInput: '' })
    Keyboard.dismiss()
  }

  languageSelected (itemValue) {
    this.setState({ language: itemValue })
  }

  countrySelected (itemValue) {
    this.setState({ country: itemValue })
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
            <View style={globalStyles.row}>
              <Text style={globalStyles.column}>County:</Text>
              <Picker selectedValue={this.state.country ? this.state.country : 'Select'}
                style={[{ width: 150 }, styles.column]}
                onValueChange={this.countrySelected}>
                {countryList.map((country) => {
                  return <Picker.Item value={country} label={country} key={country} />
                })}
              </Picker>
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
