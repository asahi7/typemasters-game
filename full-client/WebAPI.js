import firebase from 'firebase'
import Config from './config/Config'

// TODO(aibek): handle following
let currentUser = null

function parseJSON (response) {
  if (response.status >= 400) {
    throw new Error(response)
  }
  const contentType = response.headers.get('Content-Type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return response
}

const attachToken = async (options) => {
  const user = currentUser || await firebase.auth().currentUser
  if (user) {
    return user.getIdToken(true).then(token => {
      // TODO(aibek): check token retrival & error handling
      console.log('TOKEN', token)
      if (!token) {
        throw new Error('Unauthorized')
      }
      if (!options) {
        options = {}
      }
      options.headers = {
        ...options.headers,
        Authorization: token
      }
      return options
    })
  } else {
    return options
  }
}

export default {
  getRaceCount: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getRaceCount?uid=${uid}`).then(parseJSON)
  },

  getAverageCpm: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getAverageCpm?uid=${uid}`).then(parseJSON)
  },

  getLatestAverageCpm: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getLatestAverageCpm?uid=${uid}`).then(parseJSON)
  },

  getLastPlayedGame: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getLastPlayedGame?uid=${uid}`).then(parseJSON)
  },

  getBestResult: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getBestResult?uid=${uid}`).then(parseJSON)
  },
  getGamesWon: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getGamesWon?uid=${uid}`).then(parseJSON)
  }
}
