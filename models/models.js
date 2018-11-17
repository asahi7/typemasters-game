const Sequelize = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize('typemasters', process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscoredAll: true,
    timestamps: false
  }
})

const User = sequelize.define('user', {
  uid: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
})

const Text = sequelize.define('text', {
  text: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  language: {
    type: Sequelize.STRING,
    allowNull: false
  },
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 30,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
})

const Race = sequelize.define('race', {
  textId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
})

const RacePlayer = sequelize.define('racePlayer', {
  userUid: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  raceId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  wpm: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  points: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  accuracy: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
})

Text.hasMany(Race)
Race.belongsTo(Text, { foreignKey: 'textId' })
Race.hasMany(RacePlayer)
RacePlayer.belongsTo(Race, { foreignKey: 'raceId' })
User.hasMany(RacePlayer)
RacePlayer.belongsTo(User, { foreignKey: 'userUid' })

module.exports = {
  sequelize,
  User,
  Text,
  Race,
  RacePlayer
}