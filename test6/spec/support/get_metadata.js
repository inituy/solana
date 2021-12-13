var solana = require('@solana/web3.js');
var metaplex = require('@metaplex/js');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
          new solana.PublicKey(params.token).toBuffer()
        ],
        metaplex.programs.metadata.MetadataProgram.PUBKEY
      );
    })
    .then(function (pda) {
      var publicKey = pda[0];
      return metaplex.programs.metadata.Metadata.load(params.connection, publicKey);
    });
};
