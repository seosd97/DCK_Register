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

  ctx.body = JSON.stringify(payload);
};

exports.registerSummoner = async (ctx) => {
  const { summoner_id } = ctx.params;
  const res = await riotApi.getSummonerData(summoner_id);

  if (res.status >= 400) {
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
    where: { sid: summoner_id },
  });

  if (summonerData !== null) {
    tournamentData.setSummoners([summonerData]);
    return;
  }

  summonerData = res.data;
  tournamentData.createSummoner({
    sid: summonerData.id,
    name: summonerData.name,
    puuid: summonerData.puuid,
    accountId: summonerData.accountId,
    profileIconId: summonerData.profileIconId,
    summonerLevel: summonerData.summonerLevel,
  });
};

const makeSummonerDto = async (summonerData) => {
  let result = summonerData;
  const leagueData = await riotApi.getLeagueData(summonerData.sid);
  result.leagueDto = leagueData.data;

  return result;
};
