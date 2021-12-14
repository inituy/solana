var fs = require('fs');
var path = require('path');
var execTs = require('./utils/exec_ts');

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
          'upload', params.assetsPath,
          '--env', params.environment,
          '--keypair', secretKeyPath,
        ]
      });
    })
    .then(function () {
      return execTs({
        cwd: params.rootPath,
        params: [
          'create_candy_machine',
          '--env', params.environment,
          '--keypair', secretKeyPath,
          '-p', '1',
        ]
      })
        .catch(function () {
          console.log(new Date(), 'Candy machine already created');
        });
    })
    .then(function () {
      try { fs.unlinkSync(secretKeyPath); } catch (e) {}
    })
    .then(function () {
      var cachePath = path.join(params.rootPath, '.cache', `${params.environment}-temp`);
      var cacheContents = fs.readFileSync(cachePath).toString();
      var cacheJson = JSON.parse(cacheContents);
      return cacheJson;
    });
};
