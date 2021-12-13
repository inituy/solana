var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return spltoken.Token.getAssociatedTokenAddress(
        spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        spltoken.TOKEN_PROGRAM_ID,
        new solana.PublicKey(params.token),
        new solana.PublicKey(params.wallet),
      );
    })
    .then(function (publicKey) {
      return params.connection.getAccountInfo(publicKey);
    });
};
