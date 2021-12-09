var bs58 = require('bs58');
var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');
var metaplex = require('@metaplex/js');

module.exports = function createNft(input) {
  var DECIMALS = 0
    , MULTISIGNERS = []
    , AMOUNT = 1;

  var mintAuthority = solana.Keypair.generate()
    , token
    , tokenAccount
    , tokenMetadataAccount;


  // NOTE: If payer not in creators array, add it.
  var payerCreator = input.metadata.creators.find(function (creator) {
    return creator.keypair.publicKey.equals(input.payer.publicKey);
  });
  if (!payerCreator)
    input.metadata.creators.unshift({ keypair: input.payer, share: 0 });

  return Promise.resolve()
    .then(function () {
      return spltoken.Token.createMint(
        input.connection,
        input.payer,             // Payer
        input.payer.publicKey,   // Mint authority
        input.payer.publicKey,   // Freeze authority
        DECIMALS,
        spltoken.TOKEN_PROGRAM_ID,
      );
    })
    .then(function (_) {
      token = _;
    })
    .then(function () {
      return token.getOrCreateAssociatedAccountInfo(input.payer.publicKey);
    })
    .then(function (_) {
      tokenAccount = _;
    })
    .then(function () {
      return token.mintTo(
        tokenAccount.address,
        input.payer.publicKey,
        MULTISIGNERS,
        AMOUNT,
      );
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
        { feePayer: input.payer.publicKey, },
        {
          mint: token.publicKey,
          metadata: pda[0],
          metadataData: new metaplex.programs.metadata.MetadataDataData({
            symbol: input.metadata.symbol,
            name: input.metadata.name,
            uri: input.metadata.uri,
            sellerFeeBasisPoints: input.sellerFee,
            creators: input.metadata.creators.map(function (creator) {
              return new metaplex.programs.metadata.Creator({
                address: creator.keypair.publicKey.toString(),
                share: creator.share,
                verified: creator.keypair.publicKey.equals(input.payer.publicKey),
              })
            })
          }),
          updateAuthority: input.payer.publicKey,
          mintAuthority: input.payer.publicKey
        }
      );
      return solana.sendAndConfirmTransaction(
        input.connection,
        transaction,
        [input.payer],
      );
    })
    .then(function () {
      return token.setAuthority(
        token.publicKey,
        mintAuthority.publicKey,
        'MintTokens',
        input.payer,
        []
      );
    })
    .then(function (result) {
      return token;
    });
};
