// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PaymentContractEnhanced
 * @dev Enhanced version with rate limiting and multi-sig support
 * @notice Addresses issues #16, #19, #20 from security audit
 */
contract PaymentContractEnhanced is ReentrancyGuard, Ownable, Pausable {
    
    enum PaymentStatus { Created, Escrowed, Released, Refunded, Disputed }
    
    struct Payment {
        uint256 paymentId;
        uint256 orderId;
        address buyer;
        address seller;
        uint256 amount;
        PaymentStatus status;
        uint256 createdAt;
        uint256 releaseTime;
        bool disputed;
        uint256 feePercent;
    }
    
    // State variables
    uint256 private paymentCounter;
    mapping(uint256 => Payment) public payments;
    mapping(uint256 => uint256) public orderToPayment;
    mapping(address => uint256[]) public userPayments;
    
    uint256 public platformFeePercent = 2;
    uint256 public constant MAX_FEE_PERCENT = 10;
    address public platformWallet;
    
    // FIX #16: Rate limiting for payment creation
    mapping(address => uint256) public paymentsCreatedToday;
    mapping(address => uint256) public lastPaymentCreationReset;
    uint256 public constant DAILY_PAYMENT_LIMIT = 20;
    
    // FIX #19, #20: Multi-sig support
    address public multiSigWallet;
    bool public multiSigEnabled;
    
    // Events
    event PaymentCreated(
        uint256 indexed paymentId,
        uint256 indexed orderId,
        address indexed buyer,
        address seller,
        uint256 amount
    );
    
    event PaymentEscrowed(uint256 indexed paymentId, uint256 timestamp);
    event PaymentReleased(uint256 indexed paymentId, uint256 amount, uint256 timestamp);
    event PaymentRefunded(uint256 indexed paymentId, uint256 amount, uint256 timestamp);
    event DisputeRaised(uint256 indexed paymentId, address indexed raisedBy, uint256 timestamp);
    event DisputeResolved(uint256 indexed paymentId, address winner, uint256 timestamp);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event PlatformFeeChanged(uint256 oldFee, uint256 newFee, uint256 timestamp);
    event ContractInitialized(address indexed owner, address indexed platformWallet, uint256 feePercent);
    event RateLimitExceeded(address indexed user, uint256 attemptedCount, uint256 timestamp);
    event MultiSigWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event MultiSigEnabled(bool enabled);
    
    // Modifiers
    modifier onlyMultiSigOrOwner() {
        if (multiSigEnabled) {
            require(msg.sender == multiSigWallet, "Only multi-sig can execute");
        } else {
            require(msg.sender == owner(), "Only owner can execute");
        }
        _;
    }
    
    /**
     * @dev Constructor
     * @param _platformWallet Address to receive platform fees
     */
    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        multiSigEnabled = false;
        
        emit ContractInitialized(msg.sender, _platformWallet, platformFeePercent);
    }
    
    /**
     * @dev Create a new escrow payment with rate limiting
     * @param _orderId Associated order ID
     * @param _seller Seller address
     * @param _releaseTime Timestamp when payment can be auto-released
     * @return uint256 Payment ID
     */
    function createPayment(
        uint256 _orderId,
        address _seller,
        uint256 _releaseTime
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        // FIX #16: Check rate limit
        _checkPaymentRateLimit(msg.sender);
        
        // Input validation
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(msg.value <= 1000 ether, "Payment exceeds maximum limit");
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Buyer and seller cannot be same");
        require(_orderId > 0, "Invalid order ID");
        require(_releaseTime > block.timestamp, "Release time must be in future");
        require(_releaseTime <= block.timestamp + 365 days, "Release time too far in future");
        require(orderToPayment[_orderId] == 0, "Payment already exists for this order");
        
        paymentCounter++;
        uint256 newPaymentId = paymentCounter;
        
        payments[newPaymentId] = Payment({
            paymentId: newPaymentId,
            orderId: _orderId,
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            status: PaymentStatus.Escrowed,
            createdAt: block.timestamp,
            releaseTime: _releaseTime,
            disputed: false,
            feePercent: platformFeePercent
        });
        
        orderToPayment[_orderId] = newPaymentId;
        userPayments[msg.sender].push(newPaymentId);
        userPayments[_seller].push(newPaymentId);
        
        emit PaymentCreated(newPaymentId, _orderId, msg.sender, _seller, msg.value);
        emit PaymentEscrowed(newPaymentId, block.timestamp);
        
        return newPaymentId;
    }
    
    /**
     * @dev Release escrowed payment to seller
     * @param _paymentId Payment ID to release
     */
    function releasePayment(uint256 _paymentId) 
        external 
        nonReentrant 
        whenNotPaused
    {
        Payment storage payment = payments[_paymentId];
        
        uint256 amount = payment.amount;
        uint256 feePercent = payment.feePercent;
        address seller = payment.seller;
        
        require(payment.status == PaymentStatus.Escrowed, "Invalid payment status");
        require(!payment.disputed, "Payment is disputed");
        require(
            msg.sender == payment.buyer || 
            msg.sender == owner(),
            "Only buyer or owner can release"
        );
        
        payment.status = PaymentStatus.Released;
        
        _transferPaymentToSeller(seller, amount, feePercent);
        
        emit PaymentReleased(_paymentId, amount, block.timestamp);
    }
    
    /**
     * @dev Request refund and raise dispute
     * @param _paymentId Payment ID
     */
    function requestRefund(uint256 _paymentId) 
        external 
        nonReentrant 
        whenNotPaused
    {
        Payment storage payment = payments[_paymentId];
        require(payment.buyer == msg.sender, "Only buyer can request refund");
        require(payment.status == PaymentStatus.Escrowed, "Invalid payment status");
        require(!payment.disputed, "Payment already disputed");
        
        payment.disputed = true;
        
        emit DisputeRaised(_paymentId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Resolve payment dispute (admin only)
     * @param _paymentId Payment ID
     * @param refundBuyer True to refund buyer, false to release to seller
     */
    function resolveDispute(uint256 _paymentId, bool refundBuyer) 
        external 
        onlyOwner 
        nonReentrant 
    {
        Payment storage payment = payments[_paymentId];
        
        uint256 amount = payment.amount;
        address buyer = payment.buyer;
        address seller = payment.seller;
        uint256 feePercent = payment.feePercent;
        
        require(payment.disputed, "No dispute to resolve");
        require(payment.status == PaymentStatus.Escrowed, "Invalid payment status");
        
        address winner;
        
        if (refundBuyer) {
            payment.status = PaymentStatus.Refunded;
            (bool success, ) = buyer.call{value: amount}("");
            require(success, "Refund failed");
            winner = buyer;
            emit PaymentRefunded(_paymentId, amount, block.timestamp);
        } else {
            payment.status = PaymentStatus.Released;
            _transferPaymentToSeller(seller, amount, feePercent);
            winner = seller;
            emit PaymentReleased(_paymentId, amount, block.timestamp);
        }
        
        payment.disputed = false;
        emit DisputeResolved(_paymentId, winner, block.timestamp);
    }
    
    /**
     * @dev Cancel payment before escrow (buyer only, within grace period)
     * @param _paymentId Payment ID
     */
    function cancelPayment(uint256 _paymentId) 
        external 
        nonReentrant 
        whenNotPaused
    {
        Payment storage payment = payments[_paymentId];
        require(payment.buyer == msg.sender, "Only buyer can cancel");
        require(payment.status == PaymentStatus.Escrowed, "Invalid payment status");
        require(block.timestamp <= payment.createdAt + 1 hours, "Grace period expired");
        require(!payment.disputed, "Cannot cancel disputed payment");
        
        payment.status = PaymentStatus.Refunded;
        
        (bool success, ) = payment.buyer.call{value: payment.amount}("");
        require(success, "Refund failed");
        
        emit PaymentRefunded(_paymentId, payment.amount, block.timestamp);
    }
    
    // View functions
    
    function getPayment(uint256 _paymentId) 
        external 
        view 
        returns (Payment memory) 
    {
        return payments[_paymentId];
    }
    
    function getPaymentByOrder(uint256 _orderId) 
        external 
        view 
        returns (Payment memory) 
    {
        uint256 paymentId = orderToPayment[_orderId];
        require(paymentId > 0, "Payment not found");
        return payments[paymentId];
    }
    
    function getUserPayments(address _user, uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory, uint256) 
    {
        uint256[] memory allPayments = userPayments[_user];
        uint256 totalCount = allPayments.length;
        
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
            result[i] = allPayments[_offset + i];
        }
        
        return (result, totalCount);
    }
    
    function getUserPaymentCount(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return userPayments[_user].length;
    }
    
    function getTotalPayments() external view returns (uint256) {
        return paymentCounter;
    }
    
    function canAutoRelease(uint256 _paymentId) external view returns (bool) {
        Payment memory payment = payments[_paymentId];
        return (
            payment.status == PaymentStatus.Escrowed &&
            !payment.disputed &&
            block.timestamp >= payment.releaseTime
        );
    }
    
    // Admin functions
    
    /**
     * @dev Update platform fee percentage (requires multi-sig if enabled)
     * @param _newFee New fee percentage
     */
    function setPlatformFee(uint256 _newFee) external onlyMultiSigOrOwner {
        require(_newFee <= MAX_FEE_PERCENT, "Fee cannot exceed maximum");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFee;
        
        emit PlatformFeeChanged(oldFee, _newFee, block.timestamp);
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Update platform wallet address
     * @param _newWallet New wallet address
     */
    function setPlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        address oldWallet = platformWallet;
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(oldWallet, _newWallet);
    }
    
    /**
     * @dev Set multi-sig wallet address (FIX #19, #20)
     * @param _multiSigWallet Multi-sig wallet address
     */
    function setMultiSigWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "Invalid multi-sig address");
        address oldWallet = multiSigWallet;
        multiSigWallet = _multiSigWallet;
        emit MultiSigWalletUpdated(oldWallet, _multiSigWallet);
    }
    
    /**
     * @dev Enable or disable multi-sig requirement (FIX #19, #20)
     * @param _enabled True to enable multi-sig
     */
    function setMultiSigEnabled(bool _enabled) external onlyOwner {
        require(multiSigWallet != address(0), "Multi-sig wallet not set");
        multiSigEnabled = _enabled;
        emit MultiSigEnabled(_enabled);
    }
    
    /**
     * @dev Pause contract (requires multi-sig if enabled)
     */
    function pause() external onlyMultiSigOrOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (requires multi-sig if enabled)
     */
    function unpause() external onlyMultiSigOrOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw - only withdraw unclaimed/stuck funds after 180 days
     */
    function emergencyWithdraw() external onlyMultiSigOrOwner whenPaused {
        uint256 withdrawableAmount = 0;
        
        for (uint256 i = 1; i <= paymentCounter; i++) {
            Payment storage payment = payments[i];
            if (
                payment.status == PaymentStatus.Escrowed &&
                block.timestamp >= payment.createdAt + 180 days
            ) {
                withdrawableAmount += payment.amount;
                payment.status = PaymentStatus.Refunded;
            }
        }
        
        require(withdrawableAmount > 0, "No withdrawable funds");
        
        (bool success, ) = owner().call{value: withdrawableAmount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev FIX #16: Check and update rate limit for payment creation
     * @param _user User address
     */
    function _checkPaymentRateLimit(address _user) private {
        // Reset counter if it's a new day
        if (block.timestamp >= lastPaymentCreationReset[_user] + 1 days) {
            paymentsCreatedToday[_user] = 0;
            lastPaymentCreationReset[_user] = block.timestamp;
        }
        
        if (paymentsCreatedToday[_user] >= DAILY_PAYMENT_LIMIT) {
            emit RateLimitExceeded(_user, paymentsCreatedToday[_user], block.timestamp);
            revert("Daily payment creation limit reached");
        }
        
        paymentsCreatedToday[_user]++;
    }
    
    /**
     * @dev Internal function to transfer payment to seller
     * @param _seller Seller address
     * @param _amount Total payment amount
     * @param _feePercent Fee percentage locked at creation
     */
    function _transferPaymentToSeller(
        address _seller,
        uint256 _amount,
        uint256 _feePercent
    ) internal {
        uint256 platformFee = (_amount * _feePercent) / 100;
        uint256 sellerAmount = _amount - platformFee;
        
        (bool successSeller, ) = _seller.call{value: sellerAmount}("");
        require(successSeller, "Transfer to seller failed");
        
        (bool successPlatform, ) = platformWallet.call{value: platformFee}("");
        require(successPlatform, "Platform fee transfer failed");
    }
    
    receive() external payable {
        revert("Direct payments not accepted");
    }
    
    fallback() external payable {
        revert("Direct payments not accepted");
    }
}
