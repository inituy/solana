const solana = require('@solana/web3.js');
const splToken = require("@solana/spl-token");
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new solana.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
module.exports = function createAssociatedTokenAccountInstruction(
  associatedTokenAddress,
  payer,
  walletAddress,
  splTokenMintAddress
) {
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: walletAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: solana.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splToken.TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: solana.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new solana.TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  });
}