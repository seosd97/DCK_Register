const riotApi = require('./riot_api');
const { Summoner, Tournament } = require('../../models');
const errorHandler = require('../errorHandler');

// TODO : 현재 시즌은 추후 계산하도록 작업
const season = 4;
const limitSummoner = 20;

exports.getSummonerByName = async (ctx) => {
  const summoner = await Summoner.findOne({
    where: {
      name: ctx.params.name,
    },
  });

  let payload = {};
  if (summoner === null) {
    payload = await makeSummonerDtoByNameFromRiot(ctx.params.name);
    payload.alreadyRegistered = false;
  } else {
    payload = await makeSummonerDto(summoner);
    payload.alreadyRegistered = true;
  }

  ctx.status = 200;
  ctx.body = payload;
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
  });

  let payload = [];
  for (let i in summoners) {
    const summonerDto = await makeSummonerDto(summoners[i]);
    payload.push(summonerDto);
  }

  return payload;
};

exports.registerSummoner = async (ctx) => {
  const reqData = ctx.request.body;

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
    ctx.status = 401;
    ctx.body = errorHandler.responseError(401, 'the limit summoner has been exceeded');
    return;
  }

  const dupSummoner = await tournamentData.getSummoners({
    where: {
      sid: reqData.summonerId,
    },
  });

  if (Array.isArray(dupSummoner) && dupSummoner.length) {
    ctx.status = 400;
    ctx.body = errorHandler.responseError(400, 'duplicate summoner id');
    return;
  }

  let summonerData = await Summoner.findOne({
    where: { sid: reqData.summonerId },
  });

  if (summonerData === null) {
    const res = await riotApi.getSummonerData(reqData.summonerId);

    if (res.status >= 400) {
      ctx.status = res.status;
      ctx.body = res.data;
      return;
    }

    const dto = res.data;
    summonerData = await Summoner.create({
      sid: dto.id,
      name: dto.name,
      puuid: dto.puuid,
      accountId: dto.accountId,
      profileIconId: dto.profileIconId,
      summonerLevel: dto.summonerLevel,
      desiredPosition: reqData.position,
      password_digest: reqData.password,
    });

    const leagueDto = await riotApi.getLeagueData(dto.id);
    if (leagueDto.status >= 400) {
      ctx.status = leagueDto.status;
      ctx.body = leagueDto.data;
      return;
    }

    for (let i in leagueDto.data) {
      const leagueData = leagueDto.data[i];

      await summonerData.createLeague({
        leagueId: leagueData.leagueId,
        queueType: leagueData.queueType,
        tier: leagueData.tier,
        rank: leagueData.rank,
        sid: leagueData.summonerId,
        summonerName: leagueData.summonerName,
        leaguePoints: leagueData.leaguePoints,
        wins: leagueData.wins,
        losses: leagueData.losses,
        veteran: leagueData.veteran,
        inactive: leagueData.inactive,
        freshBlood: leagueData.freshBlood,
        hotStreak: leagueData.hotStreak,
      });
    }
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
  let payload = summonerData.toJSON();
  const leagueData = await summonerData.getLeagues();

  let leagueDto = null;
  for (let i in leagueData) {
    const dto = leagueData[i];
    if (dto.queueType === 'RANKED_SOLO_5x5') {
      leagueDto = dto.toJSON();
      break;
    }
  }

  payload.leagueDto = leagueDto;

  return payload;
};

const makeSummonerDtoByNameFromRiot = async (name) => {
  const res = await riotApi.getSummonerDataByName(name);

  if (res.status >= 400) {
    return errorHandler(res.status, res.data);
  }

  let payload = res.data;
  const leagueDto = await riotApi.getLeagueData(res.data.id);
  if (leagueDto.status >= 400) {
    return errorHandler(res.status, res.data);
  }

  const soloRank = await leagueDto.data.find((l) => {
    return l.queueType === 'RANKED_SOLO_5x5';
  });

  if (soloRank !== undefined) {
    payload.leagueDto = soloRank;
  }

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
