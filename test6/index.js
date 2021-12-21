var phantom = window.solana;
var solana = require('./solana/web3.js');
var spltoken = require('./spltoken/spltoken');
var exchangeNft = require('./app/exchange_nft');
var connection = new solana.Connection('https://api.devnet.solana.com');
var bs58 = require('bs58');

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();
  programId = new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ');
  Promise.resolve()
    .then(function () {
      return exchangeNft({
        receiverAddress: phantom.publicKey,
        connection: connection,
        programId: programId,
        nftMintAddress: new solana.PublicKey(document.querySelectorAll('input')[0].value),
        intermediaryTokenMintAddress: new solana.PublicKey(document.querySelectorAll('input')[1].value),
        creatorIntermediaryTokenAtaAddress: new solana.PublicKey(document.querySelectorAll('input')[2].value),
        rewardCandyMachineConfigAddress: new solana.PublicKey(document.querySelectorAll('input')[3].value),
        rewardCandyMachineAddress: new solana.PublicKey(document.querySelectorAll('input')[4].value),
      });
    })
    .then(function (trx) {
      console.log(new Date(), 'Sending transaction...', trx);
      return phantom.signAndSendTransaction(trx);
    })
    .then(function (_) {
      console.log(new Date(), 'Confirming transaction...', _.signature);
      return connection.confirmTransaction(_.signature);
    })
    .then(function () {
      console.log(new Date(), 'Confirmed!');
    })
    .catch(function (error) {
      console.log(new Date(), 'Failed', error);
    });
});

phantom.on('connect', function (a) { console.log(phantom.publicKey.toString()); });
phantom.connect();
