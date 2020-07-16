'use strict';

const summoner = require('./summoner');

module.exports = (sequelize, DataTypes) => {
  const League = sequelize.define(
    'League',
    {
      leagueId: DataTypes.STRING,
      queueType: DataTypes.STRING,
      tier: DataTypes.STRING,
      rank: DataTypes.STRING,
      sid: DataTypes.STRING,
      summonerName: DataTypes.STRING,
      leaguePoints: DataTypes.INTEGER,
      wins: DataTypes.INTEGER,
      losses: DataTypes.INTEGER,
      veteran: DataTypes.BOOLEAN,
      inactive: DataTypes.BOOLEAN,
      freshBlood: DataTypes.BOOLEAN,
      hotStreak: DataTypes.BOOLEAN,
    },
    {}
  );
  League.associate = function (models) {
    League.belongsTo(models.Summoner, {
      onDelete: 'CASCADE',
    });
  };
  return League;
};
