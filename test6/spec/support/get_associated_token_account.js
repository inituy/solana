var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');

module.exports = function (params) {
  // var token = new spltoken.Token({
  //   connection: params.connection,
  //   publicKey: new solana.PublicKey(params.token),
  //   programId: spltoken.TOKEN_PROGRAM_ID,
  //   payer: params.owner,
  // });
  return Promise.resolve()
    .then(function () {
      return spltoken.Token.getAssociatedTokenAddress(
        spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        spltoken.TOKEN_PROGRAM_ID,
        params.owner,
        params.wallet,
      );
    })
    .then(function (publicKey) {
      return publicKey;
    });
};
