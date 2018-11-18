import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.handlePlayPressed = this.handlePlayPressed.bind(this)
  }

  componentDidMount () {

  }

  handlePlayPressed () {
    this.props.navigation.navigate('Game')
  }

  render () {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.playButton} onPress={this.handlePlayPressed}>
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    backgroundColor: '#ff0000',
    borderRadius: 100
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20
  }
})
