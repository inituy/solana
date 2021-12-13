jasmine.DEFAULT_TIMEOUT_INTERVAL = 99999999;

var path = require('path');

var readJson = require('./support/read_json')
  , getReceiverKeypair = require('./support/get_receiver_keypair')
  , getCreatorKeypair = require('./support/get_creator_keypair')

var createDevnetConnection = require('../solana/create_devnet_connection')
  , generateKeypair = require('../solana/generate_keypair')
  , readKeypair = require('../solana/read_keypair')
  , fundWallet = require('../solana/fund_wallet')
  , getBalance = require('../solana/get_balance')
  , getAccount = require('../solana/get_account');

var createToken = require('../spltoken/create_token')
  , createTokenAccount = require('../spltoken/create_token_account')
  , getAssociatedTokenAccount = require('../spltoken/get_associated_token_account');

var getMetadata = require('../metaplex/get_metadata');

var createCandyMachine = require('../candymachine/create_candy_machine')
  , forgetCandyMachine = require('../candymachine/forget_candy_machine')
  , mintCandyMachineNft = require('../candymachine/mint_candy_machine_nft')

describe('NFT exchange full flow', function () {
  // NOTE: Before this test can be run (a.k.a. pending automation):
  // [x] Create a keypair to represent the creator
  // [x] Create a keypair to represent the receiver
  // [x] Create a fungible token and account using the creator keypair
  // [x] Create a candy machine for the nfts using the creator keypair
  // [x] Create a candy machine for rewards using the creator keypair, the
  //     fungible token address and account address.
  // [x] Mint an nft to the creator.
  // [ ] Transfer the nft to the receiver.

  var connection
    , fungibleToken
    , receiverKeypair
    , creatorKeypair
    , creatorFungibleTokenAccount
    , nftCandyMachine
    , rewardCandyMachine

    // TODO: Get this values programatically.
    , nftPublicKey = 'CZG9X8YdhoZgNkZGnQaawvjkMX3AGgtbg7uc4tW2YuV7'
    , rewardPublicKey = '11111111111111111111111111111111111111111111'
    , receiverInitialBalance

  var uriMap = readJson('./uri_map.json');

  var exchangeNft = require('../functions/exchange_nft')
    , purchaseReward = require('../functions/purchase_reward')
    , revealRewards = require('../functions/reveal_rewards')

  beforeAll(function () {
    return Promise.resolve()
      // 0. connection is started.
      .then(function () { console.log(new Date(), 'Creating connection...'); })
      .then(function () { return createDevnetConnection(); })
      .then(function (_) { connection = _; })

      // 1. get and fund creator wallet.
      .then(function () { console.log(new Date(), 'Funding creator...'); })
      .then(function () { creatorKeypair = getCreatorKeypair(); })
      .then(function () {
        var pubkey = creatorKeypair.publicKey;
        return fundWallet({ connection: connection, wallet: pubkey });
      })

      // 2. get and fund receiver wallet.
      .then(function () { console.log(new Date(), 'Funding receiver...'); })
      .then(function () { receiverKeypair = getReceiverKeypair(); })
      .then(function () {
        var pubkey = receiverKeypair.publicKey;
        return fundWallet({ connection: connection, wallet: pubkey });
      })

      // 3. capture receiver initial balance.
      .then(function () { console.log(new Date(), 'Getting receiver balance...'); })
      .then(function () {
        var pubkey = receiverKeypair.publicKey;
        return getBalance({ connection: connection, wallet: pubkey });
      })
      .then(function (_) { receiverInitialBalance = _; })

      // 4. create fungible token, create account and increase supply.
      .then(function () { console.log(new Date(), 'Creating fungible token...'); })
      .then(function () {
        return createToken({
          connection: connection,
          owner: creatorKeypair,
          decimals: 2,
        });
      })
      .then(function (_) { fungibleTokenPublicKey = _; })
      .then(function () { console.log(new Date(), 'Creating fungible token account for creator...'); })
      .then(function () {
        return createTokenAccount({
          connection: connection,
          token: fungibleTokenPublicKey,
          tokenOwner: creatorKeypair,
          tokenAccountOwner: creatorKeypair.publicKey,
        })
      })
      .then(function (_) { creatorFungibleTokenAccountPublicKey = _; })

      // 5. create nft candy machine.
      .then(function () { console.log(new Date(), 'Forgetting and re-creating NFT candy machine...'); })
      .then(function () {
        return forgetCandyMachine({
          rootPath: path.join(__dirname, './support/nft'),
          environment: 'devnet',
        })
      })
      .then(function () {
        return createCandyMachine({
          rootPath: path.join(__dirname, './support/nft'),
          assetsPath: path.join(__dirname, './support/nft/assets'),
          environment: 'devnet',
          owner: creatorKeypair,
        });
      })
      .then(function (candyMachine) {
        nftCandyMachine = candyMachine;
      })

      // 6. create reward candy machine
      .then(function () { console.log(new Date(), 'Forgetting and re-creating reward candy machine...'); })
      .then(function () {
        return forgetCandyMachine({
          rootPath: path.join(__dirname, './support/reward'),
          environment: 'devnet',
        })
      })
      .then(function () {
        return createCandyMachine({
          rootPath: path.join(__dirname, './support/reward'),
          assetsPath: path.join(__dirname, './support/reward/assets'),
          environment: 'devnet',
          owner: creatorKeypair,
          token: fungibleToken,
          tokenAccount: creatorFungibleTokenAccount
        });
      })
      .then(function (candyMachine) {
        rewardCandyMachine = candyMachine;
      })

      // 7. mint nft to creator
      .then(function () { console.log(new Date(), 'Minting NFT to creator...'); })
      .then(function () {
        return mintCandyMachineNft({
          rootPath: path.join(__dirname, './support/reward'),
          environment: 'devnet',
          owner: creatorKeypair,
        });
      })

      .then(function (candyMachine) {
        console.log(new Date(), 'Done minting!');
        console.log(new Date(), 'Candy machine looks like: ', JSON.stringify(candyMachine));
      })
  });

  it('receiver mints NFT', function () {
    // 1. receiver mints nft at candy machine.
    // 2. receiver has updated balance after paying for the nft and fees.
    // 3. receiver has nft ata with balance 1.
  });

  xit('exchanges NFT for fungible token', function () {
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

  xit('exchange fungible token for reward', function () {
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

  xit('reward is revealed', function () {
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
