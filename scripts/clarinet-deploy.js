#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 StackScope Clarinet Deployment');
console.log('================================\n');

class ClarinetDeployer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.envPath = path.join(this.projectRoot, '.env.local');
    this.contractPath = path.join(this.projectRoot, 'contracts', 'stackscope-notes.clar');
  }

  // Check if Clarinet is installed
  checkClarinet() {
    console.log('🔧 Checking Clarinet installation...');
    
    try {
      const result = execSync('clarinet --version', { encoding: 'utf8' });
      console.log('✅ Clarinet found:', result.trim());
      return true;
    } catch (error) {
      console.log('❌ Clarinet not found');
      console.log('💡 Install Clarinet with: npm install -g @hirosystems/clarinet');
      console.log('🌐 Or download from: https://github.com/hirosystems/clarinet/releases');
      return false;
    }
  }

  // Initialize Clarinet project if needed
  initClarinet() {
    console.log('📋 Initializing Clarinet project...');
    
    try {
      // Check if Clarinet.toml exists
      const clarinetTomlPath = path.join(this.projectRoot, 'Clarinet.toml');
      if (!fs.existsSync(clarinetTomlPath)) {
        console.log('🆕 Creating new Clarinet project...');
        execSync('clarinet new stackscope-temp', { cwd: this.projectRoot });
        
        // Copy contracts to new structure
        const tempContractsPath = path.join(this.projectRoot, 'stackscope-temp', 'contracts');
        const targetContractsPath = path.join(this.projectRoot, 'contracts');
        
        if (fs.existsSync(tempContractsPath)) {
          fs.cpSync(tempContractsPath, targetContractsPath, { recursive: true });
          fs.rmSync(path.join(this.projectRoot, 'stackscope-temp'), { recursive: true, force: true });
        }
        
        console.log('✅ Clarinet project initialized');
      } else {
        console.log('✅ Clarinet project already exists');
      }
    } catch (error) {
      console.log('❌ Error initializing Clarinet:', error.message);
    }
  }

  // Check contract syntax
  checkContract() {
    console.log('📄 Checking contract syntax...');
    
    try {
      const result = execSync('clarinet check', { cwd: this.projectRoot, encoding: 'utf8' });
      console.log('✅ Contract syntax valid');
      return true;
    } catch (error) {
      console.log('❌ Contract syntax error:', error.message);
      return false;
    }
  }

  // Generate deployment plan
  generateDeploymentPlan(network = 'testnet') {
    console.log(`📋 Generating ${network} deployment plan...`);
    
    try {
      const result = execSync(`clarinet deployments generate --${network} --medium-cost`, { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      console.log('✅ Deployment plan generated');
      console.log('📁 Plan saved to: deployments/default.testnet-plan.yaml');
      return true;
    } catch (error) {
      console.log('❌ Error generating deployment plan:', error.message);
      return false;
    }
  }

  // Deploy contract
  async deploy(network = 'testnet') {
    console.log(`🚀 Deploying to ${network}...`);
    
    try {
      // First, check if we need to set up testnet config
      const testnetConfigPath = path.join(this.projectRoot, 'settings', 'Testnet.toml');
      if (!fs.existsSync(testnetConfigPath)) {
        console.log('📁 Creating testnet configuration...');
        this.createTestnetConfig();
      }

      // Apply deployment plan
      const result = execSync(`clarinet deployments apply --${network}`, { 
        cwd: this.projectRoot, 
        encoding: 'utf8',
        input: 'y\n' // Auto-confirm deployment
      });
      
      console.log('✅ Deployment completed!');
      console.log('📊 Deployment result:');
      console.log(result);
      
      return true;
    } catch (error) {
      console.log('❌ Deployment failed:', error.message);
      return false;
    }
  }

  // Create testnet configuration
  createTestnetConfig() {
    const settingsDir = path.join(this.projectRoot, 'settings');
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }

    const testnetConfig = `[network]
name = "testnet"
stacks_node_rpc_address = "https://api.testnet.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "\${STX_WALLET_MNEMONIC}"
balance = 100_000_000_000
derivation = "m/44'/5757'/0'/0/0"
`;

    fs.writeFileSync(path.join(settingsDir, 'Testnet.toml'), testnetConfig);
    console.log('✅ Testnet configuration created');
  }

  // Start local development environment
  startDevnet() {
    console.log('🌐 Starting local development environment...');
    
    try {
      console.log('📋 This will start a local Stacks blockchain with your contract deployed');
      console.log('🔗 You can interact with it at: http://localhost:8000');
      console.log('💡 Press Ctrl+C to stop the devnet');
      
      execSync('clarinet devnet start', { cwd: this.projectRoot, stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Error starting devnet:', error.message);
    }
  }

  // Main deployment function
  async deploy() {
    try {
      console.log('🎯 Starting Clarinet deployment...\n');
      
      // Step 1: Check Clarinet installation
      if (!this.checkClarinet()) {
        return;
      }
      
      // Step 2: Initialize project
      this.initClarinet();
      
      // Step 3: Check contract syntax
      if (!this.checkContract()) {
        return;
      }
      
      // Step 4: Generate deployment plan
      if (!this.generateDeploymentPlan('testnet')) {
        return;
      }
      
      // Step 5: Deploy to testnet
      const success = await this.deploy('testnet');
      
      if (success) {
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('========================');
        console.log('✅ Contract deployed to testnet');
        console.log('📊 Check your deployment at: https://explorer.stacks.co/');
        console.log('🔍 Use clarinet console --testnet to interact with your contract');
        
        console.log('\n📋 Next Steps:');
        console.log('===============');
        console.log('1. Test contract functions');
        console.log('2. Verify deployment on explorer');
        console.log('3. Start local development: clarinet devnet start');
      }
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
    }
  }
}

// Run deployment
const deployer = new ClarinetDeployer();
deployer.deploy();
