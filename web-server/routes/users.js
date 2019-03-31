const express = require('express')
const router = express.Router()
const models = require('../../models/models')
const _ = require('lodash')
const { query, validationResult, body } = require('express-validator/check')

const Sequelize = models.sequelize.Sequelize

/**
 * Gets a user
 * @param req.query.uid
 */
router.get('/', [
  query('uid').isAlphanumeric().isLength({ min: 1 })
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        etc: errors.array()
      }
    })
  }
  const user = await models.User.findOne({ where: { uid: req.query.uid } })
  if (_.isEmpty(user)) {
    return res.status(400).send({
      error: {
        message: `User with uid: ${req.query.uid} does not exist`
      }
    })
  }
  return res.send(user)
})

/**
 * Simple blank method to trigger creation of a new user, by firebase middleware
 */
router.post('/createUserIfNotExists', async (req, res) => {
  return res.sendStatus(200)
})

router.post('/saveNickname', [
  body('nickname').isAlphanumeric().isLength({ min: 3 }).trim().escape()
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        etc: errors.array()
      }
    })
  }
  return models.User.update(
    { nickname: req.body.nickname },
    { where: { uid: res.locals.userPayload.uid } }
  ).then(() => {
    return res.sendStatus(200)
  }).catch(err => {
    if (err instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).send({
        error: {
          message: 'Nickname: ' + req.body.nickname + ' is already present'
        }
      })
    }
    next(err)
  })
})

const countryList = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua &amp; Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia &amp; Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Cook Islands', 'Costa Rica',
  'Cote D Ivoire', 'Croatia', 'Cruise Ship', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Polynesia', 'French West Indies', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyz Republic', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania',
  'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Namibia', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russia', 'Rwanda', 'Saint Pierre &amp; Miquelon', 'Samoa', 'San Marino', 'Satellite', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'St Kitts &amp; Nevis', 'St Lucia', 'St Vincent', 'St. Lucia', 'Sudan',
  'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor L\'Este', 'Togo', 'Tonga', 'Trinidad &amp; Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Turks &amp; Caicos', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'United States Minor Outlying Islands', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Virgin Islands (US)', 'Yemen', 'Zambia', 'Zimbabwe']

router.post('/saveCountry', [
  body('country').isAscii().isLength({ min: 3 }).trim().escape()
], async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        etc: errors.array()
      }
    })
  }
  if (!_.includes(countryList, req.body.country)) {
    return res.status(400).send({
      error: {
        message: 'Country ' + req.body.country + ' does not exist'
      }
    })
  }
  return models.User.update(
    { country: req.body.country },
    { where: { uid: res.locals.userPayload.uid } }
  ).then(() => {
    return res.sendStatus(200)
  }).catch((err) => {
    next(err)
  })
})

module.exports = router
