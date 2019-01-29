import React from 'react'
import { Text, StyleSheet, AsyncStorage, Picker, View } from 'react-native'
import { LinearGradient } from 'expo'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      language: null
    }
    this.languageSelected = this.languageSelected.bind(this)
  }

  componentWillMount () {
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
    })
  }

  languageSelected (itemValue) {
    AsyncStorage.setItem('textLanguage', itemValue)
    this.setState({ language: itemValue })
  }

  render () {
    return (
      <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={styles.header}>
            Settings
          </Text>
        </View>
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={styles.normalText}>Select your typing language</Text>
        </View>
        {this.state.language &&
          <Picker selectedValue={this.state.language}
            style={{ height: 50, width: 200 }}
            onValueChange={this.languageSelected}>
            <Picker.Item value='ZH' label='Chinese (Mandarin)' />
            <Picker.Item value='EN' label='English' />
            <Picker.Item value='FR' label='French' />
            <Picker.Item value='DE' label='German' />
            <Picker.Item value='KO' label='Korean' />
            <Picker.Item value='HI' label='Hindi' />
            <Picker.Item value='RU' label='Russian' />
            <Picker.Item value='ES' label='Spanish' />
            <Picker.Item value='TR' label='Turkish' />
            <Picker.Item value='KZ' label='Kazakh' />
          </Picker>
        }
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
  }
})
