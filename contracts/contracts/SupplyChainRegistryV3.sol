// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SupplyChainRegistry V3
 * @dev Enhanced version with front-running protection and multi-sig
 * @notice Addresses issues #18, #19, #20 from security audit
 */
contract SupplyChainRegistryV3 is ReentrancyGuard {
    
    AgriChainAccessControl public accessControl;
    
    enum ProductStatus { Harvested, InTransit, AtWarehouse, Sold, Delivered, Cancelled }
    enum QualityGrade { A, B, C, Ungraded }
    
    struct Product {
        uint256 productId;
        string name;
        string category;
        address farmer;
        uint256 harvestDate;
        uint256 quantity;
        string unit;
        uint256 pricePerUnit;
        uint256 wholesalePrice;
        QualityGrade grade;
        ProductStatus status;
        string ipfsHash;
        bool isActive;
        bool isApproved;
        address approvedBy;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct OwnershipTransfer {
        address from;
        address to;
        uint256 timestamp;
        string location;
        uint256 blockNumber;
        uint256 transferPrice;
    }
    
    struct QualityCheck {
        address inspector;
        QualityGrade grade;
        uint256 timestamp;
        string comments;
        bool passed;
    }

    struct ProductBatch {
        uint256 batchId;
        uint256[] productIds;
        address creator;
        uint256 createdAt;
        string batchMetadata;
    }
    
    // FIX #18: Front-running protection via commit-reveal
    struct PriceCommitment {
        bytes32 commitmentHash;
        uint256 timestamp;
        bool revealed;
    }
    
    // State variables
    uint256 public productCount;
    uint256 public batchCount;
    uint256 public constant MAX_BATCH_SIZE = 100;
    uint256 public constant REVEAL_DELAY = 5 minutes;
    
    mapping(uint256 => Product) public products;
    mapping(uint256 => OwnershipTransfer[]) public ownershipHistory;
    mapping(uint256 => QualityCheck[]) public qualityHistory;
    mapping(uint256 => address) public currentOwner;
    mapping(address => uint256[]) public userProducts;
    mapping(uint256 => ProductBatch) public batches;
    mapping(bytes32 => bool) private batchHashes;
    
    // FIX #18: Price commitment tracking
    mapping(uint256 => mapping(address => PriceCommitment)) public priceCommitments;
    
    // FIX #19, #20: Multi-sig support
    address public multiSigWallet;
    bool public multiSigEnabled;
    
    // Rate limiting
    mapping(address => uint256) public productsCreatedToday;
    mapping(address => uint256) public lastProductCreationReset;
    
    // Events
    event ProductRegistered(
        uint256 indexed productId,
        address indexed farmer,
        string name,
        uint256 quantity,
        uint256 timestamp
    );
    
    event ProductApproved(
        uint256 indexed productId,
        address indexed approver,
        uint256 timestamp
    );

    event ProductRejected(
        uint256 indexed productId,
        address indexed rejector,
        string reason,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        uint256 timestamp,
        string location
    );
    
    event QualityCheckAdded(
        uint256 indexed productId,
        address indexed inspector,
        QualityGrade grade,
        bool passed,
        uint256 timestamp
    );
    
    event StatusUpdated(
        uint256 indexed productId,
        ProductStatus oldStatus,
        ProductStatus newStatus,
        address indexed updatedBy,
        uint256 timestamp
    );

    event ProductDeactivated(
        uint256 indexed productId,
        address indexed deactivatedBy,
        string reason,
        uint256 timestamp
    );

    event BatchCreated(
        uint256 indexed batchId,
        address indexed creator,
        uint256 productCount,
        uint256 timestamp
    );
    
    // FIX #18: Price commitment events
    event PriceCommitted(
        uint256 indexed productId,
        address indexed owner,
        bytes32 commitmentHash,
        uint256 timestamp
    );
    
    event PriceRevealed(
        uint256 indexed productId,
        address indexed owner,
        uint256 newPrice,
        uint256 timestamp
    );
    
    // FIX #19, #20: Multi-sig events
    event MultiSigWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event MultiSigEnabled(bool enabled);
    
    // Modifiers
    modifier onlyRole(bytes32 role) {
        require(
            accessControl.hasRole(role, msg.sender),
            "AccessControl: sender does not have required role"
        );
        _;
    }

    modifier onlyVerified() {
        (bool verified, bool kycCompleted) = accessControl.getVerificationStatus(msg.sender);
        require(verified && kycCompleted, "User must complete KYC verification");
        _;
    }

    modifier canPerformAction(bytes32 role) {
        require(
            accessControl.canPerformAction(msg.sender, role),
            "User cannot perform this action - verification required"
        );
        _;
    }

    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId <= productCount, "Product does not exist");
        require(products[_productId].isActive, "Product is not active");
        _;
    }

    modifier onlyProductOwner(uint256 _productId) {
        require(
            currentOwner[_productId] == msg.sender,
            "Only product owner can perform this action"
        );
        _;
    }

    modifier onlyFarmerOrAdmin(uint256 _productId) {
        bool isOwner = products[_productId].farmer == msg.sender;
        bool isAdmin = accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
                      accessControl.hasRole(accessControl.SUPER_ADMIN_ROLE(), msg.sender);
        require(isOwner || isAdmin, "Only farmer or admin can perform this action");
        _;
    }
    
    modifier onlyMultiSigOrAdmin() {
        if (multiSigEnabled) {
            require(msg.sender == multiSigWallet, "Only multi-sig can execute");
        } else {
            require(
                accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
                accessControl.hasRole(accessControl.SUPER_ADMIN_ROLE(), msg.sender),
                "Only admin can execute"
            );
        }
        _;
    }

    constructor(address _accessControl) {
        require(_accessControl != address(0), "Invalid AccessControl address");
        accessControl = AgriChainAccessControl(_accessControl);
        multiSigEnabled = false;
    }

    function registerProduct(
        string memory _name,
        string memory _category,
        uint256 _quantity,
        string memory _unit,
        uint256 _pricePerUnit,
        uint256 _wholesalePrice,
        string memory _ipfsHash
    ) external canPerformAction(accessControl.FARMER_ROLE()) nonReentrant returns (uint256) {
        require(bytes(_name).length > 0 && bytes(_name).length <= 100, "Invalid product name length");
        require(bytes(_category).length > 0 && bytes(_category).length <= 50, "Invalid category length");
        require(_quantity > 0 && _quantity <= 1000000, "Invalid quantity");
        require(bytes(_unit).length > 0 && bytes(_unit).length <= 20, "Invalid unit length");
        require(_pricePerUnit > 0 && _pricePerUnit <= 10000 ether, "Invalid price range");
        require(_wholesalePrice > 0 && _wholesalePrice <= _pricePerUnit, "Wholesale price must be <= retail price");
        require(bytes(_ipfsHash).length > 0 && bytes(_ipfsHash).length <= 100, "Invalid IPFS hash");

        _checkAndUpdateRateLimit(msg.sender, 50);

        productCount++;
        uint256 productId = productCount;

        products[productId] = Product({
            productId: productId,
            name: _name,
            category: _category,
            farmer: msg.sender,
            harvestDate: block.timestamp,
            quantity: _quantity,
            unit: _unit,
            pricePerUnit: _pricePerUnit,
            wholesalePrice: _wholesalePrice,
            grade: QualityGrade.Ungraded,
            status: ProductStatus.Harvested,
            ipfsHash: _ipfsHash,
            isActive: true,
            isApproved: false,
            approvedBy: address(0),
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        currentOwner[productId] = msg.sender;
        userProducts[msg.sender].push(productId);

        ownershipHistory[productId].push(OwnershipTransfer({
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            location: "Farm/Origin",
            blockNumber: block.number,
            transferPrice: 0
        }));

        emit ProductRegistered(
            productId,
            msg.sender,
            _name,
            _quantity,
            block.timestamp
        );

        return productId;
    }

    /**
     * @dev FIX #18: Commit to a price update (step 1 of commit-reveal)
     * @param _productId Product ID
     * @param _commitmentHash Hash of (productId, newPrice, salt, sender)
     */
    function commitPriceUpdate(
        uint256 _productId,
        bytes32 _commitmentHash
    ) external productExists(_productId) onlyProductOwner(_productId) {
        require(_commitmentHash != bytes32(0), "Invalid commitment hash");
        
        PriceCommitment storage commitment = priceCommitments[_productId][msg.sender];
        require(commitment.timestamp == 0 || commitment.revealed, "Previous commitment not revealed");
        
        priceCommitments[_productId][msg.sender] = PriceCommitment({
            commitmentHash: _commitmentHash,
            timestamp: block.timestamp,
            revealed: false
        });
        
        emit PriceCommitted(_productId, msg.sender, _commitmentHash, block.timestamp);
    }
    
    /**
     * @dev FIX #18: Reveal and execute price update (step 2 of commit-reveal)
     * @param _productId Product ID
     * @param _newPrice New price per unit
     * @param _salt Random salt used in commitment
     */
    function revealPriceUpdate(
        uint256 _productId,
        uint256 _newPrice,
        bytes32 _salt
    ) external productExists(_productId) onlyProductOwner(_productId) {
        PriceCommitment storage commitment = priceCommitments[_productId][msg.sender];
        
        require(commitment.timestamp > 0, "No commitment found");
        require(!commitment.revealed, "Already revealed");
        require(
            block.timestamp >= commitment.timestamp + REVEAL_DELAY,
            "Reveal delay not met"
        );
        require(
            block.timestamp <= commitment.timestamp + 1 hours,
            "Commitment expired"
        );
        
        // Verify commitment
        bytes32 computedHash = keccak256(abi.encodePacked(_productId, _newPrice, _salt, msg.sender));
        require(computedHash == commitment.commitmentHash, "Invalid reveal");
        
        // Validate new price
        require(_newPrice > 0 && _newPrice <= 10000 ether, "Invalid price range");
        
        // Update price
        Product storage product = products[_productId];
        product.pricePerUnit = _newPrice;
        product.updatedAt = block.timestamp;
        
        commitment.revealed = true;
        
        emit PriceRevealed(_productId, msg.sender, _newPrice, block.timestamp);
    }

    function approveProduct(
        uint256 _productId
    ) external onlyRole(accessControl.ADMIN_ROLE()) productExists(_productId) {
        Product storage product = products[_productId];
        require(!product.isApproved, "Product already approved");

        product.isApproved = true;
        product.approvedBy = msg.sender;
        product.updatedAt = block.timestamp;

        emit ProductApproved(_productId, msg.sender, block.timestamp);
    }

    function rejectProduct(
        uint256 _productId,
        string memory _reason
    ) external onlyRole(accessControl.ADMIN_ROLE()) productExists(_productId) {
        Product storage product = products[_productId];
        
        product.isActive = false;
        product.updatedAt = block.timestamp;

        emit ProductRejected(_productId, msg.sender, _reason, block.timestamp);
    }

    function transferOwnership(
        uint256 _productId,
        address _to,
        string memory _location,
        uint256 _transferPrice
    ) external payable productExists(_productId) onlyProductOwner(_productId) nonReentrant {
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot transfer to self");
        require(products[_productId].isApproved, "Product must be approved first");
        require(msg.value == _transferPrice, "Payment must match transfer price");
        require(_transferPrice > 0, "Transfer price must be greater than 0");

        bool hasDistributorRole = accessControl.hasRole(accessControl.DISTRIBUTOR_ROLE(), _to);
        bool hasRetailerRole = accessControl.hasRole(accessControl.RETAILER_ROLE(), _to);
        bool hasConsumerRole = accessControl.hasRole(accessControl.CONSUMER_ROLE(), _to);
        
        require(
            hasDistributorRole || hasRetailerRole || hasConsumerRole,
            "Recipient must have buyer role"
        );

        address previousOwner = currentOwner[_productId];
        _removeProductFromUser(previousOwner, _productId);
        
        currentOwner[_productId] = _to;
        userProducts[_to].push(_productId);

        ownershipHistory[_productId].push(OwnershipTransfer({
            from: previousOwner,
            to: _to,
            timestamp: block.timestamp,
            location: _location,
            blockNumber: block.number,
            transferPrice: _transferPrice
        }));

        Product storage product = products[_productId];
        product.updatedAt = block.timestamp;
        
        (bool success, ) = previousOwner.call{value: msg.value}("");
        require(success, "Payment transfer failed");

        emit OwnershipTransferred(
            _productId,
            previousOwner,
            _to,
            block.timestamp,
            _location
        );
    }

    function addQualityCheck(
        uint256 _productId,
        QualityGrade _grade,
        string memory _comments,
        bool _passed
    ) external onlyRole(accessControl.ADMIN_ROLE()) productExists(_productId) {
        qualityHistory[_productId].push(QualityCheck({
            inspector: msg.sender,
            grade: _grade,
            timestamp: block.timestamp,
            comments: _comments,
            passed: _passed
        }));

        Product storage product = products[_productId];
        product.grade = _grade;
        product.updatedAt = block.timestamp;

        emit QualityCheckAdded(
            _productId,
            msg.sender,
            _grade,
            _passed,
            block.timestamp
        );
    }

    function updateStatus(
        uint256 _productId,
        ProductStatus _newStatus
    ) external productExists(_productId) onlyFarmerOrAdmin(_productId) {
        Product storage product = products[_productId];
        ProductStatus oldStatus = product.status;

        require(oldStatus != _newStatus, "Status is already set to this value");

        product.status = _newStatus;
        product.updatedAt = block.timestamp;

        emit StatusUpdated(
            _productId,
            oldStatus,
            _newStatus,
            msg.sender,
            block.timestamp
        );
    }

    function deactivateProduct(
        uint256 _productId,
        string memory _reason
    ) external productExists(_productId) onlyFarmerOrAdmin(_productId) {
        Product storage product = products[_productId];
        product.isActive = false;
        product.updatedAt = block.timestamp;

        emit ProductDeactivated(_productId, msg.sender, _reason, block.timestamp);
    }

    function createBatch(
        uint256[] memory _productIds,
        string memory _batchMetadata
    ) external canPerformAction(accessControl.FARMER_ROLE()) returns (uint256) {
        require(_productIds.length > 0, "Batch must contain at least one product");
        require(_productIds.length <= MAX_BATCH_SIZE, "Batch size exceeds maximum limit");

        bytes32 batchHash = keccak256(abi.encodePacked(_productIds, msg.sender));
        require(!batchHashes[batchHash], "Duplicate batch already exists");

        for (uint256 i = 0; i < _productIds.length; i++) {
            require(
                products[_productIds[i]].farmer == msg.sender,
                "All products must belong to caller"
            );
            
            for (uint256 j = i + 1; j < _productIds.length; j++) {
                require(_productIds[i] != _productIds[j], "Duplicate product in batch");
            }
        }

        batchCount++;
        uint256 batchId = batchCount;

        batches[batchId] = ProductBatch({
            batchId: batchId,
            productIds: _productIds,
            creator: msg.sender,
            createdAt: block.timestamp,
            batchMetadata: _batchMetadata
        });
        
        batchHashes[batchHash] = true;

        emit BatchCreated(batchId, msg.sender, _productIds.length, block.timestamp);

        return batchId;
    }
    
    /**
     * @dev FIX #19, #20: Set multi-sig wallet
     * @param _multiSigWallet Multi-sig wallet address
     */
    function setMultiSigWallet(address _multiSigWallet) external onlyRole(accessControl.SUPER_ADMIN_ROLE()) {
        require(_multiSigWallet != address(0), "Invalid multi-sig address");
        address oldWallet = multiSigWallet;
        multiSigWallet = _multiSigWallet;
        emit MultiSigWalletUpdated(oldWallet, _multiSigWallet);
    }
    
    /**
     * @dev FIX #19, #20: Enable or disable multi-sig
     * @param _enabled True to enable
     */
    function setMultiSigEnabled(bool _enabled) external onlyRole(accessControl.SUPER_ADMIN_ROLE()) {
        require(multiSigWallet != address(0), "Multi-sig wallet not set");
        multiSigEnabled = _enabled;
        emit MultiSigEnabled(_enabled);
    }

    // View functions
    
    function getProduct(
        uint256 _productId
    ) external view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }

    function getOwnershipHistory(
        uint256 _productId
    ) external view productExists(_productId) returns (OwnershipTransfer[] memory) {
        return ownershipHistory[_productId];
    }

    function getQualityHistory(
        uint256 _productId
    ) external view productExists(_productId) returns (QualityCheck[] memory) {
        return qualityHistory[_productId];
    }

    function getUserProducts(
        address _user,
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory, uint256) {
        uint256[] memory allProducts = userProducts[_user];
        uint256 totalCount = allProducts.length;
        
        if (_offset >= totalCount) {
            return (new uint256[](0), totalCount);
        }
        
        uint256 end = _offset + _limit;
        if (end > totalCount) {
            end = totalCount;
        }
        
        uint256 resultSize = end - _offset;
        uint256[] memory result = new uint256[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = allProducts[_offset + i];
        }
        
        return (result, totalCount);
    }
    
    function getUserProductCount(
        address _user
    ) external view returns (uint256) {
        return userProducts[_user].length;
    }

    function getBatch(
        uint256 _batchId
    ) external view returns (ProductBatch memory) {
        require(_batchId > 0 && _batchId <= batchCount, "Batch does not exist");
        return batches[_batchId];
    }

    function _checkAndUpdateRateLimit(address _user, uint256 _dailyLimit) private {
        if (block.timestamp >= lastProductCreationReset[_user] + 1 days) {
            productsCreatedToday[_user] = 0;
            lastProductCreationReset[_user] = block.timestamp;
        }

        require(
            productsCreatedToday[_user] < _dailyLimit,
            "Daily product creation limit reached"
        );

        productsCreatedToday[_user]++;
    }
    
    function _removeProductFromUser(address _user, uint256 _productId) internal {
        uint256[] storage userProductList = userProducts[_user];
        for (uint256 i = 0; i < userProductList.length; i++) {
            if (userProductList[i] == _productId) {
                userProductList[i] = userProductList[userProductList.length - 1];
                userProductList.pop();
                break;
            }
        }
    }

    function getCurrentOwner(
        uint256 _productId
    ) external view productExists(_productId) returns (address) {
        return currentOwner[_productId];
    }

    function isProductOwner(
        uint256 _productId,
        address _user
    ) external view returns (bool) {
        if (_productId == 0 || _productId > productCount) {
            return false;
        }
        return currentOwner[_productId] == _user;
    }
}
