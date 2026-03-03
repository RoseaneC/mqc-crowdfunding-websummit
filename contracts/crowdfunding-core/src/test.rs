#![cfg(test)]
extern crate std;

use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, String};

use crate::{xlm, CrowdfundingCore, CrowdfundingCoreClient};

#[test]
fn donation_splits_and_mints() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let donor = Address::generate(&env);
    let ngo = Address::generate(&env);

    let contract_id = env.register(CrowdfundingCore, (admin.clone(), treasury, 700u32));
    let client = CrowdfundingCoreClient::new(&env, &contract_id);

    client.admin_fund_account(&donor, &xlm::to_stroops(100));

    let project_id = client.create_project(
        &ngo,
        &1u32,
        &xlm::to_stroops(1_000),
        &String::from_str(&env, "ipfs://project"),
    );

    let doc_hash = BytesN::<32>::from_array(&env, &[1; 32]);
    let (donation_id, nft_id) = client.donate(&donor, &project_id, &1u32, &doc_hash, &xlm::to_stroops(10));

    assert_eq!(donation_id, 1);
    assert_eq!(nft_id, 1);

    let donation = client.get_donation(&donation_id);
    assert_eq!(donation.amount_stroops, xlm::to_stroops(10));
    assert_eq!(donation.fee_stroops, xlm::to_stroops(10) * 700 / 10_000);

    let nft = client.get_nft(&nft_id);
    assert_eq!(nft.owner, donor);
}
