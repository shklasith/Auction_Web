using Microsoft.EntityFrameworkCore;
using Auction_Web.Data;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;
using System.Globalization;

namespace Auction_Web.Services
{
    public interface IReportingService
    {
        Task<AuctionPerformanceReportDto> GetAuctionPerformanceReportAsync(ReportFilterDto? filters = null);
        Task<BidderActivityReportDto> GetBidderActivityReportAsync(ReportFilterDto? filters = null);
        Task<RevenueTrendsReportDto> GetRevenueTrendsReportAsync(ReportFilterDto? filters = null);
        Task<AnalyticsDashboardDto> GetAnalyticsDashboardAsync();
    }

    public class ReportingService : IReportingService
    {
        private readonly ApplicationDbContext _context;

        public ReportingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AuctionPerformanceReportDto> GetAuctionPerformanceReportAsync(ReportFilterDto? filters = null)
        {
            var query = _context.Auctions.AsQueryable();

            // Apply filters
            if (filters != null)
            {
                if (filters.StartDate.HasValue)
                    query = query.Where(a => a.CreatedDate >= filters.StartDate.Value);
                
                if (filters.EndDate.HasValue)
                    query = query.Where(a => a.CreatedDate <= filters.EndDate.Value);
                
                if (!string.IsNullOrEmpty(filters.Category))
                    query = query.Where(a => a.Category == filters.Category);
                
                if (filters.Status.HasValue)
                    query = query.Where(a => a.Status == filters.Status.Value);
            }

            var auctions = await query.ToListAsync();
            var totalAuctions = auctions.Count;
            var activeAuctions = auctions.Count(a => a.Status == AuctionStatus.Active);
            var completedAuctions = auctions.Count(a => a.Status == AuctionStatus.Sold);
            var cancelledAuctions = auctions.Count(a => a.Status == AuctionStatus.Cancelled);

            var completionRate = totalAuctions > 0 ? (decimal)completedAuctions / totalAuctions * 100 : 0;

            // Get bids for these auctions
            var auctionIds = auctions.Select(a => a.Id).ToList();
            var bids = await _context.Bids
                .Where(b => auctionIds.Contains(b.AuctionId))
                .ToListAsync();

            var avgBidsPerAuction = totalAuctions > 0 ? (decimal)bids.Count / totalAuctions : 0;

            var completedAuctionIds = auctions.Where(a => a.Status == AuctionStatus.Sold).Select(a => a.Id).ToList();
            var completedBids = bids.Where(b => completedAuctionIds.Contains(b.AuctionId)).ToList();
            var avgSalePrice = completedBids.Any() ? completedBids.GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .Average() : 0;

            var totalRevenue = completedBids.GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .Sum();

            // Category performance
            var categoryPerformance = auctions.GroupBy(a => a.Category)
                .Select(g => new CategoryPerformanceDto
                {
                    Category = g.Key,
                    TotalAuctions = g.Count(),
                    CompletedAuctions = g.Count(a => a.Status == AuctionStatus.Sold),
                    TotalRevenue = bids.Where(b => g.Select(a => a.Id).Contains(b.AuctionId))
                        .GroupBy(b => b.AuctionId)
                        .Select(bg => bg.Max(b => b.Amount))
                        .DefaultIfEmpty(0)
                        .Sum(),
                    AverageSalePrice = g.Count(a => a.Status == AuctionStatus.Sold) > 0 
                        ? bids.Where(b => g.Where(a => a.Status == AuctionStatus.Sold).Select(a => a.Id).Contains(b.AuctionId))
                            .GroupBy(b => b.AuctionId)
                            .Select(bg => bg.Max(b => b.Amount))
                            .DefaultIfEmpty(0)
                            .Average() 
                        : 0,
                    TotalBids = bids.Count(b => g.Select(a => a.Id).Contains(b.AuctionId))
                })
                .OrderByDescending(c => c.TotalRevenue)
                .ToList();

            // Top performing auctions
            var topPerformingAuctions = await _context.Auctions
                .Where(a => auctionIds.Contains(a.Id) && a.Status == AuctionStatus.Sold)
                .Select(a => new
                {
                    Auction = a,
                    BidCount = _context.Bids.Count(b => b.AuctionId == a.Id),
                    MaxBid = _context.Bids.Where(b => b.AuctionId == a.Id).Max(b => (decimal?)b.Amount) ?? 0
                })
                .OrderByDescending(x => x.MaxBid)
                .Take(filters?.TopN ?? 10)
                .Select(x => new TopPerformingAuctionDto
                {
                    AuctionId = x.Auction.Id,
                    Title = x.Auction.Title,
                    Category = x.Auction.Category,
                    FinalPrice = x.MaxBid,
                    TotalBids = x.BidCount,
                    UniqueViewers = 0, // Will be 0 if AuctionViews table doesn't exist
                    EndDate = x.Auction.EndDate
                })
                .ToListAsync();

            return new AuctionPerformanceReportDto
            {
                TotalAuctions = totalAuctions,
                ActiveAuctions = activeAuctions,
                CompletedAuctions = completedAuctions,
                CancelledAuctions = cancelledAuctions,
                AverageCompletionRate = completionRate,
                AverageBidsPerAuction = avgBidsPerAuction,
                AverageSalePrice = avgSalePrice,
                TotalRevenue = totalRevenue,
                CategoryPerformance = categoryPerformance,
                TopPerformingAuctions = topPerformingAuctions
            };
        }

