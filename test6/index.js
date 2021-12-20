var phantom = window.solana;
var solana = require('./solana/web3.js');
var exchangeNft = require('./app/exchange_nft');
var connection = new solana.Connection('https://api.devnet.solana.com');

document.querySelector('button').addEventListener('click', function () {
  Promise.resolve()
    .then(function () {
      // TODO: Move to .env
      var addrs = [
        '68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ',
        '8Mwn68bxvFSgvqdrmDY6Uffm6FuDWncphBnRywz1yChv',
        'C4mK7STgAaNRpEcT4Xmbgbsyz1siyrenmiCciSh1FoyK',
        'DNy7Mb5z2tqGGpjNmLPLgPpjSLNzvzNZMcNscEY2zqLw',
        '6m4YHztTAnN2swbX1Si7CkjWsnyUUSf7t6Jwo3FNs5da',
        'G4HGGAAi7fNqPWvoiXKGvzrCxahLq9YZwyerc3tPvL9T',
      ];
      return exchangeNft({
        receiverAddress: phantom.publicKey,
        connection: connection,
        programId: new solana.PublicKey(addrs[0]),
        nftMintAddress: new solana.PublicKey(addrs[1]),
        intermediaryTokenMintAddress: new solana.PublicKey(addrs[2]),
        creatorIntermediaryTokenAtaAddress: new solana.PublicKey(addrs[3]),
        rewardCandyMachineConfigAddress: new solana.PublicKey(addrs[4]),
        rewardCandyMachineAddress: new solana.PublicKey(addrs[5]),
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
