const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const firebase = require('./firebase/auth')

const usersRouter = require('./routes/users')
const statisticsRouter = require('./routes/statistics')
const leaderboardRouter = require('./routes/leaderboard')

const app = express()

app.use(cors())
app.use(logger('combined'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Auth checker middleware
app.use(firebase.firebaseAuthenticationMiddleware)
app.use(firebase.firebaseAuthorizationMiddleware)
app.use(firebase.firebaseAddUserMiddleware)

app.use('/users', usersRouter)
app.use('/statistics', statisticsRouter)
app.use('/leaderboard', leaderboardRouter)

app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

// Error handler
app.use(function (err, req, res, next) {
  // logger
  console.log(err)
  // TODO(aibek): add sentry.io
  if (process.env.NODE_ENV === 'production') {
    delete err.stack
  }
  res.status(err.status || 500).send({
    error: {
      message: err.message,
      etc: err
    }
  })
})

module.exports = app
