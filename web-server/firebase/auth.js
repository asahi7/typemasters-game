const firebaseAdmin = require('firebase-admin')
const _ = require('lodash')
const models = require('../../models/models')

const firebaseServiceAccount = require('../secrets/typemasters-cc028-firebase-adminsdk-ft5e2-a8cacca758')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
})

// TODO(aibek): add more descriptive authorization policy, like post, get methods specification
/*
* Array which specifies routes in the application for which authentication check will not be
* performed.
* For now, many routes are included, to allow testing the early application.
* WARNING: the slash in the end of the route should be exact match
* TODO(aibek): handle the path with and without slash as one
*/
const EXCLUDED_ROUTES_FROM_VERIFICATION = [
  '/users',
  '/users/getNickname',
  '/statistics/getAverageCpm',
  '/statistics/getRaceCount',
  '/statistics/getLatestAverageCpm',
  '/statistics/getFirstRace',
  '/statistics/getLastPlayedGame',
  '/statistics/getBestResult',
  '/statistics/getGamesWon',
  '/statistics/countGamesPlayedToday',
  '/statistics/countUserPlayedToday',
  '/statistics/getLastPlayedGames',
  '/statistics/getAverageAccuracy',
  '/statistics/getLastAverageAccuracy',
  '/leaderboard/getBestResults',
  '/leaderboard/getBestAvgResults',
  '/leaderboard/getBestTodayResults'
]
// TODO(aibek): some of the routes should be checked for token

/**
 * A middleware to check user's authentication
 */
const firebaseAuthenticationMiddleware = async (req, res, next) => {
  const token = req.get('Authorization')
  let tokenCheckFailed = false
  if (token) {
    try {
      const payload = await firebaseAdmin.auth().verifyIdToken(token)
      res.locals.userPayload = payload
    } catch (error) {
      tokenCheckFailed = true
    }
  }
  if (!token || tokenCheckFailed === true) {
    if (_.includes(EXCLUDED_ROUTES_FROM_VERIFICATION, req.path)) {
      return next()
    }
    return res.status(403).send('Not Authorized')
  }
  next()
}

/**
 * A middleware to check user's permissions and authorization.
 */
const firebaseAuthorizationMiddleware = async (req, res, next) => {
  // TODO(aibek): add rules for authorization check
  next()
}

/**
 * A middleware to add a new user using his authorization token payload.
 * @param res.locals.userPayload is a user's payload retrieved from previous middlewares
 */
const firebaseAddUserMiddleware = async (req, res, next) => {
  const payload = res.locals.userPayload
  if (payload && payload.uid) {
    const user = await models.User.findOne({ where: { uid: payload.uid } })
    if (_.isEmpty(user)) {
      await addUser(payload)
    }
  }
  next()
}

/**
 * A method to create a user in a database using firebase middleware.
 */
async function addUser (payload) {
  await models.User.findOrCreate({
    where: {
      email: payload.email
    },
    defaults: {
      uid: payload.uid,
      email: payload.email
    }
  })
}

module.exports = {
  firebaseAuthenticationMiddleware,
  firebaseAuthorizationMiddleware,
  firebaseAddUserMiddleware
}
