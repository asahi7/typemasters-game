import firebase from 'firebase'
const API_URL = 'http://192.168.0.9:3001'

let currentUser = null

firebase.auth().onAuthStateChanged(function (user) {
  console.log('WEBAPI', { user })
  currentUser = user
})

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

}
