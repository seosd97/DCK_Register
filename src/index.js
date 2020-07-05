/* 
1. 등록된 소환사 정보 (모스트 챔피언, 역대 DCK 등수 포함)
*/

const restify = require('restify');

const server = restify.createServer();
const port = 8080;

server.use(restify.plugins.bodyParser);

server.get('/', (req, res) => {
  res.send('DCK REGISTER');
});

server.listen(port, () => {
  console.log(`DCK Register listening on ${port}`);
});
