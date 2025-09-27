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

## Prerequisites

-   Node.js 18+
-   The FT contract must be compiled to WASM at `ft/target/near/fungible_token.wasm`.

## Purpose

This script serves as a reliable setup tool for local integration testing. It ensures a consistent environment for testing the `token-claim-service` API against a live, local blockchain instance without relying on public testnet infrastructure.