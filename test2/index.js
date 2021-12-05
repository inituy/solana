var solana = require('@solana/web3.js');

var conn
  , kp1
  , kp2
  , rbh;

// connect
conn = new solana.Connection('https://api.devnet.solana.com');

// generate keys
kp1 = solana.Keypair.generate()
kp2 = solana.Keypair.generate()

Promise.resolve()

// airdrop
.then(function () {
  console.log(new Date(), 'Sale mangaso');
  return conn.requestAirdrop(kp1.publicKey, solana.LAMPORTS_PER_SOL * 5);
})
.then(function (sig) {
  console.log(new Date(), 'Mangaso incoming', sig);
  return conn.confirmTransaction(sig);
})
.then(function (confirm) {
  console.log(new Date(), 'Mangaso sucesful', confirm);
})

// create account with data
.then(function () {
  console.log(new Date(), 'Getting blockhash');
  return conn.getRecentBlockhash();
})
.then(function (response) {
  console.log(new Date(), 'Blockhash:', response);
  rbh = response.blockhash;
})
.then(function () {
  var trx = new solana.Transaction({
    feePayer: kp1.publicKey,
    recentBlockhash: rbh,
  });
  var ins = solana.SystemProgram.createAccount({
    fromPubkey: kp1.publicKey,
    newAccountPubkey: kp2.publicKey,
    lamports: solana.LAMPORTS_PER_SOL / 10000,
    space: 128,
    programId: solana.SystemProgram.programId,
  });
  trx.add(ins);
  console.log(new Date(), 'Creating transacciong', trx);
  return solana.sendAndConfirmTransaction(conn, trx, [kp1, kp2]);
})
.then(function (response) {
  console.log(new Date(), 'Transaction response', response);
})

// read from account
.then(function () {
  console.log(new Date(), 'Getting account');
  return conn.getAccountInfo(kp2.publicKey);
})
.then(function (response) {
  console.log(new Date(), 'Account!', response);
  console.log(new Date(), 'Account data', response.data.toString())
})

// update account data
// NOTE: cant update account from web3?
