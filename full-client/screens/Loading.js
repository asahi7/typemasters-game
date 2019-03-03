import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import globalStyles from '../styles'

export default class Loading extends React.Component {
  render () {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size='large' />
        <Text>Loading</Text>
      </View>
    )
  }
}
