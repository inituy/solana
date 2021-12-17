describe('exchange NFT program', function () {

  // NOTE: Caller can pass an NFT metadata account that does not belong to the
  // NFT. In that chase, we will not accept the NFT metadata.
  it('fails if nft metadata does not match nft mint');

  // NOTE: Caller can pass an NFT that is not the NFT that the program is
  // exchanging for rewards. In that case, we will not accept the NFT.
  it('fails if nft update authority doesnt match expected');

  // NOTE: Caller can pass an NFT for which they don't have a balance. In that
  // case we will not accept the NFT.
  it('fails if nft balance is 0');

  /* // NOTE: Caller can pass an associated token account made for another
  // token mint. In that case, we will not accept the associated token account.
  it('fails if reward ata not related to reward mint');

  // NOTE: Caller can pass an associated token account that already exists.
  // In that case, we will not accept the associated token account.
  it('fails if reward ata has lamports'); */

  // NOTE: Caller can pass an allowance account with an address that does not
  // match the required derived address: // ['reward_allowance', pid, nft]
  // In that case, we will not accept the allowance account.
  it('fails if allowance ata is invalid');

  // NOTE: Caller can pass the allowance account twice, which means they
  // already got their reward.
  // In that case, we will not accept the allowance account.
  it('fails if allowance ata was already used');

  // NOTE: If caller passes all the right values:
  // * Allowance associated token account will be marked as used.
  // * Reward is minted using candy machine (`mint` instruction is called).
  it('gives the reward to the caller');

});
