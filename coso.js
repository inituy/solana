var fs = require('fs');
var bs58 = require('bs58');
var solana = require('@solana/web3.js');
var { struct, u32, ns64 } = require('@solana/buffer-layout');
// var phantom = window.solana;

//window.addEventListener('load', function () {
  var privKeyFile = fs.readFileSync('./fedepriv').toString().trim();
  var privKeyFede = Uint8Array.from(bs58.decode(privKeyFile));
  var keypairFede = solana.Keypair.fromSecretKey(privKeyFede);

  var pubKeyFede = keypairFede.publicKey; // new solana.PublicKey('9LSubqtiT4xgxuJxw26mTeYcUkTRRBUpKh32LXgyEAsk');
  var pubKeyGabi = new solana.PublicKey('BH9UJfRp9nxocU9QFao3Fw7N7PuwA8FJq8Xw2zkQ1W8y');
  var pubKeyRandom = new solana.Keypair().publicKey;
  var pubKeyGabiProgram = new solana.PublicKey('2GYkB6ZU77wYgAmL5JwPhU6tXBRqFXGo2qNofThBScBM');

  var network = 'https://api.devnet.solana.com';
  var connection = new solana.Connection(network);

  // phantom.on('connect', function (publicKey) {
  //   pubKeyFede = publicKey;
  //   randomBullshitGo();
  // });

  function randomBullshitGo() {
    var rbh, trx, ins;
    Promise.resolve()
    .then(function () {
      return connection.getRecentBlockhash();
    })
    .then(function (response) {
      rbh = response.blockhash;
    })
    .then(function () {
      trx = new solana.Transaction({
        feePayer: pubKeyFede,
        recentBlockhash: rbh
      });

      var index = 8;
      var layout = struct([
        u32('instruction'),
        ns64('space'),
        //ns64('fede'), 
      ]);
      var data = Buffer.alloc(layout.span);
      var fields = {
        instruction: index,
        space: 12,
        //fede: 200,
      };
      layout.encode(fields, data);

      ins = new solana.TransactionInstruction({
        keys: [{ isSigner: true, isWritable: true, pubkey: pubKeyFede }],
        programId: solana.SystemProgram.programId,
        data: data,
      });
      trx.add(ins);
    })
    .then(function () {
      // return phantom.request({
      //   method: 'signAndSendTransaction',
      //   params: {
      //     message: bs58.encode(trx.serializeMessage())
      //   }
      // });
      return solana.sendAndConfirmTransaction(connection, trx, [keypairFede]);
    })
    .then(function (request) {
      console.log('REQUEST', request);
      return connection.confirmTransaction(request);
    })
    .then(function (confirmation) {
      console.log('CONFIRMATION', confirmation);
    })
  }

  // phantom.connect();
  randomBullshitGo();
  //require('./mangaso.js')(connection, pubKeyFede);
//});
