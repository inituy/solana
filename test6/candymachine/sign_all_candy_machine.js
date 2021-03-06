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
          'sign_all',
          '--env', params.environment,
          '--keypair', secretKeyPath,
        ]
      })
    })
    .catch(function (error) {
      console.log(new Date(), '* Could not sign all.', error);
    })
    .then(function () {
      console.log(new Date(), 'Deleting temporary secret key:', secretKeyPath);
      try { fs.unlinkSync(secretKeyPath); } catch (e) {}
    })
    .then(function () {
      var cachePath = path.join(params.rootPath, '.cache', `${params.environment}-temp`);
      var cacheContents = fs.readFileSync(cachePath).toString();
      var cacheJson = JSON.parse(cacheContents);
      return cacheJson;
    })
    .catch(console.log);
};
