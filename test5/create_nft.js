var bs58 = require('bs58');
var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');
var metaplex = require('@metaplex/js');

module.exports = function createNft(input) {
  var DECIMALS = 0;

  var token
    , tokenAccount
    , tokenMetadataAccount;

  // NOTE: If owner not in creators array, add it.
  var ownerCreator = input.metadata.creators.find(function (creator) {
    return creator.keypair.publicKey.equals(input.owner.publicKey);
  });
  if (!ownerCreator)
    input.metadata.creators.unshift({ keypair: input.owner, share: 0 });

  return Promise.resolve()
    .then(function () {
      return spltoken.Token.createMint(
        input.connection,
        input.owner,             // Payer
        input.owner.publicKey,   // Mint authority
        input.owner.publicKey,   // Freeze authority
        DECIMALS,
        spltoken.TOKEN_PROGRAM_ID,
      );
    })
    .then(function (_) {
      token = _;
    })
    .then(function () {
      return token.getOrCreateAssociatedAccountInfo(input.owner.publicKey);
    })
    .then(function (_) {
      tokenAccount = _;
    })
    .then(function () {
      return solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
          token.publicKey.toBuffer()
        ],
        metaplex.programs.metadata.MetadataProgram.PUBKEY
      );
    })
    .then(function (pda) {
      var transaction = new metaplex.programs.metadata.CreateMetadata(
        { feePayer: input.owner.publicKey, },
        {
          mint: token.publicKey,
          mintAuthority: input.owner.publicKey,
          metadata: pda[0],
          metadataData: new metaplex.programs.metadata.MetadataDataData({
            symbol: input.metadata.symbol,
            name: input.metadata.name,
            uri: input.metadata.uri,
            sellerFeeBasisPoints: input.metadata.sellerFee,
            creators: input.metadata.creators.map(function (creator) {
              return new metaplex.programs.metadata.Creator({
                address: creator.keypair.publicKey.toString(),
                share: creator.share,
                verified: creator.keypair.publicKey.equals(input.owner.publicKey),
              })
            })
          }),
          updateAuthority: input.owner.publicKey
        }
      );
      return solana.sendAndConfirmTransaction(
        input.connection,
        transaction,
        [input.owner],
      );
    })
    .then(function (result) {
      return token;
    });
};
