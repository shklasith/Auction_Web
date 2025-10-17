using Auction_Web.Models;

namespace Auction_Web.Models.DTOs
{
    // Auction Performance Report
    public class AuctionPerformanceReportDto
    {
        public int TotalAuctions { get; set; }
        public int ActiveAuctions { get; set; }
        public int CompletedAuctions { get; set; }
        public int CancelledAuctions { get; set; }
        public decimal AverageCompletionRate { get; set; }
        public decimal AverageBidsPerAuction { get; set; }
        public decimal AverageSalePrice { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<CategoryPerformanceDto> CategoryPerformance { get; set; } = new();
        public List<TopPerformingAuctionDto> TopPerformingAuctions { get; set; } = new();
    }

    public class CategoryPerformanceDto
    {
        public string Category { get; set; } = string.Empty;
        public int TotalAuctions { get; set; }
        public int CompletedAuctions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageSalePrice { get; set; }
        public int TotalBids { get; set; }
    }

    public class TopPerformingAuctionDto
    {
        public int AuctionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal FinalPrice { get; set; }
        public int TotalBids { get; set; }
        public int UniqueViewers { get; set; }
        public DateTime EndDate { get; set; }
    }

    // Bidder Activity Report
    public class BidderActivityReportDto
    {
        public int TotalBidders { get; set; }
        public int ActiveBidders { get; set; }
        public decimal AverageBidsPerBidder { get; set; }
        public decimal TotalBidVolume { get; set; }
        public List<TopBidderDto> TopBidders { get; set; } = new();
        public List<BiddingTrendDto> BiddingTrends { get; set; } = new();
        public BidderEngagementMetricsDto EngagementMetrics { get; set; } = new();
    }

    public class TopBidderDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalBids { get; set; }
        public decimal TotalBidAmount { get; set; }
        public int AuctionsWon { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal WinRate { get; set; }
    }

    public class BiddingTrendDto
    {
        public DateTime Date { get; set; }
        public int TotalBids { get; set; }
        public decimal TotalBidAmount { get; set; }
        public int UniqueBidders { get; set; }
    }

    public class BidderEngagementMetricsDto
    {
        public decimal AverageBidResponseTime { get; set; } // in minutes
        public int PeakBiddingHour { get; set; }
        public string MostActiveDay { get; set; } = string.Empty;
        public decimal RepeatBidderRate { get; set; }
    }

    // Revenue Trends Report
    public class RevenueTrendsReportDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public decimal RevenueLastMonth { get; set; }
        public decimal RevenueGrowthRate { get; set; }
        public decimal AverageRevenuePerAuction { get; set; }
        public decimal AverageRevenuePerDay { get; set; }
        public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
        public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
        public List<CategoryRevenueDto> CategoryRevenue { get; set; } = new();
        public RevenueProjectionDto Projection { get; set; } = new();
    }

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int CompletedAuctions { get; set; }
        public int TotalBids { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int CompletedAuctions { get; set; }
        public decimal GrowthRate { get; set; }
    }

    public class CategoryRevenueDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public decimal PercentageOfTotal { get; set; }
        public int AuctionCount { get; set; }
    }

    public class RevenueProjectionDto
    {
        public decimal ProjectedMonthlyRevenue { get; set; }
        public decimal ProjectedYearlyRevenue { get; set; }
        public string Confidence { get; set; } = "Medium";
    }

    // Comprehensive Analytics Dashboard
    public class AnalyticsDashboardDto
    {
        public OverviewMetricsDto Overview { get; set; } = new();
        public UserGrowthDto UserGrowth { get; set; } = new();
        public AuctionMetricsDto AuctionMetrics { get; set; } = new();
        public RevenueMetricsDto RevenueMetrics { get; set; } = new();
        public List<PerformanceIndicatorDto> KeyPerformanceIndicators { get; set; } = new();
    }

    public class OverviewMetricsDto
    {
        public int TotalUsers { get; set; }
        public int TotalAuctions { get; set; }
        public int TotalBids { get; set; }
        public decimal TotalRevenue { get; set; }
        public int NewUsersThisMonth { get; set; }
        public int NewAuctionsThisMonth { get; set; }
        public decimal RevenueThisMonth { get; set; }
    }

    public class UserGrowthDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersToday { get; set; }
        public int NewUsersThisWeek { get; set; }
        public int NewUsersThisMonth { get; set; }
        public decimal GrowthRate { get; set; }
        public List<UserGrowthTrendDto> GrowthTrend { get; set; } = new();
    }

    public class UserGrowthTrendDto
    {
        public DateTime Date { get; set; }
        public int NewUsers { get; set; }
        public int TotalUsers { get; set; }
    }

    public class AuctionMetricsDto
    {
        public int TotalAuctions { get; set; }
        public int ActiveAuctions { get; set; }
        public int CompletedAuctions { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal AverageDuration { get; set; } // in days
        public decimal AverageBidsPerAuction { get; set; }
    }

    public class RevenueMetricsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal RevenueToday { get; set; }
        public decimal RevenueThisWeek { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public decimal RevenueThisYear { get; set; }
        public decimal GrowthRate { get; set; }
    }

    public class PerformanceIndicatorDto
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Change { get; set; } = string.Empty;
        public string Trend { get; set; } = "stable"; // up, down, stable
        public string Description { get; set; } = string.Empty;
    }

    // Report Filter Request
    public class ReportFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Category { get; set; }
        public AuctionStatus? Status { get; set; }
        public int? TopN { get; set; } = 10;
    }

    // Export Report Request
    public class ExportReportRequestDto
    {
        public string ReportType { get; set; } = string.Empty; // auction, bidder, revenue, analytics
        public string Format { get; set; } = "json"; // json, csv, pdf
        public ReportFilterDto? Filters { get; set; }
    }
}

