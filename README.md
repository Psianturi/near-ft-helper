# NEAR FT Helper (`near-ft-helper`)

**Repository**: https://github.com/Psianturi/near-ft-helper
**Status**: ✅ Production Ready - Automated sandbox deployment and testing
---

## 🧩 What is this?

This folder is **not a standalone application**. It is a **helper environment** designed to simulate a local NEAR blockchain for testing the `token-claim-service`.

It contains a single script (`deploy.js`) that automates the entire setup for a local sandbox environment:
1.  **Starts a Sandbox**: Runs a fresh, isolated `near-sandbox` instance.
2.  **Creates Accounts**: Generates predefined accounts (`master.test.near`, `ft.test.near`, `user.test.near`).
3.  **Deploys & Initializes**: Deploys the Fungible Token contract and mints the total supply.
4.  **Transfers Tokens**: Automatically performs initial token transfers for testing readiness.
5.  **Runs E2E Tests**: Verifies that the entire setup works as expected.

> 💡 **Analogy:**  
> If `token-claim-service` is an ATM, this folder is the local bank simulator that provides dummy accounts and play money (tokens) to test the ATM.

## 📋 Prerequisites

### 🏗️ **FT Contract Source Code**

This helper requires the **NEAR Fungible Token (FT) contract** source code to compile and deploy. The FT contract is the smart contract that implements the NEP-141 standard for fungible tokens on NEAR.

#### **Where to Get the FT Contract:**
**Repository**: https://github.com/near-examples/FT  
**Purpose**: Official NEAR example implementation of NEP-141 Fungible Token standard  
**Language**: Rust with NEAR SDK  
**Standard**: NEP-141 (NEAR Enhancement Proposal 141)

#### **What the FT Contract Does:**
- ✅ **Token Creation**: Mint new tokens with specified total supply
- ✅ **Token Transfer**: Transfer tokens between accounts (NEP-141 `ft_transfer`)
- ✅ **Storage Management**: Handle storage deposits for token holders (NEP-145)
- ✅ **Balance Queries**: Check account balances (`ft_balance_of`)
- ✅ **Metadata**: Provide token information (name, symbol, decimals, etc.)
- ✅ **Standards Compliance**: Full NEP-141 and NEP-145 compliance

#### **Why This Specific Contract:**
- **Official Example**: Maintained by NEAR team, well-tested
- **Standards Compliant**: Implements latest NEP-141/145 standards
- **Battle-Tested**: Used in production applications
- **Well-Documented**: Clear code structure and comments

### Directory Structure
This helper expects the following directory structure:
```
parent-directory/
├── ft/                    # FT contract source code (from near-examples/FT)
│   ├── Cargo.toml         # Rust project configuration
│   ├── src/lib.rs         # Smart contract implementation
│   └── target/wasm32-unknown-unknown/release/fungible_token.wasm  # Compiled contract
├── ft-claiming-service/   # API service (optional for deployment)
└── near-ft-helper/        # This helper repository
```

### Setup Steps
1. **Clone FT Contract Repository**:
   ```bash
   # Clone the official NEAR FT example
   git clone https://github.com/near-examples/FT.git ft

   # Navigate to contract directory
   cd ft

   # Compile to WebAssembly for NEAR blockchain
   cargo build --target wasm32-unknown-unknown --release

   # Return to parent directory
   cd ..
   ```

2. **Clone This Helper Repository**:
   ```bash
   git clone https://github.com/Psianturi/near-ft-helper.git
   cd near-ft-helper
   npm install
   ```

### System Requirements
- **Node.js**: 18+ (for deployment scripts)
- **Rust**: Latest stable (for contract compilation)
- **Cargo**: Rust package manager
- **WASM Target**: `wasm32-unknown-unknown` (installed via rustup)
- **NEAR CLI**: Optional, for manual testing

## 🚀 How to Use for Sandbox Testing

*   Clone this repository:
   ```bash
   git clone https://github.com/Psianturi/near-ft-helper.git
   cd near-ft-helper

### Step 1: Run `deploy.js`

From within the `near-ft-helper` directory, run:

```bash
# Installs dependencies like near-workspaces-js
npm install

# Starts the sandbox and deploys the contract
node deploy.js
```

This command will start the sandbox, deploy the contract, and then wait. **Do not close this terminal**. It needs to keep running to provide the blockchain environment for the API service.

### Step 2: Run the API Service

Once `deploy.js` is running, open a **new terminal** and navigate to the `token-claim-service` directory to start the server.

See the `token-claim-service/README.md` for full instructions.

## Purpose

This script serves as a reliable setup tool for local integration testing. It ensures a consistent environment for testing the `token-claim-service` API against a live, local blockchain instance without relying on public testnet infrastructure.