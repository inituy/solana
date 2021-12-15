const solana = require('@solana/web3.js');

function name(params) {
  const connection = new solana.Connection('https://api.devnet.solana.com')
  const pubkey = new solana.PublicKey('CZG9X8YdhoZgNkZGnQaawvjkMX3AGgtbg7uc4tW2YuV7')

  connection.getAccountInfo(pubkey).then(function (params) {
    console.log(params);
  })
} name()