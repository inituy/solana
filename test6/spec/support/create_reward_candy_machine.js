var path = require('path');
var createCandyMachine = require('../../candymachine/create_candy_machine')

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return createCandyMachine({
        rootPath: path.join(__dirname, './reward'),
        assetsPath: path.join(__dirname, './reward/assets'),
        environment: 'devnet',
        owner: params.creatorKeypair,
        tokenMint: params.intermediaryTokenMintAddress,
        tokenAta: params.creatorIntermediaryTokenAtaAddress,
      })
    });
};
