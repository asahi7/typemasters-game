import firebase from 'firebase'
import Config from './config/Config'

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

/**
 * Helper method to attach token to an API call.
 *
 * Example:
 * return attachToken(options).then(options => {
 *   return fetch(API, options).then(parseJSON)
 * })
 * */
const attachToken = async (options) => {
  const user = firebase.auth().currentUser
  if (user) {
    return user.getIdToken(true).then(token => {
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
  saveNickname: (nickname) => {
    const options = {
      method: 'POST'
    }
    return attachToken(options).then(options => {
      return fetch(`${Config.WEB_SERVER_API}/users/saveNickname?nickname=${nickname}`, options).then(parseJSON)
    })
  },

  getNickname: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/users/getNickname?uid=${uid}`).then(parseJSON)
  },

  createUserIfNotExists: () => {
    const options = {
      method: 'POST'
    }
    return attachToken(options).then(options => {
      return fetch(`${Config.WEB_SERVER_API}/users/createUserIfNotExists`, options).then(parseJSON)
    })
  },

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

  getLastScore: (uid, language) => {
    return fetch(`${Config.WEB_SERVER_API}/statistics/getLastScore?uid=${uid}&language=${language}`).then(parseJSON)
  },

  getUserInfo: (uid) => {
    return fetch(`${Config.WEB_SERVER_API}/users?uid=${uid}`).then(parseJSON)
  }
}
