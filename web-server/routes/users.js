const express = require("express");
const router = express.Router();
const models = require("../../models/models");
const _ = require("lodash");
const { query, validationResult, body } = require("express-validator/check");
const countryList = require("../consts/countryList");

const Sequelize = models.sequelize.Sequelize;

/**
 * Gets a user
 * @param req.query.uid
 */
router.get(
  "/",
  [
    query("uid")
      .isAlphanumeric()
      .isLength({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: "Validation Error",
          etc: errors.array()
        }
      });
    }
    const user = await models.User.findOne({ where: { uid: req.query.uid } });
    if (_.isEmpty(user)) {
      return res.status(400).send({
        error: {
          message: `User with uid: ${req.query.uid} does not exist`
        }
      });
    }
    return res.send(user);
  }
);

router.get("/supportedLanguages", async (req, res) => {
  const supportedLangs = await models.SupportedLang.findAll();
  return res.send(supportedLangs);
});

/**
 * Simple blank method to trigger creation of a new user, by firebase middleware
 */
router.post("/createUserIfNotExists", async (req, res) => {
  return res.sendStatus(200);
});

router.post(
  "/saveNickname",
  [
    body("nickname")
      .isAlphanumeric()
      .isLength({ min: 3 })
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: "Validation Error",
          etc: errors.array()
        }
      });
    }
    return models.User.update(
      { nickname: req.body.nickname },
      { where: { uid: res.locals.userPayload.uid } }
    )
      .then(() => {
        return res.sendStatus(200);
      })
      .catch(err => {
        if (err instanceof Sequelize.UniqueConstraintError) {
          return res.status(409).send({
            error: {
              message: "Nickname: " + req.body.nickname + " is already present"
            }
          });
        }
        next(err);
      });
  }
);

router.post(
  "/saveCountry",
  [
    body("country")
      .isAscii()
      .isLength({ min: 3 })
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: "Validation Error",
          etc: errors.array()
        }
      });
    }
    if (!_.includes(countryList, req.body.country)) {
      return res.status(400).send({
        error: {
          message: "Country " + req.body.country + " does not exist"
        }
      });
    }
    return models.User.update(
      { country: req.body.country },
      { where: { uid: res.locals.userPayload.uid } }
    )
      .then(() => {
        return res.sendStatus(200);
      })
      .catch(err => {
        next(err);
      });
  }
);

module.exports = router;
