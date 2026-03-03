#[cfg(test)]
mod xlm {
    use super::*;
    const XLM_KEY: &soroban_sdk::Symbol = &soroban_sdk::symbol_short!("XLM");

    pub fn contract_id(env: &soroban_sdk::Env) -> soroban_sdk::Address {
        env.storage()
            .instance()
            .get::<_, soroban_sdk::Address>(XLM_KEY)
            .expect("XLM contract not initialized.")
    }

    pub fn register(
        env: &soroban_sdk::Env,
        admin: &soroban_sdk::Address,
    ) -> soroban_sdk::testutils::StellarAssetContract {
        let sac = env.register_stellar_asset_contract_v2(admin.clone());
        env.storage().instance().set(XLM_KEY, &sac.address());
        stellar_asset_client(env).mint(admin, &to_stroops(100_000));
        sac
    }

    pub fn stellar_asset_client<'a>(
        env: &soroban_sdk::Env,
    ) -> soroban_sdk::token::StellarAssetClient<'a> {
        soroban_sdk::token::StellarAssetClient::new(env, &contract_id(env))
    }

    pub fn token_client<'a>(env: &soroban_sdk::Env) -> soroban_sdk::token::TokenClient<'a> {
        soroban_sdk::token::TokenClient::new(env, &contract_id(env))
    }
}

#[cfg(test)]
const ONE_XLM: i128 = 10_000_000;
#[cfg(not(test))]
const XLM_KEY: &soroban_sdk::Symbol = &soroban_sdk::symbol_short!("XLM");

#[cfg(test)]
pub const fn to_stroops(num: u64) -> i128 {
    (num as i128) * ONE_XLM
}

#[cfg(not(test))]
pub const SERIALIZED_ASSET: [u8; 4] = [0, 0, 0, 0];

#[cfg(not(test))]
pub fn register(env: &soroban_sdk::Env, _admin: &soroban_sdk::Address) {
    if env
        .storage()
        .instance()
        .has(XLM_KEY)
    {
        return;
    }

    let contract_id = env
        .deployer()
        .with_stellar_asset(SERIALIZED_ASSET)
        .deployed_address();
    env.storage().instance().set(XLM_KEY, &contract_id);
}

#[cfg(not(test))]
pub fn contract_id(env: &soroban_sdk::Env) -> soroban_sdk::Address {
    env.storage()
        .instance()
        .get::<_, soroban_sdk::Address>(XLM_KEY)
        .expect("XLM contract not initialized.")
}

#[cfg(not(test))]
pub fn token_client<'a>(env: &soroban_sdk::Env) -> soroban_sdk::token::TokenClient<'a> {
    soroban_sdk::token::TokenClient::new(env, &contract_id(env))
}

#[cfg(test)]
pub use xlm::*;
