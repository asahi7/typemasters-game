import { SwitchNavigator } from 'react-navigation'
import Loading from './screens/Loading'
import SignUp from './screens/SignUp'
import SignIn from './screens/SignIn'
import Game from './screens/Game'
import * as firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyABqH90F1qdKwhSXci_SRERvBNn7GVJEV4',
  authDomain: 'typemasters-cc028.firebaseapp.com',
  databaseURL: 'https://typemasters-cc028.firebaseio.com',
  projectId: 'typemasters-cc028',
  storageBucket: 'typemasters-cc028.appspot.com',
  messagingSenderId: '1097557406122'
}
firebase.initializeApp(config)

console.log('hello')

const App = SwitchNavigator(
  {
    Loading,
    SignUp,
    SignIn,
    Game
  },
  {
    initialRouteName: 'Loading'
  }
)

export default App
