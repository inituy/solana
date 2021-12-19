var solana = require('@solana/web3.js');
var metaplex = require('@metaplex/js');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
          new solana.PublicKey(params.token).toBuffer(),
          Buffer.from('edition'),
        ],
        metaplex.programs.metadata.MetadataProgram.PUBKEY
      );
    })
    .then(function (pda) {
      return pda[0];
    });
};
