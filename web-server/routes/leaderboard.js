const express = require("express");
const router = express.Router();
const models = require("../../models/models");
const { query, validationResult } = require("express-validator/check");
const Op = models.sequelize.Op;

router.get(
  "/getBestResults",
  [
    query("language")
      .isAlpha()
      .isLength({ min: 1, max: 10 })
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
    return models.RacePlayer.findAll({
      include: [
        {
          model: models.Race,
          attributes: ["id", "textId", "date"],
          required: true
        },
        {
          model: models.User,
          attributes: ["id", "uid", "nickname", "country"],
          required: true
        }
      ],
      where: { language: req.query.language },
      order: [["cpm", "DESC"]],
      limit: 20
    })
      .then(results => {
        return res.send(results);
      })
      .catch(err => {
        next(err);
      });
  }
);

router.get(
  "/getBestAvgResults",
  [
    query("language")
      .isAlpha()
      .isLength({ min: 1, max: 10 })
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
    return models.RacePlayer.findAll({
      include: [
        {
          model: models.Race,
          attributes: [],
          required: true
        },
        {
          model: models.User,
          attributes: ["id", "uid", "nickname", "country"],
          required: true
        }
      ],
      where: { language: req.query.language },
      group: "uid",
      attributes: [
        [models.sequelize.fn("AVG", models.sequelize.col("cpm")), "avg"],
        "user.uid",
        "user.nickname",
        "user.country"
      ],
      order: [
        [models.sequelize.fn("AVG", models.sequelize.col("cpm")), "DESC"]
      ],
      limit: 20
    })
      .then(results => {
        return res.send(results);
      })
      .catch(err => {
        next(err);
      });
  }
);

router.get(
  "/getBestCpmTodayResults",
  [
    query("language")
      .isAlpha()
      .isLength({ min: 1, max: 10 })
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
    return models.RacePlayer.findAll({
      include: [
        {
          model: models.Race,
          attributes: ["id", "textId", "date"],
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
          attributes: ["id", "uid", "nickname", "country"],
          required: true
        }
      ],
      order: [["cpm", "DESC"]],
      where: { language: req.query.language },
      limit: 20
    })
      .then(results => {
        return res.send(results);
      })
      .catch(err => {
        next(err);
      });
  }
);

router.get(
  "/getBestAccTodayResults",
  [
    query("language")
      .isAlpha()
      .isLength({ min: 1, max: 10 })
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
    return models.RacePlayer.findAll({
      include: [
        {
          model: models.Race,
          attributes: ["id", "textId", "date"],
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
          attributes: ["id", "uid", "nickname", "country"],
          required: true
        }
      ],
      order: [["accuracy", "DESC"]],
      where: { language: req.query.language },
      limit: 20
    })
      .then(results => {
        return res.send(results);
      })
      .catch(err => {
        next(err);
      });
  }
);

module.exports = router;
