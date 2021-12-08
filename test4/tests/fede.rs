#[cfg(test)]
mod tests {
  // use solana_program::pubkey::Pubkey;
  // use std::str::FromStr;

  // struct PruebaStruct;

  #[derive(Debug)]
  enum IpAddr {
    V4(String),
    V6(String),
  }

  #[test]
  fn test_fede() {
    let p1 = IpAddr::V4(String::from("hola"));
    let p2 = IpAddr::V6(String::from("hola"));
    println!("plip {:?}", p1);
    dbg!("plop {}", p2);
  }
}
