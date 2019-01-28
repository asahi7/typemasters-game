import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo'

export default class Leaderboard extends React.Component {
  render () {
    return (
      <LinearGradient colors={['#e1f6fa', '#dac6d8']} style={styles.container}>
        <Text>Leaderboard</Text>
      </LinearGradient>
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
