#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔍 StackScope Contract Verification');
console.log('=================================\n');

// Get contract address from user input
const contractAddress = process.argv[2];
const txid = process.argv[3];

if (!contractAddress || !txid) {
  console.error('❌ Missing arguments');
  console.log('Usage: node scripts/verify-deploy.js <CONTRACT_ADDRESS> <TXID>');
  process.exit(1);
}

console.log(`📍 Contract Address: ${contractAddress}`);
console.log(`🔗 Transaction ID: ${txid}`);
console.log(`🌐 Network: testnet`);

// Verify contract on Stacks API
function verifyContract() {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.testnet.hiro.so/v2/contracts/${contractAddress}`;
    
    https.get(apiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const contract = JSON.parse(data);
          
          console.log('\n✅ Contract Verification Results:');
          console.log('==================================');
          console.log(`📄 Contract Found: ${contract.contract_id}`);
          console.log(`👤 Deployer: ${contract.deployer}`);
          console.log(`⏰ Block Height: ${contract.block_height}`);
          console.log(`🔗 Explorer: https://explorer.stacks.co/txid/${txid}`);
          
          resolve(contract);
        } catch (error) {
          console.error('❌ Error parsing contract data:', error.message);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ API Error:', error.message);
      reject(error);
    });
  });
}

// Main verification
async function main() {
  try {
    console.log('🔍 Verifying contract deployment...');
    
    await verifyContract();
    
    console.log('\n🎉 Verification Complete!');
    console.log('============================');
    console.log('✅ Contract is deployed and verified on testnet');
    console.log('📱 You can now interact with the contract');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main();
