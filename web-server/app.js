const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const firebase = require('./firebase/auth')
const Sentry = require('@sentry/node')
const helmet = require('helmet')
const rateLimiterMiddleware = require('./middleware/rateLimiterMemory')

Sentry.init({ dsn: 'https://8ba7f2fda85246a0a168a2f7fcae5c73@sentry.io/1427713' })

const usersRouter = require('./routes/users')
const statisticsRouter = require('./routes/statistics')
const leaderboardRouter = require('./routes/leaderboard')

const app = express()

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.hidePoweredBy())
app.use(helmet.ieNoOpen())
app.use(cors())
app.use(rateLimiterMiddleware)
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

// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler())

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
