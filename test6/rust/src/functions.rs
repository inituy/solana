use solana_program::msg;
use solana_program::program::invoke_signed;
use solana_program::program::invoke;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;
use solana_program::program_error::ProgramError;
use solana_program::program_pack::Pack;
use spl_token::state::Account as SplTokenAccount;
use spl_token_metadata::state::Metadata;
use solana_program::instruction::Instruction;
use solana_program::instruction::AccountMeta;



pub fn verify_nft_ata_belongs_to_mint(
  nft_ata: &AccountInfo,
  nft_mint: &AccountInfo,
) -> Result<u8, ProgramError> {
  let ata = SplTokenAccount::unpack_unchecked(&nft_ata.data.borrow())?;
  if ata.mint != *nft_mint.key {
    msg!("NFT associated token account does not belong to NFT mint");
    return Err(ProgramError::Custom(1));
  }
  Ok(1)
}



pub fn verify_nft_metadata_update_authority_matches(
  nft_metadata: &AccountInfo,
) -> Result<u8, ProgramError> {
  let metadata = Metadata::from_account_info(&nft_metadata)?;
  match bs58::decode("HW6oto3fnZuWfFcLaMBRkA4UYChQ8D57LTcHLKS3GmbC").into_vec() {
    Ok(reward_update_authority_vec) => {
      let reward_update_authority = Pubkey::new(&reward_update_authority_vec[..]);
      if metadata.update_authority != reward_update_authority {
        msg!("NFT metadata does not have the correct update authority");
        return Err(ProgramError::Custom(1));
      }
    }
    _ => {}
  }
  Ok(1)
}



pub fn verify_nft_metadata_belongs_to_mint(
  nft_metadata: &AccountInfo,
  nft_mint: &AccountInfo,
) -> Result<u8, ProgramError> {
  let metadata = Metadata::from_account_info(&nft_metadata)?;
  if metadata.mint != *nft_mint.key {
    msg!("NFT metadata does not belong to NFT mint");
    return Err(ProgramError::Custom(2));
  }
  Ok(1)
}



pub fn verify_nft_ata_belongs_to_receiver(
  nft_ata: &AccountInfo,
  receiver: &AccountInfo,
) -> Result<u8, ProgramError> {
  let ata = SplTokenAccount::unpack_unchecked(&nft_ata.data.borrow())?;
  if ata.owner != *receiver.key {
    msg!("NFT associated token account does not belong to receiver");
    return Err(ProgramError::Custom(1));
  }
  Ok(1)
}



pub fn verify_nft_ata_balance_is_not_zero(
  nft_ata: &AccountInfo,
) -> Result<u8, ProgramError> {
  let ata = SplTokenAccount::unpack_unchecked(&nft_ata.data.borrow())?;
  if ata.amount == 0 {
    msg!("NFT associated token account balance is 0");
    return Err(ProgramError::Custom(1));
  }
  Ok(1)
}



pub fn verify_nft_allowance_account_is_valid(
  program_id: &Pubkey,
  nft_mint: &AccountInfo,
  nft_allowance: &AccountInfo,
) -> Result<u8, ProgramError> {
  let pda = Pubkey::find_program_address(
    &[
      &"allowance".as_bytes(),
      &program_id.as_ref(),
      &nft_mint.key.as_ref(),
    ],
    &program_id,
  );
  let expected_address = pda.0;
  if *nft_allowance.key != expected_address {
    msg!("NFT allowance account is not valid");
    return Err(ProgramError::Custom(1));
  }
  Ok(1)
}



pub fn verify_nft_allowance_account_is_owned(
  program_id: &Pubkey,
  nft_allowance: &AccountInfo,
) -> Result<u8, ProgramError> {
  if *nft_allowance.key != *program_id {
    msg!("NFT allowance account not owned by program");
    return Err(ProgramError::Custom(1));
  }
  Ok(1)
}



pub fn verify_nft_allowance_account_is_not_used(
  nft_allowance: &AccountInfo,
) -> Result<u8, ProgramError> {
  let data = nft_allowance.try_borrow_mut_data()?;
  // let unpacked = allowance::NftAllowanceAccount::try_from_slice(&data)?;
  msg!("{:?}", data);
  Ok(1)
}

 

