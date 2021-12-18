use solana_program::msg;
use solana_program::account_info::next_account_info;
use solana_program::entrypoint::ProgramResult;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;

use crate::functions::create_intermerdiary_token_mint;

use crate::functions::verify_receiver_is_signer;
use crate::functions::verify_nft_ata_belongs_to_mint;
use crate::functions::verify_nft_ata_belongs_to_receiver;
use crate::functions::verify_nft_ata_balance_is_not_zero;
use crate::functions::verify_nft_metadata_belongs_to_mint;
use crate::functions::verify_nft_metadata_update_authority_matches;
// use crate::functions::verify_nft_allowance_account_is_owned;
// use crate::functions::verify_nft_allowance_account_is_valid;
// use crate::functions::verify_nft_allowance_account_is_not_used;

use crate::functions::mint_intermediary_token;
use crate::functions::update_nft_allowance_account_as_used;
use crate::functions::purchase_reward_with_intermediary_token;



pub fn initialize(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  _instruction_data: &[u8]
) -> ProgramResult {
  msg!("Initialize!");

  let account_iter = &mut accounts.iter();

  let creator = next_account_info(account_iter)?;
  let intermediary_token_mint = next_account_info(account_iter)?;
  let system_program = next_account_info(account_iter)?;
  let token_program = next_account_info(account_iter)?;

  create_intermerdiary_token_mint(
    &program_id,
    &creator,
    &intermediary_token_mint,
    &system_program,
    &token_program,
  )?;

  Ok(())
}



pub fn exchange(
  _program_id: &Pubkey,
  accounts: &[AccountInfo],
  _instruction_data: &[u8]
) -> ProgramResult {
  msg!("Exchange!");

  let account_iter = &mut accounts.iter();

  let receiver = next_account_info(account_iter)?;
  let nft_mint = next_account_info(account_iter)?;
  let nft_ata = next_account_info(account_iter)?;
  let nft_metadata = next_account_info(account_iter)?;
  // let nft_allowance = next_account_info(account_iter)?;

  // let intermediary_token_ata = next_account_info(account_iter)?;

  verify_receiver_is_signer(&receiver)?; // DONE
  verify_nft_ata_belongs_to_mint(&nft_ata, &nft_mint)?; // DONE!
  verify_nft_ata_belongs_to_receiver(&nft_ata, &receiver)?; // DONE
  verify_nft_ata_balance_is_not_zero(&nft_ata)?; // DONE
  verify_nft_metadata_belongs_to_mint(&nft_metadata, &nft_mint)?; // DONE!
  verify_nft_metadata_update_authority_matches(&nft_metadata)?; // DONE
  // verify_nft_allowance_account_is_owned(&program_id, &nft_allowance)?;
  // verify_nft_allowance_account_is_valid(&program_id, &nft_mint, &nft_allowance)?; // DONE
  // verify_nft_allowance_account_is_not_used(&nft_allowance)?; // DOING

  update_nft_allowance_account_as_used()?;
  mint_intermediary_token()?;
  purchase_reward_with_intermediary_token()?;

  Ok(())

}
