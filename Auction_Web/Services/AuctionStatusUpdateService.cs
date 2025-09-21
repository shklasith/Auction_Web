using Auction_Web.Services;

namespace Auction_Web.Services
{
    public class AuctionStatusUpdateService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuctionStatusUpdateService> _logger;
        private readonly TimeSpan _updateInterval = TimeSpan.FromMinutes(1); // Update every minute

        public AuctionStatusUpdateService(IServiceProvider serviceProvider, ILogger<AuctionStatusUpdateService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Auction Status Update Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var auctionService = scope.ServiceProvider.GetRequiredService<IAuctionService>();
                        await auctionService.UpdateAuctionStatusesAsync();
                    }

                    _logger.LogDebug("Auction statuses updated successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating auction statuses");
                }

                await Task.Delay(_updateInterval, stoppingToken);
            }

            _logger.LogInformation("Auction Status Update Service stopped");
        }
    }
}
