const Axios = require('axios');

const endpoint = 'https://kr.api.riotgames.com/lol/';

exports.getSummonerData = async (id) => {
  try {
    const data = await Axios.get(`${endpoint}summoner/v4/summoners/${id}`, {
      headers: {
        'X-Riot-Token': process.env.API_KEY,
      },
    });

    return data;
  } catch (err) {
    return err.response;
  }
};

exports.getLeagueData = async (id) => {
  try {
    const data = await Axios.get(`${endpoint}league/v4/entries/by-summoner/${id}`, {
      headers: {
        'X-Riot-Token': process.env.API_KEY,
      },
    });

    return data;
  } catch (err) {
    return err.response;
  }
};

exports.getMostPlayedData = async (account_id) => {};
