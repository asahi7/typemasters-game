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
  getRaceCount: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getRaceCount?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getAverageCpm: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getAverageCpm?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getLatestAverageCpm: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getLatestAverageCpm?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getFirstRace: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getFirstRace?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getLastPlayedGame: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getLastPlayedGame?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getBestResult: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getBestResult?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getGamesWon: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getGamesWon?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getUserInfo: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/users?uid=${uid}`).then(parseJSON)
  }
}
