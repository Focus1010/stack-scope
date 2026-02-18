#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🌐 Starting StackScope Web Deployment Server...');
console.log('==========================================\n');

class WebDeploymentServer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.contractPath = path.join(this.projectRoot, 'contracts', 'stackscope-notes.clar');
    this.port = 3001;
  }

  // Load contract code
  loadContractCode() {
    try {
      if (fs.existsSync(this.contractPath)) {
        return fs.readFileSync(this.contractPath, 'utf8');
      } else {
        return `;; Contract file not found at ${this.contractPath}\n;; Please ensure contracts/stackscope-notes.clar exists`;
      }
    } catch (error) {
      return `;; Error loading contract: ${error.message}`;
    }
  }

  // Create enhanced HTML
  createHTML(contractCode) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>StackScope Contract Deployment</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .step { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
        .code { background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; max-height: 500px; overflow-y: auto; border: 1px solid #e1e5e7; white-space: pre; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin: 8px; transition: background-color 0.3s; }
        button:hover { background: #0056b3; transform: translateY(-2px); }
        button:active { transform: translateY(0); }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        .success { color: #28a745; font-weight: bold; margin: 12px 0; padding: 12px; background: #d4edda; border-radius: 6px; }
        .error { color: #dc3545; font-weight: bold; margin: 12px 0; padding: 12px; background: #f8d7da; border-radius: 6px; }
        .info { color: #17a2b8; font-weight: bold; margin: 12px 0; padding: 12px; background: #d1ecf1; border-radius: 6px; }
        .result { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #007bff; }
        .loading { color: #007bff; font-style: italic; }
        h1 { color: #007bff; text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        h2 { color: #495057; margin-top: 0; font-size: 1.5em; }
        .step h2 { margin-top: 0; }
        .contract-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .explorer-link { color: #007bff; text-decoration: none; font-weight: bold; }
        .explorer-link:hover { text-decoration: underline; }
        .tabs { display: flex; margin-bottom: 20px; border-bottom: 2px solid #e9ecef; }
        .tab { padding: 12px 20px; cursor: pointer; border: none; background: none; font-weight: bold; color: #6c757d; }
        .tab.active { color: #007bff; border-bottom: 2px solid #007bff; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .deployment-option { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        .deployment-option h3 { margin-top: 0; color: #007bff; }
        .step-number { background: #007bff; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px; }
        .copy-feedback { position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 12px 20px; border-radius: 8px; z-index: 1000; opacity: 0; transition: opacity 0.3s; }
        .copy-feedback.show { opacity: 1; }
        @media (max-width: 768px) {
            .two-column { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 StackScope Contract Deployment</h1>
        <p style="text-align: center; color: #6c757d; font-size: 1.2em; margin-bottom: 30px;">Deploy your smart contract directly to Stacks testnet</p>
        
        <div class="tabs">
            <div class="tab active" onclick="showTab('contract')">📄 Contract Code</div>
            <div class="tab" onclick="showTab('deploy')">🚀 Deployment</div>
            <div class="tab" onclick="showTab('guide')">📋 Guide</div>
        </div>

        <div id="contract-tab" class="tab-content active">
            <div class="step">
                <h2><span class="step-number">1</span> Contract Information</h2>
                <div class="contract-info">
                    <strong>📄 Contract Name:</strong> stackscope-notes<br>
                    <strong>🌐 Network:</strong> testnet<br>
                    <strong>💰 Estimated Fee:</strong> 0.001 STX<br>
                    <strong>⚡ Clarity Version:</strong> 2<br>
                    <strong>🔧 Features:</strong> Add/Update/Delete notes linked to transactions
                </div>
            </div>
            
            <div class="step">
                <h2><span class="step-number">2</span> Contract Code</h2>
                <p>Here's your complete contract code. You can copy it or download the file:</p>
                <div class="code" id="contract-code">${contractCode}</div>
                <div style="margin-top: 15px;">
                    <button onclick="copyContractCode()">📋 Copy Contract Code</button>
                    <button onclick="downloadContract()">💾 Download Contract File</button>
                    <button onclick="selectCode()">🖱️ Select All Code</button>
                </div>
                <div id="copy-status"></div>
            </div>
        </div>

        <div id="deploy-tab" class="tab-content">
            <div class="step">
                <h2><span class="step-number">1</span> Choose Deployment Method</h2>
                <div class="two-column">
                    <div class="deployment-option">
                        <h3>🌐 Method A: Stacks Explorer (Recommended)</h3>
                        <p><strong>Most reliable method with built-in verification</strong></p>
                        <ol>
                            <li>Visit: <a href="https://explorer.stacks.co/" target="_blank" class="explorer-link">https://explorer.stacks.co/</a></li>
                            <li>Connect your Leather/XVerse wallet (testnet mode)</li>
                            <li>Click "Deploy Contract" or "Smart Contracts"</li>
                            <li>Upload contract file or paste the code above</li>
                            <li><strong>Contract name:</strong> stackscope-notes</li>
                            <li><strong>Fee:</strong> 0.001 STX</li>
                            <li>Sign transaction in your wallet</li>
                        </ol>
                    </div>
                    
                    <div class="deployment-option">
                        <h3>📱 Method B: Testnet Web Interface</h3>
                        <p><strong>Alternative web interface for deployment</strong></p>
                        <ol>
                            <li>Visit: <a href="https://testnet.stacks.co/" target="_blank" class="explorer-link">https://testnet.stacks.co/</a></li>
                            <li>Connect your wallet (testnet mode)</li>
                            <li>Navigate to contract deployment section</li>
                            <li>Upload contract: <strong>stackscope-notes.clar</strong></li>
                            <li>Deploy with 0.001 STX fee</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="step">
                <h2><span class="step-number">2</span> After Deployment</h2>
                <p>Once deployed, you'll receive:</p>
                <div class="result">
                    <strong>📍 Contract Address:</strong> ST... (testnet format)<br>
                    <strong>🔗 Transaction ID:</strong> 0x... (64-character hex)<br>
                    <strong>🌐 Network:</strong> testnet<br>
                    <strong>💰 Gas Cost:</strong> ~0.001 STX<br>
                    <strong>🔍 Explorer Link:</strong> Direct verification link
                </div>
                
                <h3>✅ Verify Your Deployment</h3>
                <p>Use this command to verify:</p>
                <div class="code">node scripts/verify-deploy.js &lt;CONTRACT_ADDRESS&gt; &lt;TXID&gt;</div>
            </div>
        </div>

        <div id="guide-tab" class="tab-content">
            <div class="step">
                <h2><span class="step-number">1</span> Quick Start Guide</h2>
                <div class="info">
                    <strong>🚀 Ready to deploy in 3 simple steps:</strong>
                    <ol>
                        <li>Choose your deployment method from the Deployment tab</li>
                        <li>Follow the step-by-step instructions</li>
                        <li>Save your contract address and transaction ID</li>
                    </ol>
                </div>
            </div>
            
            <div class="step">
                <h2><span class="step-number">2</span> Contract Functions</h2>
                <p>After deployment, you can interact with these functions:</p>
                <div class="code">
;; Add a note
(contract-call? 'ST... .stackscope-notes add-note (buff 32) "your-note-here"))

;; Get a note
(contract-call? 'ST... .stackscope-notes get-note (buff 32))

;; Update a note
(contract-call? 'ST... .stackscope-notes update-note (buff 32) "updated-note"))

;; Delete a note
(contract-call? 'ST... .stackscope-notes delete-note (buff 32))
                </div>
            </div>
            
            <div class="step">
                <h2><span class="step-number">3</span> Useful Links</h2>
                <div class="two-column">
                    <div class="deployment-option">
                        <h3>🔗 Development Tools</h3>
                        <ul>
                            <li><a href="https://explorer.stacks.co/" target="_blank" class="explorer-link">Stacks Explorer</a></li>
                            <li><a href="https://testnet.stacks.co/faucet" target="_blank" class="explorer-link">Testnet Faucet</a></li>
                            <li><a href="https://docs.stacks.co/" target="_blank" class="explorer-link">Stacks Documentation</a></li>
                        </ul>
                    </div>
                    
                    <div class="deployment-option">
                        <h3>🛠️ Troubleshooting</h3>
                        <ul>
                            <li><strong>Contract not found:</strong> Check contract name spelling</li>
                            <li><strong>Transaction failed:</strong> Check wallet STX balance</li>
                            <li><strong>High fees:</strong> Try --low-cost option</li>
                            <li><strong>Connection issues:</strong> Refresh wallet connection</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="copy-feedback" class="copy-feedback">
        <span id="copy-message">✅ Copied to clipboard!</span>
    </div>

    <script>
        // Tab switching
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName + '-tab').classList.add('active');
            event.target.classList.add('active');
        }

        // Copy contract code
        function copyContractCode() {
            const codeElement = document.getElementById('contract-code');
            const textArea = document.createElement('textarea');
            textArea.value = codeElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                showCopyFeedback('✅ Contract code copied to clipboard!');
            } catch (err) {
                showCopyFeedback('❌ Failed to copy. Please copy manually.');
            }
            
            document.body.removeChild(textArea);
        }

        // Download contract file
        function downloadContract() {
            const code = document.getElementById('contract-code').textContent;
            const blob = new Blob([code], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stackscope-notes.clar';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        // Select all code
        function selectCode() {
            const codeElement = document.getElementById('contract-code');
            const range = document.createRange();
            range.selectNodeContents(codeElement);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }

        // Show copy feedback
        function showCopyFeedback(message) {
            const feedback = document.getElementById('copy-feedback');
            const messageElement = document.getElementById('copy-message');
            messageElement.textContent = message;
            feedback.classList.add('show');
            
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 StackScope Deployment Interface Loaded');
        });
    </script>
</body>
</html>`;
  }

  // Start server
  startServer() {
    const contractCode = this.loadContractCode();
    const html = this.createHTML(contractCode);

    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else if (req.url === '/contracts/stackscope-notes.clar') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(contractCode);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(this.port, () => {
      console.log(`✅ Web deployment server started!`);
      console.log(`🌐 Open your browser and go to: http://localhost:${this.port}`);
      console.log(`📄 Contract code available at: http://localhost:${this.port}/contracts/stackscope-notes.clar`);
      console.log(`💡 Press Ctrl+C to stop the server`);
    });

    // Handle server shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Server stopped');
      server.close();
      process.exit(0);
    });
  }
}

// Start the server
const webServer = new WebDeploymentServer();
webServer.startServer();
