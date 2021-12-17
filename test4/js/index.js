var solana = require('@solana/web3.js');
var metaplex = require('@metaplex/js');
var path = require('path');
var fs = require('fs');

var conn = new solana.Connection('https://api.devnet.solana.com');
var secretKey = new Uint8Array(JSON.parse(fs.readFileSync('/home/vagrant/.config/solana/id.json').toString()));
var keypair = solana.Keypair.fromSecretKey(secretKey);
var metadataPubkey = new solana.PublicKey('4gwTv5wcth9ggt8dP9TGKtyfxbYywnysTLNPJmhdKvku');
var pid = '7qaUjoe2yntoPiKM2yuf2kasDmeEL2dEGgpYi7F5eMUL';

Promise.resolve()
  .then(function () {
    console.log(new Date(), 'Requesting airdrop...');
    return conn.requestAirdrop(keypair.publicKey, solana.LAMPORTS_PER_SOL * 2);
  })
  .then(function (signature) {
    return conn.confirmTransaction(signature);
  })
  .then(function () {
    console.log(new Date(), 'Airdropped!');
    console.log(new Date(), 'Getting recent blockhash...');
    return conn.getRecentBlockhash();
  })
  .then(function (response) {
    var trx = new solana.Transaction({
      feePayer: keypair.publicKey,
      recentBlockhash: response.blockhash
    });

    trx.add(new solana.TransactionInstruction({
      keys: [
        { isSigner: true, isWritable: false, pubkey: keypair.publicKey },
        { isSigner: false, isWritable: false, pubkey: metadataPubkey },
      ],
      programId: new solana.PublicKey(pid),
      data: Buffer.from("Fede"),
    }));

    console.log(new Date(), 'Sending transaction...', trx);

    return solana.sendAndConfirmTransaction(conn, trx, [keypair]);
  })
  .then(function (signature) {
    console.log(new Date(), 'Done!', signature);
  });
