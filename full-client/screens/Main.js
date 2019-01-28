import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.handlePlayPressed = this.handlePlayPressed.bind(this)
  }

  handlePlayPressed () {
    this.props.navigation.navigate('Game')
  }

  render () {
    return (
      <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.header}>
            Compete With Others And Increase Your Typing Speed!
          </Text>
        </View>
        {/* TODO(aibek): fill out last played games from API */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.tableHeader}>Last Played</Text>
          <View style={styles.row}>
            <Text style={styles.column}>aibek</Text>
            <Text style={styles.column}>210 cpm</Text>
            <Text style={styles.column}>21 ms ago</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.column}>aibek</Text>
            <Text style={styles.column}>210 cpm</Text>
            <Text style={styles.column}>21 ms ago</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.column}>aibek</Text>
            <Text style={styles.column}>210 cpm</Text>
            <Text style={styles.column}>21 ms ago</Text>
          </View>
        </View>
        {/* TODO(aibek): add link to settings for language */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={styles.normalText}>Choose your language and</Text>
          <TouchableOpacity style={styles.playButton} onPress={this.handlePlayPressed}>
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
        </View>
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
  tableHeader: {
    fontSize: 20,
    color: '#56ABBD',
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
  row: {
    flex: 0.1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  },
  column: {
    margin: 10,
    color: '#56ABBD',
    fontSize: 15
  },
  playButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 60,
    marginTop: 10,
    backgroundColor: '#ff0000'
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20
  }
})
