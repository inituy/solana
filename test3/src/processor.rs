use solana_program::{
  account_info::{next_account_info, AccountInfo},
  program_pack::Pack,
  program_pack::IsInitialized,
  entrypoint::ProgramResult,
  program_error::ProgramError,
  msg,
  pubkey::Pubkey,
  sysvar::{rent::Rent, Sysvar},
};


use crate::{
  state::Escrow,
  instruction::EscrowInstruction,
  error::EscrowError,
};

pub struct Processor;

impl Processor {
  pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
  ) -> ProgramResult {
    let instruction = EscrowInstruction::unpack(instruction_data)?;
    match instruction {
      EscrowInstruction::InitEscrow { amount } => {
        msg!("Instruction: InitEscrow");
        return Self::process_init_escrow(accounts, amount, program_id);
      }
    }
  }

  fn process_init_escrow(
    accounts: &[AccountInfo],
    amount: u64,
    _program_id: &Pubkey,
  ) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
      return Err(ProgramError::MissingRequiredSignature);
    }

    let temp_token_account = next_account_info(account_info_iter)?;

    let token_to_receive_account = next_account_info(account_info_iter)?;

    if *token_to_receive_account.owner != spl_token::id() {
      return Err(ProgramError::IncorrectProgramId)
    }

    let escrow_account = next_account_info(account_info_iter)?;

    let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

    if !rent.is_exempt(escrow_account.lamports(), escrow_account.data_len()) {
      return Err(EscrowError::NoRentExempt.into());
    }

    let mut escrow_info = Escrow::unpack_unchecked(&escrow_account.try_borrow_data()?)?;
    if escrow_info.is_initialized() {
      return Err(ProgramError::AccountAlreadyInitialized);
    }

    escrow_info.is_initialized = true;
    escrow_info.initializer_pubkey = *initializer.key;
    escrow_info.temp_token_account_pubkey = *temp_token_account.key;
    escrow_info.initializer_token_to_receive_account_pubkey = *token_to_receive_account.key;
    escrow_info.expected_amount = amount;

    Escrow::pack(escrow_info, &mut escrow_account.try_borrow_mut_data()?)?;

    // Continues https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/#cpis-part-1

    return Ok(());
  }
}