        public async Task<BidderActivityReportDto> GetBidderActivityReportAsync(ReportFilterDto? filters = null)
        {
            var bidsQuery = _context.Bids.AsQueryable();

            // Apply date filters
            if (filters?.StartDate.HasValue == true)
                bidsQuery = bidsQuery.Where(b => b.BidDate >= filters.StartDate.Value);
            
            if (filters?.EndDate.HasValue == true)
                bidsQuery = bidsQuery.Where(b => b.BidDate <= filters.EndDate.Value);

            var bids = await bidsQuery.Include(b => b.User).ToListAsync();
            var uniqueBidders = bids.Select(b => b.UserId).Distinct().Count();
            
            // Active bidders (bidders with at least one bid in the period)
            var activeBidders = uniqueBidders;
            
            var avgBidsPerBidder = uniqueBidders > 0 ? (decimal)bids.Count / uniqueBidders : 0;
            var totalBidVolume = bids.Sum(b => b.Amount);

            // Top bidders
            var topBidders = bids.GroupBy(b => b.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    User = g.First().User,
                    TotalBids = g.Count(),
                    TotalBidAmount = g.Sum(b => b.Amount),
                    AuctionsParticipated = g.Select(b => b.AuctionId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalBidAmount)
                .Take(filters?.TopN ?? 10)
                .ToList();

            var topBidderDtos = new List<TopBidderDto>();
            foreach (var bidder in topBidders)
            {
                var wonAuctions = await _context.Auctions
                    .Where(a => a.Status == AuctionStatus.Sold && a.WinnerId == bidder.UserId)
                    .CountAsync();

                var totalSpent = await _context.Auctions
                    .Where(a => a.Status == AuctionStatus.Sold && a.WinnerId == bidder.UserId)
                    .Join(_context.Bids, 
                        a => a.Id, 
                        b => b.AuctionId, 
                        (a, b) => new { a, b })
                    .Where(x => x.b.UserId == bidder.UserId)
                    .GroupBy(x => x.a.Id)
                    .Select(g => g.Max(x => x.b.Amount))
                    .DefaultIfEmpty(0)
                    .SumAsync();

                var winRate = bidder.AuctionsParticipated > 0 
                    ? (decimal)wonAuctions / bidder.AuctionsParticipated * 100 
                    : 0;

                topBidderDtos.Add(new TopBidderDto
                {
                    UserId = bidder.UserId,
                    Username = bidder.User?.UserName ?? "Unknown",
                    Email = bidder.User?.Email ?? "Unknown",
                    TotalBids = bidder.TotalBids,
                    TotalBidAmount = bidder.TotalBidAmount,
                    AuctionsWon = wonAuctions,
                    TotalSpent = totalSpent,
                    WinRate = winRate
                });
            }

            // Bidding trends (daily)
            var biddingTrends = bids.GroupBy(b => b.BidDate.Date)
                .Select(g => new BiddingTrendDto
                {
                    Date = g.Key,
                    TotalBids = g.Count(),
                    TotalBidAmount = g.Sum(b => b.Amount),
                    UniqueBidders = g.Select(b => b.UserId).Distinct().Count()
                })
                .OrderBy(t => t.Date)
                .ToList();

            // Engagement metrics
            var peakHour = bids.GroupBy(b => b.BidDate.Hour)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault();

            var mostActiveDay = bids.GroupBy(b => b.BidDate.DayOfWeek)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key.ToString())
                .FirstOrDefault() ?? "N/A";

            var repeatBidders = bids.GroupBy(b => b.UserId)
                .Count(g => g.Count() > 1);
            var repeatBidderRate = uniqueBidders > 0 ? (decimal)repeatBidders / uniqueBidders * 100 : 0;

            var engagementMetrics = new BidderEngagementMetricsDto
            {
                AverageBidResponseTime = 0, // Would need auction creation to bid time calculation
                PeakBiddingHour = peakHour,
                MostActiveDay = mostActiveDay,
                RepeatBidderRate = repeatBidderRate
            };

            return new BidderActivityReportDto
            {
                TotalBidders = uniqueBidders,
                ActiveBidders = activeBidders,
                AverageBidsPerBidder = avgBidsPerBidder,
                TotalBidVolume = totalBidVolume,
                TopBidders = topBidderDtos,
                BiddingTrends = biddingTrends,
                EngagementMetrics = engagementMetrics
            };
        }

