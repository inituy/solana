var fs = require('fs');
var solana = require('@solana/web3.js');

var createNft = require('./create_nft');
var mintNft = require('./mint_nft');

// 1. load secret keys
var secrets = [
  new Uint8Array(JSON.parse(fs.readFileSync('./id1.json'))),
  new Uint8Array(JSON.parse(fs.readFileSync('./id2.json'))),
  new Uint8Array(JSON.parse(fs.readFileSync('./id3.json'))),
];

var keys = [
  solana.Keypair.fromSecretKey(secrets[0]),
  solana.Keypair.fromSecretKey(secrets[1]),
  solana.Keypair.fromSecretKey(secrets[2]),
];

var conn = new solana.Connection('https://api.devnet.solana.com', 'confirmed')
  , token;

Promise.resolve()
  .then(function () {
    console.log(new Date(), 'Starting...');
    return createNft({
      connection: conn,
      owner: keys[0],
      metadata: {
        symbol: '$INIT',
        name: 'init.uy logo',
        uri: 'https://init.uy/images/og-image.png',
        sellerFee: 5000,
        creators: [{ keypair: keys[1], share: 100 }]
      }
    })
  })
  .then(function (recentlyCreatedToken) {
    token = recentlyCreatedToken;
    console.log(new Date(), 'Created NFT!');
    console.log(new Date(), 'Your token address is:', token.publicKey.toString());
  })
  .then(function () {
    console.log(new Date(), 'Minting NFT...');
    return mintNft({
      connection: conn,
      token: token,
      owner: keys[0],
      receiver: keys[2],
      metadata: {
        uri: 'https://init.uy/images/crear-tu-sitio-y-alojarlo-gratis.png'
      }
    });
  })
  .then(function () {
    console.log(new Date(), 'Minted NFT to:', keys[2].publicKey.toString());
    process.exit(1);
  });
