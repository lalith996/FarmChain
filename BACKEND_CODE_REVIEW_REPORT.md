# FarmChain Backend - Comprehensive Code Review Report

**Analysis Date:** November 6, 2025  
**Thoroughness Level:** Very Thorough (All Critical Paths Analyzed)  
**Total Issues Found:** 30 (4 CRITICAL, 9 HIGH, 9 MEDIUM, 8 LOW)

---

## EXECUTIVE SUMMARY

The FarmChain backend has a solid overall architecture with good use of Express, Mongoose, Redis, and blockchain integration. However, there are **4 CRITICAL security issues** and **9 HIGH-priority issues** that must be fixed before production deployment. The most severe issues involve authentication vulnerabilities, private key exposure, and payment processing logic.

### Critical Issues Requiring Immediate Action:
1. **Replay Attack Vulnerability** - Nonce validation not implemented in auth middleware
2. **Private Key Exposure** - Blockchain wallet private key stored in environment variables
3. **Hardcoded Exchange Rate** - 1000x wrong currency conversion rate for payments
4. **Memory Leak** - In-memory rate limiting has unbounded growth

---

## DETAILED FINDINGS

### TIER 1: CRITICAL SECURITY ISSUES (4 issues)

#### Issue #1: REPLAY ATTACK VULNERABILITY - No Nonce Validation
**File:** `src/middleware/auth.middleware.js` (Lines 135-168)  
**Severity:** 🔴 CRITICAL  
**CWE:** CWE-252 (Unchecked Return Value)

The middleware claims to prevent replay attacks but doesn't validate nonces:
- Nonce is extracted from message but never verified against stored nonce
- Same signature can be replayed indefinitely
- Attacker can gain account access with captured signature

**Fix:** Call `redisService.getNonce()`, verify match, delete after use.

---

#### Issue #2: PRIVATE KEY EXPOSURE IN ENVIRONMENT
**File:** `src/config/blockchain.js` (Lines 23-24)  
**Severity:** 🔴 CRITICAL  
**CWE:** CWE-798 (Use of Hard-Coded Credentials)

Blockchain wallet private key exposed in environment variables:
- Could be leaked through logs, debugging, or process listing
- Complete blockchain wallet compromise
- Cannot revoke exposed key

**Fix:** Use AWS KMS, HashiCorp Vault, or hardware wallet.

---

#### Issue #3: HARDCODED CURRENCY CONVERSION RATE
**File:** `src/controllers/payment.controller.js` (Lines 48-49)  
**Severity:** 🔴 CRITICAL  
**CWE:** CWE-1025 (Comparison Using Wrong Factors)

Mock exchange rate hardcoded as `/1000`:
- INR to ETH conversion is 1000x unrealistic
- Users pay wrong amounts (1000x too much or too little)
- Escrow payment system completely broken

**Fix:** Implement real-time price feed (Chainlink, CoinGecko) or use stablecoin.

---

#### Issue #4: IN-MEMORY RATE LIMITING MEMORY LEAK
**File:** `src/middleware/rateLimit.middleware.js` (Lines 89-117)  
**Severity:** 🔴 CRITICAL  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)

IP-based rate limiting Map grows unbounded:
- Old entries never deleted
- Server exhausts memory after days/weeks
- DoS vulnerability

**Fix:** Use Redis for all rate limiting or implement LRU cache with cleanup.

---

### TIER 2: HIGH-PRIORITY ISSUES (9 issues)

#### Issue #5: UNVALIDATED NONCE IN AUTH SERVICE
**File:** `src/services/auth.service.js` (Lines 56-63)  
**Severity:** 🟠 HIGH  
**Impacts:** Authentication bypass risk

---

#### Issue #6: DANGEROUS REDIS PATTERN MATCHING
**File:** `src/services/redis.service.js` (Lines 183-190)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-248 (Uncaught Exception)

Using `keys()` command which is O(N) and blocking entire Redis.

---

#### Issue #7: MIXED ROLE CHECKING APPROACHES
**Files:** Multiple (`auth.middleware.js`, `product.controller.js`, `order.controller.js`)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)

