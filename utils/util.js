function setCookie(name, value) {
  const newCookie = `${name}=${value}; max-age=${60*60*24}; secure; samesite=strict`;
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
