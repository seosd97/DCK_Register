const searchForm = document.getElementById('search-form');
const searchBox = document.getElementById('search-textbox');
const searchButton = document.getElementById('search-button');
const summonerInfo = document.getElementById('register-preview');
const registerSubmit = document.getElementById('register-submit');
const previousButton = document.getElementById('previous-btn');

let curSummoner = null;

searchButton.onclick = (e) => {
  const name = searchBox.value;

  if (!nameValidator(name)) {
    return;
  }

  if (curSummoner !== null && curSummoner.name.toLowerCase() === name.toLowerCase()) {
    moveToSummonerInfo();
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
      moveToSummonerInfo();

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

  // TODO : 이미 다른 시즌에 등록된 유저의 경우 id값이 db의 id로 넘어올 수 있음.
  if (curSummoner.alreadyRegistered) {
    requestUnRegister({
      summonerId: curSummoner.sid,
      password: '',
    })
      .then((res) => {
        if (res.status >= 400) {
          res.json().then((j) => {
            console.log(j);
          });
          return;
        }

        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    requestRegister({
      summonerId: curSummoner.id,
      password: '',
      position: desiredPosition.value,
    })
      .then((res) => {
        if (res.status >= 400) {
          res.json().then((j) => {
            console.log(j);
          });
          return;
        }

        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

const requestRegister = async (data) => {
  return fetch('http://localhost:8080/api/summoners/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

const requestUnRegister = async (data) => {
  return fetch('http://localhost:8080/api/summoners/unregister', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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

  // if (curSummoner !== null && curSummoner.name.toLowerCase() === name.toLowerCase()) {
  //   console.log('duplicated name of current summoner\'s name');
  //   return false;
  // }

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

// TODO : 현재 등록 된 유저와 그렇지 않은 유저의 id가 다르게 오고 있음.
//        해당 부분을 서버 쪽에서 꼭 처리 해야 함.
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

  const posValue = data.desiredPosition !== undefined ? data.desiredPosition : 0;
  const desiredPosition = document.querySelector(
    `#position-select-list input[value='${posValue}']`
  );
  desiredPosition.checked = true;

  if (data.alreadyRegistered) {
    registerSubmit.value = '등록 취소';
  } else {
    registerSubmit.value = '등록';
  }
};

previousButton.onclick = (e) => {
  moveToSearchForm();
};

searchForm.addEventListener('animationend', () => {
  if (searchForm.classList.contains('anm-fo-l')) {
    searchForm.classList.add('disabled');
    searchForm.classList.remove('anm-fo-l');

    summonerInfo.classList.remove('disabled');
    summonerInfo.classList.add('anm-fi-l');
  } else if (searchForm.classList.contains('anm-fi-r')) {
    searchForm.classList.remove('disabled');
    searchForm.classList.remove('anm-fi-r');
  }
});

summonerInfo.addEventListener('animationend', () => {
  if (summonerInfo.classList.contains('anm-fo-r')) {
    summonerInfo.classList.add('disabled');
    summonerInfo.classList.remove('anm-fo-r');

    searchForm.classList.remove('disabled');
    searchForm.classList.add('anm-fi-r');
  } else if (summonerInfo.classList.contains('anm-fi-l')) {
    summonerInfo.classList.remove('disabled');
    summonerInfo.classList.remove('anm-fi-l');
  }
});

const moveToSummonerInfo = () => {
  searchForm.classList.add('anm-fo-l');
};

const moveToSearchForm = () => {
  summonerInfo.classList.add('anm-fo-r');
};
