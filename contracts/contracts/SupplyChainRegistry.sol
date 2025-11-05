// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SupplyChainRegistry
 * @dev Main contract for managing agricultural supply chain
 * @notice Handles product registration, ownership transfers, and quality checks
 */
contract SupplyChainRegistry is AccessControl, ReentrancyGuard, Pausable {
    
    // Role definitions
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Enums
    enum ProductStatus { Harvested, InTransit, AtWarehouse, Sold, Delivered }
    enum QualityGrade { A, B, C }
    
    // Structs
    struct Product {
        uint256 productId;
        string name;
        string category;
        address farmer; // FIX #5: This now stores ORIGINAL FARMER only, not current owner
        uint256 harvestDate;
        uint256 quantity;
        string unit;
        uint256 pricePerUnit;
        QualityGrade grade;
        ProductStatus status;
        string ipfsHash;
        bool isActive;
        uint256 createdAt;
    }
    
    struct OwnershipTransfer {
        address from;
        address to;
        uint256 timestamp;
        string location;
        uint256 blockNumber;
        uint256 transferPrice; // FIX #3: Add price to track payments
    }
    
    struct QualityCheck {
        address inspector;
        uint256 timestamp;
        QualityGrade grade;
        string reportHash;
        string notes;
    }
    
    // State variables
    uint256 private productCounter;
    mapping(uint256 => Product) public products;
    mapping(uint256 => OwnershipTransfer[]) public productHistory;
    mapping(uint256 => QualityCheck[]) public qualityChecks;
    mapping(address => uint256[]) public userProducts;
    mapping(uint256 => address) public currentOwner; // FIX #5: Track current owner separately
    
    // Events
    event ProductRegistered(
        uint256 indexed productId,
        address indexed farmer,
        string name,
        uint256 quantity,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event ProductStatusUpdated(
        uint256 indexed productId,
        ProductStatus newStatus,
        string location,
        uint256 timestamp
    );
    
    event QualityCheckAdded(
        uint256 indexed productId,
        address indexed inspector,
        QualityGrade grade,
        uint256 timestamp
    );
    
    event ProductPriceUpdated(
        uint256 indexed productId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // Modifiers
    modifier onlyProductOwner(uint256 _productId) {
        // FIX #5: Use currentOwner mapping, not product.farmer
        require(
            currentOwner[_productId] == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId <= productCounter, "Invalid product ID");
        require(products[_productId].isActive, "Product does not exist");
        _;
    }
    
    // Main Functions
    
    /**
     * @dev Register a new product on the blockchain
     * @param _name Product name
     * @param _category Product category
     * @param _quantity Quantity available
     * @param _unit Unit of measurement
     * @param _pricePerUnit Price per unit
     * @param _harvestDate Harvest date timestamp
     * @param _grade Quality grade
     * @param _ipfsHash IPFS hash for metadata
     * @return uint256 New product ID
     */
    function registerProduct(
        string memory _name,
        string memory _category,
        uint256 _quantity,
        string memory _unit,
        uint256 _pricePerUnit,
        uint256 _harvestDate,
        QualityGrade _grade,
        string memory _ipfsHash
    ) external whenNotPaused returns (uint256) {
        require(hasRole(FARMER_ROLE, msg.sender), "Only farmers can register");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_pricePerUnit > 0, "Price must be greater than 0");
        require(_harvestDate <= block.timestamp, "Invalid harvest date");
        
        productCounter++;
        uint256 newProductId = productCounter;
        
        products[newProductId] = Product({
            productId: newProductId,
            name: _name,
            category: _category,
            farmer: msg.sender, // FIX #5: This stores ORIGINAL farmer, never changes
            harvestDate: _harvestDate,
            quantity: _quantity,
            unit: _unit,
            pricePerUnit: _pricePerUnit,
            grade: _grade,
            status: ProductStatus.Harvested,
            ipfsHash: _ipfsHash,
            isActive: true,
            createdAt: block.timestamp
        });
        
        currentOwner[newProductId] = msg.sender; // FIX #5: Set initial owner
        userProducts[msg.sender].push(newProductId);
        
        productHistory[newProductId].push(OwnershipTransfer({
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            location: "Farm Registration",
            blockNumber: block.number,
            transferPrice: 0 // FIX #3: Initial registration has no price
        }));
        
        emit ProductRegistered(
            newProductId,
            msg.sender,
            _name,
            _quantity,
            block.timestamp
        );
        
        return newProductId;
    }
    
    /**
     * @dev Transfer product ownership with payment enforcement
     * @param _productId Product ID to transfer
     * @param _to New owner address
     * @param _location Current location
     * @param _transferPrice Price of transfer
     */
    function transferOwnership(
        uint256 _productId,
        address _to,
        string memory _location,
        uint256 _transferPrice
    ) external payable
        productExists(_productId)
        onlyProductOwner(_productId)
        whenNotPaused
    {
        require(_to != address(0), "Invalid address");
        require(_to != msg.sender, "Cannot transfer to yourself");
        
        // GAS OPT #5: Cache role checks to avoid multiple external calls
        bool hasDistributorRole = hasRole(DISTRIBUTOR_ROLE, _to);
        bool hasRetailerRole = hasRole(RETAILER_ROLE, _to);
        bool hasFarmerRole = hasRole(FARMER_ROLE, _to);
        
        require(
            hasDistributorRole || hasRetailerRole || hasFarmerRole,
            "Invalid recipient role"
        );
        
        // FIX #3: Enforce payment
        require(msg.value == _transferPrice, "Payment must match transfer price");
        require(_transferPrice > 0, "Transfer price must be greater than 0");
        
        address previousOwner = currentOwner[_productId]; // FIX #5: Use currentOwner
        
        // FIX #4: Remove from previous owner's array
        _removeProductFromUser(previousOwner, _productId);
        
        // Update current owner (product.farmer stays as original farmer)
        currentOwner[_productId] = _to;
        
        productHistory[_productId].push(OwnershipTransfer({
            from: previousOwner,
            to: _to,
            timestamp: block.timestamp,
            location: _location,
            blockNumber: block.number,
            transferPrice: _transferPrice // FIX #3: Store price
        }));
        
        userProducts[_to].push(_productId);
        
        // FIX #3: Transfer payment to previous owner
        (bool success, ) = previousOwner.call{value: msg.value}("");
        require(success, "Payment transfer failed");
        
        emit OwnershipTransferred(
            _productId,
            previousOwner,
            _to,
            block.timestamp
        );
    }
    
    /**
     * @dev Update product status
     * @param _productId Product ID
     * @param _newStatus New status
     * @param _location Current location
     */
    function updateProductStatus(
        uint256 _productId,
        ProductStatus _newStatus,
        string memory _location
    ) external 
        productExists(_productId)
        onlyProductOwner(_productId)
        whenNotPaused
    {
        Product storage product = products[_productId];
        product.status = _newStatus;
        
        emit ProductStatusUpdated(
            _productId,
            _newStatus,
            _location,
            block.timestamp
        );
    }
    
    /**
     * @dev Add quality check record
     * @param _productId Product ID
     * @param _grade Quality grade
     * @param _reportHash IPFS hash of quality report
     * @param _notes Additional notes
     */
    function addQualityCheck(
        uint256 _productId,
        QualityGrade _grade,
        string memory _reportHash,
        string memory _notes
    ) external 
        productExists(_productId)
        whenNotPaused
    {
        require(
            hasRole(ADMIN_ROLE, msg.sender) ||
            products[_productId].farmer == msg.sender,
            "Not authorized"
        );
        
        qualityChecks[_productId].push(QualityCheck({
            inspector: msg.sender,
            timestamp: block.timestamp,
            grade: _grade,
            reportHash: _reportHash,
            notes: _notes
        }));
        
        products[_productId].grade = _grade;
        
        emit QualityCheckAdded(
            _productId,
            msg.sender,
            _grade,
            block.timestamp
        );
    }
    
    /**
     * @dev Update product price
     * @param _productId Product ID
     * @param _newPrice New price per unit
     */
    function updateProductPrice(
        uint256 _productId,
        uint256 _newPrice
    ) external 
        productExists(_productId)
        onlyProductOwner(_productId)
        whenNotPaused
    {
        require(_newPrice > 0, "Price must be greater than 0");
        
        Product storage product = products[_productId];
        uint256 oldPrice = product.pricePerUnit;
        product.pricePerUnit = _newPrice;
        
        emit ProductPriceUpdated(_productId, oldPrice, _newPrice, block.timestamp);
    }
    
    /**
     * @dev Update product quantity
     * @param _productId Product ID
     * @param _newQuantity New quantity
     */
    function updateProductQuantity(
        uint256 _productId,
        uint256 _newQuantity
    ) external 
        productExists(_productId)
        onlyProductOwner(_productId)
        whenNotPaused
    {
        require(_newQuantity > 0, "Quantity must be greater than 0");
        products[_productId].quantity = _newQuantity;
    }
    
    /**
     * @dev Deactivate a product
     * @param _productId Product ID
     */
    function deactivateProduct(uint256 _productId) 
        external 
        productExists(_productId)
        onlyProductOwner(_productId)
    {
        products[_productId].isActive = false;
    }
    
    // View functions
    
    /**
     * @dev Get product details
     * @param _productId Product ID
     * @return Product Product struct
     */
    function getProduct(uint256 _productId) 
        external 
        view 
        productExists(_productId)
        returns (Product memory) 
    {
        return products[_productId];
    }
    
    /**
     * @dev Get product ownership history
     * @param _productId Product ID
     * @return OwnershipTransfer[] Array of ownership transfers
     */
    function getProductHistory(uint256 _productId) 
        external 
        view 
        productExists(_productId)
        returns (OwnershipTransfer[] memory) 
    {
        return productHistory[_productId];
    }
    
    /**
     * @dev Get product quality checks
     * @param _productId Product ID
     * @return QualityCheck[] Array of quality checks
     */
    function getQualityChecks(uint256 _productId) 
        external 
        view 
        productExists(_productId)
        returns (QualityCheck[] memory) 
    {
        return qualityChecks[_productId];
    }
    
    /**
     * @dev Get all products owned by a user (GAS OPT #2: Added pagination)
     * @param _user User address
     * @param _offset Starting index
     * @param _limit Maximum number of results
     * @return uint256[] Array of product IDs
     * @return uint256 Total count
     */
    function getUserProducts(address _user, uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory, uint256) 
    {
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
    
    /**
     * @dev Get product count for a user (GAS OPT #2: Efficient count)
     * @param _user User address
     * @return uint256 Number of products owned
     */
    function getUserProductCount(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return userProducts[_user].length;
    }
    
    /**
     * @dev Get total number of products
     * @return uint256 Total products
     */
    function getTotalProducts() external view returns (uint256) {
        return productCounter;
    }
    
    /**
     * @dev Get current product owner (FIX #5: Return currentOwner, not farmer)
     * @param _productId Product ID
     * @return address Current owner address
     */
    function getCurrentOwner(uint256 _productId) 
        external 
        view 
        productExists(_productId)
        returns (address) 
    {
        return currentOwner[_productId];
    }
    
    /**
     * @dev Remove product from user's array (FIX #4: Clean up ownership tracking)
     * @param _user User address
     * @param _productId Product ID to remove
     */
    function _removeProductFromUser(address _user, uint256 _productId) internal {
        uint256[] storage userProductList = userProducts[_user];
        for (uint256 i = 0; i < userProductList.length; i++) {
            if (userProductList[i] == _productId) {
                // Move last element to this position and pop
                userProductList[i] = userProductList[userProductList.length - 1];
                userProductList.pop();
                break;
            }
        }
    }
    
    // Admin functions
    
    /**
     * @dev Grant role to user
     * @param role Role to grant
     * @param account User address
     */
    function grantRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(ADMIN_ROLE) 
    {
        super.grantRole(role, account);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
