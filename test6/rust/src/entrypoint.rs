use solana_program::entrypoint::ProgramResult;
use solana_program::entrypoint;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;
use solana_program::program_error::ProgramError;

use crate::processor::initialize;
use crate::processor::exchange;

fn process_instruction(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  instruction_data: &[u8]
) -> ProgramResult {

  //let data: &[u8] = &[b'1'][..];
  let data: &[u8] = &instruction_data[..];

  match data {
    &[b'1'] => { return initialize(&program_id, &accounts, &instruction_data); }
    &[b'2'] => { return exchange(&program_id, &accounts, &instruction_data); }
    _ => { return Err(ProgramError::InvalidInstructionData); }
  }

}

entrypoint!(process_instruction);
