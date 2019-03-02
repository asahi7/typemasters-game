const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const _ = require('lodash')
const firebase = require('firebase')
const { query, validationResult } = require('express-validator/check')

/**
 * Gets a user
 * @param req.query.uid
 */
router.get('/', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const user = await models.User.findOne({ where: { uid: req.query.uid } })
  if (_.isEmpty(user)) {
    res.status(400).send({
      error: `User with uid: ${req.query.uid} does not exist`
    })
    return
  }
  console.log('in users/n/n', user)
  res.send(user)
})

const config = {
  apiKey: 'AIzaSyABqH90F1qdKwhSXci_SRERvBNn7GVJEV4',
  authDomain: 'typemasters-cc028.firebaseapp.com',
  databaseURL: 'https://typemasters-cc028.firebaseio.com',
  projectId: 'typemasters-cc028',
  storageBucket: 'typemasters-cc028.appspot.com',
  messagingSenderId: '1097557406122'
}
firebase.initializeApp(config)

/**
 * Simple blank method to trigger creation of a new user, by firebase middleware
 */
router.post('/createUserIfNotExists', async (req, res) => {
  return res.sendStatus(200)
})

/**
 * @param req.body.email
 * @param req.body.password
 */
router.post('/signup', async (req, res) => {
  await firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(() => {
    const user = firebase.auth().currentUser
    console.log(user)
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      res.send({ token: idToken, user })
    }).catch(function (error) {
      console.log(error)
    })
  }).catch(function (error) {
    console.log(error)
  })
})

/**
 * @param req.body.email
 * @param req.body.password
 */
router.post('/signin', async (req, res) => {
  await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(() => {
    const user = firebase.auth().currentUser
    console.log(user)
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
      res.send({ token: idToken, user })
    }).catch(function (error) {
      console.log(error)
    })
  }).catch(function (error) {
    console.log(error)
  })
})

router.post('/saveNickname', [
  query('nickname').isAlphanumeric().isLength({ min: 3 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.User.update(
    { nickname: req.query.nickname },
    { where: { uid: res.locals.userPayload.uid } }
  ).then(() => {
    res.sendStatus(200)
  }).catch(() => {
    return res.sendStatus(500)
  })
})

router.get('/getNickname', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.User.findOne({
    where: { uid: req.query.uid }
  }).then((user) => {
    if (!user) {
      return res.send({ nickname: null })
    }
    res.send({ nickname: user.nickname })
  })
})

module.exports = router
