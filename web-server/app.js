require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const firebase = require('./firebase/auth')

const usersRouter = require('./routes/users')
const statisticsRouter = require('./routes/statistics')

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

module.exports = app
