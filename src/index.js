/* 
1. 등록된 소환사 정보 (모스트 챔피언, 역대 DCK 등수 포함)
*/

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const render = require('koa-ejs');

const models = require('../models').sequelize;
const register_api = require('./apis/register_api');
const path = require('path');

const server = new Koa();
const router = new Router();

const port = 8080;

render(server, {
  root: path.join(__dirname, 'view'),
  viewExt: 'html',
  cache: false,
  debug: false,
});

server.use(bodyparser());

router.get('/', async (ctx) => {
  await ctx.render('register_form');
});

router.post('/api/register', register_api.registerSummoner);
router.get('/api/summoners/:season_id', register_api.getSummoners);

server.use(router.routes());
server.use(router.allowedMethods());

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
