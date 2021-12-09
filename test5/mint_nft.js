var solana = require('@solana/web3.js');
var metaplex = require('@metaplex/js');

module.exports = function mintNft(input) {
  var throwawayMintAuthority = solana.Keypair.generate()
    , receivingTokenAccount
    , tokenMetadata
    , tokenMetadataAddress;

  return Promise.resolve()
    // NOTE: We start by finding the ATA for the receiver. This time, as
    // opposed to the `createNft` function, the ATA may be found since the
    // token already exists by the time we call this function.
    .then(function () {
      return input.token.getOrCreateAssociatedAccountInfo(input.receiver.publicKey);
    })
    .then(function (_) {
      receivingTokenAccount = _;
    })

    // NOTE: We change the supply of the NFT to 1. Having it be 1 makes it so
    // that nobody will be able to exchange the token, making it non-fungible.
    // TODO: Does this `mintTo` charge the receiver or the owner?
    .then(function () {
      return input.token.mintTo(
        receivingTokenAccount.address,
        input.owner.publicKey,
        [],
        1, // Amount
      );
    })

    // NOTE: Another necessary step to ensure that the NFT remains non-fungible
    // is to eliminate the possibilty of increasing supply. To achieve this, we
    // will give the mint authority to a keypair that's going to be lost after
    // the execution of this function.
    .then(function () {
      return input.token.setAuthority(
        input.token.publicKey,
        throwawayMintAuthority.publicKey,
        'MintTokens',
        input.owner,
        []
      );
    })

    // NOTE: Again we compile the PDA that references the metadata account. You
    // will notice that these are the same values that we used in the
    // `createNft` function.
    .then(function () {
      return solana.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          metaplex.programs.metadata.MetadataProgram.PUBKEY.toBuffer(),
          input.token.publicKey.toBuffer()
        ],
        metaplex.programs.metadata.MetadataProgram.PUBKEY
      );
    })
    .then(function (_) {
      tokenMetadataAddress = _[0];
    })

    // NOTE: Since the UpdateMetadata transaction does not remember previous
    // values, we need to load the metadata that is already stored in the
    // metadata account. This will let us change only the fields we want and
    // keep the ones we don't want to change.
    .then(function () {
      return metaplex.programs.metadata.Metadata.load(input.connection, tokenMetadataAddress);
    })
    .then(function (_) {
      tokenMetadata = _;
    })

    // NOTE: Same way we did with the CreateMetadata transaction, we build an
    // UpdateMetadata transaction with the a new metadata object that is based
    // off of the previously set metadata in the account.
    // In order to finally transfer ownership of the NFT and its metadata to
    // the receiver, we also indicate in the UpdateMetadata transaction that we
    // want to change the update authority. This way the previous owner of the
    // NFT has no permission to change the NFT's metadata.
    .then(function () {
      var transaction = new metaplex.programs.metadata.UpdateMetadata(
        { feePayer: input.receiver.publicKey },
        {
          metadata: tokenMetadataAddress,
          metadataData: new metaplex.programs.metadata.MetadataDataData({
            uri: input.metadata.uri, // NOTE: Updated URI from input
            symbol: tokenMetadata.data.data.symbol,
            name: tokenMetadata.data.data.name,
            sellerFeeBasisPoints: tokenMetadata.data.data.sellerFee,
            creators: tokenMetadata.data.data.creators
          }),
          updateAuthority: input.owner.publicKey,
          newUpdateAuthority: input.receiver.publicKey,
          primarySaleHappened: 1,
        }
      );
      return solana.sendAndConfirmTransaction(
        input.connection,
        transaction,
        [input.receiver, input.owner],
      );
    })
};
