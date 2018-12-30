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

router.get('/getLastPlayedGame', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.Race.findAll({
    include: {
      model: models.RacePlayer,
      where: { raceId: models.sequelize.col('race.id') }
    },
    where: { '$racePlayers.userUid$': req.query.uid },
    attributes: ['date'],
    order: [['date', 'DESC']],
    exclude: ['racePlayers']
  }).then((result) => {
    return res.send({ result: result[0]['date'] })
  })
})

module.exports = router
