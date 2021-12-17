use solana_program::entrypoint;
use solana_program::msg;
use solana_program::account_info::AccountInfo;
use solana_program::account_info::next_account_info;
use solana_program::entrypoint::ProgramResult;
use solana_program::pubkey::Pubkey;
use solana_program::program_error::ProgramError;
// use solana_program::program::invoke_signed;
// use spl_token_metadata::instruction::update_metadata_accounts;
// use spl_token_metadata::ID as SPL_TOKEN_METADATA_PROGRAM_ID;
use spl_token_metadata::state::Metadata;
// use std::io::Error;

fn verify_nft_ownership(
  receiver: &AccountInfo,
  nft: &AccountInfo,
) -> Result<bool, ProgramError> {

  let metadata = Metadata::from_account_info(&nft)?;

  if !receiver.is_signer || !metadata.update_authority.eq(receiver.key) {
    return Err(ProgramError::Custom(1));
  }

  Ok(true)
}

fn process_instruction(
  _program_id: &Pubkey,
  accounts: &[AccountInfo],
  _instruction_data: &[u8]
) -> ProgramResult {

  let account_iter = &mut accounts.iter();

  let receiver  = next_account_info(account_iter)?;
  let nft       = next_account_info(account_iter)?;

  match verify_nft_ownership(&receiver, &nft) {
    Ok(_) => { msg!("Receiver owns NFT, yes") }
    Err(_) => { msg!("Error") }
  }

  Ok(())
}

entrypoint!(process_instruction);
