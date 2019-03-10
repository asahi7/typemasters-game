import React from 'react'
import { StyleSheet, View, TextInput } from 'react-native'
import _ from 'lodash'

export default class GameTextInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      wordIndex: 0,
      correctInput: true
    }
    this.handleUserInput = this.handleUserInput.bind(this)
    this.isNotLastMatchingWordOfText = this.isNotLastMatchingWordOfText.bind(this)
    this.isLastMatchingWordOfText = this.isLastMatchingWordOfText.bind(this)
    this.setInitialState = this.setInitialState.bind(this)
  }

  componentDidMount () {
    this.setInitialState()
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.refresh !== this.props.refresh) {
      this.setInitialState()
    }
  }

  componentWillUnmount () {
    this._textInput.setNativeProps({text: ''})
  }

  setInitialState() {
    this._textInput.setNativeProps({text: ''})
    this.setState({
      wordIndex: 0,
      correctInput: true
    })
  }

  // References https://github.com/facebook/react-native/issues/20119#issuecomment-421994973
  textInputValue = null

  handleUserInput (input) {
    const word = this.props.textArray[this.state.wordIndex]
    if(_.startsWith(word, input)) {
      this.setState({
        correctInput: true
      })
    } else {
      this.setState({
        correctInput: false
      })
    }
    if (this.isNotLastMatchingWordOfText(input) || this.isLastMatchingWordOfText(input)) {
      this._textInput.clear()
      this.textInputValue = null
      this.props.handler(word.length, this.props.textArray.slice(this.state.wordIndex + 1).join(' '))
      this.setState({
        wordIndex: this.state.wordIndex + 1
      })
    } else {
      this.textInputValue = input
    }
  }

  isNotLastMatchingWordOfText (input) {
    const word = this.props.textArray[this.state.wordIndex]
    return input.charAt(input.length - 1) === ' ' && this.props.textArray.length - 1 !== this.state.wordIndex
      && input.slice(0, input.length - 1) === word
  }

  isLastMatchingWordOfText (input) {
    const word = this.props.textArray[this.state.wordIndex]
    return this.props.textArray.length - 1 === this.state.wordIndex
      && input === word
  }

  render () {
    return (
      <View style={styles.textInput}>
        <TextInput
          style={[styles.textInputStyle, this.state.correctInput ? styles.correctTextInput : styles.incorrectTextInput]}
          autoCapitalize='none'
          placeholder='Start typing here..'
          onChangeText={this.handleUserInput}
          ref={input => { this._textInput = input }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  textInput: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'stretch',
    margin: 10
  },
  textInputStyle: {
    flex: 1,
    padding: 5,
    height: 40,
    borderWidth: 2
  },
  correctTextInput: {
    borderColor: '#4ce300'
  },
  incorrectTextInput: {
    borderColor: '#ff0000'
  }
})