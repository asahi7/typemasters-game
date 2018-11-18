const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const { query, validationResult } = require('express-validator/check')

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

module.exports = router
