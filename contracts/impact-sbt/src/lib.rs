#![no_std]

use soroban_sdk::{
    contract, contractevent, contractimpl, contracttype, symbol_short, Address, Env, String,
    Symbol,
};

const ADMIN_KEY: &Symbol = &symbol_short!("ADMIN");
const NEXT_ID_KEY: &Symbol = &symbol_short!("NEXT");

#[derive(Clone)]
#[contracttype]
pub struct Sbt {
    pub id: u64,
    pub owner: Address,
    pub metadata_uri: String,
    pub minted_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Token(u64),
}

#[contractevent]
#[derive(Clone)]
pub struct MintEvent {
    #[topic]
    pub owner: Address,
    pub id: u64,
}

#[contract]
pub struct ImpactSbt;

#[contractimpl]
impl ImpactSbt {
    pub fn __constructor(env: &Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(ADMIN_KEY, &admin);
        env.storage().instance().set(NEXT_ID_KEY, &1u64);
    }

    pub fn mint(env: &Env, owner: Address, metadata_uri: String) -> u64 {
        Self::require_admin(env);
        let id = Self::next_id(env);
        let token = Sbt {
            id,
            owner: owner.clone(),
            metadata_uri,
            minted_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&DataKey::Token(id), &token);
        MintEvent { owner, id }.publish(env);
        id
    }

    // Intentionally no transfer method, making this token soulbound.
    pub fn token(env: &Env, id: u64) -> Sbt {
        env.storage()
            .persistent()
            .get::<_, Sbt>(&DataKey::Token(id))
            .expect("token not found")
    }

    pub fn owner_of(env: &Env, id: u64) -> Address {
        Self::token(env, id).owner
    }

    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(ADMIN_KEY).unwrap();
        admin.require_auth();
    }

    fn next_id(env: &Env) -> u64 {
        let id: u64 = env.storage().instance().get(NEXT_ID_KEY).unwrap();
        env.storage().instance().set(NEXT_ID_KEY, &(id + 1));
        id
    }
}

mod test;
