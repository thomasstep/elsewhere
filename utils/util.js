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

module.exports = {
  setCookie,
  getCookie,
};
