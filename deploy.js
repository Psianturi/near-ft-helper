const { Worker } = require('near-workspaces');
const fs = require('fs');

async function main() {
  console.log('--- Starting End-to-End Test ---');

  // 1. Initialize Sandbox
  // Worker.init() starts a new sandbox instance and cleans it up after the script finishes.
  const worker = await Worker.init();
  console.log('✅ Sandbox started');

  // 2. Create Accounts
  // Using root account from the worker to create sub-accounts.
  const root = worker.rootAccount;
  const ftContractAccount = await root.createSubAccount('ft');
  const masterAccount = root; // Use root as master
  const userAccount = await root.createSubAccount('user');

  console.log(`\n--- Accounts Created ---`);
  console.log(`  Contract: ${ftContractAccount.accountId}`);
  console.log(`  Master (token owner): ${masterAccount.accountId}`);
  console.log(`  User (receiver): ${userAccount.accountId}`);

  // Log private keys
  console.log(`\n--- Private Keys ---`);
  try {
    console.log(`Root key: ${root.signer.keyPair.secretKey}`);
  } catch (e) {
    console.log(`Root key: undefined`);
  }
  try {
    console.log(`Master key: ${masterAccount.signer.keyPair.secretKey}`);
  } catch (e) {
    console.log(`Master key: undefined`);
  }
  try {
    console.log(`User key: ${userAccount.signer.keyPair.secretKey}`);
  } catch (e) {
    console.log(`User key: undefined`);
  }

  // Try to get from keyStore
  try {
    const rootKey = await worker.manager.keyStore.getKey('sandbox', root.accountId);
    console.log(`Root key from keystore: ${rootKey.secretKey}`);
  } catch (e) {
    console.log(`Root key from keystore: error ${e.message}`);
  }
  try {
    const masterKey = await worker.manager.keyStore.getKey('sandbox', masterAccount.accountId);
    console.log(`Master key from keystore: ${masterKey.secretKey}`);
  } catch (e) {
    console.log(`Master key from keystore: error ${e.message}`);
  }

  // 3. Deploy Contract
  const wasm = fs.readFileSync('/mnt/d/POSMPROJECT/BLOCKCHAIN/NEAR/NEARN-FT/ft/target/near/fungible_token.wasm');
  await ftContractAccount.deploy(wasm);
  console.log('\n✅ FT contract deployed');

  // 4. Initialize Contract
  // The total supply will be minted to `owner_id`.
  console.log('\n--- Initializing Contract & Minting Tokens ---');
  await ftContractAccount.call(
    ftContractAccount.accountId,
    'new_default_meta',
    {
      owner_id: masterAccount.accountId,
      total_supply: '1000000000000000000000000', // 1,000,000 with 18 decimals for example
    }
  );
  console.log(`✅ Contract initialized. Tokens minted to ${masterAccount.accountId}.`);

  // 5. Verify Initial Balance of Master Account
  let masterBalance = await ftContractAccount.view('ft_balance_of', { account_id: masterAccount.accountId });
  console.log(`  Initial balance of ${masterAccount.accountId}: ${masterBalance}`);

  // 6. Register User for FT Storage
  // This must be called by an account with NEAR to pay for storage. `masterAccount` has funds by default.
  // We attach a deposit to cover the storage cost.
  console.log('\n--- Registering User for Storage ---');
  await masterAccount.call(
    ftContractAccount.accountId,
    'storage_deposit',
    { account_id: userAccount.accountId, registration_only: true },
    { attachedDeposit: '1250000000000000000000' } // 0.00125 NEAR
  );
  console.log(`✅ User ${userAccount.accountId} is registered for FT storage.`);

  // 7. Transfer FT from Master to User
  // This is the core test. It must be called by the token owner (`masterAccount`).
  console.log('\n--- Performing FT Transfer ---');
  const transferAmount = '500000000000000000000'; // 500 tokens
  await masterAccount.call(
    ftContractAccount.accountId,
    'ft_transfer',
    {
      receiver_id: userAccount.accountId,
      amount: transferAmount,
      memo: 'Test transfer from deploy script'
    },
    { attachedDeposit: '1' } // Attach 1 yoctoNEAR as required by the standard
  );
  console.log(`✅ Transferred ${transferAmount} tokens from ${masterAccount.accountId} to ${userAccount.accountId}.`);

  // 8. Verify Final Balances
  masterBalance = await ftContractAccount.view('ft_balance_of', { account_id: masterAccount.accountId });
  let userBalance = await ftContractAccount.view('ft_balance_of', { account_id: userAccount.accountId });
  console.log('\n--- Final Balances ---');
  console.log(`  Balance of ${masterAccount.accountId}: ${masterBalance}`);
  console.log(`  Balance of ${userAccount.accountId}: ${userBalance}`);

  if (userBalance === transferAmount) {
    console.log('\n✅✅✅ End-to-End Test Successful! ✅✅✅');
  } else {
    console.log('\n❌❌❌ End-to-End Test Failed! ❌❌❌');
  }

  // Keep the sandbox running for benchmarking
  console.log('\n🔄 Sandbox is now running and ready for benchmarking...');
  console.log('📡 RPC endpoint: http://localhost:3030');
  console.log('⏹️  Press Ctrl+C to stop the sandbox');

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down sandbox...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down sandbox...');
    process.exit(0);
  });

  // Keep alive indefinitely
  await new Promise(() => {}); // Never resolves
}

main().catch(console.error);
