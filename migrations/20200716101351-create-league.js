'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Leagues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      leagueId: {
        type: Sequelize.STRING,
      },
      queueType: {
        type: Sequelize.STRING,
      },
      tier: {
        type: Sequelize.STRING,
      },
      rank: {
        type: Sequelize.STRING,
      },
      sid: {
        type: Sequelize.STRING,
      },
      summonerName: {
        type: Sequelize.STRING,
      },
      leaguePoints: {
        type: Sequelize.INTEGER,
      },
      wins: {
        type: Sequelize.INTEGER,
      },
      losses: {
        type: Sequelize.INTEGER,
      },
      veteran: {
        type: Sequelize.BOOLEAN,
      },
      inactive: {
        type: Sequelize.BOOLEAN,
      },
      freshBlood: {
        type: Sequelize.BOOLEAN,
      },
      hotStreak: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Leagues');
  },
};
