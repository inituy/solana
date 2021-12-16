var solana = require('../solana/web3.js')
  , metaplex = require('../metaplex/js')
  , fundWallet = require('../solana/fund_wallet')
  , getReceiverKeypair = require('./support/get_receiver_keypair')

fdescribe('exchange NFT program', function () {
  var connection = new solana.Connection('https://api.devnet.solana.com')
    , programId = '7qaUjoe2yntoPiKM2yuf2kasDmeEL2dEGgpYi7F5eMUL';

  var receiverKeypair = getReceiverKeypair()
    , nftMintAddress = new solana.PublicKey('CZG9X8YdhoZgNkZGnQaawvjkMX3AGgtbg7uc4tW2YuV7')
    , nftMetadataUpdateAuthorityAddress = new solana.PublicKey('HW6oto3fnZuWfFcLaMBRkA4UYChQ8D57LTcHLKS3GmbC')
    , nftMetadataAddress
    , nftAllowanceAddress;

  beforeAll(function () {
    return Promise.resolve()
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
          metaplex.programs.metadata.MetadataProgram.PUBKEY
        );
      })
      .then(function (response) {
        nftAllowanceAddress = response[0];
        console.log(new Date(), 'NFT allowance address:', nftAllowanceAddress.toString());
      })
      .catch(console.log);
  });

  // NOTE: Caller can pass an NFT metadata account that does not belong to the
  // NFT. In that chase, we will not accept the NFT metadata.
  it('fails if nft metadata does not match nft mint', function () {
    var wrongNftMintAddress = solana.Keypair.generate().publicKey;

    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: wrongNftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataUpdateAuthorityAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
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
      })
  });

  // NOTE: Caller can pass an NFT that is not the NFT that the program is
  // exchanging for rewards. In that case, we will not accept the NFT.
  it('fails if nft update authority doesnt match expected', function () {
    var wrongNftMetadataUpdateAuthorityAddress = solana.Keypair.generate().publicKey;

    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: wrongNftMetadataUpdateAuthorityAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
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
      })
  });

  // NOTE: Caller can pass an NFT for which they don't have a balance. In that
  // case we will not accept the NFT.
  it('fails if nft balance is 0', function () {
    // TODO: This needs to be the mint address of an NFT that the receiver
    // does not have.
    var notOwnedNftMintAddress = solana.Keypair.generate().publicKey;

    return Promise.resolve()
      .then(function () {
        console.log(new Date(), 'Getting blockhash...');
        return connection.getRecentBlockhash();
      })
      .then(function (response) {
        var keys = [
          { isSigner: true,  isWritable: false, pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: notOwnedNftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataUpdateAuthorityAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
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
      });
  });

  /* // NOTE: Caller can pass an associated token account made for another
  // token mint. In that case, we will not accept the associated token account.
  it('fails if reward ata not related to reward mint');

  // NOTE: Caller can pass an associated token account that already exists.
  // In that case, we will not accept the associated token account.
  it('fails if reward ata has lamports'); */

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
          { isSigner: false, isWritable: false, pubkey: notOwnedNftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataUpdateAuthorityAddress },
          { isSigner: false, isWritable: false, pubkey: wrongNftAllowanceAddress },
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
      })
  });

  // NOTE: Caller can pass the allowance account twice, which means they
  // already got their reward.
  // In that case, we will not accept the allowance account.
  it('fails if allowance ata was already used');

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
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataUpdateAuthorityAddress },
          { isSigner: false, isWritable: false, pubkey: nftAllowanceAddress },
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
