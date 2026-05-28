# Reference Contracts Archive

This directory contains example Stellar smart contracts that have been archived for reference purposes. These contracts are **excluded from the build** to prevent compilation errors and keep the development environment clean.

## Why These Contracts Are Archived

These are OpenZeppelin example contracts that were experiencing build issues:

1. **fungible-allowlist** - ❌ Has compilation errors due to incorrect macro syntax
2. **nft-enumerable** - ⚠️ Not producing release WASM artifacts

The main working contract (`guess-the-number`) remains in the `contracts/` directory and builds successfully.

## Archived Contracts

### 1. fungible-allowlist

**Purpose:** Demonstrates a fungible token with role-based access control and allowlist functionality.

**Status:** Contains compilation errors that need fixing before it can be built.

**Key Features:**

- Implements `FungibleToken` trait
- Uses `AccessControl` for role-based permissions
- Supports burnable tokens via `FungibleBurnable`
- Demonstrates OpenZeppelin stellar-contracts patterns

**Known Issues:**
The contract has incorrect macro usage that causes compilation failures:

1. **Missing `#[default_impl]` macros** - Lines 47, 68, 71
2. **Wrong parameter order** - Line 37 in `grant_role_no_auth()` call
3. **Unused imports** - Line 9 has unnecessary imports

### 2. nft-enumerable

**Purpose:** Demonstrates an enumerable NFT collection with metadata and ownership tracking.

**Status:** Builds without errors but doesn't produce release WASM artifacts.

**Key Features:**

- Implements enumerable NFT functionality
- Supports metadata storage
- Tracks token ownership
- Example of NFT patterns on Stellar

## How to Fix and Re-enable Archived Contracts

If you want to fix and use these contracts again, follow these steps:

### Fixing fungible-allowlist

Edit `contracts-reference/fungible-allowlist/src/contract.rs`:

**1. Add `#[default_impl]` before trait implementations:**

```rust
// Line 47 - Before FungibleToken implementation
#[default_impl]
#[contractimpl]
impl FungibleToken for ExampleContract {
    // ... implementation
}

// Line 68 - Before AccessControl implementation
#[default_impl]
#[contractimpl]
impl AccessControl for ExampleContract {}

// Line 71 - Before FungibleBurnable implementation
#[default_impl]
#[contractimpl]
impl FungibleBurnable for ExampleContract {}
```

**2. Fix parameter order in grant_role_no_auth (Line 37):**

```rust
// BEFORE (incorrect):
access_control::grant_role_no_auth(e, &manager, &admin, &symbol_short!("manager"));

// AFTER (correct):
access_control::grant_role_no_auth(e, &admin, &manager, &symbol_short!("manager"));
```

**3. Remove unused imports (Line 9):**

```rust
// BEFORE:
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, MuxedAddress, Symbol, Vec};

// AFTER:
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String};
```

### Re-enabling Contracts in the Build

Once fixed, to re-enable these contracts:

1. **Move contract back to active directory:**

   ```bash
   mv contracts-reference/[contract-name] contracts/
   ```

2. **Add to environments.toml** (if you want client generation):

   ```toml
   [development.contracts]
   fungible_allowlist_example = {
     client = true,
     constructor_args = "--admin me --manager me --initial_supply 1000000000000000000000000"
   }
   nft_enumerable_example = {
     client = true,
     constructor_args = "--owner me"
   }
   ```

3. **Clean and rebuild:**
   ```bash
   cargo clean
   npm start
   ```

## Technical Context

### Build System

The project uses a Cargo workspace defined in the root `Cargo.toml`:

```toml
[workspace]
members = ["contracts/*"]
```

This wildcard pattern means:

- All contracts in `contracts/` are automatically built
- Contracts outside `contracts/` are excluded
- No workspace configuration changes needed to archive/restore

### OpenZeppelin Stellar Contracts

These examples are based on OpenZeppelin stellar-contracts v0.5.1, which provides:

- Reusable trait implementations for common token standards
- Access control patterns
- Security best practices for Stellar smart contracts

The macro syntax issues stem from version-specific requirements where:

- `#[default_impl]` must precede `#[contractimpl]` for trait implementations
- The old `#[contractimpl(contracttrait)]` syntax is no longer supported

## Development Workflow

### Adding New Contracts

To add a new contract to the active workspace:

1. Create it in `contracts/` directory
2. The Cargo workspace will auto-detect it
3. Add configuration to `environments.toml` if you want client generation
4. Run `npm start` to build and deploy

### Archiving Future Contracts

To archive additional contracts:

1. Move to `contracts-reference/`
2. Remove from `environments.toml`
3. Document in this README
4. Run `cargo clean` to clear old artifacts

## Additional Resources

- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/stellar-contracts)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Smart Contracts Guide](https://developers.stellar.org/docs/smart-contracts)

---

**Last Updated:** March 2, 2026
**Reason for Archive:** Build system cleanup - preserving examples while maintaining clean development environment