pub fn update_nft_allowance_account_as_used(
) -> Result<u8, ProgramError> {
  Ok(1)
}



pub fn mint_intermediary_token<'a>(
  intermediary_token_mint: &AccountInfo<'a>,
  intermediary_token_mint_authority: &AccountInfo<'a>,
  intermediary_token_ata: &AccountInfo<'a>,
  token_program: &AccountInfo<'a>,
  program_id: &Pubkey,
) -> Result<u8, ProgramError> {
  let key: &[u8] = b"mintauthority";
  let (mint_authority, bump) = Pubkey::find_program_address(&[key, program_id.as_ref()], &program_id);
  let signer: &[&[&[u8]]] = &[&[&key[..], program_id.as_ref(), &[bump]]];

  invoke_signed(
    &spl_token::instruction::mint_to(
      &spl_token::id(),
      intermediary_token_mint.key,
      intermediary_token_ata.key,
      &mint_authority,
      &[],
      1,
    )?,
    &[
      intermediary_token_mint.clone(),
      intermediary_token_ata.clone(),
      intermediary_token_mint_authority.clone(),
      token_program.clone(),
    ],
    signer
  )?;

  Ok(1)
}



pub fn purchase_reward_with_intermediary_token<'a>(
  // _receiver: &AccountInfo<'a>,
  // _reward_candy_machine: &AccountInfo<'a>,
  // _reward_candy_machine_config: &AccountInfo<'a>,
  // _reward_candy_machine_treasury: &AccountInfo<'a>,
  // _reward_mint: &AccountInfo<'a>,
  // _reward_master_edition: &AccountInfo<'a>,
  // _token_metadata_program: &AccountInfo<'a>,
  // _token_program: &AccountInfo<'a>,
  // _system_program: &AccountInfo<'a>,
  // _rent: &AccountInfo<'a>,
  // _clock: &AccountInfo<'a>,
) -> Result<u8, ProgramError> {

  // let accounts = &[
  //   AccountMeta { // payer
  //     pubkey: *receiver.key,
  //     is_signer: true,
  //     is_writable: false,
  //   },
  //   AccountMeta { // candy machine config
  //     pubkey: *reward_candy_machine_config.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta { // candy machine
  //     pubkey: *reward_candy_machine.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta {
  //     // TREASURY: issuer of candy machine that gets paid for NFT.
  //     // NOTE: This needs to be an ATA of the intermediary token mint.
  //     pubkey: *reward_candy_machine_treasury.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta {
  //     // REWARD MINT: account where the reward mint will be created by candy
  //     // machine.
  //     pubkey: *reward_mint.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta {
  //     // MASTER EDITION: PDA for metadata of reward nft in candy machine.
  //     // NOTE: Not sure yet how to get this one. Just send PDA.
  //     pubkey: *reward_master_edition.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta { // reward nft mint authority
  //     pubkey: *receiver.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta { // reward nft update authority
  //     pubkey: *receiver.key,
  //     is_signer: false,
  //     is_writable: false,
  //   },
  //   AccountMeta {
  //   }
  // ];

  // let data = &[];

  // invoke(
  //   &Instruction {
  //     program_id: *reward_candy_machine.key,
  //     accounts: accounts.to_vec(),
  //     data: data.to_vec(),
  //   },
  //   &[]
  // )?;

  // invoke_signed(
  //   &spl_token::instruction::mint_to(
  //     &spl_token::id(),
  //     intermediary_token_mint.key,
  //     intermediary_token_ata.key,
  //     &mint_authority,
  //     &[],
  //     1,
  //   )?,
  //   &[
  //     intermediary_token_mint.clone(),
  //     intermediary_token_ata.clone(),
  //     intermediary_token_mint_authority.clone(),
  //     token_program.clone(),
  //   ],
  //   signer
  // )?;

  Ok(1)
}



pub fn verify_receiver_is_signer(
  receiver: &AccountInfo,
) -> Result<u8, ProgramError> {
  if !receiver.is_signer { return Err(ProgramError::Custom(1)); }
  Ok(1)
}
