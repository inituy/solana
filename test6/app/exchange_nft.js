var solana = require('../solana/web3.js')
  , metaplex = require('../metaplex/js')
  , spltoken = require('../spltoken/spltoken');

var getMetadataAddress = require('../metaplex/get_metadata_address')
  , getMasterEditionAddress = require('../metaplex/get_master_edition_address');

if (!globalThis.Buffer) {
  globalThis.Buffer = {
    from: function (string) {
      return new TextEncoder().encode(string);
    }
  };
}

module.exports = function (input) {
  var instructions = []
    , signers = []
    , mintLayoutMinBalance;

  var signAndSendTransaction = input.signAndSendTransaction;

  var receiverAddress = input.receiverAddress
    , connection = input.connection
    , programId = input.programId
    , nftMintAddress = input.nftMintAddress
    , intermediaryTokenMintAddress = input.intermediaryTokenMintAddress
    , creatorIntermediaryTokenAtaAddress = input.creatorIntermediaryTokenAtaAddress
    , rewardCandyMachineConfigAddress = input.rewardCandyMachineConfigAddress
    , rewardCandyMachineAddress = input.rewardCandyMachineAddress

  var rewardMintKeypair = solana.Keypair.generate()
    , candyMachineProgramAddress = new solana.PublicKey('cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ')

  return Promise.resolve()
    .then(function () {
      return Promise.all([
        solana.PublicKey.findProgramAddress(
          [ Buffer.from('metadata'),
            metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
            new solana.PublicKey(nftMintAddress).toBuffer() ],
          metaplex.programs.metadata.MetadataProgram.PUBKEY
        ),
        solana.PublicKey.findProgramAddress(
          [ Buffer.from('allowance'),
            programId.toBuffer(),
            new solana.PublicKey(nftMintAddress).toBuffer() ],
          programId,
        ),
        spltoken.Token.getAssociatedTokenAddress(
          spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
          spltoken.TOKEN_PROGRAM_ID,
          nftMintAddress,
          receiverAddress,
        ),
        spltoken.Token.getAssociatedTokenAddress(
          spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
          spltoken.TOKEN_PROGRAM_ID,
          intermediaryTokenMintAddress,
          receiverAddress,
        ),
        spltoken.Token.getAssociatedTokenAddress(
          spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
          spltoken.TOKEN_PROGRAM_ID,
          rewardMintKeypair.publicKey,
          receiverAddress,
        ),
        getMetadataAddress({
          token: rewardMintKeypair.publicKey
        }),
        getMasterEditionAddress({
          token: rewardMintKeypair.publicKey
        }),
        solana.PublicKey.findProgramAddress(
          [ Buffer.from('mintauthority'), programId.toBuffer() ],
          programId
        ),
      ])
    })
    .then(function (pdas) {
      nftMetadataAddress = pdas[0][0];
      nftAllowanceAddress = pdas[1][0];
      nftAtaAddress = pdas[2];
      receiverIntermediaryTokenAtaAddress = pdas[3];
      rewardAtaAddress = pdas[4];
      rewardMetadataAddress = pdas[5];
      rewardMasterEditionAddress = pdas[6];
      intermediaryTokenMintAuthorityAddress = pdas[7][0];
    })



    .then(function () {
      console.log(new Date(), intermediaryTokenMintAddress.toString(), '+ Intermediary token mint');
      console.log(new Date(), intermediaryTokenMintAuthorityAddress.toString(), '+ Intermediary token mint authority');
      console.log(new Date(), creatorIntermediaryTokenAtaAddress.toString(), '+ Creater intermediary associated token account address');
      console.log(new Date(), receiverAddress.toString(), '+ Receiver address');
      console.log(new Date(), receiverIntermediaryTokenAtaAddress.toString(), '+ Receiver intermediary associated token account address');
      console.log(new Date(), nftMintAddress.toString(), '+ NFT mint address');
      console.log(new Date(), nftAtaAddress.toString(), '+ NFT associated token account address');
      console.log(new Date(), nftMetadataAddress.toString(), '+ NFT metadata address');
      console.log(new Date(), nftAllowanceAddress.toString(), '+ NFT allowance address');
      console.log(new Date(), rewardMintKeypair.publicKey.toString(), '+ Reward mint address');
      console.log(new Date(), rewardAtaAddress.toString(), '+ Reward associated token address');
      console.log(new Date(), rewardMetadataAddress.toString(), '+ Reward metadata address');
      console.log(new Date(), rewardMasterEditionAddress.toString(), '+ Reward master edition address');
      console.log(new Date(), rewardCandyMachineConfigAddress.toString(), '+ Reward candy machine config address');
      console.log(new Date(), rewardCandyMachineAddress.toString(), '+ Reward candy machine address');
    })



    .then(function () {
      console.log(new Date(), 'Getting minimum balances for mint...');
      return connection.getMinimumBalanceForRentExemption(spltoken.MintLayout.span);
    })
    .then(function (balance) {
      mintLayoutMinBalance = balance;
    })

    // NOTE: Create intermediary token associated account for receiver if it
    // doesnt exist.
    .then(function () {
      return connection.getAccountInfo(receiverIntermediaryTokenAtaAddress);
    })
    .then(function (accountInfo) {
      if (!!accountInfo && accountInfo.lamports != 0) return;
      instructions.push(spltoken.Token.createAssociatedTokenAccountInstruction(
        spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        spltoken.TOKEN_PROGRAM_ID,
        intermediaryTokenMintAddress,
        receiverIntermediaryTokenAtaAddress,
        receiverAddress,
        receiverAddress,
      ));
    })

    // NOTE: Create and mint one nft that the candy machine will certify.
    .then(function () {
      instructions.push(solana.SystemProgram.createAccount({
        fromPubkey: receiverAddress,
        newAccountPubkey: rewardMintKeypair.publicKey,
        space: spltoken.MintLayout.span,
        lamports: mintLayoutMinBalance,
        programId: spltoken.TOKEN_PROGRAM_ID,
      }));
      instructions.push(spltoken.Token.createInitMintInstruction(
        spltoken.TOKEN_PROGRAM_ID,
        rewardMintKeypair.publicKey,
        0,               // decimals
        receiverAddress, // mint authority
        receiverAddress, // freeze authority
      ));
      instructions.push(spltoken.Token.createAssociatedTokenAccountInstruction(
        spltoken.ASSOCIATED_TOKEN_PROGRAM_ID,
        spltoken.TOKEN_PROGRAM_ID,
        rewardMintKeypair.publicKey,
        rewardAtaAddress,
        receiverAddress,
        receiverAddress,
      ));
      instructions.push(spltoken.Token.createMintToInstruction(
        spltoken.TOKEN_PROGRAM_ID,
        rewardMintKeypair.publicKey,
        rewardAtaAddress,
        receiverAddress,
        [], // multisig
        1,  // amount
      ));
      instructions.push(new solana.TransactionInstruction({
        programId: programId,
        data: Buffer.from('2'),
        keys: [
          { isSigner: true,  isWritable: true,  pubkey: receiverAddress },
          { isSigner: false, isWritable: false, pubkey: nftMintAddress },
          { isSigner: false, isWritable: false, pubkey: nftAtaAddress },
          { isSigner: false, isWritable: false, pubkey: nftMetadataAddress },
          { isSigner: false, isWritable: true,  pubkey: nftAllowanceAddress },
          { isSigner: false, isWritable: true,  pubkey: intermediaryTokenMintAddress },
          { isSigner: false, isWritable: false, pubkey: intermediaryTokenMintAuthorityAddress },
          { isSigner: false, isWritable: true,  pubkey: receiverIntermediaryTokenAtaAddress },
          { isSigner: false, isWritable: false, pubkey: spltoken.TOKEN_PROGRAM_ID },
          { isSigner: false, isWritable: false, pubkey: candyMachineProgramAddress },
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

    .then(function () {
      signers.push(rewardMintKeypair);
    })

    // NOTE:
    .then(function () {
      return connection.getRecentBlockhash();
    })
    .then(function (response) {
      var trx = new solana.Transaction({
        feePayer: receiverAddress,
        recentBlockhash: response.blockhash,
      });
      instructions.forEach(function (_) { trx.add(_); });
      return signAndSendTransaction(connection, trx, signers);
    });
};
