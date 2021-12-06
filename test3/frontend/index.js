var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');
var BN = require('bn.js');

var minBal
  , tempTokenAccount
  , ins = []
  , trx;

var conn = new solana.Connection('https://api.devnet.solana.com')
  , mintPubkey = new solana.PublicKey('GAxmQxqHA1f2oAS6gvaTii4XeUyiLNsfJogWhhfvaHpc')
  , mintAccountPubkey = new solana.PublicKey('98YMU8q9TaXEQc2B9GxoGGh41Dx8RpvujhBRXT2ogmkg')
  , programId = new solana.PublicKey('EKujHHh2FM2WAYJ4Eqooc3kvzbH3kude99H61NHVsYXb')
  , amount = 100
  , kp1 = solana.Keypair.generate()   // feepayer
  , kp2 = solana.Keypair.generate()   // my temp account
  , kp3 = solana.Keypair.generate()   // receiver
  , kpMinOwner = solana.Keypair.fromSecretKey(Uint8Array.from([178,28,241,176,83,127,222,54,22,239,139,75,239,94,108,195,155,124,9,114,147,94,252,190,150,204,82,119,11,188,20,91,15,42,219,174,164,120,167,55,174,210,40,209,121,206,11,117,37,117,20,207,130,178,161,52,190,105,79,207,169,132,147,228]))

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

.then(function () {
  console.log(new Date(), 'Getting min bal');
  return conn.getMinimumBalanceForRentExemption(spltoken.AccountLayout.span, 'confirmed');
})
.then(function (_) {
  console.log(new Date(), 'Min bal', _);
  minBal = _;
})
.then(function () {
  ins.push(solana.SystemProgram.createAccount({
    programId: spltoken.TOKEN_PROGRAM_ID,
    space: spltoken.AccountLayout.span,
    lamports: minBal,
    fromPubkey: kp1.publicKey,
    newAccountPubkey: kp2.publicKey,
  }));

  ins.push(solana.SystemProgram.createAccount({
    programId: spltoken.TOKEN_PROGRAM_ID,
    space: spltoken.AccountLayout.span,
    lamports: minBal,
    fromPubkey: kp1.publicKey,
    newAccountPubkey: kp3.publicKey,
  }));

  ins.push(spltoken.Token.createInitAccountInstruction(
    spltoken.TOKEN_PROGRAM_ID,  // token program id
    mintPubkey,                 // token id
    kp2.publicKey,              // owner of the new token account
    kp1.publicKey,              // feepayer
  ));

  ins.push(spltoken.Token.createTransferInstruction(
    spltoken.TOKEN_PROGRAM_ID,    // token program id
    mintAccountPubkey,            // token program account (source)
    kp2.publicKey,                // owner of token account (target)
    kpMinOwner.publicKey,
    [],
    amount,
  ));

  var bn = new BN(amount).toArray('le', 8);
  var data = Buffer.from(Uint8Array.of(bn))
  var keys = [
    { pubkey: kp1.publicKey,               isSigner: true,  isWritable: false },
    { pubkey: kp2.publicKey,               isSigner: false, isWritable: false },
    { pubkey: kp3.publicKey,               isSigner: false, isWritable: false },
    { pubkey: solana.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: spltoken.TOKEN_PROGRAM_ID,   isSigner: false, isWritable: false },
  ];

  console.log(new Date(), 'KEYS', keys);

  ins.push(new solana.TransactionInstruction({
    programId: programId,
    data: data,
    keys: keys
  }));

  trx = new solana.Transaction();

  trx.add(ins[0]);
  trx.add(ins[1]);
  trx.add(ins[2]);
  trx.add(ins[3]);
  trx.add(ins[4]);

  console.log(new Date(), 'Sending transaction', trx);
  return solana.sendAndConfirmTransaction(conn, trx, [kp1, kp2, kp3, kpMinOwner]);
})
.then(function (signature) {
  console.log(new Date(), 'Confirmed', signature);
})
