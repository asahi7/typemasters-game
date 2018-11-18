'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable('race_players', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userUid: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'users',
          key: 'uid'
        }
      },
      raceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'races',
          key: 'id'
        },
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
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable('race_players')
  }
}
