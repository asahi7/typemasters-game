import React from 'react'
import { Text, View } from 'react-native'
import { LinearGradient } from 'expo'
import Commons from '../Commons'
import globalStyles from '../styles'

export default class About extends React.Component {
  render () {
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            About
          </Text>
        </View>
      </LinearGradient>
    )
  }
}
