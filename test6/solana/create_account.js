var solana = require('@solana/web3.js');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      return params.connection.getRecentBlockhash();
    })
    .then(function (response) {
      var signers = [params.payer];

      var trx = new solana.Transaction({
        feePayer: params.payer.publicKey,
        recentBlockhash: response.blockhash,
      });

      trx.add(solana.SystemProgram.createAccount({
        fromPubkey: params.payer.publicKey,
        newAccountPubkey: params.address,
        space: params.space,
        lamports: params.lamports,
        programId: params.programId,
      }));

      return solana.sendAndConfirmTransaction(params.connection, trx, signers);
    })
};
