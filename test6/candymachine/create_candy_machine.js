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
      })
    })
    .catch(function (error) {
      console.log(new Date(), '* Could not upload.', error);
    })
    .then(function () {
      var cmdparams = [
        'create_candy_machine',
        '--env', params.environment,
        '--keypair', secretKeyPath,
      ];
      if (!!params.tokenMint) {
        cmdparams.push('--spl-token');
        cmdparams.push(params.tokenMint);
      }
      if (!!params.tokenAta) {
        cmdparams.push('--spl-token-account');
        cmdparams.push(params.tokenAta);
      }
      return execTs({
        cwd: params.rootPath,
        params: cmdparams
      })
        .catch(function (error) {
          console.log(new Date(), '* Could not create candy machine', error);
        });
    })
    .then(function () {
      return execTs({
        cwd: params.rootPath,
        params: [
          'update_candy_machine',
          '--env', params.environment,
          '--keypair', secretKeyPath,
          '--price', '0.000000001', // will multiply by LAMPORTS_PER_SOL
          '--date', 'now',
        ]
      })
        .catch(function (error) {
          console.log(new Date(), '* Could not update candy machine', error);
        });
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
