const riotApi = require('./riot_api');
const { Summoner, Tournament, TournamentSummoner } = require('../../models');
const summoner = require('../../models/summoner');

// TODO : 현재 시즌은 추후 계산하도록 작업
const season = 4;

exports.getSummoners = async (ctx) => {
  const tournament = await Tournament.findOne({
    where: {
      seasonId: ctx.params.season_id,
    },
  });

  if (tournament === null) {
    ctx.body = {
      status: {
        status_code: 400,
        message: 'invalid seasonId',
      },
    };
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
