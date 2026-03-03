#![no_std]

use soroban_sdk::{
    contract, contractevent, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
    String, Symbol,
};

mod xlm;

const ADMIN_KEY: &Symbol = &symbol_short!("ADMIN");
const TREASURY_KEY: &Symbol = &symbol_short!("TREAS");
const FEE_BPS_KEY: &Symbol = &symbol_short!("FEE");
const NEXT_PROJECT_ID_KEY: &Symbol = &symbol_short!("NPROJ");
const NEXT_DONATION_ID_KEY: &Symbol = &symbol_short!("NDON");
const NEXT_NFT_ID_KEY: &Symbol = &symbol_short!("NNFT");

#[derive(Clone)]
#[contracttype]
pub struct Project {
    pub id: u64,
    pub ngo_wallet: Address,
    pub tax_category: u32,
    pub target_stroops: i128,
    pub collected_stroops: i128,
    pub active: bool,
    pub metadata_uri: String,
}

#[derive(Clone)]
#[contracttype]
pub struct Donation {
    pub id: u64,
    pub project_id: u64,
    pub donor: Address,
    pub donor_type: u32, // 1=PF, 2=PJ
    pub donor_doc_hash: BytesN<32>,
    pub amount_stroops: i128,
    pub fee_stroops: i128,
    pub project_stroops: i128,
    pub nft_id: u64,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct ImpactNft {
    pub id: u64,
    pub owner: Address,
    pub project_id: u64,
    pub donation_id: u64,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Project(u64),
    Donation(u64),
    Nft(u64),
}

#[contractevent]
#[derive(Clone)]
pub struct DonationEvent {
    #[topic]
    pub donor: Address,
    pub donation_id: u64,
    pub nft_id: u64,
}

#[contract]
pub struct CrowdfundingCore;

#[contractimpl]
impl CrowdfundingCore {
    pub fn __constructor(env: &Env, admin: Address, treasury: Address, fee_bps: u32) {
        admin.require_auth();
        if fee_bps > 10_000 {
            panic!("invalid fee_bps");
        }

        xlm::register(env, &admin);
        env.storage().instance().set(ADMIN_KEY, &admin);
        env.storage().instance().set(TREASURY_KEY, &treasury);
        env.storage().instance().set(FEE_BPS_KEY, &fee_bps);
        env.storage().instance().set(NEXT_PROJECT_ID_KEY, &1u64);
        env.storage().instance().set(NEXT_DONATION_ID_KEY, &1u64);
        env.storage().instance().set(NEXT_NFT_ID_KEY, &1u64);
    }

    pub fn create_project(
        env: &Env,
        ngo_wallet: Address,
        tax_category: u32,
        target_stroops: i128,
        metadata_uri: String,
    ) -> u64 {
        Self::require_admin(env);
        if target_stroops <= 0 {
            panic!("invalid target");
        }

        let id = Self::next_u64(env, NEXT_PROJECT_ID_KEY);
        let project = Project {
            id,
            ngo_wallet,
            tax_category,
            target_stroops,
            collected_stroops: 0,
            active: true,
            metadata_uri,
        };
        env.storage().persistent().set(&DataKey::Project(id), &project);
        id
    }

    pub fn set_project_status(env: &Env, project_id: u64, active: bool) {
        Self::require_admin(env);
        let mut project = Self::get_project(env, project_id);
        project.active = active;
        env.storage()
            .persistent()
            .set(&DataKey::Project(project_id), &project);
    }

    pub fn admin_set_fee_bps(env: &Env, fee_bps: u32) {
        Self::require_admin(env);
        if fee_bps > 10_000 {
            panic!("invalid fee_bps");
        }
        env.storage().instance().set(FEE_BPS_KEY, &fee_bps);
    }

    pub fn admin_set_treasury(env: &Env, treasury: Address) {
        Self::require_admin(env);
        env.storage().instance().set(TREASURY_KEY, &treasury);
    }

    pub fn admin_fund_account(env: &Env, to: Address, amount_stroops: i128) {
        Self::require_admin(env);
        if amount_stroops <= 0 {
            panic!("invalid amount");
        }
        let admin: Address = env.storage().instance().get(ADMIN_KEY).unwrap();
        xlm::token_client(env).transfer(&admin, &to, &amount_stroops);
    }

    pub fn donate(
        env: &Env,
        donor: Address,
        project_id: u64,
        donor_type: u32,
        donor_doc_hash: BytesN<32>,
        amount_stroops: i128,
    ) -> (u64, u64) {
        if donor_type != 1 && donor_type != 2 {
            panic!("invalid donor_type");
        }
        if amount_stroops <= 0 {
            panic!("invalid amount");
        }
        donor.require_auth();

        let mut project = Self::get_project(env, project_id);
        if !project.active {
            panic!("inactive project");
        }

        let fee_bps: u32 = env.storage().instance().get(FEE_BPS_KEY).unwrap();
        let treasury: Address = env.storage().instance().get(TREASURY_KEY).unwrap();

        let fee_stroops: i128 = amount_stroops * (fee_bps as i128) / 10_000;
        let project_stroops: i128 = amount_stroops - fee_stroops;
        let token = xlm::token_client(env);
        token.transfer(&donor, &treasury, &fee_stroops);
        token.transfer(&donor, &project.ngo_wallet, &project_stroops);

        let donation_id = Self::next_u64(env, NEXT_DONATION_ID_KEY);
        let nft_id = Self::next_u64(env, NEXT_NFT_ID_KEY);
        let timestamp = env.ledger().timestamp();

        project.collected_stroops += project_stroops;
        env.storage()
            .persistent()
            .set(&DataKey::Project(project_id), &project);

        let donation = Donation {
            id: donation_id,
            project_id,
            donor: donor.clone(),
            donor_type,
            donor_doc_hash,
            amount_stroops,
            fee_stroops,
            project_stroops,
            nft_id,
            timestamp,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Donation(donation_id), &donation);

        let nft = ImpactNft {
            id: nft_id,
            owner: donor.clone(),
            project_id,
            donation_id,
            timestamp,
        };
        env.storage().persistent().set(&DataKey::Nft(nft_id), &nft);

        DonationEvent {
            donor,
            donation_id,
            nft_id,
        }
        .publish(env);
        (donation_id, nft_id)
    }

    pub fn get_project(env: &Env, project_id: u64) -> Project {
        env.storage()
            .persistent()
            .get::<_, Project>(&DataKey::Project(project_id))
            .expect("project not found")
    }

    pub fn get_donation(env: &Env, donation_id: u64) -> Donation {
        env.storage()
            .persistent()
            .get::<_, Donation>(&DataKey::Donation(donation_id))
            .expect("donation not found")
    }

    pub fn get_nft(env: &Env, nft_id: u64) -> ImpactNft {
        env.storage()
            .persistent()
            .get::<_, ImpactNft>(&DataKey::Nft(nft_id))
            .expect("nft not found")
    }

    pub fn admin(env: &Env) -> Address {
        env.storage().instance().get(ADMIN_KEY).unwrap()
    }

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(ADMIN_KEY).unwrap();
        admin.require_auth();
    }

    fn next_u64(env: &Env, key: &Symbol) -> u64 {
        let current: u64 = env.storage().instance().get(key).unwrap();
        env.storage().instance().set(key, &(current + 1));
        current
    }
}

mod test;
