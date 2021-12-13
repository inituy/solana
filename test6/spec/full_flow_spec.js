jasmine.DEFAULT_TIMEOUT_INTERVAL = 99999999;

var createConnection = require('./support/create_connection')
  , generateKeypair = require('./support/generate_keypair')
  , readKeypair = require('./support/read_keypair')
  , fundWallet = require('./support/fund_wallet')
  , createCandyMachine = require('./support/create_candy_machine')
  , getAssociatedTokenAccount = require('./support/get_associated_token_account')
  , getMetadata = require('./support/get_metadata')
  , getAccount = require('./support/get_account')
  , getBalance = require('./support/get_balance')
  , readJson = require('./support/read_json')

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
    , receiverKeypair             = readKeypair('./receiver.json')
    , creatorKeypair              = readKeypair('./creator.json')
    , fungibleTokenPublicKey      = 'AGZAucYaaMXNCMQYtxU1BKEBSukRXvJtgYLUxj23Zoh2'
    , nftCandyMachinePublicKey    = 'DRsKJgpHo4ZeSsQ62j8AZRsud9NrqicWZceMRPUNWNc1'
    , rewardCandyMachinePublicKey = '3LNUS5gtR6pa315uQDNtcoJbETCuJJxsA8inBoJjW4Dp'
    , nftPublicKey                = 'CZG9X8YdhoZgNkZGnQaawvjkMX3AGgtbg7uc4tW2YuV7'
    , receiverInitialBalance
    , rewardPublicKey             = '11111111111111111111111111111111111111111111'

  var uriMap = readJson('./uri_map.json');

  var exchangeNft = require('../functions/exchange_nft')
    , purchaseReward = require('../functions/purchase_reward')
    , revealRewards = require('../functions/reveal_rewards')

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

      // 6. receiver wallet is funded.
      // .then(function () {
      //   return fundWallet({
      //     connection: connection,
      //     wallet: receiverKeypair.publicKey,
      //   });
      // })

      .then(function () {
        return getBalance({
          connection: connection,
          wallet: receiverKeypair.publicKey,
        })
      })
      .then(function (_) { receiverInitialBalance = _; })
  });

  it('receiver mints NFT', function () {
    // 1. receiver mints nft at candy machine.
    // 2. receiver has updated balance after paying for the nft and fees.
    // 3. receiver has nft ata with balance 1.
  });

  it('exchanges NFT for fungible token', function () {
    return Promise.resolve()
      // 1. receiver exchanges nft at custom function 1.
      .then(function () {
        return exchangeNft({
          connection: connection,
          token: nftPublicKey,
          owner: receiverKeypair.secretKey,
        });
      })

      // 2. receiver has fungible token ata with balance 1.
      .then(function () {
        return getAssociatedTokenAccount({
          connection: connection,
          token: fungibleTokenPublicKey,
          wallet: receiverKeypair.publicKey,
        });
      })
      .then(function (accountInfo) {
        expect(accountInfo).not.toBeNull();
        expect(accountInfo.balance).toBe(1);
      })

      // 3. receiver nft metadata is updated
      .then(function () {
        return getMetadata({
          connection: connection,
          token: nftPublicKey
        });
      })
      .then(function (metadata) {
        expect(metadata.data.data.uri).toEqual('https://banafederico.com');
      });
  });

  it('exchange fungible token for reward', function () {
    return Promise.resolve()
      // 1. receiver exchanges fungible token at candy machine.
      .then(function () {
        return purchaseReward({
          connection: connection,
          purchaser: receiverKeypair,
        });
      })

      // 2. receiver has updated balance after paying for fees.
      .then(function () {
        return getBalance({
          connection: connection,
          wallet: receiverKeypair.publicKey
        })
      })
      .then(function (balance) {
        expect(balance).toBe(receiverInitialBalance - 1);
      })

      // 3. receiver has fungible token ata with balance 0.
      .then(function () {
        return getAssociatedTokenAccount({
          connection: connection,
          token: fungibleTokenPublicKey,
          wallet: receiverKeypair.publicKey,
        });
      })
      .then(function (accountInfo) {
        expect(accountInfo).not.toBeNull();
        expect(accountInfo.balance).toBe(0);
      })

      // 4. receiver has reward ata with balance 1.
      .then(function () {
        return getAssociatedTokenAccount({
          connection: connection,
          token: rewardPublicKey,
          wallet: receiverKeypair.publicKey,
        });
      })
      .then(function (accountInfo) {
        expect(accountInfo).not.toBeNull();
        expect(accountInfo.balance).toBe(1);
      })
  });

  it('reward is revealed', function () {
    return Promise.resolve()
      // 1. custom function 1 is called.
      .then(function () {
        return revealRewards({
          connection: connection,
        });
      })

      // 2. receiver has nft with updated metadata.
      .then(function () {
        return getMetadata({
          connection: connection,
          token: nftPublicKey
        });
      })
      .then(function (metadata) {
        expect(metadata.uri).toEqual('https://init.uy');
      })

      // 3. receiver has reward with updated metadata.
      .then(function () {
        return getMetadata({
          connection: connection,
          token: rewardPublicKey,
        });
      })
      .then(function (metadata) {
        expect(metadata.uri).toEqual('https://init.uy/revealed');
      })
  });
});
