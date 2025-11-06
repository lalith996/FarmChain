# Private Key Migration to KMS - Implementation Guide

**Status:** 🔴 CRITICAL - Required before production deployment
**Estimated Time:** 4-8 hours
**Priority:** IMMEDIATE

---

## Problem Statement

**Current State (INSECURE):**
```javascript
// backend/src/config/blockchain.js
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
```

**Issues:**
- Private key stored in plaintext `.env` file
- Exposed in environment variable dumps
- Visible in logs if misconfigured
- Vulnerable to server compromise
- Can be accidentally committed to git

**Risk Level:** 🔴 CRITICAL - Complete blockchain account compromise

---

## Recommended Solutions

### Option 1: AWS KMS (Recommended for AWS deployments)

**Pros:**
- Industry-standard encryption
- Audit logging
- IAM-based access control
- Key rotation support
- FIPS 140-2 validated

**Implementation:**

#### Step 1: Install Dependencies
```bash
cd backend
npm install @aws-sdk/client-kms @aws-sdk/client-secrets-manager
```

#### Step 2: Create KMS Key in AWS Console
```bash
# Using AWS CLI
aws kms create-key \
  --description "FarmChain Blockchain Signing Key" \
  --key-usage SIGN_VERIFY \
  --customer-master-key-spec ECC_SECG_P256K1
```

#### Step 3: Store Private Key in AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name farmchain/blockchain/private-key \
  --description "FarmChain blockchain private key" \
  --secret-string '{"privateKey":"YOUR_PRIVATE_KEY_HERE"}'
```

#### Step 4: Create KMS Service

**File:** `backend/src/services/kms.service.js`
```javascript
const { KMSClient, SignCommand } = require('@aws-sdk/client-kms');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { ethers } = require('ethers');

class KMSService {
  constructor() {
    this.kmsClient = new KMSClient({ region: process.env.AWS_REGION });
    this.secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
    this.keyId = process.env.KMS_KEY_ID;
  }

  /**
   * Get private key from Secrets Manager
   */
  async getPrivateKey() {
    const command = new GetSecretValueCommand({
      SecretId: 'farmchain/blockchain/private-key'
    });

    const response = await this.secretsClient.send(command);
    const secret = JSON.parse(response.SecretString);
    return secret.privateKey;
  }

  /**
   * Create wallet with KMS-backed signer
   */
  async createWallet(provider) {
    const privateKey = await this.getPrivateKey();
    const wallet = new ethers.Wallet(privateKey, provider);

    // Override signTransaction to use KMS
    wallet.signTransaction = async (transaction) => {
      return await this.signTransaction(transaction);
    };

    return wallet;
  }

  /**
   * Sign transaction using KMS
   */
  async signTransaction(transaction) {
    const serializedTx = ethers.Transaction.from(transaction).unsignedSerialized;
    const messageHash = ethers.keccak256(serializedTx);

    const command = new SignCommand({
      KeyId: this.keyId,
      Message: Buffer.from(messageHash.slice(2), 'hex'),
      MessageType: 'DIGEST',
      SigningAlgorithm: 'ECDSA_SHA_256'
    });

    const response = await this.kmsClient.send(command);
    const signature = response.Signature;

    // Parse signature and return
    return this.formatSignature(signature);
  }

  formatSignature(signature) {
    // Convert DER signature to Ethereum format
    // Implementation details...
  }
}

module.exports = new KMSService();
```

#### Step 5: Update Blockchain Config

**File:** `backend/src/config/blockchain.js`
```javascript
const { ethers } = require('ethers');
const kmsService = require('../services/kms.service');

let wallet = null;

async function initializeWallet() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  if (process.env.USE_KMS === 'true') {
    // Production: Use KMS
    wallet = await kmsService.createWallet(provider);
    console.log('✅ Wallet initialized with KMS');
  } else {
    // Development only
    if (process.env.NODE_ENV === 'production') {
      throw new Error('KMS must be enabled in production');
    }
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.warn('⚠️  Using plaintext private key (development only)');
  }

  return wallet;
}

module.exports = {
  initializeWallet,
  getWallet: () => wallet
};
```

#### Step 6: Update Environment Variables

**File:** `.env.production`
```bash
# Remove PRIVATE_KEY completely
# PRIVATE_KEY=xxx  ← DELETE THIS

