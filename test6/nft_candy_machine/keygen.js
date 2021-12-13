var s =require('@solana/web3.js')
var kp = s.Keypair.generate();
console.log(kp.secretKey);
console.log(kp.publicKey.toString());
