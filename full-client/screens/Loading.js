import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import globalStyles from '../styles'
import i18n from 'i18n-js'

export default class Loading extends React.Component {
  render () {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size='large' />
        <Text>{i18n.t('loading.loading')}</Text>
      </View>
    )
  }
}
