using Auction_Web.Models;
using Auction_Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Auction_Web.Services
{
    public interface IBiddingService
    {
        Task<BidResult> PlaceBidAsync(int auctionId, decimal bidAmount, int bidderId);
        Task<decimal> GetNextMinimumBidAsync(int auctionId);
        Task<IEnumerable<Bid>> GetAuctionBidsAsync(int auctionId);
        Task<Bid?> GetHighestBidAsync(int auctionId);
        Task<bool> IsValidBidAsync(int auctionId, decimal bidAmount, int bidderId);
        Task ProcessAutomaticBidAsync(int auctionId, decimal targetAmount, int bidderId);
        Task NotifyBidUpdateAsync(int auctionId, Bid newBid);
        Task NotifyAuctionEndingAsync(int auctionId, TimeSpan timeRemaining);
        Task HandleAuctionExtensionAsync(int auctionId);
    }

    public enum BidResultStatus
    {
        Success,
        InvalidAmount,
        AuctionNotActive,
        AuctionEnded,
        BidTooLow,
        SelfBid,
        InsufficientIncrement,
        MaxBidsReached,
        BidderNotApproved
    }

    public class BidResult
    {
        public BidResultStatus Status { get; set; }
        public string Message { get; set; } = string.Empty;
        public Bid? Bid { get; set; }
        public decimal NextMinimumBid { get; set; }
    }

    public class BiddingService : IBiddingService
    {
        private readonly IAuctionService _auctionService;
        private readonly IHubContext<BiddingHub> _hubContext;
        private readonly ILogger<BiddingService> _logger;
        
        // In-memory storage - in production, use a database
        private static readonly List<Bid> _bids = new();
        private static int _nextBidId = 1;
        private readonly object _bidLock = new();

        public BiddingService(IAuctionService auctionService, IHubContext<BiddingHub> hubContext, ILogger<BiddingService> logger)
        {
            _auctionService = auctionService;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<BidResult> PlaceBidAsync(int auctionId, decimal bidAmount, int bidderId)
        {
            try
            {
                var auction = await _auctionService.GetAuctionByIdAsync(auctionId, false);
                if (auction == null)
                {
                    return new BidResult { Status = BidResultStatus.AuctionNotActive, Message = "Auction not found." };
                }

                // Validate bid
                var validationResult = await ValidateBidAsync(auction, bidAmount, bidderId);
                if (validationResult.Status != BidResultStatus.Success)
                {
                    return validationResult;
                }

                // Place the bid
                lock (_bidLock)
                {
                    var bid = new Bid
                    {
                        Id = _nextBidId++,
                        AuctionId = auctionId,
                        UserId = bidderId.ToString(),
                        Amount = bidAmount,
                        BidDate = DateTime.UtcNow,
                        IsWinning = true
                    };

                    // Mark previous winning bid as not winning
                    var previousWinningBid = _bids.Where(b => b.AuctionId == auctionId && b.IsWinning).FirstOrDefault();
                    if (previousWinningBid != null)
                    {
                        previousWinningBid.IsWinning = false;
                    }

                    _bids.Add(bid);

                    // Update auction current price and bid count
                    auction.CurrentPrice = bidAmount;
                    auction.BidCount++;

                    var result = new BidResult
                    {
                        Status = BidResultStatus.Success,
                        Message = "Bid placed successfully!",
                        Bid = bid,
                        NextMinimumBid = CalculateNextMinimumBid(auction, bidAmount)
                    };

                    // Handle auto-extension if enabled
                    _ = Task.Run(() => HandleAuctionExtensionAsync(auctionId));

                    // Notify all connected clients
                    _ = Task.Run(() => NotifyBidUpdateAsync(auctionId, bid));

                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error placing bid for auction {AuctionId}", auctionId);
                return new BidResult { Status = BidResultStatus.InvalidAmount, Message = "An error occurred while placing the bid." };
            }
        }

        private async Task<BidResult> ValidateBidAsync(Auction auction, decimal bidAmount, int bidderId)
        {
            // Check if auction is active
            if (!auction.IsLive)
            {
                return new BidResult { Status = BidResultStatus.AuctionNotActive, Message = "Auction is not currently active." };
            }

            // Check if auction has ended
            if (auction.HasEnded)
            {
                return new BidResult { Status = BidResultStatus.AuctionEnded, Message = "Auction has ended." };
            }

            // Check if bidder is the seller
            if (auction.SellerId == bidderId.ToString())
            {
                return new BidResult { Status = BidResultStatus.SelfBid, Message = "You cannot bid on your own auction." };
            }

            // Check minimum bid amount
            var nextMinimumBid = await GetNextMinimumBidAsync(auction.Id);
            if (bidAmount < nextMinimumBid)
            {
                return new BidResult 
                { 
                    Status = BidResultStatus.BidTooLow, 
                    Message = $"Bid must be at least ${nextMinimumBid:F2}.",
                    NextMinimumBid = nextMinimumBid
                };
            }

            // Check if pre-approval is required
            if (auction.RequirePreApproval)
            {
                // In a real application, check if bidder is pre-approved
                // For now, assume all bidders are approved
            }

            // Check maximum bids limit
            if (auction.MaxBids.HasValue)
            {
                var bidderBidCount = _bids.Count(b => b.AuctionId == auction.Id && b.BidderId == bidderId.ToString());
                if (bidderBidCount >= auction.MaxBids.Value)
                {
                    return new BidResult { Status = BidResultStatus.MaxBidsReached, Message = "Maximum bid limit reached for this auction." };
                }
            }

            return new BidResult { Status = BidResultStatus.Success };
        }

        public async Task<decimal> GetNextMinimumBidAsync(int auctionId)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(auctionId, false);
            if (auction == null) return 0;

            var highestBid = await GetHighestBidAsync(auctionId);
            var currentPrice = highestBid?.Amount ?? auction.StartingPrice;

            return CalculateNextMinimumBid(auction, currentPrice);
        }

        private decimal CalculateNextMinimumBid(Auction auction, decimal currentPrice)
        {
            decimal increment = auction.BidIncrement ?? GetDefaultBidIncrement(currentPrice);
            return currentPrice + increment;
        }

        private decimal GetDefaultBidIncrement(decimal currentPrice)
        {
            // Dynamic bid increments based on price ranges
            return currentPrice switch
            {
                < 25 => 0.50m,
                < 100 => 1.00m,
                < 500 => 5.00m,
                < 1000 => 10.00m,
                < 5000 => 25.00m,
                _ => 50.00m
            };
        }

        public async Task<IEnumerable<Bid>> GetAuctionBidsAsync(int auctionId)
        {
            return await Task.FromResult(_bids.Where(b => b.AuctionId == auctionId).OrderByDescending(b => b.BidDate));
        }

        public async Task<Bid?> GetHighestBidAsync(int auctionId)
        {
            return await Task.FromResult(_bids.Where(b => b.AuctionId == auctionId).OrderByDescending(b => b.Amount).FirstOrDefault());
        }

        public async Task<bool> IsValidBidAsync(int auctionId, decimal bidAmount, int bidderId)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(auctionId, false);
            if (auction == null) return false;

            var validationResult = await ValidateBidAsync(auction, bidAmount, bidderId);
            return validationResult.Status == BidResultStatus.Success;
        }

        public async Task ProcessAutomaticBidAsync(int auctionId, decimal targetAmount, int bidderId)
        {
            // Implementation for automatic bidding (proxy bidding)
            var nextMinimum = await GetNextMinimumBidAsync(auctionId);
            
            if (targetAmount >= nextMinimum)
            {
                await PlaceBidAsync(auctionId, nextMinimum, bidderId);
            }
        }

        public async Task NotifyBidUpdateAsync(int auctionId, Bid newBid)
        {
            try
            {
                var auction = await _auctionService.GetAuctionByIdAsync(auctionId, false);
                if (auction == null) return;

                var bidUpdate = new
                {
                    AuctionId = auctionId,
                    HighestBid = newBid.Amount,
                    BidCount = auction.BidCount,
                    NextMinimumBid = await GetNextMinimumBidAsync(auctionId),
                    BidderName = $"Bidder {newBid.BidderId}", // In production, get actual bidder name
                    BidTime = newBid.BidDate,
                    TimeRemaining = auction.TimeRemaining
                };

                await _hubContext.Clients.Group($"auction_{auctionId}").SendAsync("BidUpdate", bidUpdate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying bid update for auction {AuctionId}", auctionId);
            }
        }

        public async Task NotifyAuctionEndingAsync(int auctionId, TimeSpan timeRemaining)
        {
            try
            {
                var notification = new
                {
                    AuctionId = auctionId,
                    TimeRemaining = timeRemaining,
                    Message = timeRemaining.TotalMinutes switch
                    {
                        <= 1 => "Auction ending in less than 1 minute!",
                        <= 5 => "Auction ending in less than 5 minutes!",
                        <= 15 => "Auction ending in less than 15 minutes!",
                        _ => "Auction ending soon!"
                    }
                };

                await _hubContext.Clients.Group($"auction_{auctionId}").SendAsync("AuctionEnding", notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying auction ending for auction {AuctionId}", auctionId);
            }
        }

        public async Task HandleAuctionExtensionAsync(int auctionId)
        {
            try
            {
                var auction = await _auctionService.GetAuctionByIdAsync(auctionId, false);
                if (auction == null || !auction.AutoExtend) return;

                var timeRemaining = auction.TimeRemaining;
                var extensionMinutes = auction.AutoExtendMinutes ?? 5;

                // If auction ends within the extension threshold and there's recent bidding activity
                if (timeRemaining.TotalMinutes <= extensionMinutes)
                {
                    var recentBids = _bids.Where(b => b.AuctionId == auctionId && 
                                                    b.BidDate > DateTime.UtcNow.AddMinutes(-extensionMinutes))
                                          .Any();

                    if (recentBids)
                    {
                        // Extend auction by the specified minutes
                        // In a real application, update the auction end date in the database
                        _logger.LogInformation("Auction {AuctionId} extended by {Minutes} minutes due to recent bidding activity", 
                                             auctionId, extensionMinutes);

                        await _hubContext.Clients.Group($"auction_{auctionId}")
                            .SendAsync("AuctionExtended", new { AuctionId = auctionId, ExtensionMinutes = extensionMinutes });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling auction extension for auction {AuctionId}", auctionId);
            }
        }
    }
}
