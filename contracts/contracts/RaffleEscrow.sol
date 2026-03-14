// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RaffleEscrow
 * @notice Escrow contract for Onagui raffle platform
 * @dev Holds USDC in escrow until raffle completes or is cancelled
 */
contract RaffleEscrow is ReentrancyGuard, Ownable {
    // USDC token on Polygon
    IERC20 public immutable USDC;
    
    // Platform fee (2% = 200 basis points)
    uint256 public constant PLATFORM_FEE_BPS = 200;
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    // Cancellation fee (2%)
    uint256 public constant CANCELLATION_FEE_BPS = 200;
    
    struct Raffle {
        address creator;
        uint256 prizeValue;
        uint256 totalTickets;
        uint256 ticketsSold;
        uint256 ticketPrice;
        uint256 totalFunds;
        uint256 cancellationFee;
        bool isActive;
        bool isCancelled;
        bool isCompleted;
        address winner;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // Raffle ID => Raffle
    mapping(bytes32 => Raffle) public raffles;
    
    // Raffle ID => Buyer => Amount Contributed
    mapping(bytes32 => mapping(address => uint256)) public contributions;
    
    // Platform fees collected
    uint256 public platformFeesCollected;
    
    // Events
    event RaffleCreated(
        bytes32 indexed raffleId,
        address indexed creator,
        uint256 prizeValue,
        uint256 totalTickets,
        uint256 ticketPrice
    );
    
    event TicketsPurchased(
        bytes32 indexed raffleId,
        address indexed buyer,
        uint256 amount,
        uint256 ticketCount
    );
    
    event WinnerSelected(
        bytes32 indexed raffleId,
        address indexed winner,
        uint256 prizeAmount
    );
    
    event RaffleCancelled(
        bytes32 indexed raffleId,
        uint256 refundAmount
    );
    
    event FundsReleased(
        bytes32 indexed raffleId,
        address indexed creator,
        uint256 amount
    );
    
    event PlatformFeesWithdrawn(uint256 amount, address to);
    
    constructor(address _usdcAddress) {
        USDC = IERC20(_usdcAddress);
    }
    
    /**
     * @notice Create a new raffle with escrow
     * @param raffleId Unique identifier for the raffle
     * @param prizeValue Value of the prize in USDC
     * @param totalTickets Total number of tickets
     * @param ticketPrice Price per ticket in USDC
     */
    function createRaffle(
        bytes32 raffleId,
        uint256 prizeValue,
        uint256 totalTickets,
        uint256 ticketPrice
    ) external nonReentrant {
        require(raffles[raffleId].creator == address(0), "Raffle already exists");
        require(prizeValue > 0, "Prize value must be > 0");
        require(totalTickets > 0, "Must have tickets");
        require(ticketPrice > 0, "Ticket price must be > 0");
        
        // Calculate cancellation fee (2% of prize value)
        uint256 cancellationFee = (prizeValue * CANCELLATION_FEE_BPS) / BPS_DENOMINATOR;
        
        // Transfer cancellation fee from creator
        require(
            USDC.transferFrom(msg.sender, address(this), cancellationFee),
            "Cancellation fee transfer failed"
        );
        
        // Create raffle
        raffles[raffleId] = Raffle({
            creator: msg.sender,
            prizeValue: prizeValue,
            totalTickets: totalTickets,
            ticketsSold: 0,
            ticketPrice: ticketPrice,
            totalFunds: 0,
            cancellationFee: cancellationFee,
            isActive: true,
            isCancelled: false,
            isCompleted: false,
            winner: address(0),
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        emit RaffleCreated(raffleId, msg.sender, prizeValue, totalTickets, ticketPrice);
    }
    
    /**
     * @notice Purchase tickets for a raffle
     * @param raffleId ID of the raffle
     * @param ticketCount Number of tickets to purchase
     */
    function purchaseTickets(
        bytes32 raffleId,
        uint256 ticketCount
    ) external nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        
        require(raffle.isActive, "Raffle not active");
        require(!raffle.isCancelled, "Raffle cancelled");
        require(!raffle.isCompleted, "Raffle completed");
        require(ticketCount > 0, "Must buy at least 1 ticket");
        require(
            raffle.ticketsSold + ticketCount <= raffle.totalTickets,
            "Not enough tickets available"
        );
        
        uint256 amount = ticketCount * raffle.ticketPrice;
        
        // Transfer USDC from buyer to escrow
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        // Update raffle state
        raffle.ticketsSold += ticketCount;
        raffle.totalFunds += amount;
        contributions[raffleId][msg.sender] += amount;
        
        emit TicketsPurchased(raffleId, msg.sender, amount, ticketCount);
    }
    
    /**
     * @notice Complete raffle and release funds to creator
     * @param raffleId ID of the raffle
     * @param winner Address of the winner
     */
    function completeRaffle(
        bytes32 raffleId,
        address winner
    ) external onlyOwner nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        
        require(raffle.isActive, "Raffle not active");
        require(!raffle.isCancelled, "Raffle cancelled");
        require(!raffle.isCompleted, "Already completed");
        require(winner != address(0), "Invalid winner");
        
        // Calculate platform fee
        uint256 platformFee = (raffle.totalFunds * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = raffle.totalFunds - platformFee;
        
        // Mark as completed
        raffle.isCompleted = true;
        raffle.isActive = false;
        raffle.winner = winner;
        raffle.completedAt = block.timestamp;
        
        // Refund cancellation fee to creator
        require(
            USDC.transfer(raffle.creator, raffle.cancellationFee),
            "Cancellation fee refund failed"
        );
        
        // Track platform fees
        platformFeesCollected += platformFee;
        
        // Release funds to creator
        require(
            USDC.transfer(raffle.creator, creatorAmount),
            "Creator payment failed"
        );
        
        emit WinnerSelected(raffleId, winner, creatorAmount);
        emit FundsReleased(raffleId, raffle.creator, creatorAmount);
    }
    
    /**
     * @notice Cancel raffle and refund all buyers
     * @param raffleId ID of the raffle
     */
    function cancelRaffle(bytes32 raffleId) external nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        
        require(
            msg.sender == raffle.creator || msg.sender == owner(),
            "Only creator or admin"
        );
        require(raffle.isActive, "Raffle not active");
        require(!raffle.isCompleted, "Already completed");
        
        // Mark as cancelled
        raffle.isCancelled = true;
        raffle.isActive = false;
        
        // Keep cancellation fee (goes to platform)
        platformFeesCollected += raffle.cancellationFee;
        
        emit RaffleCancelled(raffleId, raffle.totalFunds);
    }
    
    /**
     * @notice Claim refund after raffle is cancelled
     * @param raffleId ID of the raffle
     */
    function claimRefund(bytes32 raffleId) external nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        
        require(raffle.isCancelled, "Raffle not cancelled");
        
        uint256 refundAmount = contributions[raffleId][msg.sender];
        require(refundAmount > 0, "No contribution to refund");
        
        // Clear contribution
        contributions[raffleId][msg.sender] = 0;
        
        // Refund USDC
        require(USDC.transfer(msg.sender, refundAmount), "Refund failed");
    }
    
    /**
     * @notice Withdraw platform fees
     * @param to Address to send fees to
     */
    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        require(platformFeesCollected > 0, "No fees to withdraw");
        
        uint256 amount = platformFeesCollected;
        platformFeesCollected = 0;
        
        require(USDC.transfer(to, amount), "Fee withdrawal failed");
        
        emit PlatformFeesWithdrawn(amount, to);
    }
    
    /**
     * @notice Get raffle details
     * @param raffleId ID of the raffle
     */
    function getRaffle(bytes32 raffleId) external view returns (Raffle memory) {
        return raffles[raffleId];
    }
    
    /**
     * @notice Get contribution amount for a buyer
     * @param raffleId ID of the raffle
     * @param buyer Address of the buyer
     */
    function getContribution(
        bytes32 raffleId,
        address buyer
    ) external view returns (uint256) {
        return contributions[raffleId][buyer];
    }
    
    /**
     * @notice Emergency withdraw (only owner, only for stuck funds)
     * @param token Address of token to withdraw
     * @param to Address to send to
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "Invalid address");
        IERC20(token).transfer(to, amount);
    }
}
