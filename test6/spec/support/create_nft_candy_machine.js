var path = require('path');
var createCandyMachine = require('../../candymachine/create_candy_machine')

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return createCandyMachine({
        rootPath: path.join(__dirname, './nft'),
        assetsPath: path.join(__dirname, './nft/assets'),
        environment: 'devnet',
        owner: params.creatorKeypair,
      })
    });
};
