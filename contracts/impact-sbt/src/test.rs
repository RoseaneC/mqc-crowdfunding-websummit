#![cfg(test)]
extern crate std;

use soroban_sdk::{testutils::Address as _, Address, Env, String};

use crate::{ImpactSbt, ImpactSbtClient};

#[test]
fn mints_and_reads_soulbound_token() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let contract_id = env.register(ImpactSbt, (admin.clone(),));
    let client = ImpactSbtClient::new(&env, &contract_id);

    let id = client.mint(&owner, &String::from_str(&env, "ipfs://impact/1"));
    assert_eq!(id, 1);
    assert_eq!(client.owner_of(&id), owner);
}
