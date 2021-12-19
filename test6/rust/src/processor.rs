use solana_program::msg;
use solana_program::account_info::next_account_info;
use solana_program::entrypoint::ProgramResult;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;

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
  _program_id: &Pubkey,
  _accounts: &[AccountInfo],
  _instruction_data: &[u8]
) -> ProgramResult {
  msg!("Initialize!");
  Ok(())
}



pub fn exchange(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  _instruction_data: &[u8]
) -> ProgramResult {
  msg!("Exchange!");

  let account_iter = &mut accounts.iter();

  let receiver = next_account_info(account_iter)?;
  let nft_mint = next_account_info(account_iter)?;
  let nft_ata = next_account_info(account_iter)?;
  let nft_metadata = next_account_info(account_iter)?;
  let _nft_allowance = next_account_info(account_iter)?;
  let intermediary_token_mint = next_account_info(account_iter)?;
  let intermediary_token_mint_authority = next_account_info(account_iter)?;
  let intermediary_token_ata = next_account_info(account_iter)?;
  let token_program = next_account_info(account_iter)?;

  let candy_machine_program = next_account_info(account_iter)?;
  let reward_candy_machine_config = next_account_info(account_iter)?;
  let reward_candy_machine = next_account_info(account_iter)?;
  let reward_candy_machine_treasury = next_account_info(account_iter)?;
  let reward_metadata = next_account_info(account_iter)?;
  let reward_mint = next_account_info(account_iter)?;
  let reward_master_edition = next_account_info(account_iter)?;
  let token_metadata_program = next_account_info(account_iter)?;
  let system_program = next_account_info(account_iter)?;
  let rent = next_account_info(account_iter)?;
  let clock = next_account_info(account_iter)?;

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

  mint_intermediary_token(
    &intermediary_token_mint,
    &intermediary_token_mint_authority,
    &intermediary_token_ata,
    &token_program,
    &program_id,
  )?;

  purchase_reward_with_intermediary_token(
    &candy_machine_program,
    &reward_candy_machine_config,
    &reward_candy_machine,
    &receiver,
    &reward_candy_machine_treasury,
    &reward_metadata,
    &reward_mint,
    &reward_master_edition,
    &token_metadata_program,
    &token_program,
    &system_program,
    &rent,
    &clock,
    &intermediary_token_ata,
  )?;

  Ok(())

}
