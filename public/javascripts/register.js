const searchForm = document.getElementById('search-form');
const searchBox = document.getElementById('search-textbox');
const searchButton = document.getElementById('search-button');

searchButton.onclick = (e) => {
  const name = searchBox.value;

  if (!nameValidator(name)) {
    return;
  }

  const http = new XMLHttpRequest();
  http.onreadystatechange = () => {
    if (http.readyState === http.DONE) {
      console.log(http.response);
    }
  };

  http.open('GET', `http://localhost:8080/api/summoners/${name}`, true);
  http.send();
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
    console.log(label);
    label = createErrorText(err);
  }

  label.innerText = err;
  searchForm.appendChild(label);
};

const createErrorText = () => {
  const label = document.createElement('div');
  label.classList = ['error-label'];

  return label;
};
