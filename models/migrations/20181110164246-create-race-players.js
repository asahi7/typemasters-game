'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('race_players', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userUid: {
        type: Sequelize.STRING,
        allowNull: false
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
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('race_players')
  }
}
