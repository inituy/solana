var solana = require('./solana/web3');
var connection = new solana.Connection('https://api.devnet.solana.com');

var address = 'HkLkeD1P6wa2RboRx67PXzj9oXoL713oxneA2UueZ2Qw';
connection.getAccountInfo(new solana.PublicKey(address))
  .then(function (asd) {
    console.log(asd);
    console.log(asd.owner.toString());
  });
