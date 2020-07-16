'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tournament = sequelize.define(
    'Tournament',
    {
      name: { type: DataTypes.STRING, defaultValue: '' },
      seasonId: DataTypes.INTEGER,
    },
    {}
  );

  Tournament.associate = function (models) {
    Tournament.belongsToMany(models.Summoner, { through: 'TournamentSummoners' });
  };

  return Tournament;
};
