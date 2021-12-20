var phantom = window.solana;
var solana = require('./solana/web3.js');
var exchangeNft = require('./app/exchange_nft');
var connection = new solana.Connection('https://api.devnet.solana.com');

document.querySelector('button').addEventListener('click', function () {
  Promise.resolve()
    .then(function () {
      return exchangeNft({
        connection: connection,
        receiverAddress: phantom.publicKey,
        programId: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
        nftMintAddress: new solana.PublicKey('J53xXw6rGhWfR9ainyiZ4kJtsYmhsHNzMjNDyJgpSVwD'),
        intermediaryTokenMintAddress: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
        creatorIntermediaryTokenAtaAddress: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
        rewardCandyMachineProgramAddress: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
        rewardCandyMachineConfigAddress: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
        rewardCandyMachineAddress: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
      });
    })
    .then(function (trx) {
      console.log(new Date(), 'Sending transaction...', trx);
      return phantom.signAndSendTransaction(trx);
    })
    .then(function (_) {
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
