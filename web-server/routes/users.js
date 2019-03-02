const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const _ = require('lodash')
const { query, validationResult } = require('express-validator/check')

const Sequelize = models.sequelize.Sequelize

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
  res.send(user)
})

/**
 * Simple blank method to trigger creation of a new user, by firebase middleware
 */
router.post('/createUserIfNotExists', async (req, res) => {
  return res.sendStatus(200)
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
  }).catch(err => {
    if (err instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).send({ message: 'nickname is already present' })
    }
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
