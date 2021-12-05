use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum EscrowError {
  #[error("Invalid instruction")]
  InvalidInstruction,

  #[error("Invalid instruction")]
  NoRentExempt,
}

impl From<EscrowError> for ProgramError {
  fn from(e: EscrowError) -> ProgramError {
    return ProgramError::Custom(e as u32);
  }
}
