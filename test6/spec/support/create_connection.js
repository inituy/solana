var solana = require('@solana/web3.js');

module.exports = function () {
  return new solana.Connection('https://api.devnet.solana.com', 'confirmed')
};
