var fs = require('fs');
var bs58 = require('bs58');
var solana = require('@solana/web3.js');
var createNft = require('./create_nft');

// 1. load secret keys
var secrets = [
  new Uint8Array(JSON.parse(fs.readFileSync('./id1.json'))),
  new Uint8Array(JSON.parse(fs.readFileSync('./id2.json'))),
  new Uint8Array(JSON.parse(fs.readFileSync('./id3.json'))),
];

var keys = [
  solana.Keypair.fromSecretKey(secrets[0]), // payer
  solana.Keypair.fromSecretKey(secrets[1]), // mint authority
  solana.Keypair.fromSecretKey(secrets[2]),
];


Promise.resolve()
  .then(function () {
    console.log(new Date(), 'Starting...');
    return createNft({
      connection: new solana.Connection('https://api.devnet.solana.com', 'confirmed'),
      payer: keys[0],
      metadata: {
        symbol: '$INIT',
        name: 'init.uy logo',
        uri: 'https://init.uy/images/og-image.png',
        sellerFee: 10000,
        creators: [
          { keypair: keys[1], share: 50 },
          { keypair: keys[2], share: 50 },
        ]
      }
    })
  })
  .then(function (token) {
    console.log(new Date(), 'Done!');
    console.log(new Date(), 'Your token address is:', token.publicKey.toString());
  })
  .then(function () {
    process.exit(1);
  });
