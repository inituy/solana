var solana = require('@solana/web3.js');

module.exports = function () {
  return solana.Keypair.generate();
};
