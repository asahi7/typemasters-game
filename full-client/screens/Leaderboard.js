import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default class Leaderboard extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <Text>Leaderboard</Text>
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
