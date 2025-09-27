const { connect, keyStores, KeyPair } = require('near-api-js');
const fs = require('fs');
require('dotenv').config({ path: '../ft-claiming-service/.env.testnet' });

async function main() {
  console.log('--- Starting Testnet Deployment ---');

  // Configuration
  const networkId = 'testnet';
  const nodeUrl = 'https://rpc.testnet.fastnear.com';
  const masterAccountId = process.env.MASTER_ACCOUNT || 'your-testnet-account.testnet';
  const privateKey = process.env.MASTER_ACCOUNT_PRIVATE_KEY || 'your-private-key-here';

  if (masterAccountId === 'your-testnet-account.testnet' || privateKey === 'your-private-key-here') {
    console.error('❌ Please set MASTER_ACCOUNT and MASTER_ACCOUNT_PRIVATE_KEY in .env');
    console.log('Example:');
    console.log('MASTER_ACCOUNT=your-account.testnet');
    console.log('MASTER_ACCOUNT_PRIVATE_KEY=ed25519:...');
    process.exit(1);
  }

  // Setup connection
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(privateKey);
  await keyStore.setKey(networkId, masterAccountId, keyPair);

  const near = await connect({
    networkId,
    nodeUrl,
    keyStore,
    walletUrl: 'https://wallet.testnet.near.org/',
    helperUrl: 'https://helper.testnet.near.org',
  });

  const masterAccount = await near.account(masterAccountId);
  console.log(`✅ Connected to testnet as ${masterAccountId}`);

  // Check balance
  const balance = await masterAccount.getAccountBalance();
  console.log(`💰 Account balance: ${balance.available} yoctoNEAR`);

  // Deploy FT contract - use master account directly for simplicity
  const ftContractAccountId = masterAccountId; 
  console.log(`🎯 Using master account as FT contract: ${ftContractAccountId}`);

  const ftAccount = masterAccount;
  
  const wasmPath = '../ft/target/wasm32-unknown-unknown/release/fungible_token.wasm';

  // Check if WASM file exists
  if (!fs.existsSync(wasmPath)) {
    console.error('❌ WASM file not found!');
    console.error(`Expected path: ${wasmPath}`);
    console.error('');
    console.error('Please ensure:');
    console.error('1. The FT contract repository is cloned at: ../ft');
    console.error('2. The contract is compiled: cd ../ft && cargo build --target wasm32-unknown-unknown --release');
    console.error('3. The WASM file exists at the expected location');
    process.exit(1);
  }

  const wasm = fs.readFileSync(wasmPath);

  console.log('🚀 Deploying FT contract...');
  await ftAccount.deployContract(wasm);
  console.log('✅ FT contract deployed');

  // Initialize contract (skip if already initialized)
  console.log('🔧 Initializing contract...');
  try {
    await ftAccount.functionCall({
      contractId: ftContractAccountId,
      methodName: 'new_default_meta',
      args: {
        owner_id: masterAccountId,
        total_supply: '1000000000000000000000000', // 1,000,000 tokens
      },
      gas: '30000000000000',
    });
    console.log('✅ Contract initialized');
  } catch (error) {
    if (error.message.includes('already been initialized')) {
      console.log('ℹ️  Contract already initialized, continuing...');
    } else {
      throw error;
    }
  }

  // Create user account for testing
  const userAccountId = `user-${Date.now()}.${masterAccountId}`;
  console.log(`👤 Creating user account: ${userAccountId}`);

  try {
    await masterAccount.createAccount(
      userAccountId,
      keyPair.getPublicKey(),
      '10000000000000000000000000' // 10 NEAR
    );
    console.log('✅ User account created');
  } catch (error) {
    console.log('ℹ️  User account might already exist, continuing...');
  }

  // Register user for FT storage
  console.log('💾 Registering user for FT storage...');
  await masterAccount.functionCall({
    contractId: ftContractAccountId,
    methodName: 'storage_deposit',
    args: {
      account_id: userAccountId,
      registration_only: true,
    },
    gas: '30000000000000',
    attachedDeposit: '1250000000000000000000', // 0.00125 NEAR
  });
  console.log('✅ User registered for storage');

  // Check balance before transfer
  console.log('🔍 Checking FT balance...');
  let currentBalance;
  try {
    currentBalance = await ftAccount.viewFunction(ftContractAccountId, 'ft_balance_of', { account_id: masterAccountId });
    console.log(`💰 Master balance: ${currentBalance}`);
  } catch (error) {
    console.log('⚠️  Could not check balance, continuing...');
    currentBalance = '0';
  }

  // Test transfer only if balance is sufficient
  if (BigInt(currentBalance) >= BigInt('500000000000000000000')) {
    console.log('🔄 Testing FT transfer...');
    await masterAccount.functionCall({
      contractId: ftContractAccountId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: userAccountId,
        amount: '500000000000000000000', // 500 tokens
        memo: 'Test transfer from deploy script',
      },
      gas: '30000000000000',
      attachedDeposit: '1',
    });
    console.log('✅ Test transfer completed');
  } else {
    console.log('⚠️  Insufficient balance for test transfer, skipping...');
  }

  // Check balances
  const masterBalance = await ftAccount.viewFunction(ftContractAccountId, 'ft_balance_of', { account_id: masterAccountId });
  const userBalance = await ftAccount.viewFunction(ftContractAccountId, 'ft_balance_of', { account_id: userAccountId });

  console.log('\n--- Final Balances ---');
  console.log(`Master (${masterAccountId}): ${masterBalance}`);
  console.log(`User (${userAccountId}): ${userBalance}`);

  // Update .env with deployed contract
  const envPath = '/mnt/d/POSMPROJECT/BLOCKCHAIN/NEAR/NEARN-FT/ft-claiming-service/.env';
  let envContent = fs.readFileSync(envPath, 'utf8');

  envContent = envContent.replace(/FT_CONTRACT=.*/, `FT_CONTRACT=${ftContractAccountId}`);

  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Updated .env with FT_CONTRACT=${ftContractAccountId}`);

  console.log('\n✅✅✅ Testnet Deployment Successful! ✅✅✅');
  console.log(`📡 RPC: ${nodeUrl}`);
  console.log(`🎯 FT Contract: ${ftContractAccountId}`);
  console.log(`👤 Test User: ${userAccountId}`);
  console.log('\n🚀 You can now run the service with: npm start');
}

main().catch(console.error);