# Add KMS configuration
USE_KMS=true
AWS_REGION=us-east-1
KMS_KEY_ID=arn:aws:kms:us-east-1:123456789:key/xxxx
```

#### Step 7: Update IAM Permissions

**IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Sign",
        "kms:GetPublicKey"
      ],
      "Resource": "arn:aws:kms:*:*:key/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:farmchain/*"
    }
  ]
}
```

---

### Option 2: Google Cloud KMS

**Implementation:**

```bash
npm install @google-cloud/kms @google-cloud/secret-manager
```

**File:** `backend/src/services/gcp-kms.service.js`
```javascript
const { KeyManagementServiceClient } = require('@google-cloud/kms');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class GCPKMSService {
  constructor() {
    this.kmsClient = new KeyManagementServiceClient();
    this.secretClient = new SecretManagerServiceClient();
    this.keyName = process.env.GCP_KEY_NAME;
  }

  async getPrivateKey() {
    const name = `projects/${process.env.GCP_PROJECT}/secrets/blockchain-private-key/versions/latest`;
    const [version] = await this.secretClient.accessSecretVersion({ name });
    return version.payload.data.toString();
  }

  async signTransaction(transaction) {
    const serializedTx = ethers.Transaction.from(transaction).unsignedSerialized;
    const digest = ethers.keccak256(serializedTx);

    const [signResponse] = await this.kmsClient.asymmetricSign({
      name: this.keyName,
      digest: {
        sha256: Buffer.from(digest.slice(2), 'hex')
      }
    });

    return this.formatSignature(signResponse.signature);
  }
}

module.exports = new GCPKMSService();
```

---

### Option 3: HashiCorp Vault

**Implementation:**

```bash
npm install node-vault
```

**File:** `backend/src/services/vault.service.js`
```javascript
const vault = require('node-vault');

class VaultService {
  constructor() {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN
    });
  }

  async getPrivateKey() {
    const result = await this.client.read('secret/data/farmchain/blockchain');
    return result.data.data.privateKey;
  }

  async createWallet(provider) {
    const privateKey = await this.getPrivateKey();
    return new ethers.Wallet(privateKey, provider);
  }
}

module.exports = new VaultService();
```

**Vault Setup:**
```bash
# Enable secrets engine
vault secrets enable -path=secret kv-v2

# Store private key
vault kv put secret/farmchain/blockchain privateKey="YOUR_KEY_HERE"

# Create policy
vault policy write farmchain-backend - <<EOF
path "secret/data/farmchain/*" {
  capabilities = ["read"]
}
EOF

# Create token
vault token create -policy=farmchain-backend
```

---

### Option 4: Hardware Wallet (Ledger/Trezor) - Development/Testing

**Pros:**
- Private key never leaves device
- Physical security
- Good for development/testing

**Cons:**
- Not suitable for automated production systems
- Requires physical access

**Implementation:**

```bash
npm install @ledgerhq/hw-app-eth @ledgerhq/hw-transport-node-hid
```

```javascript
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default;
const Eth = require('@ledgerhq/hw-app-eth').default;

class LedgerService {
  async createWallet(provider) {
    const transport = await TransportNodeHid.create();
    const eth = new Eth(transport);

    const path = "m/44'/60'/0'/0/0";
    const { address } = await eth.getAddress(path);

    // Create custom signer
    const signer = {
      address,
      provider,
      signTransaction: async (tx) => {
        const serialized = ethers.Transaction.from(tx).unsignedSerialized;
        const signature = await eth.signTransaction(path, serialized);
        return signature;
      }
    };

    return signer;
  }
}
```

---

## Migration Checklist

### Pre-Migration:
- [ ] Choose KMS provider (AWS, GCP, Vault)
- [ ] Set up cloud account and permissions
- [ ] Install required dependencies
- [ ] Test KMS access in development
- [ ] Backup current private key securely

### Migration:
- [ ] Create KMS key
- [ ] Store private key in secrets manager
- [ ] Implement KMS service
- [ ] Update blockchain configuration
- [ ] Update environment variables
- [ ] Remove plaintext private key from all files
- [ ] Update .gitignore to prevent key exposure

### Testing:
- [ ] Test wallet initialization
- [ ] Test transaction signing
- [ ] Test on testnet (Polygon Amoy)
- [ ] Verify signatures are valid
- [ ] Load test signing performance
- [ ] Test error handling (KMS unavailable)

