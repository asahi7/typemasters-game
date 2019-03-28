import { createRootNavigator } from './router'
import * as firebase from 'firebase'
import i18n from 'i18n-js'
import { Localization } from 'expo'
import { en, ru } from './i18n'
import Sentry from 'sentry-expo'

if (__DEV__) {
  console.log('__DEV__: ' + __DEV__)
}

// Remove this once Sentry is correctly setup.
Sentry.enableInExpoDevelopment = true

Sentry.config('https://87a1b73b40134530a69a4178026fd4eb@sentry.io/1424807').install()

// TODO(aibek): check if async call is needed for Android in order to detect language change
i18n.fallbacks = true
i18n.translations = { en, ru, kk: ru }
i18n.locale = Localization.locale

const config = {
  apiKey: 'AIzaSyABqH90F1qdKwhSXci_SRERvBNn7GVJEV4',
  authDomain: 'typemasters-cc028.firebaseapp.com',
  databaseURL: 'https://typemasters-cc028.firebaseio.com',
  projectId: 'typemasters-cc028',
  storageBucket: 'typemasters-cc028.appspot.com',
  messagingSenderId: '1097557406122'
}
firebase.initializeApp(config)

export default createRootNavigator()
