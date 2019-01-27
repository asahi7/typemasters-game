import React from 'react'
import { View, Text, StyleSheet, AsyncStorage, Picker } from 'react-native'

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
      <View style={styles.container}>
        <Text>Settings</Text>
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