### Deployment:
- [ ] Deploy to staging with KMS
- [ ] Monitor for 24 hours
- [ ] Review CloudWatch/Stackdriver logs
- [ ] Verify no key exposure in logs
- [ ] Deploy to production
- [ ] Monitor continuously

### Post-Migration:
- [ ] Delete plaintext keys from all systems
- [ ] Rotate keys if previously exposed
- [ ] Set up key rotation schedule
- [ ] Document key management procedures
- [ ] Train team on KMS usage
- [ ] Set up alerts for KMS access

---

## Security Best Practices

### 1. Environment Separation
```javascript
// WRONG: Same key for dev and production
const key = process.env.PRIVATE_KEY;

// RIGHT: Different keys per environment
const keyPath = process.env.NODE_ENV === 'production'
  ? 'farmchain/prod/blockchain'
  : 'farmchain/dev/blockchain';
```

### 2. Key Rotation
```javascript
// Implement key rotation every 90 days
async function rotateKey() {
  const newKey = ethers.Wallet.createRandom();
  await transferFunds(oldWallet, newKey.address);
  await secretsManager.updateSecret({
    SecretId: 'farmchain/blockchain/private-key',
    SecretString: JSON.stringify({ privateKey: newKey.privateKey })
  });
}
```

### 3. Audit Logging
```javascript
// Log all key access
await auditLog.create({
  action: 'KMS_KEY_ACCESS',
  user: 'system',
  resource: 'blockchain-signing-key',
  timestamp: new Date(),
  success: true
});
```

### 4. Rate Limiting
```javascript
// Limit signing requests
const signingRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100 // 100 signatures per minute
});
```

---

## Cost Estimates

### AWS KMS:
- **Key storage:** $1/month
- **Signing operations:** $0.03 per 10,000 requests
- **Secrets Manager:** $0.40/month + $0.05 per 10,000 API calls
- **Estimated monthly cost (1000 tx/day):** ~$2-5

### Google Cloud KMS:
- **Key versions:** $0.06/month each
- **Signing operations:** $0.03 per 10,000 operations
- **Secret Manager:** $0.06 per secret per month + $0.03 per 10,000 accesses
- **Estimated monthly cost:** ~$2-5

### HashiCorp Vault:
- **Self-hosted:** Free (infrastructure costs only)
- **Cloud:** Starts at $0.03/hour (~$22/month)

---

## Performance Considerations

### Latency:
- AWS KMS: ~50-100ms per signature
- Local key: ~1-5ms per signature
- **Impact:** 20-50x slower than local signing

### Mitigation:
1. **Batch signing** where possible
2. **Cache signatures** for identical transactions
3. **Use async processing** for non-critical operations
4. **Implement circuit breakers** for KMS failures

---

## Troubleshooting

### Issue: KMS unavailable
```javascript
async function signWithFallback(transaction) {
  try {
    return await kmsService.signTransaction(transaction);
  } catch (error) {
    logger.error('KMS signing failed:', error);

    // Fallback: Queue for later
    await transactionQueue.add(transaction);
    throw new Error('Transaction queued for later processing');
  }
}
```

### Issue: Performance degradation
```javascript
// Add caching
const signatureCache = new Map();

async function cachedSign(transaction) {
  const hash = ethers.keccak256(serialize(transaction));

  if (signatureCache.has(hash)) {
    return signatureCache.get(hash);
  }

  const signature = await kmsService.signTransaction(transaction);
  signatureCache.set(hash, signature);

  return signature;
}
```

---

## Alternative: Managed Services

### Alchemy Transaction API
- No private key management needed
- Transactions signed server-side
- Higher cost but simpler

### Fireblocks
- Enterprise-grade key management
- MPC (Multi-Party Computation)
- Compliance features

---

## Conclusion

**Required Action:** Implement one of the KMS solutions before production deployment.

**Recommended:** AWS KMS if using AWS, otherwise HashiCorp Vault for flexibility.

**Timeline:**
- Development: 4 hours
- Testing: 2 hours
- Deployment: 2 hours
- **Total: 8 hours**

**Priority:** 🔴 CRITICAL - Must complete before production launch.

---

*Document Version: 1.0*
*Last Updated: 2025-11-06*
*Next Review: After implementation*
