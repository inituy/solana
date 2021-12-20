var fs = require('fs');
var path = require('path');
var execTs = require('./utils/exec_ts');

module.exports = function (params) {
  var secretKeyPath = path.join(__dirname, `id${Math.ceil(Math.random()*1000000)}.json`);
  var secretKey = `[${params.receiver.secretKey.toString()}]`;
  var signature;
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
        .then(function (stdout) {
          signature = stdout.match(/mint_one_token finished (.*)/);
          signature = signature[1].trim();
        })
        .catch(function (error) {
          console.log(new Date(), 'Could not mint:', error);
        });
    })
    .then(function () {
      console.log(new Date(), 'Deleting temporary secret key:', secretKeyPath);
      try { fs.unlinkSync(secretKeyPath); } catch (e) {}
    })
    .then(function () {
      console.log(new Date(), 'Fetching transaction...', signature);
      function loop() {
        return params
          .connection
          .getTransaction(signature, 'confirmed')
          .then(function (trx) {
            if (!trx) return loop();
            return trx;
          });
      }
      return loop();
    })
    .then(function (trx) {
      var address = trx.transaction.message.accountKeys[1];
      // console.log(new Date(), 'Got mint address:', address.toString());
      return address;
    })
};
