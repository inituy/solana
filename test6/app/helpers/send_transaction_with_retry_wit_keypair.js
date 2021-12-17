const solana = require('@solana/web3.js');
const sendSignedTransaction = require('./send_signed_transaction');

module.exports = async function sendTransactionWithRetryWithKeypair (
  connection,
  wallet,
  instructions,
  signers,
) {
  commitment = 'singleGossip';
  includesFeePayer = false;
  const transaction = new solana.Transaction();
  instructions.forEach(instruction => transaction.add(instruction));
  var blockhash = await connection.getRecentBlockhash()
  transaction.recentBlockhash = blockhash.blockhash;
  if (includesFeePayer) {
    transaction.setSigners(...signers.map(s => s.publicKey));
  } else {
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map(s => s.publicKey),
    );
  }

  if (signers.length > 0) {
    transaction.sign(...[wallet, ...signers]);
  } else {
    transaction.sign(wallet);
  }

  const { txid, slot } = await sendSignedTransaction(
    connection,
    transaction,
  );

  console.log("TXID", txid);
  console.log("SLOT", slot);

  return { txid, slot };
};