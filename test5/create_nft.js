var solana = require('@solana/web3.js');
var spltoken = require('@solana/spl-token');
var metaplex = require('@metaplex/js');

module.exports = function createNft(input) {
  var token
    , tokenAccount
    , tokenMetadataAddress;

  // NOTE: If owner not in creators array, add it. The Token Metadata Program
  // does not allow for update authorities that are not also a creator in the
  // creators array.
  // One of the steps in the instruction looks like the following:
  //   Program log: If using a creators array, you must be one of the creators
  //   listed
  var ownerCreator = input.metadata.creators.find(function (creator) {
    return creator.keypair.publicKey.equals(input.owner.publicKey);
  });
  if (!ownerCreator)
    input.metadata.creators.unshift({ keypair: input.owner, share: 0 });

  return Promise.resolve()

    // NOTE: We create the account that will take the role of NFT. This account
    // needs to be created using the Token Program. It also needs to have 0
    // decimal places and have a supply of 1, which we'll achieve in the next
    // step when we issue the mint.
    .then(function () {
      return spltoken.Token.createMint(
        input.connection,
        input.owner,             // Payer
        input.owner.publicKey,   // Mint authority
        input.owner.publicKey,   // Freeze authority
        0,                       // Decimals
        spltoken.TOKEN_PROGRAM_ID,
      );
    })
    .then(function (_) { token = _; })

    // NOTE: Create an ATA for the owner of the NFT to hold the NFT. Even
    // though it says "get or create" it will always create it, because the
    // token account was just created in the step above.
    // Quick reminder of what an ATA is: There's three main players in token
    // holding in Solana. One is the account that represents the wallet. Then
    // the account that represents the currency or token. And finally there is
    // an account which stores a reference to the wallet and the token, as well
    // as the amount of tokens the wallet currently holds. That last one is
    // called an associated token account or ATA.
    // Since the token is an NFT, the amount of tokens will always be 1.
    .then(function () {
      return token.getOrCreateAssociatedAccountInfo(input.owner.publicKey);
    })
    .then(function (_) {
      tokenAccount = _;
    })

    // NOTE: We start the process of creating the metadata account for the NFT.
    // For the NFT to be displayed properly in wallet software like Phantom
    // there needs to be another account which is related to the NFT and holds
    // its metadata. Metadata must comply with the Token Metadata Standard,
    // which we achieve by using the Metaplex library.
    // In this next step, we create a PDA which will become the metadata
    // account address and is based off of a seed like the one below.
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
    .then(function (_) {
      tokenMetadataAddress = _[0];
    })

    // NOTE: We create a CreateMetadata transaction using the Metaplex library
    // and execute it using the web3 library. This will create the metadata
    // account at the derived address created in the function above. At this
    // point the NFT will exist with its metadata, but the supply will be 0.
    .then(function () {
      var transaction = new metaplex.programs.metadata.CreateMetadata(
        { feePayer: input.owner.publicKey, },
        {
          mint: token.publicKey,
          mintAuthority: input.owner.publicKey,
          metadata: tokenMetadataAddress,
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
