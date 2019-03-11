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
  return models.RacePlayer.findAll({
    include: [
      {
        model: models.Race,
        attributes: [],
        required: true,
        include: [{
          model: models.Text, attributes: [], required: true, where: { language: req.query.language }
        }]
      }
    ],
    where: { userUid: req.query.uid },
    order: [['id', 'DESC']],
    limit: 10,
    attributes: ['cpm']
  }).then((results) => {
    const sum = _.sumBy(results, (o) => {
      return o.cpm
    })
    const average = (sum / _.size(results))
    return Math.round(average * 100) / 100
  }).then(avg => {
    return res.send({ result: avg })
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
  return models.RacePlayer.findAll({
    include: [
      {
        model: models.Race,
        attributes: [],
        required: true,
        include: [{
          model: models.Text, attributes: [], required: true, where: { language: req.query.language }
        }]
      }
    ],
    where: { userUid: req.query.uid },
    attributes: ['cpm']
  }).then((results) => {
    const sum = _.sumBy(results, (o) => {
      return o.cpm
    })
    const average = (sum / _.size(results))
    return Math.round(average * 100) / 100
  }).then(avg => {
    return res.send({ result: avg })
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
        model: models.RacePlayer, attributes: ['cpm', 'accuracy'], where: { userUid: req.query.uid }
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
        cpm: result.racePlayers[0].cpm,
        accuracy: result.racePlayers[0].accuracy
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
  // TODO(aibek): check other queries and in case make it like this one.
  return models.RacePlayer.findOne({
    include: [
      {
        model: models.Race,
        attributes: [],
        required: true,
        include: [
          { model: models.Text, attributes: [], where: { language: req.query.language }, required: true }
        ]
      }
    ],
    where: { userUid: req.query.uid },
    order: [['cpm', 'DESC']]
  }).then((result) => {
    if (!result) {
      return res.send({ result: null })
    }
    return res.send({ result: result.cpm })
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

router.get('/countUserPlayedToday', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.RacePlayer.count({
    include: [
      {
        model: models.Race,
        required: true,
        where: {
          date: {
            [Op.lt]: new Date(),
            [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        model: models.User,
        required: true,
        where: { uid: req.query.uid }
      }
    ]
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

router.get('/getAverageAccuracy', [
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
        model: models.RacePlayer, attributes: ['accuracy'], where: { userUid: req.query.uid }
      }
    ],
    attributes: ['id']
  }).then((results) => {
    const sum = _.sumBy(results, (o) => {
      return o.racePlayers[0].accuracy
    })
    const average = (sum / _.size(results))
    return average
  }).then(avg => {
    return res.send({ result: Math.round(avg) })
  })
})

router.get('/getLastAverageAccuracy', [
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
        model: models.RacePlayer, attributes: ['accuracy'], where: { userUid: req.query.uid }
      }
    ],
    attributes: ['id', 'date'],
    order: [['date', 'DESC']],
    limit: 10
  }).then((results) => {
    const sum = _.sumBy(results, (o) => {
      return o.racePlayers[0].accuracy
    })
    const average = (sum / _.size(results))
    return average
  }).then(avg => {
    return res.send({ result: Math.round(avg) })
  })
})

// TODO(aibek): timezone is not correct for client
router.get('/getAllCpmHistory', [
  query('uid').isAlphanumeric().isLength({ min: 1 }),
  query('language').isAlpha().isLength({ min: 1, max: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return models.RacePlayer.findAll({
    include: [
      {
        model: models.Race,
        attributes: ['date'],
        required: true,
        include: [
          {
            model: models.Text, attributes: [], required: true, where: { language: req.query.language }
          }
        ]
      }
    ],
    includeIgnoreAttributes: false,
    where: { userUid: req.query.uid },
    attributes: [[models.sequelize.fn('AVG', models.sequelize.col('cpm')), 'cpm'], [models.sequelize.fn('DATE_FORMAT', models.sequelize.col('race.date'), '%Y-%m-%d'), 'date']],
    group: [models.sequelize.fn('DATE_FORMAT', models.sequelize.col('race.date'), '%Y-%m-%d')],
    order: [[models.sequelize.col('date'), 'ASC']],
    limit: 100
  }).then((results) => {
    if (!results) {
      res.send({ result: null })
    }
    return res.send({ result: results })
  })
})

module.exports = router
