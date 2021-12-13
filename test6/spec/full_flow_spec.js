jasmine.DEFAULT_TIMEOUT_INTERVAL = 99999999;

var createConnection = require('./support/create_connection')
  , generateKeypair = require('./support/generate_keypair')
  , readKeypair = require('./support/read_keypair')
  , fundWallet = require('./support/fund_wallet')
  , createCandyMachine = require('./support/create_candy_machine')
  , getAssociatedTokenAccount = require('./support/get_associated_token_account')

describe('NFT exchange full flow', function () {
  // NOTE: Before this test can be run (a.k.a. pending automation):
  // * Create a keypair to represent the creator
  // * Create a keypair to represent the receiver
  // * Create a candy machine for the nfts using the creator keypair
  // * Create a fungible token and account using the creator keypair
  // * Create a candy machine for rewards using the creator keypair, the
  //   fungible token address and account address.
  // * Mint an nft to the creator.
  // * Transfer the nft to the receiver.

  var connection
    , receiverKeypair = readKeypair('./receiver.json')
    , creatorKeypair = readKeypair('./creator.json')
    , fungibleTokenPublicKey = 'AGZAucYaaMXNCMQYtxU1BKEBSukRXvJtgYLUxj23Zoh2'
    , nftCandyMachinePublicKey = 'DRsKJgpHo4ZeSsQ62j8AZRsud9NrqicWZceMRPUNWNc1' // '4TR9sRvKYSiJkBd1BYRdzqmqmaA594A9j1kwFdKVk88G'
    , rewardCandyMachinePublicKey = '3LNUS5gtR6pa315uQDNtcoJbETCuJJxsA8inBoJjW4Dp' // 'G6Uvt6jNaC2pKGbj9CRyBiXK7U4y4vrrJFcjbxvEfSey';
    , nftPublicKey = 'CZG9X8YdhoZgNkZGnQaawvjkMX3AGgtbg7uc4tW2YuV7';

  beforeEach(function () {
    return Promise.resolve()
      // 0. connection is started.
      .then(function () { return createConnection(); })
      .then(function (_) { connection = _; })

      // 2. creator wallet is funded.
      // .then(function () {
      //   return fundWallet({
      //     connection: connection,
      //     wallet: creatorKeypair.publicKey,
      //   });
      // })

      // // 6. receiver wallet is funded.
      // .then(function () {
      //   return fundWallet({
      //     connection: connection,
      //     wallet: receiverKeypair.publicKey,
      //   });
      // })
  });

  xit('receiver mints NFT', function () {
    // 1. receiver mints nft at candy machine.
    // 2. receiver has updated balance after paying for the nft and fees.
    // 3. receiver has nft ata with balance 1.
  });

  it('exchanges NFT for fungible token', function () {
    var ata;
    return Promise.resolve()
      .then(function () {
        return getAssociatedTokenAccount({
          connection: connection,
          token: nftPublicKey,
          owner: creatorKeypair.publicKey,
          wallet: receiverKeypair.publicKey,
        });
      })
      .then(function (_) {
        ata = _;
        console.log(ata);
      })
    // 1. receiver exchanges nft at custom function 1.
    //   1.1. receiver calls function, passes nft address.
    //   1.2. function verifies nft is owned by receiver.
    //   1.3. function mints fungible token to receiver's ata.
    // 3. receiver has fungible token ata with balance 1.
  });

  xit('exchange fungible token for reward', function () {
    // 1. receiver exchanges fungible token at candy machine.
    // 2. receiver has updated balance after paying for fees.
    // 3. receiver has fungible token ata with balance 0.
    // 4. receiver has reward ata with balance 1.
  });

  xit('reward is revealed', function () {
    // 1. custom function 1 is called.
    // 2. receiver has nft with updated metadata.
    // 3. receiver has reward with updated metadata.
  });
});
