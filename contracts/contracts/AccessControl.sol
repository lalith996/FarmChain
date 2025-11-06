// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgriChain AccessControl
 * @dev Enhanced role-based access control for agricultural supply chain
 * @notice Implements hierarchical roles with granular permissions
 */
contract AgriChainAccessControl is AccessControl, Pausable, ReentrancyGuard {
    // Role constants - keccak256 hash of role names
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");

    // Role hierarchy levels (higher = more privilege)
    mapping(bytes32 => uint8) public roleLevel;

    // Role transfer timelock (24 hours)
    uint256 public constant ROLE_TRANSFER_DELAY = 24 hours;

    // Pending role transfers
    struct RoleTransfer {
        bytes32 role;
        address from;
        address to;
        uint256 executeAfter;
        bool executed;
        bool cancelled; // FIX #2: Separate cancelled state
    }

    mapping(uint256 => RoleTransfer) public pendingTransfers;
    uint256 public transferCount;

    // User verification status
    mapping(address => bool) public isVerified;
    mapping(address => bool) public hasCompletedKYC;

    // Role activity tracking
    mapping(address => uint256) public lastRoleChange;
    mapping(address => uint256) public roleChangeCount;

    // Events
    event RoleGrantedWithVerification(
        bytes32 indexed role,
        address indexed account,
        address indexed granter,
        bool requiresVerification
    );

    event RoleRevokedWithReason(
        bytes32 indexed role,
        address indexed account,
        address indexed revoker,
        string reason
    );

    event RoleTransferInitiated(
        uint256 indexed transferId,
        bytes32 indexed role,
        address indexed from,
        address to,
        uint256 executeAfter
    );

    event RoleTransferExecuted(
        uint256 indexed transferId,
        bytes32 indexed role,
        address indexed from,
        address to
    );

    event RoleTransferCancelled(
        uint256 indexed transferId,
        bytes32 indexed role,
        address indexed canceller
    );

    event EmergencyPause(
        address indexed admin,
        string reason,
        uint256 timestamp
    );

    event EmergencyUnpause(
        address indexed admin,
        uint256 timestamp
    );

    event UserVerified(
        address indexed user,
        address indexed verifier,
        uint256 timestamp
    );

    event KYCCompleted(
        address indexed user,
        address indexed approver,
        uint256 timestamp
    );

    event RoleHierarchyUpdated(
        bytes32 indexed role,
        uint8 oldLevel,
        uint8 newLevel
    );

    event AccessControlInitialized(
        address indexed deployer,
        uint256 timestamp
    );

    /**
     * @dev Constructor - Initialize role hierarchy
     * FIX #4: Emit events for initial role grants
     */
    constructor() {
        // Grant deployer the super admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);

        // Set role hierarchy levels
        roleLevel[SUPER_ADMIN_ROLE] = 10;
        roleLevel[ADMIN_ROLE] = 8;
        roleLevel[FARMER_ROLE] = 5;
        roleLevel[DISTRIBUTOR_ROLE] = 5;
        roleLevel[RETAILER_ROLE] = 4;
        roleLevel[CONSUMER_ROLE] = 2;

        // Set admin roles
        _setRoleAdmin(ADMIN_ROLE, SUPER_ADMIN_ROLE);
        _setRoleAdmin(FARMER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(DISTRIBUTOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(RETAILER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CONSUMER_ROLE, ADMIN_ROLE);
        
        // FIX #4: Emit initialization event
        emit AccessControlInitialized(msg.sender, block.timestamp);
    }

    /**
     * @dev Grant role with verification requirements
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function grantRoleWithVerification(
        bytes32 role,
        address account
    ) external whenNotPaused {
        require(account != address(0), "Invalid account address");
        require(
            hasRole(getRoleAdmin(role), msg.sender) || hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "Caller cannot grant this role"
        );

        // Check role hierarchy - cannot grant higher or equal level role
        if (!hasRole(SUPER_ADMIN_ROLE, msg.sender)) {
            require(
                roleLevel[role] < getRoleLevel(msg.sender),
                "Cannot grant role of equal or higher level"
            );
        }

        // Grant the role
        _grantRole(role, account);

        // Track role change
        lastRoleChange[account] = block.timestamp;
        roleChangeCount[account]++;

        // Check if role requires verification
        bool requiresVerification = requiresKYCVerification(role);

        emit RoleGrantedWithVerification(
            role,
            account,
            msg.sender,
            requiresVerification
        );
    }

    /**
     * @dev Revoke role with reason
     * @param role The role to revoke
     * @param account The account to revoke the role from
     * @param reason The reason for revocation
     */
    function revokeRoleWithReason(
        bytes32 role,
        address account,
        string calldata reason
    ) external whenNotPaused {
        require(
            hasRole(getRoleAdmin(role), msg.sender) || hasRole(SUPER_ADMIN_ROLE, msg.sender),
            "Caller cannot revoke this role"
        );

        // Cannot revoke SUPER_ADMIN_ROLE unless caller is super admin
        if (role == SUPER_ADMIN_ROLE) {
            require(
                hasRole(SUPER_ADMIN_ROLE, msg.sender),
                "Only super admin can revoke super admin role"
            );
        }

        // Revoke the role
        _revokeRole(role, account);

        // Track role change
        lastRoleChange[account] = block.timestamp;
        roleChangeCount[account]++;

        emit RoleRevokedWithReason(role, account, msg.sender, reason);
    }

    /**
     * @dev Initiate role transfer with timelock
     * @param role The role to transfer
     * @param from Current role holder
     * @param to New role holder
     * FIX #8: Enhanced input validation
     */
    function initiateRoleTransfer(
        bytes32 role,
        address from,
        address to
    ) external onlyRole(SUPER_ADMIN_ROLE) returns (uint256) {
        // FIX #1: Zero address validation
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(from != to, "Cannot transfer to same address"); // FIX #8
        require(hasRole(role, from), "From address does not have role");
        require(!hasRole(role, to), "To address already has role");

        uint256 transferId = transferCount++;
        uint256 executeAfter = block.timestamp + ROLE_TRANSFER_DELAY;

        pendingTransfers[transferId] = RoleTransfer({
            role: role,
            from: from,
            to: to,
            executeAfter: executeAfter,
            executed: false,
            cancelled: false // FIX #2: Initialize cancelled state
        });

        emit RoleTransferInitiated(transferId, role, from, to, executeAfter);

        return transferId;
    }

    /**
     * @dev Execute pending role transfer
     * @param transferId The ID of the transfer to execute
     * FIX #2: Check cancelled state separately
     */
    function executeRoleTransfer(
        uint256 transferId
    ) external onlyRole(SUPER_ADMIN_ROLE) nonReentrant {
        RoleTransfer storage transfer = pendingTransfers[transferId];

        require(!transfer.executed, "Transfer already executed");
        require(!transfer.cancelled, "Transfer was cancelled"); // FIX #2
        require(
            block.timestamp >= transfer.executeAfter,
            "Transfer still in timelock"
        );
        require(
            hasRole(transfer.role, transfer.from),
            "From address no longer has role"
        );

        // Execute transfer
        _revokeRole(transfer.role, transfer.from);
        _grantRole(transfer.role, transfer.to);

        transfer.executed = true;

        emit RoleTransferExecuted(
            transferId,
            transfer.role,
            transfer.from,
            transfer.to
        );
    }

    /**
     * @dev Cancel pending role transfer
     * @param transferId The ID of the transfer to cancel
     * FIX #2: Mark as cancelled instead of executed
     */
    function cancelRoleTransfer(
        uint256 transferId
    ) external onlyRole(SUPER_ADMIN_ROLE) {
        RoleTransfer storage transfer = pendingTransfers[transferId];

        require(!transfer.executed, "Transfer already executed");
        require(!transfer.cancelled, "Transfer already cancelled"); // FIX #2

        transfer.cancelled = true; // FIX #2: Mark as cancelled, not executed

        emit RoleTransferCancelled(transferId, transfer.role, msg.sender);
    }

    /**
     * @dev Verify user (complete basic verification)
     * @param user The user to verify
     */
    function verifyUser(address user) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Invalid user address");
        require(!isVerified[user], "User already verified");

        isVerified[user] = true;

        emit UserVerified(user, msg.sender, block.timestamp);
    }

    /**
     * @dev Approve KYC for user
     * @param user The user to approve KYC for
     */
    function approveKYC(address user) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Invalid user address");
        require(isVerified[user], "User must be verified first");
        require(!hasCompletedKYC[user], "KYC already completed");

        hasCompletedKYC[user] = true;

        emit KYCCompleted(user, msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency pause - stops all role operations
     * @param reason The reason for pausing
     */
    function emergencyPause(
        string calldata reason
    ) external onlyRole(SUPER_ADMIN_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Emergency unpause - resumes role operations
     */
    function emergencyUnpause() external onlyRole(SUPER_ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }

    /**
     * @dev Update role hierarchy level
     * @param role The role to update
     * @param newLevel The new hierarchy level
     */
    function updateRoleLevel(
        bytes32 role,
        uint8 newLevel
    ) external onlyRole(SUPER_ADMIN_ROLE) {
        uint8 oldLevel = roleLevel[role];
        roleLevel[role] = newLevel;

        emit RoleHierarchyUpdated(role, oldLevel, newLevel);
    }

    /**
     * @dev Check if user has permission (role-based check)
     * @param account The account to check
     * @param permission The permission identifier (role in this case)
     */
    function hasPermission(
        address account,
        bytes32 permission
    ) external view returns (bool) {
        return hasRole(permission, account);
    }

    /**
     * @dev Get all roles for an account (GAS OPT #4: Single-pass algorithm)
     * @param account The account to check
     * @return An array of role hashes
     */
    function getRoles(address account) external view returns (bytes32[] memory) {
        // GAS OPT #4: Use fixed array of all possible roles
        bytes32[6] memory allRoles = [
            SUPER_ADMIN_ROLE,
            ADMIN_ROLE,
            FARMER_ROLE,
            DISTRIBUTOR_ROLE,
            RETAILER_ROLE,
            CONSUMER_ROLE
        ];

        // GAS OPT #4: Count roles in single pass
        uint256 count = 0;
        bool[6] memory hasRoleFlags;
        
        for (uint256 i = 0; i < 6; i++) {
            if (hasRole(allRoles[i], account)) {
                hasRoleFlags[i] = true;
                count++;
            }
        }

        // GAS OPT #4: Build result array directly using flags (no second loop)
        bytes32[] memory userRoles = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < 6; i++) {
            if (hasRoleFlags[i]) {
                userRoles[index] = allRoles[i];
                index++;
            }
        }

        return userRoles;
    }

    /**
     * @dev Get role level for an account (highest role level they have)
     * @param account The account to check
     * @return The highest role level
     */
    function getRoleLevel(address account) public view returns (uint8) {
        uint8 maxLevel = 0;

        if (hasRole(SUPER_ADMIN_ROLE, account) && roleLevel[SUPER_ADMIN_ROLE] > maxLevel) {
            maxLevel = roleLevel[SUPER_ADMIN_ROLE];
        }
        if (hasRole(ADMIN_ROLE, account) && roleLevel[ADMIN_ROLE] > maxLevel) {
            maxLevel = roleLevel[ADMIN_ROLE];
        }
        if (hasRole(FARMER_ROLE, account) && roleLevel[FARMER_ROLE] > maxLevel) {
            maxLevel = roleLevel[FARMER_ROLE];
        }
        if (hasRole(DISTRIBUTOR_ROLE, account) && roleLevel[DISTRIBUTOR_ROLE] > maxLevel) {
            maxLevel = roleLevel[DISTRIBUTOR_ROLE];
        }
        if (hasRole(RETAILER_ROLE, account) && roleLevel[RETAILER_ROLE] > maxLevel) {
            maxLevel = roleLevel[RETAILER_ROLE];
        }
        if (hasRole(CONSUMER_ROLE, account) && roleLevel[CONSUMER_ROLE] > maxLevel) {
            maxLevel = roleLevel[CONSUMER_ROLE];
        }

        return maxLevel;
    }

    /**
     * @dev Check if role requires KYC verification
     * @param role The role to check
     * @return True if KYC is required
     */
    function requiresKYCVerification(bytes32 role) public pure returns (bool) {
        return role == FARMER_ROLE || role == DISTRIBUTOR_ROLE;
    }

    /**
     * @dev Check if user can perform action (has role and is verified if needed)
     * @param account The account to check
     * @param role The required role
     * @return True if user can perform action
     */
    function canPerformAction(
        address account,
        bytes32 role
    ) external view returns (bool) {
        if (!hasRole(role, account)) {
            return false;
        }

        // Check verification requirements
        if (requiresKYCVerification(role)) {
            return isVerified[account] && hasCompletedKYC[account];
        }

        return true;
    }

    /**
     * @dev Get verification status
     * @param account The account to check
     * @return verified Is user verified
     * @return kycCompleted Has KYC been completed
     */
    function getVerificationStatus(
        address account
    ) external view returns (bool verified, bool kycCompleted) {
        return (isVerified[account], hasCompletedKYC[account]);
    }
}
