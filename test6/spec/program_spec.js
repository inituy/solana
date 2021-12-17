var solana = require('../solana/web3.js')
  , metaplex = require('../metaplex/js')
  , fundWallet = require('../solana/fund_wallet')
  , getReceiverKeypair = require('./support/get_receiver_keypair')
  , createToken = require('../spltoken/create_token')
  , createTokenAccount = require('../spltoken/create_token_account')

fdescribe('exchange NFT program', function () {
  var connection = new solana.Connection('https://api.devnet.solana.com')
    , programId = '68k4mTrd4uVdszH47cnodYmPot6q97rz2jXrG8FJVqEQ';

  var receiverKeypair = getReceiverKeypair()
    , nftMintAddress = new solana.PublicKey('J53xXw6rGhWfR9ainyiZ4kJtsYmhsHNzMjNDyJgpSVwD')
    , nftAtaAddress = new solana.PublicKey('BhQTw3jgf1AgU1wPmiJsNSbqcdtFkqKL4SyeFsp64819')
    , nftMetadataAddress
    , nftAllowanceAddress
    , intermediaryTokenAtaAddress = solana.Keypair.generate().publicKey;

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

  beforeAll(function () {
    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Receiver wallet address', receiverKeypair.publicKey.toString());
      })

      // NOTE: Calculate NFT metadata address.
      .then(function () {
        return solana.PublicKey.findProgramAddress(
          [ Buffer.from('metadata'),
            metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
            new solana.PublicKey(nftMintAddress).toBuffer() ],
          metaplex.programs.metadata.MetadataProgram.PUBKEY
        );
      })
      .then(function (response) {
        nftMetadataAddress = response[0];
        console.log(new Date(), 'NFT metadata address:', nftMetadataAddress.toString());
      })

      // NOTE: Calculate NFT allowance address.
      .then(function () {
        return solana.PublicKey.findProgramAddress(
          [ Buffer.from('allowance'),
            new solana.PublicKey(programId).toBuffer(),
            new solana.PublicKey(nftMintAddress).toBuffer() ],
          new solana.PublicKey(programId)
        );
      })
      .then(function (response) {
        nftAllowanceAddress = response[0];
        console.log(new Date(), 'NFT allowance address:', nftAllowanceAddress.toString());
      })

      // NOTE: Calculate balance 0 NFT metadata address.
      .then(function () {
        return solana.PublicKey.findProgramAddress(
          [ Buffer.from('metadata'),
            metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
            new solana.PublicKey(balZeroNftMintAddress).toBuffer() ],
          metaplex.programs.metadata.MetadataProgram.PUBKEY
        );
      })
      .then(function (response) {
        balZeroNftMetadataAddress = response[0];
        console.log(new Date(), 'Balance zero NFT metadata address:', balZeroNftMetadataAddress.toString());
      })

      // NOTE: Calculate different authority NFT metadata address.
      .then(function () {
        return solana.PublicKey.findProgramAddress(
          [ Buffer.from('metadata'),
            metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
            new solana.PublicKey(diffAuthNftMintAddress).toBuffer() ],
          metaplex.programs.metadata.MetadataProgram.PUBKEY
        );
      })
      .then(function (response) {
        diffAuthNftMetadataAddress = response[0];
        console.log(new Date(), 'Different authority NFT metadata address:', diffAuthNftMetadataAddress.toString());
      })
      .catch(console.log);
  });



  xit('fails if nft ata doesnt belong to nft mint', function () {
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
          tokenOwner: receiverKeypair,
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
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
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
  xit('fails if nft ata doesnt belong to receiver', function () {
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
          tokenOwner: someoneElsesKeypair,
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
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
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
  xit('fails if nft ata balance is 0', function () {
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
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
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
  xit('fails if nft metadata does not match nft mint', function () {
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
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
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
  xit('fails if nft update authority doesnt match expected', function () {
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
          { isSigner: false, isWritable: false, pubkey: diffAuthNftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
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

  /* // NOTE: Caller can pass an associated token account made for another
  // token mint. In that case, we will not accept the associated token account.
  xit('fails if reward ata not related to reward mint');

  // NOTE: Caller can pass an associated token account that already exists.
  // In that case, we will not accept the associated token account.
  xit('fails if reward ata has lamports'); */

  // NOTE: Caller can pass an allowance account with an address that does not
  // match the required derived address: // ['reward_allowance', pid, nft]
  // In that case, we will not accept the allowance account.
  xit('fails if allowance ata is invalid', function () {
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
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).toBeUndefined();
      })
      .catch(function (error) {
        console.log(error);
        expect(error).not.toBeUndefined();
        expect(error.logs[1].indexOf('NFT allowance account is not valid')).not.toBe(-1);
      })
  });

  // NOTE: Caller can pass the allowance account twice, which means they
  // already got their reward. In that case, we will not accept the allowance
  // account.
  xit('fails if allowance ata was already used');

  // NOTE: Caller can pass an intermediary token associated token account that
  // doesnt belong to the intermediary token mint. In that case, we will not
  // accept the intermediary token associated account.
  xit('fails if intermediary token ata is for wrong mint');

  // NOTE: If caller passes all the right values:
  // * Allowance associated token account will be marked as used.
  // * Reward is minted using candy machine (`mint` instruction is called).
  it('gives the reward to the caller', function () {
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
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenAtaAddress },
        ];
        var signers = [receiverKeypair];
        var trx = new solana.Transaction({
          feePayer: receiverKeypair.publicKey,
          recentBlockhash: response.blockhash
        });
        trx.add(new solana.TransactionInstruction({
          programId: new solana.PublicKey(programId),
          keys: keys,
          data: Buffer.from('7'),
        }));
        return solana.sendAndConfirmTransaction(connection, trx, signers);
      })
      .then(function (signature) {
        expect(signature).not.toBeUndefined();
      })
  });

});
