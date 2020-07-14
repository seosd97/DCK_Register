/* 
1. 등록된 소환사 정보 (모스트 챔피언, 역대 DCK 등수 포함)
*/

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const render = require('koa-ejs');
const serve = require('koa-static');

const models = require('../models').sequelize;
const register_api = require('./apis/register_api');
const path = require('path');

const server = new Koa();
const router = new Router();

const port = 8080;

render(server, {
  root: path.join(__dirname, 'view'),
  viewExt: 'html',
  cache: process.env.NODE_ENV === 'production',
  debug: false,
  // async: true,
});

server.use(bodyparser());

router.get('/', async (ctx) => {
  // const summoners = await register_api.getSummonerDTOs(4);
  const summoners = [
    {
      id: 11,
      sid: 'RIBnRwOof_qHcYbOurqxIEeyzu0Iw7_rD1h6S_FUnlxuXA',
      name: 'NaDiapla',
      puuid: '5PwDxYhiu2rwrnQ5-YDSF4bxLuqd7zrHr42i8gC8JZvyYvEfiExjATTsTjvCq2YujB4DCUvWjiSEWA',
      accountId: 'SfNH1EeXVbdk9ioumZmRHlXR3GzUeTrwvbdk7USh7hqb',
      profileIconId: 1394,
      summonerLevel: 187,
      desiredPosition: 0,
      leagueDto: [
        {
          leagueId: '5a11a5b9-65c9-4ad0-8a81-5be88ad831c5',
          queueType: 'RANKED_SOLO_5x5',
          tier: 'GOLD',
          rank: 'I',
          summonerId: 'RIBnRwOof_qHcYbOurqxIEeyzu0Iw7_rD1h6S_FUnlxuXA',
          summonerName: 'NaDiapla',
          leaguePoints: 17,
          wins: 11,
          losses: 17,
          veteran: false,
          inactive: false,
          freshBlood: false,
          hotStreak: false,
        },
        {
          leagueId: 'f3c509e4-35e4-4ecf-8fa9-70a5b206532d',
          queueType: 'RANKED_FLEX_SR',
          tier: 'GOLD',
          rank: 'II',
          summonerId: 'RIBnRwOof_qHcYbOurqxIEeyzu0Iw7_rD1h6S_FUnlxuXA',
          summonerName: 'NaDiapla',
          leaguePoints: 0,
          wins: 25,
          losses: 33,
          veteran: false,
          inactive: false,
          freshBlood: false,
          hotStreak: false,
        },
      ],
    },
    {
      id: 12,
      sid: 'As1OE9KJJ10fcQQL2gM45JBbvctAhFFKXt9-RTeql582BA',
      name: 'GlenCheck',
      puuid: 'YnMvnMi2R3p1qOsSMG7ImI8IRBWhzFRbEYGks_5IzZFEkDayEecsijda3sNR4R_OMSOKP3Y9sDhp6Q',
      accountId: 'BDlPC_7qt5fKnYmlSpU4ckc7EkKjjM-DCNLpkvNaKWWT',
      profileIconId: 1666,
      summonerLevel: 274,
      desiredPosition: 0,
      leagueDto: [
        {
          leagueId: '5a11a5b9-65c9-4ad0-8a81-5be88ad831c5',
          queueType: 'RANKED_SOLO_5x5',
          tier: 'GOLD',
          rank: 'IV',
          summonerId: 'As1OE9KJJ10fcQQL2gM45JBbvctAhFFKXt9-RTeql582BA',
          summonerName: 'GlenCheck',
          leaguePoints: 0,
          wins: 529,
          losses: 539,
          veteran: false,
          inactive: false,
          freshBlood: false,
          hotStreak: false,
        },
      ],
    },
  ];
  await ctx.render('index', { summoners: summoners });
});

router.post('/api/summoners/register', register_api.registerSummoner);
router.post('/api/summoners/unregister', register_api.unregisterSummoner);
router.get('/api/summoners/:season_id', register_api.getSummoners);
router.get('/api/summoners/:name', register_api.getSummonerByName);

router.post('/api/tournaments/register', register_api.registerTournament);

server.use(router.routes());
server.use(router.allowedMethods());

server.use(serve('./public'));

models
  .sync({ alter: true })
  .then(() => {
    console.log('success sync db');
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });

server.listen(port, () => {
  console.log(`DCK Register listening on ${port}`);
});