        public async Task<RevenueTrendsReportDto> GetRevenueTrendsReportAsync(ReportFilterDto? filters = null)
        {
            var startDate = filters?.StartDate ?? DateTime.UtcNow.AddMonths(-6);
            var endDate = filters?.EndDate ?? DateTime.UtcNow;

            // Get completed auctions with their winning bids
            var completedAuctions = await _context.Auctions
                .Where(a => a.Status == AuctionStatus.Sold && a.EndDate >= startDate && a.EndDate <= endDate)
                .ToListAsync();

            var auctionIds = completedAuctions.Select(a => a.Id).ToList();
            var bids = await _context.Bids
                .Where(b => auctionIds.Contains(b.AuctionId))
                .ToListAsync();

            // Calculate total revenue (max bid per auction)
            var totalRevenue = bids.GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .Sum();

            var thisMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var lastMonthStart = thisMonthStart.AddMonths(-1);

            var revenueThisMonth = bids.Where(b => b.BidDate >= thisMonthStart)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .Sum();

            var revenueLastMonth = bids.Where(b => b.BidDate >= lastMonthStart && b.BidDate < thisMonthStart)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .Sum();

            var revenueGrowthRate = revenueLastMonth > 0 
                ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
                : 0;

            var avgRevenuePerAuction = completedAuctions.Count > 0 ? totalRevenue / completedAuctions.Count : 0;
            var totalDays = (endDate - startDate).Days;
            var avgRevenuePerDay = totalDays > 0 ? totalRevenue / totalDays : 0;

            // Daily revenue
            var dailyRevenue = completedAuctions
                .GroupBy(a => a.EndDate.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = bids.Where(b => g.Select(a => a.Id).Contains(b.AuctionId))
                        .GroupBy(b => b.AuctionId)
                        .Select(bg => bg.Max(b => b.Amount))
                        .DefaultIfEmpty(0)
                        .Sum(),
                    CompletedAuctions = g.Count(),
                    TotalBids = bids.Count(b => g.Select(a => a.Id).Contains(b.AuctionId))
                })
                .OrderBy(d => d.Date)
                .ToList();

