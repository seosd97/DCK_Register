const riotApi = require('./riot_api');
const { Summoner, Tournament } = require('../../models');
const errorHandler = require('../errorHandler');

// TODO : 현재 시즌은 추후 계산하도록 작업
const season = 4;
const limitSummoner = 20;

exports.getSummonerByName = async (ctx) => {
  let summoner = await Summoner.findOne({
    where: {
      name: ctx.params.name,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });

  if (summoner === null) {
    const res = await riotApi.getSummonerDataByName(ctx.params.summoner_id);

    if (res.status >= 400) {
      ctx.status = res.status;
      ctx.body = res.data;
      return;
    }

    summoner = res.data;
  }

  ctx.status = 200;
  ctx.body = summoner;
};

exports.getSummoners = async (ctx) => {
  const payload = await this.getSummonerDTOs(ctx.params.season_id);

  ctx.status = 200;
  ctx.body = payload;
};

exports.getSummonerDTOs = async (seasonId) => {
  const tournament = await Tournament.findOne({
    where: {
      seasonId: seasonId,
    },
  });

  if (tournament === null) {
    return [];
  }

  const summoners = await tournament.getSummoners({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
    joinTableAttributes: [],
    raw: true,
  });

  let payload = [];
  for (let i in summoners) {
    const summonerDto = await makeSummonerDto(summoners[i]);
    payload.push(summonerDto);
  }

  return payload;
};

exports.registerSummoner = async (ctx) => {
  const { summonerId } = ctx.request.body;
  const res = await riotApi.getSummonerData(summonerId);

  if (res.status >= 400) {
    ctx.status = res.status;
    ctx.body = res.data;
    return;
  }

  let tournamentData = await Tournament.findOne({
    where: {
      seasonId: season,
    },
  });

  if (tournamentData === null) {
    tournamentData = await Tournament.create({ name: `DCK SEASON ${season}`, seasonId: season });
  }

  const summonerCount = await tournamentData.countSummoners();
  if (summonerCount >= limitSummoner) {
    ctx.body = errorHandler.responseError(401, 'the limit summoner has been exceeded');
    return;
  }

  const dupSummoner = await tournamentData.getSummoners({
    where: {
      sid: summonerId,
    },
  });

  if (Array.isArray(dupSummoner) && dupSummoner.length) {
    ctx.body = errorHandler.responseError(400, 'duplicate summoner id');
    return;
  }

  let summonerData = await Summoner.findOne({
    where: { sid: summonerId },
  });

  if (summonerData === null) {
    const dto = res.data;
    summonerData = await Summoner.create({
      sid: dto.id,
      name: dto.name,
      puuid: dto.puuid,
      accountId: dto.accountId,
      profileIconId: dto.profileIconId,
      summonerLevel: dto.summonerLevel,
    });
  }

  await tournamentData.addSummoners([summonerData]);

  ctx.status = 200;
  ctx.body = errorHandler.responseError(200, 'OK');
};

exports.unregisterSummoner = async (ctx) => {
  const { summonerId } = ctx.request.body;

  try {
    await Summoner.destroy({
      where: {
        sid: summonerId,
      },
    });

    ctx.status = 200;
    ctx.body = errorHandler.responseError(200, 'OK');
  } catch (err) {
    ctx.status = 400;
    ctx.body = errorHandler.responseError(400, err);
  }
};

const makeSummonerDto = async (summonerData) => {
  let payload = summonerData;
  const leagueData = await riotApi.getLeagueData(summonerData.sid);

  let leagueDto = null;
  for (let i in leagueData.data) {
    const dto = leagueData.data[i];
    if (dto.queueType === 'RANKED_SOLO_5x5') {
      leagueDto = dto;
      break;
    }
  }

  payload.leagueDto = leagueData.data;

  return payload;
};

// TODO : 추후 변경 예정
exports.registerTournament = async (ctx) => {
  const { seasonId, tournamentName } = ctx.request.body;

  const tournamentData = await Tournament.findOne({
    where: {
      seasonId: seasonId,
    },
  });

  if (tournamentData !== null) {
    ctx.status = 400;
    ctx.body = errorHandler.responseError(400, 'duplicate season id');

    return;
  }

  await Tournament.create({
    seasonId: seasonId,
    name: tournamentName,
  });

  ctx.status = 200;
  ctx.body = errorHandler.responseError(200, 'OK');
};
