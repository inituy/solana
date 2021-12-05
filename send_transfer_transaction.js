function sendTransferTransaction() {
  var rbh, trx;
  //var ins = 
  Promise.resolve()
  .then(function () {
    return connection.getRecentBlockhash();
  })
  .then(function (response) {
    rbh = response.blockhash;
  })
  .then(function () {
    trx = new solana.Transaction({
      feePayer: pubKey,
      recentBlockhash: rbh
    });
    trx.add(solana.SystemProgram.transfer({
      fromPubkey: pubKey,
      toPubkey: pubKeyGabi,
      lamports: solana.LAMPORTS_PER_SOL / 5,
    }));
    trx.add(solana.SystemProgram.transfer({
      fromPubkey: pubKey,
      toPubkey: pubKeyGabi,
      lamports: solana.LAMPORTS_PER_SOL / 5,
    }));
  })
  .then(function () {
    return phantom.request({
      method: 'signAndSendTransaction',
      params: {
        message: bs58.encode(trx.serializeMessage())
      }
    });
  })
  .then(function (request) {
    return connection.confirmTransaction(request.signature);
  })
  .then(function (confirmation) {
    console.log(confirmation);
  })
}
