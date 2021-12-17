use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::entrypoint;
use solana_program::msg;
use solana_program::account_info::AccountInfo;
use solana_program::account_info::next_account_info;
use solana_program::entrypoint::ProgramResult;
use solana_program::pubkey::Pubkey;
use solana_program::program_error::ProgramError;
use solana_program::program_pack::Pack;
use spl_token::state::Account as SplTokenAccount;
use spl_token_metadata::state::Metadata;
// use borsh::de::BorshDeserialize;
// use spl_associated_token_account::get_associated_token_address;
// use solana_program::program::invoke_signed;
// use spl_token_metadata::instruction::update_metadata_accounts;
// use spl_token_metadata::ID as SPL_TOKEN_METADATA_PROGRAM_ID;
// use std::io::Error;



#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NftAllowanceAccount {
  used: bool
}



fn verify_nft_ata_belongs_to_mint(
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



fn verify_nft_metadata_update_authority_matches(
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



fn verify_nft_metadata_belongs_to_mint(
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



fn verify_nft_ata_belongs_to_receiver(
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



fn verify_nft_ata_balance_is_not_zero(
  nft_ata: &AccountInfo,
) -> Result<u8, ProgramError> {
  let ata = SplTokenAccount::unpack_unchecked(&nft_ata.data.borrow())?;
  if ata.amount == 0 {
    msg!("NFT associated token account balance is 0");
    return Err(ProgramError::Custom(1));
  }
  Ok(1)
}



fn verify_nft_allowance_account_is_valid(
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



fn verify_nft_allowance_account_is_not_used(
  nft_allowance: &AccountInfo,
) -> Result<u8, ProgramError> {
  let data = nft_allowance.try_borrow_mut_data()?;
  let unpacked: NftAllowanceAccount = NftAllowanceAccount::try_from_slice(&data)?;
  msg!("{:?}", unpacked);
  Ok(1)
}

 

fn update_nft_allowance_account_as_used(
) -> Result<u8, ProgramError> {
  Ok(1)
}



fn mint_intermediary_token_ata_belongs_to_mint(
) -> Result<u8, ProgramError> {
  Ok(1)
}



fn purchase_reward_with_intermediary_token(
) -> Result<u8, ProgramError> {
  Ok(1)
}



fn verify_receiver_is_signer(
  receiver: &AccountInfo,
) -> Result<u8, ProgramError> {
  if !receiver.is_signer { return Err(ProgramError::Custom(1)); }
  Ok(1)
}



fn process_instruction(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  _instruction_data: &[u8]
) -> ProgramResult {

  let account_iter = &mut accounts.iter();

  let receiver = next_account_info(account_iter)?;
  let nft_mint = next_account_info(account_iter)?;
  let nft_ata = next_account_info(account_iter)?;
  let nft_metadata = next_account_info(account_iter)?;
  let nft_allowance = next_account_info(account_iter)?;
  // let intermediary_token_ata = next_account_info(account_iter)?;

  verify_receiver_is_signer(&receiver)?; // DONE
  verify_nft_ata_belongs_to_mint(&nft_ata, &nft_mint)?; // DONE!
  verify_nft_ata_belongs_to_receiver(&nft_ata, &receiver)?; // DONE
  verify_nft_ata_balance_is_not_zero(&nft_ata)?; // DONE
  verify_nft_metadata_update_authority_matches(&nft_metadata)?; // DONE
  verify_nft_metadata_belongs_to_mint(&nft_metadata, &nft_mint)?; // DONE!
  // verify_nft_allowance_account_is_owned(&program_id, &nft_allowance);
  verify_nft_allowance_account_is_valid(&program_id, &nft_mint, &nft_allowance)?; // DONE
  verify_nft_allowance_account_is_not_used(&nft_allowance)?; // DOING

  update_nft_allowance_account_as_used()?;
  mint_intermediary_token_ata_belongs_to_mint()?;
  purchase_reward_with_intermediary_token()?;

  Ok(())
}

entrypoint!(process_instruction);
