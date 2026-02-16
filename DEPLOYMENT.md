# StackScope Notes Contract Deployment

## Overview
The `stackscope-notes` contract allows users to add, update, and delete notes linked to Stacks transactions.

## Contract Details

- **Contract Name**: stackscope-notes
- **Language**: Clarity
- **Traits**: `principal`
- **Network**: Stacks (mainnet/testnet)

## Features

### Public Functions

#### `add-note`
- **Purpose**: Add a note to a transaction
- **Parameters**:
  - `owner` (principal): Contract owner
  - `txid` (buff 32): Transaction ID
  - `note` (string-utf8 200): Note content (max 200 chars)
- **Returns**: `(response bool uint)`
- **Error Codes**:
  - `u401`: Note not found
  - `u402`: Unauthorized (not owner)
  - `u403`: Note too long (>200 chars)

#### `update-note`
- **Purpose**: Update an existing note
- **Parameters**:
  - `owner` (principal): Contract owner
  - `txid` (buff 32): Transaction ID
  - `note` (string-utf8 200): Updated note content (max 200 chars)
- **Returns**: `(response bool uint)`
- **Error Codes**: Same as `add-note`

#### `delete-note`
- **Purpose**: Delete a note from a transaction
- **Parameters**:
  - `owner` (principal): Contract owner
  - `txid` (buff 32): Transaction ID
- **Returns**: `(response bool uint)`
- **Error Codes**: Same as `add-note`

### Read-Only Functions

#### `get-note`
- **Purpose**: Get a specific note by transaction ID
- **Parameters**:
  - `owner` (principal): Contract owner
  - `txid` (buff 32): Transaction ID
- **Returns**: `(response (string-utf8 200))`
- **Error Codes**:
  - `u401`: Note not found

#### `get-all-notes`
- **Purpose**: Get all notes for an owner
- **Parameters**:
  - `owner` (principal): Contract owner
- **Returns**: `(list (string-utf8 200))`

#### `get-note-count`
- **Purpose**: Get total number of notes for an owner
- **Parameters**:
  - `owner` (principal): Contract owner
- **Returns**: `(uint)`

## Data Model

### Notes Map
```
{
  txid: (buff 32) => {
    note: (string-utf8 200),
    owner: principal,
    timestamp: uint
  }
}
```

### Contract Structure
```
{
  id: string,
  principal: string,
  code: string,
  name: string,
  description: string,
  balance: string,
  owner: string,
  txId: string,
  blockHeight: number,
  timestamp: number,
  status: 'success' | 'pending' | 'failed'
}
```

## Security Features

- **Owner-Only Operations**: Only contract owner can modify notes
- **Permission Checks**: Validates caller ownership before allowing modifications
- **Input Validation**: Note length limited to 200 characters
- **Error Handling**: Proper error codes for different failure scenarios

## Deployment Instructions

### Prerequisites
- Node.js 16+
- Stacks CLI
- Stacks wallet with STX balance

### Mainnet Deployment

```bash
# 1. Install Stacks CLI
npm install -g @stacks/cli

# 2. Deploy contract
stx deploy_contract contracts/stackscope-notes.clar \
  --mainnet \
  --name "stackscope-notes" \
  --description "StackScope Notes Smart Contract" \
  --stacks-api-key YOUR_API_KEY
```

### Testnet Deployment

```bash
# 1. Deploy to testnet
stx deploy_contract contracts/stackscope-notes.clar \
  --testnet \
  --name "stackscope-notes" \
  --description "StackScope Notes Smart Contract (Testnet)" \
  --stacks-api-key YOUR_API_KEY
```

### Using Clarinet for Testing

```bash
# 1. Install Clarinet
npm install -g @stacks/clarinet

# 2. Initialize project
clarinet init stackscope-notes

# 3. Run tests
clarinet test

# 4. Deploy to testnet
clarinet deploy
```

## Contract Interaction

### Using Stacks CLI

```bash
# Add a note
stx call_contract \
  --contract SP...CONTRACT_ADDRESS \
  --function add-note \
  --args '["0x1234567890abcdef", "This is my note"]' \
  --mainnet

# Get a note
stx call_contract \
  --contract SP...CONTRACT_ADDRESS \
  --function get-note \
  --args '["SP...OWNER_ADDRESS", "0x1234567890abcdef"]' \
  --mainnet

# Get all notes
stx call_contract \
  --contract SP...CONTRACT_ADDRESS \
  --function get-all-notes \
  --args '["SP...OWNER_ADDRESS"]' \
  --mainnet
```

### Using Clarinet

```bash
# Test contract locally
clarinet console --address SP...CONTRACT_ADDRESS \
  --function add-note \
  --args '["0x1234567890abcdef", "Test note"]'
```

## Gas Costs

- **add-note**: ~0.05 STX
- **update-note**: ~0.05 STX
- **delete-note**: ~0.05 STX
- **get-note**: ~0.01 STX
- **get-all-notes**: ~0.02 STX (depends on number of notes)

## Monitoring

### Contract Events
Monitor contract deployment and usage:

```bash
# Check contract status
stx get_contract_info SP...CONTRACT_ADDRESS --mainnet

# Get recent transactions
stx get_transactions SP...CONTRACT_ADDRESS --mainnet
```

## Security Considerations

1. **Access Control**: Only contract owner can modify notes
2. **Input Validation**: Note length limited to prevent gas waste
3. **Error Handling**: Clear error codes for debugging
4. **Gas Optimization**: Efficient data structures and operations
5. **Testing**: Comprehensive test coverage before deployment

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure wallet has enough STX for gas
2. **Network Mismatch**: Verify mainnet/testnet consistency
3. **Contract Already Deployed**: Check if contract address is in use
4. **API Key Issues**: Verify Stacks API key is valid

### Debug Commands

```bash
# View contract source
cat contracts/stackscope-notes.clar

# Test locally
clarinet console --address SP...CONTRACT_ADDRESS

# Check deployment
stx get_contract_info SP...CONTRACT_ADDRESS --mainnet
```

## Integration with StackScope

The contract integrates with the StackScope dashboard through:

1. **Transaction Linking**: Notes linked to transaction IDs
2. **UI Integration**: React components for note management
3. **Real-time Updates**: Automatic refresh on transaction changes
4. **Error Handling**: User-friendly error messages
5. **Mobile Support**: Responsive design for all devices

## Support

For deployment issues or questions:
- Check the [Stacks documentation](https://docs.stacks.co/)
- Review the [Clarity book](https://book.clarity-lang.org/)
- Join the [Stacks Discord](https://discord.gg/stacks)
