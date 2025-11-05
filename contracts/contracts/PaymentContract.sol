// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PaymentContract
 * @dev Handles escrow payments for agricultural supply chain
 * @notice Manages secure payments between buyers and sellers
 */
contract PaymentContract is ReentrancyGuard, Ownable, Pausable {
    
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
        uint256 feePercent; // FIX #6: Store fee at creation time
    }
    
    // State variables
    uint256 private paymentCounter;
    mapping(uint256 => Payment) public payments;
    mapping(uint256 => uint256) public orderToPayment; // orderId => paymentId
    mapping(address => uint256[]) public userPayments;
    
    uint256 public platformFeePercent = 2; // 2% platform fee
    uint256 public constant MAX_FEE_PERCENT = 10; // Maximum 10%
    address public platformWallet;
    
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
    
    /**
     * @dev Constructor
     * @param _platformWallet Address to receive platform fees
     */
    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }
    
    /**
     * @dev Create a new escrow payment
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
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Buyer and seller cannot be same");
        require(_releaseTime > block.timestamp, "Release time must be in future");
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
            feePercent: platformFeePercent // FIX #6: Lock fee at creation
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
        
        // GAS OPT #3: Cache storage reads in memory
        uint256 amount = payment.amount;
        uint256 feePercent = payment.feePercent;
        address seller = payment.seller;
        
        require(payment.status == PaymentStatus.Escrowed, "Invalid payment status");
        require(!payment.disputed, "Payment is disputed");
        
        // FIX #7: Only buyer or owner can release, remove auto-release from anyone
        require(
            msg.sender == payment.buyer || 
            msg.sender == owner(),
            "Only buyer or owner can release"
        );
        
        payment.status = PaymentStatus.Released;
        
        // GAS OPT #1: Use internal function to avoid duplicate logic
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
        
        // GAS OPT #3: Cache storage reads in memory
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
            // GAS OPT #1: Use internal function to avoid duplicate logic
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
    
    /**
     * @dev Get payment details
     * @param _paymentId Payment ID
     * @return Payment Payment struct
     */
    function getPayment(uint256 _paymentId) 
        external 
        view 
        returns (Payment memory) 
    {
        return payments[_paymentId];
    }
    
    /**
     * @dev Get payment by order ID
     * @param _orderId Order ID
     * @return Payment Payment struct
     */
    function getPaymentByOrder(uint256 _orderId) 
        external 
        view 
        returns (Payment memory) 
    {
        uint256 paymentId = orderToPayment[_orderId];
        require(paymentId > 0, "Payment not found");
        return payments[paymentId];
    }
    
    /**
     * @dev Get all payments for a user (GAS OPT #2: Added pagination to prevent unbounded array)
     * @param _user User address
     * @param _offset Starting index
     * @param _limit Maximum number of results
     * @return uint256[] Array of payment IDs
     * @return uint256 Total count
     */
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
    
    /**
     * @dev Get payment count for a user (GAS OPT #2: Efficient count without returning array)
     * @param _user User address
     * @return uint256 Number of payments
     */
    function getUserPaymentCount(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return userPayments[_user].length;
    }
    
    /**
     * @dev Get total number of payments
     * @return uint256 Total payments
     */
    function getTotalPayments() external view returns (uint256) {
        return paymentCounter;
    }
    
    /**
     * @dev Check if payment can be released automatically
     * @param _paymentId Payment ID
     * @return bool True if auto-release is allowed
     */
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
     * @dev Update platform fee percentage (FIX #6: Cannot affect existing escrows)
     * @param _newFee New fee percentage
     * @notice Fee changes only apply to NEW payments created after this call
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE_PERCENT, "Fee cannot exceed maximum");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFee;
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
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw - FIX #2: Only withdraw unclaimed/stuck funds after 180 days
     * @notice Can only withdraw funds from payments older than 180 days that are still in escrow
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 withdrawableAmount = 0;
        
        // Only count funds from payments older than 180 days still in escrow
        for (uint256 i = 1; i <= paymentCounter; i++) {
            Payment storage payment = payments[i];
            if (
                payment.status == PaymentStatus.Escrowed &&
                block.timestamp >= payment.createdAt + 180 days
            ) {
                withdrawableAmount += payment.amount;
                payment.status = PaymentStatus.Refunded; // Mark as refunded
            }
        }
        
        require(withdrawableAmount > 0, "No withdrawable funds");
        
        (bool success, ) = owner().call{value: withdrawableAmount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev GAS OPT #1: Internal function to transfer payment to seller (DRY - Don't Repeat Yourself)
     * @param _seller Seller address
     * @param _amount Total payment amount
     * @param _feePercent Fee percentage locked at creation
     */
    function _transferPaymentToSeller(
        address _seller,
        uint256 _amount,
        uint256 _feePercent
    ) internal {
        // Calculate fees
        uint256 platformFee = (_amount * _feePercent) / 100;
        uint256 sellerAmount = _amount - platformFee;
        
        // Transfer to seller
        (bool successSeller, ) = _seller.call{value: sellerAmount}("");
        require(successSeller, "Transfer to seller failed");
        
        // Transfer platform fee
        (bool successPlatform, ) = platformWallet.call{value: platformFee}("");
        require(successPlatform, "Platform fee transfer failed");
    }
    
    // Fallback and receive functions
    receive() external payable {
        revert("Direct payments not accepted");
    }
    
    fallback() external payable {
        revert("Direct payments not accepted");
    }
}
