var solana = require('@solana/web3.js');
var wait = require('./wait');

module.exports = function (params) {
  console.log('Funding wallet...', params.wallet.toString());
  var amount = solana.LAMPORTS_PER_SOL * 5;
  return Promise.resolve()
    .then(function () {
      return params.connection.requestAirdrop(params.wallet, amount);
    })
    .then(function (signature) {
      return params.connection.confirmTransaction(signature);
    })
    .then(function () {
      var ms = 10000;
      console.log(`Wallet funded, waiting for ${ms}ms...`);
      return wait(ms);
    });
};
