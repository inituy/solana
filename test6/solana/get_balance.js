var solana = require('@solana/web3.js');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return params.connection.getBalance(
        new solana.PublicKey(params.wallet),
        'confirmed',
      );
    });
};
