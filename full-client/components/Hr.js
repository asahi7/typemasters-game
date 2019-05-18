import React from 'react'
import { View } from 'react-native'

export default class Hr extends React.Component {
  render () {
    return (
      <View
        style={{
          borderBottomColor: 'black',
          borderBottomWidth: 1,
          marginTop: 5,
          marginBottom: 5,
          borderColor: '#666',
          width: '80%',
          alignSelf: 'center'
        }}
      />
    )
  }
}
