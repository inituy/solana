var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');

module.exports = function (params) {
  var token = new spltoken.Token(
    params.connection,
    new solana.PublicKey(params.token),
    new solana.PublicKey(spltoken.TOKEN_PROGRAM_ID),
    params.payer
  );
  return Promise.resolve()
    .then(function () {
      return token.getOrCreateAssociatedAccountInfo(
        new solana.PublicKey(params.tokenAccountOwner)
      );
    })
    .then(function (ac) {
      return ac.address;
    });
};
