var path = require('path');
var signAllCandyMachine = require('../../candymachine/sign_all_candy_machine')

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return signAllCandyMachine({
        rootPath: path.join(__dirname, './nft'),
        environment: 'devnet',
        owner: params.creatorKeypair,
      });
    });
};
