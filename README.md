# NEAR Workspaces FT E2E Test Script

This directory contains a standalone end-to-end (E2E) test script for the Fungible Token contract, using `near-workspaces-js`.

The script (`deploy.js`) handles the entire lifecycle for a sandbox test:
1.  Starts a fresh, isolated sandbox environment.
2.  Creates necessary accounts (contract, token owner, user).
3.  Deploys the FT contract WASM.
4.  Initializes the contract and mints the total supply to the owner.
5.  Registers the user account for token storage.
6.  Performs a token transfer from the owner to the user.
7.  Verifies the final balances to confirm the transfer was successful.
8.  Automatically shuts down the sandbox environment upon completion.

This approach ensures a consistent and reliable testing environment, free from the state inconsistencies that can arise from manually managed sandbox processes.

## Prerequisites
- Node.js 18+
- Dependencies installed (`npm install`)
- The FT contract must be compiled to WASM at `ft/target/near/fungible_token.wasm`.

## How to Run the Test

From within the `near-ft-workspaces` directory, simply run:

```bash
node deploy.js
```

## Expected Output

If the test is successful, you will see a series of logs detailing each step, culminating in:

```
--- Final Balances ---
  Balance of master.test.near: 999500000000000000000000
  Balance of user.test.near: 500000000000000000000

✅✅✅ End-to-End Test Successful! ✅✅✅
```

If any step fails, the script will exit with an error, and the sandbox will be automatically cleaned up.

## Purpose

This script serves as a reliable integration test. It validates that the contract compiles, deploys, and functions correctly in a simulated blockchain environment. It can be used as a foundation for more complex test suites (e.g., using `ava` or `jest`) or for CI/CD pipeline checks.