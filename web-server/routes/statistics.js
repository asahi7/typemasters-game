const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const { query, validationResult } = require('express-validator/check')

router.get('/getLatestAverageCpm', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  // TODO(aibek): check for security issues and convert to sequelize in future
  models.sequelize.query(
    `SELECT AVG(cpm) as avg FROM (SELECT * FROM race_players WHERE userUid='${req.query.uid}' ORDER BY id DESC LIMIT 10) AS t`,
    { type: models.sequelize.QueryTypes.SELECT }).then((result) => {
    return res.send({ result: result[0].avg })
  })
})

router.get('/getAverageCpm', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.RacePlayer.findOne({
    attributes: [[models.sequelize.fn('AVG', models.sequelize.col('cpm')), 'avg']],
    where: {
      userUid: req.query.uid
    }
  }).then((result) => {
    return res.send({ result })
  })
})

router.get('/getRaceCount', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.RacePlayer.count({
    where: {
      userUid: req.query.uid
    }
  }).then((result) => {
    return res.send({ result })
  })
})

router.get('/getFirstRace', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  models.Race.findOne({
    include: [{
      model: models.RacePlayer,
      where: { userUid: req.query.uid }
    }],
    order: [['date', 'ASC']]
  }).then(result => {
    return res.send({ result })
  })
})

router.get('/getLastPlayedGame', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.Race.findOne({
    include: {
      model: models.RacePlayer,
      where: {
        raceId: models.sequelize.col('race.id'),
        userUid: req.query.uid
      }
    },
    attributes: ['date'],
    order: [['date', 'DESC']]
  }
  ).then(function (race) {
    return res.send({ result: race.get('date') })
  })
})

router.get('/getBestResult', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.RacePlayer.findOne({
    attributes: ['cpm'],
    where: { userUid: req.query.uid },
    order: [['cpm', 'DESC']]
  }
  ).then(function (race) {
    console.log(race.get('cpm'))
    return res.send({ result: race.get('cpm') })
  })
})

router.get('/getGamesWon', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.RacePlayer.count({
    where: {
      userUid: req.query.uid,
      isWinner: 1
    }
  }
  ).then(function (result) {
    return res.send({ result: result })
  })
})

module.exports = router
