const solana = require("@solana/web3.js")
const splToken = require("@solana/spl-token")
const anchor = require("@project-serum/anchor")
const createAssociatedTokenAccountInstruction = require("./helpers/create_associated_token_account_instructions")
const sendTransactionWithRetryWithKeypair = require('./helpers/send_transaction_with_retry_wit_keypair');
const CANDY_MACHINE_PROGRAM_ID = new solana.PublicKey(
  'cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ',
);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new solana.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const TOKEN_METADATA_PROGRAM_ID = new solana.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);
// TODO: shouldn't this walled be in some way associated with the candy machine?

module.exports = function (payload) {
  console.log('nftCandyMachine', payload.nftCandyMachine);
  var fromWallet = payload.creator;
  var toWallet = payload.receiver;
  return Promise.resolve(payload)
    .then(function () {
      // Finds ATA between buyer and NFT
      var owner = toWallet;
      return solana.PublicKey.findProgramAddress(
        [owner.publicKey.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      )
    })
    .then(function (params) {
      payload.userTokenAccountAddress = params[0]
      return payload
    })
    .then(function (data) {
      var configAddress = new solana.PublicKey(payload.nftCandyMachine.program.config)
      var uuid = payload.nftCandyMachine.program.uuid
      return solana.PublicKey.findProgramAddress(
        [Buffer.from('candy_machine'), configAddress.toBuffer(), Buffer.from(uuid)],
        CANDY_MACHINE_PROGRAM_ID
      )
    })
    .then(function (params) {
      payload.candyMachineAddress = params[0];
      return payload;
    })
    // .then(async function (data) {
    //   const wallet = new anchor.Wallet(payload.candyMachineAddress)
    //   const provider = new anchor.Provider(payload.connection, wallet, {
    //     preflightCommitment: 'recent',
    //   });
    //   const idl = await solana.SystemProgram.;
    //   payload.candyMachineIdl = idl;
    //   payload.candyMachineProvider = provider;
    //   return payload;
    // })
    // .then(function () {
    //   const program = new solana.SystemProgram(
    //     payload.candyMachineIdl,
    //     CANDY_MACHINE_PROGRAM_ID,
    //     payload.candyMachineProvider
    //   );
    //   console.log('program', program);
    //   payload.loadCandyProgram = program;
    //   return payload;
    // })
    // .then(async function () {
    //   payload.candyMachine = await payload.loadCandyProgram.account.candyMachine.fetch(
    //     payload.candyMachineAddress
    //   );
    //   return payload;
    // })
    .then(async function () {
      // Optional ??
      var fromAirdropSignature = await payload.connection.requestAirdrop(
        fromWallet.publicKey,
        solana.LAMPORTS_PER_SOL,
      );
      //wait for airdrop confirmation
      await payload.connection.confirmTransaction(fromAirdropSignature);
      return payload;
    })
    .then(async function () {
      payload.mint = await splToken.Token.createMint(
        payload.connection,
        // Currently set for the buyer(owner) to pay the fee. TODO: Make the CM pay the fee
        toWallet,
        fromWallet.publicKey,
        null,
        9,
        splToken.TOKEN_PROGRAM_ID,
      );
      return payload;
    })
    .then(async function () {
      // account on the CM side
      payload.fromTokenAccount = await payload.mint.getOrCreateAssociatedAccountInfo(
        fromWallet.publicKey,
      );
      // receiver's account
      payload.toWalletAccount = await payload.mint.getOrCreateAssociatedAccountInfo(
        toWallet.publicKey,
      );
      return payload;
    })
    .then(async function() {
      //minting 1 new token to the "fromTokenAccount" account we just returned/created
      await payload.mint.mintTo(
        payload.fromTokenAccount.address, //who it goes to
        fromWallet.publicKey, // minting authority
        [], // multisig
        1000000000, // how many
      );
      return payload;
    })
    .then(async function() {
      // will revoke minting privileges and ensure that we can not create additional tokens of this type
      await payload.mint.setAuthority(
        payload.mint.publicKey,
        null,
        "MintTokens",
        fromWallet.publicKey,
        []
      );
      return payload;
    })



    .then(async function (params) {
      const instructions = [
        solana.SystemProgram.createAccount({
          fromPubkey: toWallet.publicKey,
          newAccountPubkey: fromWallet.publicKey,
          space: splToken.MintLayout.span,
          lamports:
            await payload.connection.getMinimumBalanceForRentExemption(
              splToken.MintLayout.span
            ),
          programId: splToken.TOKEN_PROGRAM_ID
        }),

        splToken.Token.createInitMintInstruction(
          splToken.TOKEN_PROGRAM_ID,
          fromWallet.publicKey,
          0,
          toWallet.publicKey,
          toWallet.publicKey,
        ),

        createAssociatedTokenAccountInstruction(
          payload.userTokenAccountAddress,
          toWallet.publicKey,
          toWallet.publicKey,
          fromWallet.publicKey
        ),

        splToken.Token.createInitMintInstruction(
          splToken.TOKEN_PROGRAM_ID,
          fromWallet.publicKey,
          1,
          payload.userTokenAccountAddress,
          toWallet.publicKey,
        ),
      ];
      payload.instructions = instructions;
      return payload;
    })
    .then(function (params) {
      payload.tokenAccount;
      var remainingAccounts = [];
      if (payload.candyMachine.tokenMint) {
        const transferAuthority = solana.Keypair.generate();

        payload.tokenAccount = solana.PublicKey.findProgramAddress(
         [
           toWallet.publicKey.toBuffer(),
           splToken.TOKEN_PROGRAM_ID.toBuffer(),
           payload.candyMachine.tokenMint.toBuffer()
         ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        )

        remainingAccounts.push({
          pubkey: payload.tokenAccount,
          isWritable: true,
          isSigner: false,
        });
        remainingAccounts.push({
          pubkey: toWallet.publicKey,
          isWritable: false,
          isSigner: true,
        });

        payload.instructions.push(
          splToken.Token.createApproveInstruction(
            splToken.TOKEN_PROGRAM_ID,
            payload.tokenAccount,
            transferAuthority.publicKey,
            toWallet.publicKey,
            [],
            payload.candyMachine.data.price.toNumber(),
          ),
        );
        payload.remainingAccounts = remainingAccounts
      }
      payload.remainingAccounts = [];
      return payload;
    })


    .then(async function () {
      const metadataAddress = await solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          fromWallet.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );
      const masterEdition = await solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          fromWallet.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
      var remainingAccounts = payload.remainingAccounts
      payload.instructions.push(
        splToken.Token.createTransferInstruction(
          splToken.TOKEN_PROGRAM_ID,
          fromTokenAccount.address,
          toTokenAccount.address,
          fromWallet.publicKey,
          [],
          1,
        ),
      );
      return payload
    })
    // .then(function () {
    //   if (payload.tokenAccount) {
    //     payload.instructions.push(
    //       Token.createRevokeInstruction(
    //         splToken.TOKEN_PROGRAM_ID,
    //         payload.tokenAccount,
    //         toWallet.publicKey,
    //         [],
    //       ),
    //     );
    //   }
    //   return payload
    // })
    .then(function name(params) {
      
      return sendTransactionWithRetryWithKeypair(
        payload.connection,
        toWallet,
        payload.instructions,
        [mint, toWallet]
      )
    })
};
