const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const { query, validationResult } = require('express-validator/check')
const _ = require('lodash')
const Op = models.sequelize.Op

router.get('/getLatestAverageCpm', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  // TODO(aibek): check for security issues and convert to sequelize in future
  models.sequelize.query(
    `SELECT AVG(cpm) AS avg FROM race_players AS rp 
    JOIN races AS r ON rp.raceId = r.id 
    JOIN texts AS t ON t.id = r.textId 
    WHERE t.language='${req.query.language}' AND rp.userUid='${req.query.uid}'
    ORDER BY rp.id DESC LIMIT 10`,
    { type: models.sequelize.QueryTypes.SELECT }).then((result) => {
    return res.send({ result: Math.round(result[0].avg) })
  })
})

router.get('/getAverageCpm', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.Race.findAll({
    include: [
      {
        model: models.Text, attributes: [], where: { language: req.query.language }
      },
      {
        model: models.RacePlayer, attributes: ['cpm'], where: { userUid: req.query.uid }
      }
    ],
    attributes: ['id']
  }).then((results) => {
    const sum = _.sumBy(results, (o) => {
      return o.racePlayers[0].cpm
    })
    const average = (sum / _.size(results))
    return Math.round(average * 100) / 100
  }).then(avg => {
    return res.send({ result: Math.round(avg) })
  })
})

router.get('/getRaceCount', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.Race.count({
    include: [
      {
        model: models.Text, attributes: [], where: { language: req.query.language }
      },
      {
        model: models.RacePlayer, attributes: ['cpm'], where: { userUid: req.query.uid }
      }
    ]
  }).then((result) => {
    return res.send({ result })
  })
})

router.get('/getFirstRace', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  models.Race.findOne({
    include: [
      {
        model: models.Text, attributes: [], where: { language: req.query.language }
      },
      {
        model: models.RacePlayer, attributes: ['cpm'], where: { userUid: req.query.uid }
      }
    ],
    order: [['date', 'ASC']]
  }).then(result => {
    return res.send({ result })
  })
})

router.get('/getLastPlayedGame', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  models.Race.findOne({
    include: [
      {
        model: models.Text, attributes: [], where: { language: req.query.language }
      },
      {
        model: models.RacePlayer, attributes: ['cpm'], where: { userUid: req.query.uid }
      }
    ],
    order: [['date', 'DESC']]
  }).then(result => {
    if (!result) {
      return res.send({ result: null })
    }
    return res.send({
      result: {
        date: result.get('date'),
        cpm: result.racePlayers[0].cpm
      }
    })
  })
})

router.get('/getBestResult', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.Race.findOne({
    include: [
      {
        model: models.Text, attributes: [], where: { language: req.query.language }
      },
      {
        model: models.RacePlayer, attributes: ['cpm'], where: { userUid: req.query.uid }
      }
    ],
    order: [[models.RacePlayer, 'cpm', 'DESC']]
  }).then(function (race) {
    if (!race) {
      return res.send({ result: null })
    }
    race = race.toJSON()
    return res.send({ result: _.get(race, 'racePlayers[0].cpm') })
  })
})

router.get('/getGamesWon', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.Race.count({
    include: [
      {
        model: models.Text, attributes: [], where: { language: req.query.language }
      },
      {
        model: models.RacePlayer, attributes: ['cpm'], where: { userUid: req.query.uid, isWinner: 1 }
      }
    ]
  }).then(function (result) {
    return res.send({ result: result })
  })
})

router.get('/countGamesPlayedToday', async (req, res) => {
  return models.Race.count({
    where: {
      date: {
        [Op.lt]: new Date(),
        [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
      }
    }
  }).then((result) => {
    return res.send({ result })
  })
})

router.get('/getLastPlayedGames', async (req, res) => {
  return models.RacePlayer.findAll({
    include: [
      {
        model: models.Race,
        required: true,
        where: {
          'date': {
            [Op.lt]: new Date(),
            [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        model: models.User, required: true
      }
    ],
    order: [[models.Race, 'date', 'DESC']],
    limit: 10
  }).then((result) => {
    return res.send({ result })
  })
})

module.exports = router
