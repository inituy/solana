use solana_program::entrypoint;
use solana_program::entrypoint::ProgramResult;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], _instruction_data: &[u8]) -> ProgramResult {
  return Ok(());
}

entrypoint!(process_instruction);
