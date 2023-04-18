const {
  authenticationServiceUrl,
  applicationId,
  jwtCookieName,
  refreshTokenName,
} = require('./config');

function setCookie(name, value) {
  const newCookie = `${name}=${value}; secure; samesite=strict; path=/`;
  document.cookie = newCookie;
}

function getCookie(name) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

function storeItem(name, value) {
  localStorage.setItem(name, value);
}

function getItem(name) {
  return localStorage.getItem(name);
}

async function attemptRefresh() {
  const refreshToken = getItem(refreshTokenName);
  const res = await fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/token?${new URLSearchParams({ refreshToken })}`);
  if (res.status === 200) {
    // Successful sign in
    const resJson = await res.json();
    setCookie(jwtCookieName, resJson.token);
    storeItem(refreshTokenName, resJson.refreshToken);
    return resJson.token;
  }

  return null;
}

module.exports = {
  setCookie,
  getCookie,
  storeItem,
  getItem,
  attemptRefresh,
};
