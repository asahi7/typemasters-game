const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const { query, validationResult } = require('express-validator/check')

router.get('/getBestResults', [
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
        attributes: ['id', 'textId', 'date'],
        required: true,
        include: [{
          model: models.Text, required: true, attributes: ['id', 'language']
        }]
      },
      {
        model: models.User, attributes: ['id', 'uid', 'nickname', 'country'], required: true
      }
    ],
    where: models.sequelize.where(models.sequelize.col('race->text.language'), '=', req.query.language),
    order: [['cpm', 'DESC']],
    limit: 20
  }).then((results) => {
    return res.send(results)
  })
})

module.exports = router
