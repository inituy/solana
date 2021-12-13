var spltoken = require('@solana/spl-token');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return spltoken.Token.createMint(
        params.connection,
        params.owner,           // Payer
        params.owner.publicKey, // Mint authority
        params.owner.publicKey, // Freeze authority
        params.decimals || 0,
        spltoken.TOKEN_PROGRAM_ID
      );
    })
    .then(function (token) {
      return token.publicKey;
    });
};
