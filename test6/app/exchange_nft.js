var solana = require('../solana/web3.js')
  , metaplex = require('../metaplex/js')
  , spltoken = require('../spltoken/spltoken');

module.exports = function (input) {
  var signers = []
    , instructions = []
    , mintLayoutMinBalance;

  var connection = input.connection
    , programId = input.programId
    , receiverKeypair = input.receiverKeypair
    , rewardMintKeypair = input.rewardMintKeypair
    , rewardAtaAddress = input.rewardAtaAddress
    , nftMintAddress = input.nftMintAddress
    , nftAtaAddress = input.nftAtaAddress
    , nftMetadataAddress = input.nftMetadataAddress
    , nftAllowanceAddress = input.nftAllowanceAddress
    , intermediaryTokenMintAddress = input.intermediaryTokenMintAddress
    , intermediaryTokenMintAuthorityAddress = input.intermediaryTokenMintAuthorityAddress
    , receiverIntermediaryTokenAtaAddress = input.receiverIntermediaryTokenAtaAddress
    , rewardCandyMachineProgramAddress = input.rewardCandyMachineProgramAddress
    , rewardCandyMachineConfigAddress = input.rewardCandyMachineConfigAddress
    , rewardCandyMachineAddress = input.rewardCandyMachineAddress
    , creatorIntermediaryTokenAtaAddress = input.creatorIntermediaryTokenAtaAddress
    , rewardMetadataAddress = input.rewardMetadataAddress
    , rewardMintKeypair = input.rewardMintKeypair
    , rewardMasterEditionAddress = input.rewardMasterEditionAddress

  return Promise.resolve()
    .then(function () {
      console.log(new Date(), 'Getting minimum balances for mint...');
      return connection.getMinimumBalanceForRentExemption(spltoken.MintLayout.span);
    })
    .then(function (balance) {
      mintLayoutMinBalance = balance;
    })

    // instructions
    // NOTE: Create and mint one nft that the candy machine will certify.
    .then(function () {
      instructions.push(solana.SystemProgram.createAccount({
        fromPubkey: receiverKeypair.publicKey,
        newAccountPubkey: rewardMintKeypair.publicKey,
        space: spltoken.MintLayout.span,
        lamports: mintLayoutMinBalance,
        programId: spltoken.TOKEN_PROGRAM_ID,
      }));
      instructions.push(spltoken.Token.createInitMintInstruction(
        spltoken.TOKEN_PROGRAM_ID,
        rewardMintKeypair.publicKey,
        0,                         // decimals
        receiverKeypair.publicKey, // mint authority
        receiverKeypair.publicKey, // freeze authority
      ));
      instructions.push(spltoken.Token.createAssociatedTokenAccountInstruction(
        spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        spltoken.TOKEN_PROGRAM_ID,
        rewardMintKeypair.publicKey,
        rewardAtaAddress,
        receiverKeypair.publicKey,
        receiverKeypair.publicKey,
      ));
      instructions.push(spltoken.Token.createMintToInstruction(
        spltoken.TOKEN_PROGRAM_ID,
        rewardMintKeypair.publicKey,
        rewardAtaAddress,
        receiverKeypair.publicKey,
        [], // multisig
        1,  // amount
      ));
      instructions.push(new solana.TransactionInstruction({
        programId: programId,
        data: Buffer.from('2'),
        keys: [
          { isSigner: true,  isWritable: true,  pubkey: receiverKeypair.publicKey },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: true,  pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: true,  pubkey: intermediaryTokenMintAddress },
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenMintAuthorityAddress },
          { isSigner: false, isWritable: true,  pubkey: receiverIntermediaryTokenAtaAddress },
          { isSigner: false, isWritable: false, pubkey: spltoken.TOKEN_PROGRAM_ID },
          { isSigner: false, isWritable: false, pubkey: rewardCandyMachineProgramAddress },
          { isSigner: false, isWritable: false, pubkey: rewardCandyMachineConfigAddress },
          { isSigner: false, isWritable: true,  pubkey: rewardCandyMachineAddress },
          { isSigner: false, isWritable: true,  pubkey: creatorIntermediaryTokenAtaAddress }, // wallet/treasury
          { isSigner: false, isWritable: true,  pubkey: rewardMetadataAddress },
          { isSigner: true,  isWritable: true,  pubkey: rewardMintKeypair.publicKey },
          { isSigner: false, isWritable: true,  pubkey: rewardMasterEditionAddress },
          { isSigner: false, isWritable: false, pubkey: metaplex.programs.metadata.MetadataProgram.PUBKEY },
          { isSigner: false, isWritable: false, pubkey: solana.SystemProgram.programId },
          { isSigner: false, isWritable: false, pubkey: solana.SYSVAR_RENT_PUBKEY },
          { isSigner: false, isWritable: false, pubkey: solana.SYSVAR_CLOCK_PUBKEY },
        ],
      }));
    })

    // signers
    .then(function () {
      signers.push(receiverKeypair);
      signers.push(rewardMintKeypair);
    })

    // NOTE:
    .then(function () {
      console.log(new Date(), 'Calling program...');
      return connection.getRecentBlockhash();
    })
    .then(function (response) {
      var trx = new solana.Transaction({
        feePayer: receiverKeypair.publicKey,
        recentBlockhash: response.blockhash
      });
      instructions.forEach(function (_) { trx.add(_); });
      return solana.sendAndConfirmTransaction(connection, trx, signers);
    });
};
