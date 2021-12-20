jasmine.DEFAULT_TIMEOUT_INTERVAL = 99999999;

var solana = require('../solana/web3.js')
  , metaplex = require('../metaplex/js')
  , spltoken = require('../spltoken/spltoken')
  , fundWallet = require('../solana/fund_wallet')
  , createToken = require('../spltoken/create_token')
  , createTokenAccount = require('../spltoken/create_token_account')

var getCreatorKeypair = require('./support/get_creator_keypair')
  , getReceiverKeypair = require('./support/get_receiver_keypair')
  , forgetNftCandyMachine = require('./support/forget_nft_candy_machine')
  , createNftCandyMachine = require('./support/create_nft_candy_machine')
  , forgetRewardCandyMachine = require('./support/forget_reward_candy_machine')
  , createRewardCandyMachine = require('./support/create_reward_candy_machine')
  , mintNftToReceiver = require('./support/mint_nft_to_receiver');

var exchangeNft = require('../app/exchange_nft.js');

describe('exchange NFT program', function () {
  var connection = new solana.Connection('https://api.devnet.solana.com')
    , programId = new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ')
    , creatorKeypair = getCreatorKeypair()
    , receiverKeypair = getReceiverKeypair()

  // NOTE: NFT that will be exchanged for reward.
  var nftMintAddress;

  // NOTE: Intermediary token mint that is configured on the reward candy
  // machine as payment token.
  var intermediaryTokenMintAddress
    , intermediaryTokenMintAuthorityAddress;

  // NOTE: NFT associated token account that was previously emptied.
  var balZeroNftMintAddress = new solana.PublicKey('CZG9X8YdhoZgNkZGnQaawvjkMX3AGgtbg7uc4tW2YuV7')
    , balZeroNftAtaAddress = new solana.PublicKey('778MQQCK6emFkQF9eovhQvXKgLqXf7yF8VhyVhjmVFWs')
    , balZeroNftMetadataAddress;

  // NOTE: NFT associated token account for a different update authority.
  var diffAuthNftMintAddress = new solana.PublicKey('9AeLSr3bFcCjyoFED257LacijbppseAn3Wk4k2TcVRUh')
    , diffAuthNftAtaAddress = new solana.PublicKey('37apqx4whVQqJu9Wn4JCRceDzMYFw5p9QaZVCkC5dRQB')
    , diffAuthNftMetadataAddress;

  // NOTE: NFT metadata account that does not belong to the NFT mint.
  var wrongNftMetadataAddress = new solana.PublicKey('JA6jc4mKywBioiAYVfTQNqu52VjLQguhPdc9KyUU93uC');

  // NOTE: Candy machine to issues the reward NFTs program and config
  // addresses.
  var nftCandyMachineAddress
    , nftCandyMachineConfigAddress;

  // NOTE: Candy machine to issues the reward NFTs program and config
  // addresses.
  var rewardCandyMachineAddress
    , rewardCandyMachineConfigAddress;

  // NOTE: Creator associated token account will be used as treasury. Receiver
  // associated token account will be used as a step in the middle of the
  // exchange.
  var creatorIntermediaryTokenAtaAddress;



  beforeAll(function () {
    return Promise.resolve()

      // NOTE: Create a token that will be used to purchase the reward at the
      // reward candy machine. This token needs to have a program derived
      // address as the mint authority in order for the program to mint a token
      // the NFT holder can use on the reward candy machine.
      .then(function () {
        return solana.PublicKey.findProgramAddress(
          [ Buffer.from('mintauthority'), programId.toBuffer() ],
          programId
        );
      })
      .then(function (pda) {
        intermediaryTokenMintAuthorityAddress = pda[0];
      })
      .then(function () {
        console.log(new Date(), 'Creating intermediary token...');
        return createToken({
          connection: connection,
          owner: creatorKeypair,
          mintAuthority: intermediaryTokenMintAuthorityAddress,
        });
      })
      .then(function (tokenAddress) {
        intermediaryTokenMintAddress = tokenAddress;
      })

      // NOTE: Creator and receiver intermediary token accounts.
      .then(function () {
        console.log(new Date(), 'Creating creator intermediary token account...');
        return createTokenAccount({
          connection: connection,
          token: intermediaryTokenMintAddress,
          payer: creatorKeypair,
          tokenAccountOwner: creatorKeypair.publicKey,
        });
      })
      .then(function (tokenAccountAddress) {
        console.log(new Date(), 'Created creator intermediary token address:', tokenAccountAddress.toString());
        creatorIntermediaryTokenAtaAddress = tokenAccountAddress;
      })

      // NOTE: NFT candy machine.
      .then(function () {
        console.log(new Date(), 'Forgetting NFT candy machine...');
        return forgetNftCandyMachine();
      })
      .then(function () {
        console.log(new Date(), 'Creating NFT candy machine...');
        return createNftCandyMachine({ creatorKeypair: creatorKeypair });
      })
      .then(function (candyMachine) {
        nftCandyMachineAddress = new solana.PublicKey(candyMachine.candyMachineAddress);
        nftCandyMachineConfigAddress = new solana.PublicKey(candyMachine.program.config);
        console.log(new Date(), 'NFT candy machine:', nftCandyMachineAddress.toString());
        console.log(new Date(), 'NFT candy machine config:', nftCandyMachineConfigAddress.toString());
      })
      .then(function() {
        console.log(new Date(), 'Giving NFT to receiver...');
        return mintNftToReceiver({
          connection: connection,
          receiverKeypair: receiverKeypair
        });
      })
      .then(function (nftAddress) {
        nftMintAddress = nftAddress;
        console.log(new Date(), 'Gave receiver the NFT:', nftMintAddress.toString());
      })

      // NOTE: Reward candy machine.
      .then(function () {
        console.log(new Date(), 'Forgetting reward candy machine...');
        return forgetRewardCandyMachine();
      })
      .then(function () {
        console.log(new Date(), 'Creating reward candy machine...');
        return createRewardCandyMachine({
          creatorKeypair: creatorKeypair,
          creatorIntermediaryTokenAtaAddress: creatorIntermediaryTokenAtaAddress,
          intermediaryTokenMintAddress: intermediaryTokenMintAddress,
        });
      })
      .then(function (candyMachine) {
        rewardCandyMachineAddress = new solana.PublicKey(candyMachine.candyMachineAddress);
        rewardCandyMachineConfigAddress = new solana.PublicKey(candyMachine.program.config);
        console.log(new Date(), 'Reward candy machine:', rewardCandyMachineAddress.toString());
        console.log(new Date(), 'Reward candy machine config:', rewardCandyMachineConfigAddress.toString());
      })

      .catch(console.log);
  });



  it('fails if receiver doesnt sign', function () {
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: false, isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        // NOTE: Not sure this ever goes to the chain.
        expect(error).not.toBeUndefined();
      });
  });



  it('fails if nft ata doesnt belong to nft mint', function () {
    var wrongNftAtaAddress;
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Creating throwaway token...');
        return createToken({
          connection: connection,
          owner: receiverKeypair,
        });
      })
      .then(function (tokenAddress) {
        console.log(new Date(), 'Creating throwaway token address for token:', tokenAddress.toString());
        return createTokenAccount({
          connection: connection,
          token: tokenAddress,
          payer: receiverKeypair,
          tokenAccountOwner: receiverKeypair.publicKey,
        });
      })
      .then(function (tokenAccountAddress) {
        console.log(new Date(), 'Created throwaway token account:', tokenAccountAddress.toString());
        wrongNftAtaAddress = tokenAccountAddress;
      })
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: wrongNftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT associated token account does not belong to NFT mint')).not.toBe(-1);
      })
  });



  // NOTE: Caller can pass an NFT associated token account that actually
  // belongs to someone else. In that case, we will not accept the NFT
  // associated token account.
  it('fails if nft ata doesnt belong to receiver', function () {
    var someoneElsesKeypair = solana.Keypair.generate();
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Funding someone else...');
        return fundWallet({
          connection: connection,
          wallet: someoneElsesKeypair.publicKey,
        });
      })
      .then(function (tokenAddress) {
        console.log(new Date(), 'Creating throwaway token address for NFT for someone else...');
        return createTokenAccount({
          connection: connection,
          token: nftMintAddress,
          payer: someoneElsesKeypair,
          tokenAccountOwner: someoneElsesKeypair.publicKey,
        });
      })
      .then(function (tokenAccountAddress) {
        console.log(new Date(), 'Created throwaway token account:', tokenAccountAddress.toString());
        wrongNftAtaAddress = tokenAccountAddress;
      })
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: wrongNftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT associated token account does not belong to receiver')).not.toBe(-1);
      })
  });



  // NOTE: Caller can pass an NFT for which they don't have a balance. In that
  // case we will not accept the NFT.
  it('fails if nft ata balance is 0', function () {
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: balZeroNftMintAddress },
          { isSigner: false, isWritable: false, pubkey: balZeroNftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: balZeroNftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT associated token account balance is 0')).not.toBe(-1);
      });
  });



  // NOTE: Caller can pass an NFT metadata account that does not belong to the
  // NFT. In that chase, we will not accept the NFT metadata.
  it('fails if nft metadata does not match nft mint', function () {
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: wrongNftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT metadata does not belong to NFT mint')).not.toBe(-1);
      })
  });



  // NOTE: Caller can pass an NFT that is not the NFT that the program is
  // exchanging for rewards. In that case, we will not accept the NFT.
  it('fails if nft update authority doesnt match expected', function () {
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: diffAuthNftMintAddress },
          { isSigner: false, isWritable: false, pubkey: diffAuthNftAtaAddress },
          // TODO: This test fails because this metadata account doesnt belong
          // to the NFT mint it's supposed to belong to, so that verification
          // runs and makes this test fail because update authority can be
          // checked.
          { isSigner: false, isWritable: false, pubkey: diffAuthNftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT metadata does not have the correct update authority')).not.toBe(-1);
      })
  });



  // NOTE: Caller can pass an associated token account made for another
  // token mint. In that case, we will not accept the associated token account.
  it('fails if reward ata not related to reward mint');



  // NOTE: Caller can pass an associated token account that already exists.
  // In that case, we will not accept the associated token account.
  it('fails if reward ata has lamports');



  // NOTE: Caller can pass an allowance account with an address that does not
  // match the required derived address: // ['reward_allowance', pid, nft]
  // In that case, we will not accept the allowance account.
  it('fails if allowance ata is invalid', function () {
    var wrongNftAllowanceAddress = solana.Keypair.generate().publicKey;
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: wrongNftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: receiverIntermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: programId,
          keys: keys,
          data: Buffer.from('2'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT allowance account is not valid')).not.toBe(-1);
      })
  });



  // NOTE: Caller can pass the allowance account twice, which means they
  // already got their reward. In that case, we will not accept the allowance
  // account.
  it('fails if allowance ata was already used');



  // NOTE: Caller can pass an intermediary token associated token account that
  // doesnt belong to the intermediary token mint. In that case, we will not
  // accept the intermediary token associated account.
  it('fails if intermediary token ata is for wrong mint');



  // NOTE: If caller passes all the right values:
  // * Allowance associated token account will be marked as used.
  // * Reward is minted using candy machine (`mint` instruction is called).
  fit('gives the reward to the caller', function () {
    return Promise.resolve()
      .then(function () {
        return exchangeNft({
          connection: new solana.Connection('https://api.devnet.solana.com'),
          programId: new solana.PublicKey('68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ'),
          receiverAddress: receiverKeypair.publicKey,
          nftMintAddress: nftMintAddress,
          intermediaryTokenMintAddress: intermediaryTokenMintAddress,
          creatorIntermediaryTokenAtaAddress: creatorIntermediaryTokenAtaAddress,
          rewardCandyMachineConfigAddress: rewardCandyMachineConfigAddress,
          rewardCandyMachineAddress: rewardCandyMachineAddress,
        })
      })
      .then(function (trx) {
        trx.partialSign(receiverKeypair);
        return connection.sendRawTransaction(trx.serialize());
      })
      .then(function (signature) {
        console.log(new Date(), 'Waiting confirmation...', signature);
        return connection.confirmTransaction(signature);
      })
      .then(function () {
        console.log(new Date(), 'Confirmed!');
      });
  });

});
