const searchForm = document.getElementById('search-form');
const searchBox = document.getElementById('search-textbox');
const searchButton = document.getElementById('search-button');
const summonerInfo = document.getElementById('register-preview');

let curSummoner = null;

searchButton.onclick = (e) => {
  const name = searchBox.value;

  if (!nameValidator(name)) {
    return;
  }

  if (curSummoner !== null && curSummoner.name.toLowerCase() === name.toLowerCase()) {
    setErrorText('중복된 소환사명 입니다.');
    return;
  }

  searchButton.disabled = true;
  setErrorText('');

  fetch(`http://localhost:8080/api/summoners/by_name/${name}`, {
    method: 'GET',
  })
    .then(async (res) => {
      if (res.status >= 400) {
        setErrorText(res.statusText);
        return;
      }

      const data = await res.json();
      invalidateSummonerInfo(data);

      curSummoner = data;

      searchButton.disabled = false;
    })
    .catch((err) => {
      console.log(err);

      searchButton.disabled = false;
    });
};

const nameValidator = (name) => {
  if (name == null || name === '') {
    setErrorText('소환사명을 입력해주세요.');
    return false;
  }

  // TODO : regex로 특문 제외해야 함
  return true;
};

const setErrorText = (err) => {
  let label = searchForm.querySelector('.error-label');
  if (label === null) {
    label = createErrorText(err);
  }

  if (err === '') {
    label.style.display = 'none';
  }

  label.innerText = err;
  searchForm.appendChild(label);
};

const createErrorText = () => {
  const label = document.createElement('div');
  label.classList = ['error-label'];

  return label;
};

const invalidateSummonerInfo = (data) => {
  if (data === null) {
    return null;
  }

  const tierName = data.leagueDto === undefined ? 'undefined' : data.leagueDto.tier.toLowerCase();
  const winRate =
    data.leagueDto === undefined
      ? '-'
      : ((data.leagueDto.wins / (data.leagueDto.wins + data.leagueDto.losses)) * 100).toFixed(1);

  const tierImg = summonerInfo.querySelector('.tier-icon');
  tierImg.setAttribute('src', `images/ranked-emblems/Emblem_${tierName}.png`);

  const summonerName = summonerInfo.querySelector('.summoner-name');
  summonerName.innerText = data.name;

  const summonerTier = summonerInfo.querySelector('.summoner-tier');
  summonerTier.innerText =
    data.leagueDto === undefined ? 'unranked' : `${data.leagueDto.tier} ${data.leagueDto.rank}`;

  const summonerWinRate = summonerInfo.querySelector('.summoner-winrate');
  summonerWinRate.innerText =
    data.leagueDto === undefined
      ? winRate
      : `${data.leagueDto.wins} 승 ${data.leagueDto.losses} 패 (${winRate}%)`;

  summonerInfo.classList.remove('disabled');
};
