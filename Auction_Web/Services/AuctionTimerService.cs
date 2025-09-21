using Auction_Web.Services;
using Auction_Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Auction_Web.Services
{
    public class AuctionTimerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<BiddingHub> _hubContext;
        private readonly ILogger<AuctionTimerService> _logger;
        private readonly Timer _timer;

        public AuctionTimerService(
            IServiceProvider serviceProvider,
            IHubContext<BiddingHub> hubContext,
            ILogger<AuctionTimerService> logger)
        {
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
            _logger = logger;
            
            // Initialize timer to run every 30 seconds
            _timer = new Timer(ProcessAuctionTimers, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessAuctionNotifications();
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in auction timer service");
                }
            }
        }

        private async void ProcessAuctionTimers(object? state)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var auctionService = scope.ServiceProvider.GetRequiredService<IAuctionService>();
                var biddingService = scope.ServiceProvider.GetRequiredService<IBiddingService>();

                // Get all active auctions
                var searchDto = new Models.DTOs.AuctionSearchDto
                {
                    Status = Models.AuctionStatus.Active,
                    PageSize = 1000 // Get all active auctions
                };

                var activeAuctions = await auctionService.GetAuctionsAsync(searchDto);

                foreach (var auction in activeAuctions)
                {
                    if (auction.IsLive)
                    {
                        var timeRemaining = auction.TimeRemaining;

                        // Send countdown updates
                        await _hubContext.Clients.Group($"auction_{auction.Id}")
                            .SendAsync("CountdownUpdate", new
                            {
                                AuctionId = auction.Id,
                                TimeRemaining = timeRemaining,
                                EndTime = auction.EndDate,
                                IsEnding = timeRemaining.TotalMinutes <= 15
                            });

                        // Send ending notifications at specific intervals
                        if (timeRemaining.TotalMinutes <= 15 && timeRemaining.TotalMinutes > 14 ||
                            timeRemaining.TotalMinutes <= 5 && timeRemaining.TotalMinutes > 4 ||
                            timeRemaining.TotalMinutes <= 1 && timeRemaining.TotalMinutes > 0.5)
                        {
                            await biddingService.NotifyAuctionEndingAsync(auction.Id, timeRemaining);
                        }

                        // Handle auction ending
                        if (auction.HasEnded && auction.Status == Models.AuctionStatus.Active)
                        {
                            await HandleAuctionEnd(auction, auctionService, biddingService);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing auction timers");
            }
        }

        private async Task ProcessAuctionNotifications()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var auctionService = scope.ServiceProvider.GetRequiredService<IAuctionService>();

                // Update auction statuses
                await auctionService.UpdateAuctionStatusesAsync();

                // Send periodic updates for active auctions
                var searchDto = new Models.DTOs.AuctionSearchDto
                {
                    Status = Models.AuctionStatus.Active,
                    PageSize = 1000
                };

                var activeAuctions = await auctionService.GetAuctionsAsync(searchDto);

                foreach (var auction in activeAuctions.Where(a => a.IsLive))
                {
                    var timeRemaining = auction.TimeRemaining;
                    
                    // Send live updates every 30 seconds for auctions ending soon
                    if (timeRemaining.TotalMinutes <= 30)
                    {
                        await _hubContext.Clients.Group($"auction_{auction.Id}")
                            .SendAsync("LiveUpdate", new
                            {
                                AuctionId = auction.Id,
                                CurrentPrice = auction.CurrentPrice,
                                BidCount = auction.BidCount,
                                TimeRemaining = timeRemaining,
                                ViewCount = auction.ViewCount,
                                WatchlistCount = auction.WatchlistCount
                            });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing auction notifications");
            }
        }

        private async Task HandleAuctionEnd(Models.Auction auction, IAuctionService auctionService, IBiddingService biddingService)
        {
            try
            {
                _logger.LogInformation("Ending auction {AuctionId}", auction.Id);

                // End the auction
                await auctionService.EndAuctionAsync(auction.Id, int.Parse(auction.SellerId));

                // Get the winning bid
                var winningBid = await biddingService.GetHighestBidAsync(auction.Id);

                // Notify all clients that the auction has ended
                await _hubContext.Clients.Group($"auction_{auction.Id}")
                    .SendAsync("AuctionEnded", new
                    {
                        AuctionId = auction.Id,
                        WinningBid = winningBid?.Amount,
                        WinnerId = winningBid?.BidderId,
                        WinnerName = winningBid != null ? $"Bidder {winningBid.BidderId}" : null,
                        FinalPrice = auction.CurrentPrice,
                        EndTime = auction.EndDate
                    });

                _logger.LogInformation("Successfully ended auction {AuctionId} with winning bid of {Amount}", 
                    auction.Id, winningBid?.Amount ?? 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending auction {AuctionId}", auction.Id);
            }
        }

        public override void Dispose()
        {
            _timer?.Dispose();
            base.Dispose();
        }
    }
}
