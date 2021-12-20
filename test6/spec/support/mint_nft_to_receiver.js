var path = require('path');
var mintCandyMachineNft = require('../../candymachine/mint_candy_machine_nft')

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return mintCandyMachineNft({
        connection: params.connection,
        rootPath: path.join(__dirname, './nft'),
        environment: 'devnet',
        receiver: params.receiverKeypair,
      })
    });
};
