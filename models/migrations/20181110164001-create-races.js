'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('races', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      textId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'texts',
          key: 'id'
        },
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('races')
  }
}
