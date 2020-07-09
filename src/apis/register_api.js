const riotApi = require('./riot_api');
const { Summoner, Tournament, TournamentSummoner } = require('../../models');
const errorHandler = require('../errorHandler');
const tournament = require('../../models/tournament');

// TODO : 현재 시즌은 추후 계산하도록 작업
const season = 4;
const limitSummoner = 20;

exports.getSummoners = async (ctx) => {
  const tournament = await Tournament.findOne({
    where: {
      seasonId: ctx.params.season_id,
    },
  });

  if (tournament === null) {
    ctx.body = errorHandler.responseError(400, 'invalid season id');

    return;
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

  ctx.status = 200;
  ctx.body = JSON.stringify(payload);
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
    sid: summonerId,
  });

  if (dupSummoner !== null) {
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

  await tournamentData.setSummoners([summonerData]);

  ctx.status = 200;
};

const makeSummonerDto = async (summonerData) => {
  let result = summonerData;
  const leagueData = await riotApi.getLeagueData(summonerData.sid);
  result.leagueDto = leagueData.data;

  return result;
};

// TODO : 추후 변경 예정
exports.registerTournament = async (ctx) => {
  const { seasonId } = ctx.request.body;

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
  });

  ctx.status = 200;
};
