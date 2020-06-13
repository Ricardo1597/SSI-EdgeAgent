'use strict';
const homedir = require('home-dir');
const fs = require('fs');


// Refresh token version is used to revoke refresh tokens
let refreshTokenVersion;

exports.getRefreshTokenVersion = (walletName) => {
  console.log(walletName);
  if (!refreshTokenVersion) {
    const path = homedir('/.indy_client/' + walletName + '_refreshTokenVersion.json');
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({refreshTokenVersion: 0}));
    }
    refreshTokenVersion = JSON.parse(fs.readFileSync(path)).refreshTokenVersion;
  }
  return refreshTokenVersion;
}

exports.incrementRefreshTokenVersion = (walletName) => {
  console.log(walletName);
  refreshTokenVersion++;
  fs.writeFileSync(
    homedir('/.indy_client/' + walletName + '_refreshTokenVersion.json'), 
    JSON.stringify({refreshTokenVersion})
  );
}