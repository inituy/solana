var solana = require('@solana/web3.js');
var metaplex = require('@metaplex/js');
var getMetadataAddress = require('./get_metadata_address');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return getMetadataAddress({ token: params.token });
    })
    .then(function (pda) {
      var publicKey = pda[0];
      return metaplex.programs.metadata.Metadata.load(params.connection, publicKey);
    });
};
