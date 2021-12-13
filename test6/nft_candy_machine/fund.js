var fs = require('fs');
var so = require('@solana/web3.js');
var id = JSON.parse(fs.readFileSync('./id.json').toString());
var sk = new Uint8Array(id);
var kp = so.Keypair.fromSecretKey(sk);
var co = new so.Connection('https://api.devnet.solana.com', 'confirmed');

Promise.resolve()
  .then(function () { console.log(kp.publicKey.toString()); })
  .then(function () { return co.requestAirdrop(kp.publicKey, so.LAMPORTS_PER_SOL * 2); })
  .then(function (_) { console.log(_); return co.confirmTransaction(_); })
  .then(function () { console.log('Done!') })
