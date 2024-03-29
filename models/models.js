const Sequelize = require('sequelize')
const config = require('./config/config.json')[process.env.NODE_ENV || 'dev']

const sequelize = new Sequelize('typemasters', config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false
  },
  logging: false
})

const User = sequelize.define('user', {
  uid: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  nickname: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  country: {
    type: Sequelize.STRING,
    allowNull: true
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
}, {
  tableName: 'users'
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
}, {
  tableName: 'texts'
})

const SupportedLang = sequelize.define('supportedLang', {
  label: {
    type: Sequelize.STRING,
    allowNull: false
  },
  value: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  }
}, {
  tableName: 'supported_langs'
})

const Race = sequelize.define('race', {
  textId: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  },
  language: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  tableName: 'races'
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
  cpm: {
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
  },
  isWinner: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  position: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  language: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  tableName: 'race_players'
})

Race.belongsTo(Text, { foreignKey: 'textId', targetKey: 'id' })
RacePlayer.belongsTo(Race, { foreignKey: 'raceId', targetKey: 'id' })
RacePlayer.belongsTo(User, { foreignKey: 'userUid', targetKey: 'uid' })
Text.hasMany(Race, { foreignKey: 'textId', sourceKey: 'id' })
Race.hasMany(RacePlayer, { foreignKey: 'raceId', sourceKey: 'id' })
User.hasMany(RacePlayer, { foreignKey: 'userUid', sourceKey: 'uid' })

module.exports = {
  sequelize,
  User,
  Text,
  Race,
  RacePlayer,
  SupportedLang
}
