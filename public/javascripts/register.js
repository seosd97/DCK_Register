const searchForm = document.getElementById('search-form');
const searchBox = document.getElementById('search-textbox');
const searchButton = document.getElementById('search-button');
const summonerInfo = document.getElementById('register-preview');
const registerSubmit = document.getElementById('register-submit');

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

  fetch(`http://localhost:8080/api/lol/summoners/by_name/${encodeURI(name)}`, {
    method: 'GET',
  })
    .then(async (res) => {
      searchButton.disabled = false;

      if (res.status >= 400) {
        setErrorText(res.statusText);
        return;
      }

      const data = await res.json();
      invalidateSummonerInfo(data);

      curSummoner = data;
    })
    .catch((err) => {
      searchButton.disabled = false;

      console.log(err);
    });
};

registerSubmit.onclick = (e) => {
  const passwordField = document.querySelector('#password-field');
  const desiredPosition = document.querySelector('input[name="radio-position"]:checked');

  const payload = {
    summonerId: curSummoner.id,
    password: '',
    position: desiredPosition.value,
  };

  fetch('http://localhost:8080/api/summoners/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      res.json().then((j) => {});
    })
    .catch((err) => {
      console.log(err);
    });
};

const nameValidator = (name) => {
  if (name == null || name === '') {
    setErrorText('소환사명을 입력해주세요.');
    return false;
  }

  const result = name.match(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g);
  if (result !== null) {
    setErrorText('특수문자를 사용 할 수 없습니다.');
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
  summonerInfo.classList.add('fade-in');
};
