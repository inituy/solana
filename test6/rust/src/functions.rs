// use crate::allowance;
use solana_program::program::invoke_signed as invoke_signed;
use solana_program::msg;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;
use solana_program::program_error::ProgramError;
use solana_program::program_pack::Pack;
use solana_program::system_instruction;
use spl_token::state::Account as SplTokenAccount;
//use spl_token::id as SPL_TOKEN_PROGRAM_ID;
use spl_token_metadata::state::Metadata;


pub fn create_intermerdiary_token_mint<'a>(
  program_id: &Pubkey,
  creator: &AccountInfo<'a>,
  intermediary_token_mint: &AccountInfo<'a>,
  system_program: &AccountInfo<'a>,
  _token_program: &AccountInfo<'a>,
) -> Result<u8, ProgramError> {
  let key: &[u8] = b"imtm5";
  let (pda, bump) = Pubkey::find_program_address(&[key, program_id.as_ref()], &program_id);
  let signer: &[&[&[u8]]] = &[&[&key[..], program_id.as_ref(), &[bump]]];

  msg!("{:?}, {:?}", intermediary_token_mint.key, pda);

  invoke_signed(
    &system_instruction::create_account(
      creator.key,
      &pda,
      0,
      0,
      program_id,
    ),
    &[
      creator.clone(),
      intermediary_token_mint.clone(),
      system_program.clone(),
    ],
    signer
  )?;

  Ok(1)
}



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



pub fn mint_intermediary_token(
  // _intermediary_token_mint: &AccountInfo,
  // _intermediary_token_ata: &AccountInfo,
) -> Result<u8, ProgramError> {
  // let ix = spl_token::instruction::mint_to(
  //   SPL_TOKEN_PROGRAM_ID,
  //   intermediary_token_mint,
  //   intermediary_token_ata,
  //   &[],
  //   1
  // );
  Ok(1)
}



pub fn purchase_reward_with_intermediary_token(
) -> Result<u8, ProgramError> {
  Ok(1)
}



pub fn verify_receiver_is_signer(
  receiver: &AccountInfo,
) -> Result<u8, ProgramError> {
  if !receiver.is_signer { return Err(ProgramError::Custom(1)); }
  Ok(1)
}
