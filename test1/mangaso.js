var solana = require('@solana/web3.js');
module.exports = function mangaso(connection, pubKey) {
  console.log('Va mangaso...!!!');
  return Promise.resolve()
    .then(function () {
      return connection.requestAirdrop(pubKey, solana.LAMPORTS_PER_SOL * 5)
    })
    .then(function (signature) {
      console.log('Por aca andamo', signature);
      return connection.confirmTransaction(signature);
    })
    .then(function (confirmation) {
      console.log('Listo??', confirmation);
    });
}
