'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tournament = sequelize.define(
    'Tournament',
    {
      name: DataTypes.STRING,
    },
    {}
  );

  Tournament.associate = function (models) {
    Tournament.belongsToMany(models.Summoner, { through: 'TournamentSummoners' });
  };

  return Tournament;
};
