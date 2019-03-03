'use strict'

const React = require('react-native')

const {
  StyleSheet
} = React

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  header: {
    fontSize: 30,
    color: '#ed4747',
    letterSpacing: 2,
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: '700'
  },
  tableHeader: {
    fontSize: 20,
    color: '#7f1717',
    letterSpacing: 2,
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: '700'
  },
  normalText: {
    fontSize: 15,
    color: '#340303',
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  row: {
    flex: 0.1,
    borderWidth: 1,
    marginTop: 1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  },
  column: {
    marginLeft: 10,
    marginRight: 10,
    color: '#340303',
    fontSize: 15
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  normalButton: {
    marginTop: 10,
    flex: 0.1,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default globalStyles