            // Monthly revenue
            var monthlyRevenue = completedAuctions
                .GroupBy(a => new { a.EndDate.Year, a.EndDate.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Auctions = g.ToList()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToList();

            var monthlyRevenueDtos = new List<MonthlyRevenueDto>();
            MonthlyRevenueDto? previousMonth = null;

            foreach (var month in monthlyRevenue)
            {
                var monthRevenue = bids.Where(b => month.Auctions.Select(a => a.Id).Contains(b.AuctionId))
                    .GroupBy(b => b.AuctionId)
                    .Select(g => g.Max(b => b.Amount))
                    .DefaultIfEmpty(0)
                    .Sum();

                var growthRate = previousMonth != null && previousMonth.Revenue > 0
                    ? ((monthRevenue - previousMonth.Revenue) / previousMonth.Revenue) * 100
                    : 0;

                var dto = new MonthlyRevenueDto
                {
                    Year = month.Year,
                    Month = month.Month,
                    MonthName = new DateTime(month.Year, month.Month, 1).ToString("MMMM yyyy", CultureInfo.InvariantCulture),
                    Revenue = monthRevenue,
                    CompletedAuctions = month.Auctions.Count,
                    GrowthRate = growthRate
                };

                monthlyRevenueDtos.Add(dto);
                previousMonth = dto;
            }

            // Category revenue
            var categoryRevenue = completedAuctions
                .GroupBy(a => a.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Revenue = bids.Where(b => g.Select(a => a.Id).Contains(b.AuctionId))
                        .GroupBy(b => b.AuctionId)
                        .Select(bg => bg.Max(b => b.Amount))
                        .DefaultIfEmpty(0)
                        .Sum(),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Revenue)
                .Select(x => new CategoryRevenueDto
                {
                    Category = x.Category,
                    TotalRevenue = x.Revenue,
                    PercentageOfTotal = totalRevenue > 0 ? (x.Revenue / totalRevenue) * 100 : 0,
                    AuctionCount = x.Count
                })
                .ToList();

            // Revenue projection
            var projection = new RevenueProjectionDto
            {
                ProjectedMonthlyRevenue = monthlyRevenueDtos.Any() 
                    ? monthlyRevenueDtos.TakeLast(3).Average(m => m.Revenue) 
                    : 0,
                ProjectedYearlyRevenue = monthlyRevenueDtos.Any() 
                    ? monthlyRevenueDtos.TakeLast(3).Average(m => m.Revenue) * 12 
                    : 0,
                Confidence = monthlyRevenueDtos.Count >= 3 ? "High" : monthlyRevenueDtos.Count >= 2 ? "Medium" : "Low"
            };

            return new RevenueTrendsReportDto
            {
                TotalRevenue = totalRevenue,
                RevenueThisMonth = revenueThisMonth,
                RevenueLastMonth = revenueLastMonth,
                RevenueGrowthRate = revenueGrowthRate,
                AverageRevenuePerAuction = avgRevenuePerAuction,
                AverageRevenuePerDay = avgRevenuePerDay,
                DailyRevenue = dailyRevenue,
                MonthlyRevenue = monthlyRevenueDtos,
                CategoryRevenue = categoryRevenue,
                Projection = projection
            };
        }

        public async Task<AnalyticsDashboardDto> GetAnalyticsDashboardAsync()
        {
            var today = DateTime.UtcNow.Date;
            var thisMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
            var thisYearStart = new DateTime(DateTime.UtcNow.Year, 1, 1);

            // Overview metrics
            var totalUsers = await _context.Users.CountAsync();
            var totalAuctions = await _context.Auctions.CountAsync();
            var totalBids = await _context.Bids.CountAsync();
            var totalRevenue = await _context.Bids
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .SumAsync();

            var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedDate >= thisMonthStart);
            var newAuctionsThisMonth = await _context.Auctions.CountAsync(a => a.CreatedDate >= thisMonthStart);
            var revenueThisMonth = await _context.Bids
                .Where(b => b.BidDate >= thisMonthStart)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .SumAsync();

            var overview = new OverviewMetricsDto
            {
                TotalUsers = totalUsers,
                TotalAuctions = totalAuctions,
                TotalBids = totalBids,
                TotalRevenue = totalRevenue,
                NewUsersThisMonth = newUsersThisMonth,
                NewAuctionsThisMonth = newAuctionsThisMonth,
                RevenueThisMonth = revenueThisMonth
            };

            // User growth
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            var newUsersToday = await _context.Users.CountAsync(u => u.CreatedDate >= today);
            var newUsersThisWeek = await _context.Users.CountAsync(u => u.CreatedDate >= thisWeekStart);
            
            var lastMonthStart = thisMonthStart.AddMonths(-1);
            var newUsersLastMonth = await _context.Users.CountAsync(u => u.CreatedDate >= lastMonthStart && u.CreatedDate < thisMonthStart);
            var growthRate = newUsersLastMonth > 0 
                ? ((decimal)(newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
                : 0;

            var userGrowth = new UserGrowthDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                NewUsersToday = newUsersToday,
                NewUsersThisWeek = newUsersThisWeek,
                NewUsersThisMonth = newUsersThisMonth,
                GrowthRate = growthRate,
                GrowthTrend = new List<UserGrowthTrendDto>()
            };

            // Auction metrics
            var activeAuctions = await _context.Auctions.CountAsync(a => a.Status == AuctionStatus.Active);
            var completedAuctions = await _context.Auctions.CountAsync(a => a.Status == AuctionStatus.Sold);
            var completionRate = totalAuctions > 0 ? (decimal)completedAuctions / totalAuctions * 100 : 0;
            
            var auctionDurations = await _context.Auctions
                .Where(a => a.Status == AuctionStatus.Sold)
                .Select(a => (a.EndDate - a.StartDate).TotalDays)
                .ToListAsync();
            var avgDuration = auctionDurations.Any() ? (decimal)auctionDurations.Average() : 0;
            var avgBidsPerAuction = totalAuctions > 0 ? (decimal)totalBids / totalAuctions : 0;

            var auctionMetrics = new AuctionMetricsDto
            {
                TotalAuctions = totalAuctions,
                ActiveAuctions = activeAuctions,
                CompletedAuctions = completedAuctions,
                CompletionRate = completionRate,
                AverageDuration = avgDuration,
                AverageBidsPerAuction = avgBidsPerAuction
            };

            // Revenue metrics
            var revenueToday = await _context.Bids
                .Where(b => b.BidDate >= today)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .SumAsync();

            var revenueThisWeek = await _context.Bids
                .Where(b => b.BidDate >= thisWeekStart)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .SumAsync();

            var revenueThisYear = await _context.Bids
                .Where(b => b.BidDate >= thisYearStart)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .SumAsync();

            var revenueLastMonth = await _context.Bids
                .Where(b => b.BidDate >= lastMonthStart && b.BidDate < thisMonthStart)
                .GroupBy(b => b.AuctionId)
                .Select(g => g.Max(b => b.Amount))
                .DefaultIfEmpty(0)
                .SumAsync();

            var revenueGrowthRate = revenueLastMonth > 0 
                ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
                : 0;

            var revenueMetrics = new RevenueMetricsDto
            {
                TotalRevenue = totalRevenue,
                RevenueToday = revenueToday,
                RevenueThisWeek = revenueThisWeek,
                RevenueThisMonth = revenueThisMonth,
                RevenueThisYear = revenueThisYear,
                GrowthRate = revenueGrowthRate
            };

            // Key Performance Indicators
            var kpis = new List<PerformanceIndicatorDto>
            {
                new PerformanceIndicatorDto
                {
                    Name = "User Growth",
                    Value = $"+{newUsersThisMonth}",
                    Change = $"{growthRate:F1}%",
                    Trend = growthRate > 0 ? "up" : growthRate < 0 ? "down" : "stable",
                    Description = "New users this month"
                },
                new PerformanceIndicatorDto
                {
                    Name = "Revenue Growth",
                    Value = $"${revenueThisMonth:F2}",
                    Change = $"{revenueGrowthRate:F1}%",
                    Trend = revenueGrowthRate > 0 ? "up" : revenueGrowthRate < 0 ? "down" : "stable",
                    Description = "Revenue this month vs last month"
                },
                new PerformanceIndicatorDto
                {
                    Name = "Auction Success Rate",
                    Value = $"{completionRate:F1}%",
                    Change = "N/A",
                    Trend = "stable",
                    Description = "Percentage of auctions completed successfully"
                },
                new PerformanceIndicatorDto
                {
                    Name = "Active Users",
                    Value = $"{activeUsers}",
                    Change = $"{(totalUsers > 0 ? (decimal)activeUsers / totalUsers * 100 : 0):F1}%",
                    Trend = "stable",
                    Description = "Currently active user accounts"
                }
            };

            return new AnalyticsDashboardDto
            {
                Overview = overview,
                UserGrowth = userGrowth,
                AuctionMetrics = auctionMetrics,
                RevenueMetrics = revenueMetrics,
                KeyPerformanceIndicators = kpis
            };
        }
    }
}
