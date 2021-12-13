var solana = require('@solana/web3.js');

module.exports = function (params) {
  // console.log(new Date(), 'Funding wallet...', params.wallet.toString());
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
      // console.log(new Date(), `Wallet funded, waiting for ${ms}ms...`);
      return new Promise(function (ok) { setTimeout(ok, ms); });
    });
};
