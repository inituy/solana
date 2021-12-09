var solana = require('@solana/web3.js');

module.exports = function mintNft(input) {
  var AMOUNT = 1;

  var throwawayMintAuthority = solana.Keypair.generate()
    , receivingTokenAccount;

  return Promise.resolve()
    .then(function () {
      return input.token.getOrCreateAssociatedAccountInfo(input.receiver.publicKey);
    })
    .then(function (_) {
      receivingTokenAccount = _;
    })
    .then(function () {
      return input.token.mintTo(
        receivingTokenAccount.address,
        input.owner.publicKey,
        [],
        AMOUNT,
      );
    })
    .then(function () {
      return input.token.setAuthority(
        input.token.publicKey,
        throwawayMintAuthority.publicKey,
        'MintTokens',
        input.owner,
        []
      );
    });
};
