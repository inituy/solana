var web3 = require("@solana/web3.js");
var metaplex = require("@metaplex/js");
var borsh = require('borsh');

var Metadata = metaplex.programs.metadata.Metadata;
var deserialize = metaplex.deserialize;

(async function handler() {
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  var address = new web3.PublicKey("D5X1Fdh1QXeL8hQNYPgpgXDfLKngFhNfCEHv6wC76nca");

  // console.log(`Getting info for ${address}...`);
  // var info = await connection.getAccountInfo(address);
  // var values = [];
  // for (var value of info.data.values()) { values.push(value); }
  // console.log('Data &[u8]', `[${values.join(', ')}]`);
  // console.log('Data length (bytes)', info.data.length);
  // console.log('Owner', info.owner.toString());

  console.log(`Deserializing ${address}...`);
  var data = await Metadata.load(connection, address);
  console.log(data);
  console.log('owner:', data.info.owner.toString());
  console.log('creators:', data.data.data.creators);
})();
