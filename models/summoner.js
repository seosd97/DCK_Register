'use strict';
module.exports = (sequelize, DataTypes) => {
  const Summoner = sequelize.define(
    'Summoner',
    {
      sid: DataTypes.STRING,
      name: DataTypes.STRING,
      puuid: DataTypes.STRING,
      accountId: DataTypes.STRING,
      profileIconId: DataTypes.INTEGER,
      summonerLevel: DataTypes.INTEGER,
    },
    {}
  );

  Summoner.associate = function (models) {
    Summoner.belongsToMany(models.Tournament, {
      through: 'TournamentSummoners',
    });
  };

  return Summoner;
};
