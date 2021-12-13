var readKeypair = require('../../solana/read_keypair')
  , path = require('path');

module.exports = function () {
  var filename = path.join(__dirname, './creator.json');
  return readKeypair(filename);
};
