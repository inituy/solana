var fs = require('fs');
var solana = require('@solana/web3.js');

module.exports = function (filepath) {
  var file = fs.readFileSync(filepath).toString();
  var json = JSON.parse(file);
  var secret = new Uint8Array(json);
  return solana.Keypair.fromSecretKey(secret);
};
