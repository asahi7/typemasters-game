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
  const user = await models.User.findOne({ uid: req.query.uid })
  if (_.isEmpty(user)) {
    res.status(400).send({
      error: `User with uid: ${req.query.uid} does not exist`
    })
    return
  }
  console.log('in users/n/n',user)
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

module.exports = router