- Some code uses correct `req.user.hasRole()`
- Some code uses incorrect `req.user.role` (doesn't exist)
- Authorization checks could fail silently

---

#### Issue #8: UNVALIDATED BLOCKCHAIN RECEIPT ACCESS
**File:** `src/config/blockchain.js` (Lines 75, 179)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-476 (Null Pointer Dereference)

Accessing `receipt.logs[0].topics[1]` without checking if they exist:
- Could crash if logs array is empty
- Inconsistent blockchain state

---

#### Issue #9: PAYMENT RELEASE LOGIC INVERTED
**File:** `src/controllers/payment.controller.js` (Lines 129-131)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-681 (Incorrect Comparison)

Logic allows payment release if either status is delivered OR verification is complete.

---

#### Issue #10: MISSING QUANTITY ROLLBACK ON ORDER FAILURE
**File:** `src/controllers/order.controller.js` (Lines 93-94)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-1076 (Incomplete ADL Implementation)

Product quantity decremented immediately with no rollback on payment failure.

---

#### Issue #11: UNSAFE JWT TOKEN DECODING
**File:** `src/services/auth.service.js` (Lines 305, 345)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-347 (Improper Verification of Cryptographic Signature)

Using `jwt.decode()` instead of `jwt.verify()` - no signature validation.

---

#### Issue #12: UNVALIDATED REGEX INPUT IN PRODUCT SEARCH
**File:** `src/controllers/product.controller.js` (Lines 475-495)  
**Severity:** 🟠 HIGH  
**CWE:** CWE-400 (Uncontrolled Resource Consumption - ReDoS)

User search input used directly in regex without sanitization.

---

#### Issue #13: MISSING LOGGER IMPORT
**File:** `src/middleware/rateLimit.middleware.js` (Line 74)  
**Severity:** 🟠 HIGH (causes runtime error)

`logger.error()` called but logger never imported.

---

### TIER 3: MEDIUM-PRIORITY ISSUES (9 issues)

Issues 14-22 cover:
- Unsafe randomness in ID generation (Math.random instead of crypto)
- Missing coordinate validation (latitude/longitude bounds)
- IPFS hash validation too lenient
- Database connection pool size too low
- N+1 query problems
- Missing text indexes on search fields
- Inefficient role lookups (no caching)
- Missing delivery address validation
- Pagination limit validation missing

---

### TIER 4: LOW-PRIORITY ISSUES (8 issues)

Issues 23-30 cover:
- Inconsistent error response formats
- Debug logging in production (console.log with emoji)
- TODO comments not tracked
- Missing test coverage for race conditions
- Price field validation gaps
- Quantity validation gaps
- Inconsistent authorization checks

---

## QUICK FIX PRIORITY LIST

### 🔴 MUST FIX IMMEDIATELY (Critical Path):
1. [ ] Add nonce validation in `auth.middleware.js` line 166
2. [ ] Replace hardcoded exchange rate with price feed
3. [ ] Implement cleanup for in-memory rate limit Map
4. [ ] Fix blockchain receipt validation
5. [ ] Import logger in rate limit middleware
6. [ ] Fix payment release condition logic
7. [ ] Sanitize product search input using existing `sanitizeForRegex()`

### 🟠 FIX WITHIN 1 SPRINT:
- [ ] Implement Redis-based nonce validation
- [ ] Replace Math.random() with crypto.randomBytes()
- [ ] Fix Redis SCAN command instead of KEYS
- [ ] Standardize role checking across all controllers
- [ ] Add proper JWT verification (jwt.verify not decode)
- [ ] Add transaction support to order creation
- [ ] Cache role data in Redis
- [ ] Add text indexes to Product model

### 🟡 FIX BEFORE PRODUCTION:
- [ ] Load test and profile memory usage
- [ ] Add comprehensive test suite
- [ ] External security audit
- [ ] Performance testing under load
- [ ] Add coordinate validation validators
- [ ] Increase database pool size to 20-50
- [ ] Add missing input validations

---

## CODE QUALITY METRICS

| Category | Status | Priority |
|----------|--------|----------|
| Security | ⚠️ Critical issues found | 🔴 FIX NOW |
| Authentication | ⚠️ Multiple bypass vectors | 🔴 FIX NOW |
| Payment Processing | ⚠️ Logic errors | 🔴 FIX NOW |
| Input Validation | ⚠️ Gaps identified | 🟠 HIGH |
| Error Handling | ✅ Decent coverage | 🟡 MEDIUM |
| Performance | ⚠️ Memory leak, N+1 queries | 🟡 MEDIUM |
| Testing | ❌ No test suite visible | 🟡 MEDIUM |
| Logging | ⚠️ Mixed quality | 🟡 LOW |

---

## RECOMMENDATIONS

### Immediate Actions (Next 48 Hours):
1. Fix all 4 CRITICAL issues
2. Fix all 9 HIGH issues
3. Add security tests
4. Code review all auth code
5. Block production deployment

### Short Term (1-2 Weeks):
1. Implement comprehensive test suite
2. Fix all MEDIUM issues
3. Performance test under load
4. Security audit by external firm
5. Document all security decisions

### Medium Term (1 Month):
1. Implement monitoring and alerting
2. Add rate limiting metrics
3. Performance optimization
4. Database migration (transactions)
5. Key rotation mechanism

---

## FILES AFFECTED

```
🔴 CRITICAL:
  - src/middleware/auth.middleware.js
  - src/config/blockchain.js
  - src/controllers/payment.controller.js
  - src/middleware/rateLimit.middleware.js

🟠 HIGH:
  - src/services/auth.service.js
  - src/services/redis.service.js
  - src/controllers/product.controller.js
  - src/controllers/order.controller.js

🟡 MEDIUM:
  - src/models/Product.model.js
  - src/config/database.js
  - Multiple controller files

🟢 LOW:
  - src/utils/logger.js
  - src/controllers/auth.controller.js
```

---

## Next Steps

1. **Review this report** with the development team
2. **Prioritize fixes** - start with CRITICAL issues
3. **Create tickets** for each issue in your issue tracker
4. **Plan security sprint** for fixes
5. **Add automated testing** to prevent regressions
6. **Schedule external audit** before production

---

**Report Generated:** November 6, 2025  
**Reviewer:** Claude Code Analysis  
**Confidence Level:** Very High (Comprehensive Source Code Review)

For detailed code examples and line-by-line analysis, see the accompanying markdown file.
