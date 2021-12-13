var fs = require('fs');
var path = require('path');
var execTs = require('./exec_ts');

module.exports = function (params) {
  var secretKeyPath = path.join(__dirname, `id${Math.ceil(Math.random()*1000000)}.json`);
  var secretKey = `[${params.owner.secretKey.toString()}]`;
  var configPublicKey;
  return Promise.resolve()
    .then(function () { fs.writeFileSync(secretKeyPath, secretKey); })
    .then(function () {
      return execTs({
        cwd: params.rootPath,
        params: [
          'mint_one_token',
          '--env', params.environment,
          '--keypair', secretKeyPath
        ]
      })
        .catch(function () {
          console.log(new Date(), 'Couldnt mint, all NFTs minted already? Try getting rid of .cache');
        });
    })
    .then(function () { fs.unlinkSync(secretKeyPath); })
    .then(function () {
      var cachePath = path.join(params.rootPath, '.cache', `${params.environment}-temp`);
      var cacheContents = fs.readFileSync(cachePath).toString();
      var cacheJson = JSON.parse(cacheContents);
      return cacheJson;
    });
};
