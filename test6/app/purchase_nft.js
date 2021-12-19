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

var mint = solana.Keypair.generate()

module.exports = function (payload) {
  return Promise.resolve(payload)
    .then(function () {
      // Finds ATA between buyer and NFT.
      var owner = payload.owner;
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
      // Finds the candyMachine address.
      var configAddress = new solana.PublicKey(payload.nftCandyMachine.program.config)
      var uuid = payload.nftCandyMachine.program.uuid
      return solana.PublicKey.findProgramAddress(
        [Buffer.from('candy_machine'), configAddress.toBuffer(), Buffer.from(uuid)],
        CANDY_MACHINE_PROGRAM_ID
      )
    })
    .then(function (params) {
      payload.candyMachineAddress = params[0]
      return payload
    })
    .then(async function (data) {
      // Finds wallet and defines provider.
      const wallet = new anchor.Wallet(payload.candyMachineAddress)
      const provider = new anchor.Provider(payload.connection, wallet, {
        preflightCommitment: 'recent',
      })
      const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM_ID, provider)
      payload.candyMachineIdl = idl
      payload.candyMachineProvider = provider
      return payload
    })
    .then(function () {
      // Finds the candy machine program with all instructions, rpc and accounts
      const program = new anchor.Program(
        payload.candyMachineIdl,
        CANDY_MACHINE_PROGRAM_ID,
        payload.candyMachineProvider
      )
      payload.loadCandyProgram = program
      return payload
    })
    .then(async function () {
      // Defines the candy machine.
      payload.candyMachine = await payload.loadCandyProgram.account.candyMachine.fetch(
        payload.candyMachineAddress
      )
      return payload
    })
    .then(async function (params) {
      const instructions = [
        // Here we create the instructions for the account that 
        // will be used for the nft.
        solana.SystemProgram.createAccount({
          fromPubkey: payload.owner.publicKey,
          newAccountPubkey: mint.publicKey,
          space: splToken.MintLayout.span,
          lamports:
            await payload.loadCandyProgram.provider.connection.getMinimumBalanceForRentExemption(
              splToken.MintLayout.span
            ),
          programId: splToken.TOKEN_PROGRAM_ID
        }),

        // Here we create the instructions for the mint 
        // with balance 0
        splToken.Token.createInitMintInstruction(
          splToken.TOKEN_PROGRAM_ID,
          mint.publicKey,
          0,
          payload.owner.publicKey,
          payload.owner.publicKey,
        ),
        
        // Instructions to create an ATA
        createAssociatedTokenAccountInstruction(
          payload.userTokenAccountAddress,
          payload.owner.publicKey,
          payload.owner.publicKey,
          mint.publicKey
        ),
        // Instructions to mint balance 1
        splToken.Token.createInitMintInstruction(
          splToken.TOKEN_PROGRAM_ID,
          mint.publicKey,
          1,
          payload.userTokenAccountAddress,
          payload.owner.publicKey,
        ),
      ];
      payload.instructions = instructions;
      return payload
    })
    .then(function (params) {
      payload.tokenAccount;
      var remainingAccounts = [];
      if (payload.candyMachine.tokenMint) {
        const transferAuthority = solana.Keypair.generate();

        // Here we find the ATA between candyMachine and the buyer
        payload.tokenAccount = solana.PublicKey.findProgramAddress(
         [
           payload.owner.publicKey.toBuffer(),
           splToken.TOKEN_PROGRAM_ID.toBuffer(),
           payload.candyMachine.tokenMint.toBuffer()
         ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        )
         // This are signers for the transactions.
        remainingAccounts.push({
          pubkey: payload.tokenAccount,
          isWritable: true,
          isSigner: false,
        });
        remainingAccounts.push({
          pubkey: payload.owner.publicKey,
          isWritable: false,
          isSigner: true,
        });

        payload.instructions.push(
          // Approval instruction
          splToken.Token.createApproveInstruction(
            splToken.TOKEN_PROGRAM_ID,
            payload.tokenAccount,
            transferAuthority.publicKey,
            payload.owner.publicKey,
            [],
            payload.candyMachine.data.price.toNumber(),
          ),
        );
        payload.remainingAccounts = remainingAccounts
      }
      payload.remainingAccounts = [];
      return payload
    })
    .then(async function () {
      // Finds metadata address
      const metadataAddress = await solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );

      // Finds master edition for the NFT created
      const masterEdition = await solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
      var remainingAccounts = payload.remainingAccounts
      // Creates the instructions for mintNft and organice the accounts
      // received on params
      payload.instructions.push(
        payload.loadCandyProgram.instruction.mintNft({
          accounts: {
            config: new solana.PublicKey(payload.nftCandyMachine.program.config),
            candyMachine: payload.candyMachineAddress,
            payer: payload.owner.publicKey,
            wallet: payload.candyMachine.wallet,
            mint: mint.publicKey,
            metadata: metadataAddress[0],
            masterEdition: masterEdition[0],
            mintAuthority: payload.owner.publicKey,
            updateAuthority: payload.owner.publicKey,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: splToken.TOKEN_PROGRAM_ID,
            systemProgram: solana.SystemProgram.programId,
            rent: solana.SYSVAR_RENT_PUBKEY,
            clock: solana.SYSVAR_CLOCK_PUBKEY,
          },
          remainingAccounts,
        })
      );
      return payload
    })
    .then(function () {
      if (payload.tokenAccount) {
        payload.instructions.push(
          splToekn.Token.createRevokeInstruction(
            splToken.TOKEN_PROGRAM_ID,
            payload.tokenAccount,
            payload.owner.publicKey,
            [],
          ),
        );
      }
      return payload
    })
    .then(function name(params) {
      // This is currently work in prograss, but it send the transactio 
      return sendTransactionWithRetryWithKeypair(
        payload.connection,
        payload.owner,
        payload.instructions,
        [mint, payload.owner]
      )
    })
};
