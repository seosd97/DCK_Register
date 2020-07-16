'use strict';
module.exports = (sequelize, DataTypes) => {
  const Summoner = sequelize.define(
    'Summoner',
    {
      sid: DataTypes.STRING,
      name: DataTypes.STRING,
      puuid: DataTypes.STRING,
      accountId: DataTypes.STRING,
      profileIconId: { type: DataTypes.INTEGER, defaultValue: 0 },
      summonerLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
      desiredPosition: { type: DataTypes.INTEGER, defaultValue: 0 },
      password_digest: { type: DataTypes.STRING, defaultValue: '' },
    },
    {}
  );

  Summoner.associate = function (models) {
    Summoner.belongsToMany(models.Tournament, { through: 'TournamentSummoners' });
    Summoner.hasMany(models.League);
  };

  return Summoner;
};
