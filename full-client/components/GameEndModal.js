import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View, Modal } from 'react-native'
import globalStyles from '../styles'

export default class GameEndModal extends React.Component {
  render () {
    return (
      <Modal
        visible
        transparent
        onRequestClose={this.props.closeModalHandler}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalStyle}>
            <Text style={styles.modalHeader}>{this.props.modalText}</Text>
            <View
              style={styles.modalItem}><Text>You are {this.props.position} out
              of {this.props.numOfPlayers}</Text></View>
            <View style={styles.modalItem}><Text>Your CPM: {this.props.cpm}</Text></View>
            <View style={styles.modalItem}><Text>Your accuracy: {this.props.accuracy}</Text></View>
            {!this.props.authenticated &&
            <View style={{ marginTop: 10 }}>
              <Text style={[globalStyles.normalText, { color: 'red' }]}>*Sign in to save your progress.</Text>
            </View>
            }
            <TouchableHighlight
              onPress={this.props.closeModalHandler}>
              <Text style={{ color: 'red', fontSize: 20 }}>Close [X]</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080'
  },
  modalStyle: {
    backgroundColor: '#fff',
    padding: 20,
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalHeader: { color: 'red', fontSize: 20 },
  gameStatusBar: {
    flex: 0.1,
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 30
  },
  modalItem: {
    paddingLeft: 3,
    paddingRight: 3,
    borderRightWidth: 1,
    borderRightColor: '#7f1717',
    borderLeftWidth: 1,
    borderLeftColor: '#7f1717',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
