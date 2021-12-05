function sendEmptyTrx() {
  var rbh, trx;
  Promise.resolve()
  .then(function () {
    return connection.getRecentBlockhash();
  })
  .then(function (response) {
    rbh = response.blockhash;
  })
  .then(function () {
    trx = new solana.Transaction({
      feePayer: pubKey.toString(),
      recentBlockhash: rbh
    });
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
    console.log(request);
    return connection.confirmTransaction(request.signature);
  })
  .then(function (confirmation) {
    console.log('pronto', confirmation);
  })
};
