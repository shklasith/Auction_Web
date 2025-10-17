using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Auction_Web.Models.DTOs;
using Auction_Web.Services;

namespace Auction_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrator")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportingService _reportingService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportingService reportingService, ILogger<ReportsController> logger)
        {
            _reportingService = reportingService;
            _logger = logger;
        }

        /// <summary>
        /// Get comprehensive auction performance report
        /// </summary>
        /// <param name="startDate">Start date for the report (optional)</param>
        /// <param name="endDate">End date for the report (optional)</param>
        /// <param name="category">Filter by category (optional)</param>
        /// <param name="status">Filter by auction status (optional)</param>
        /// <param name="topN">Number of top performers to include (default: 10)</param>
        /// <returns>Auction performance metrics and analytics</returns>
        [HttpGet("auction-performance")]
        public async Task<ActionResult<AuctionPerformanceReportDto>> GetAuctionPerformanceReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? category = null,
            [FromQuery] Models.AuctionStatus? status = null,
            [FromQuery] int topN = 10)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    Category = category,
                    Status = status,
                    TopN = topN
                };

                var report = await _reportingService.GetAuctionPerformanceReportAsync(filters);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating auction performance report");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get bidder activity and engagement report
        /// </summary>
        /// <param name="startDate">Start date for the report (optional)</param>
        /// <param name="endDate">End date for the report (optional)</param>
        /// <param name="topN">Number of top bidders to include (default: 10)</param>
        /// <returns>Bidder activity metrics and top performers</returns>
        [HttpGet("bidder-activity")]
        public async Task<ActionResult<BidderActivityReportDto>> GetBidderActivityReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int topN = 10)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    TopN = topN
                };

                var report = await _reportingService.GetBidderActivityReportAsync(filters);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating bidder activity report");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get revenue trends and financial analytics report
        /// </summary>
        /// <param name="startDate">Start date for the report (default: 6 months ago)</param>
        /// <param name="endDate">End date for the report (default: today)</param>
        /// <returns>Revenue trends, projections, and category breakdown</returns>
        [HttpGet("revenue-trends")]
        public async Task<ActionResult<RevenueTrendsReportDto>> GetRevenueTrendsReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var report = await _reportingService.GetRevenueTrendsReportAsync(filters);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating revenue trends report");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get comprehensive analytics dashboard with all key metrics
        /// </summary>
        /// <returns>Complete analytics overview including users, auctions, revenue, and KPIs</returns>
        [HttpGet("analytics-dashboard")]
        public async Task<ActionResult<AnalyticsDashboardDto>> GetAnalyticsDashboard()
        {
            try
            {
                var dashboard = await _reportingService.GetAnalyticsDashboardAsync();
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating analytics dashboard");
                return StatusCode(500, new { message = "Error generating dashboard", error = ex.Message });
            }
        }

        /// <summary>
        /// Get quick summary statistics
        /// </summary>
        /// <returns>Key metrics summary</returns>
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetReportSummary()
        {
            try
            {
                var dashboard = await _reportingService.GetAnalyticsDashboardAsync();
                
                var summary = new
                {
                    totalRevenue = dashboard.Overview.TotalRevenue,
                    totalUsers = dashboard.Overview.TotalUsers,
                    totalAuctions = dashboard.Overview.TotalAuctions,
                    totalBids = dashboard.Overview.TotalBids,
                    activeAuctions = dashboard.AuctionMetrics.ActiveAuctions,
                    revenueThisMonth = dashboard.RevenueMetrics.RevenueThisMonth,
                    revenueGrowth = dashboard.RevenueMetrics.GrowthRate,
                    userGrowth = dashboard.UserGrowth.GrowthRate,
                    completionRate = dashboard.AuctionMetrics.CompletionRate
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report summary");
                return StatusCode(500, new { message = "Error generating summary", error = ex.Message });
            }
        }

        /// <summary>
        /// Get category performance comparison
        /// </summary>
        /// <param name="startDate">Start date (optional)</param>
        /// <param name="endDate">End date (optional)</param>
        /// <returns>Performance metrics by category</returns>
        [HttpGet("category-performance")]
        public async Task<ActionResult<List<CategoryPerformanceDto>>> GetCategoryPerformance(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var report = await _reportingService.GetAuctionPerformanceReportAsync(filters);
                return Ok(report.CategoryPerformance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating category performance report");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get top performing auctions
        /// </summary>
        /// <param name="topN">Number of top auctions to return (default: 10)</param>
        /// <param name="startDate">Start date (optional)</param>
        /// <param name="endDate">End date (optional)</param>
        /// <returns>List of top performing auctions</returns>
        [HttpGet("top-auctions")]
        public async Task<ActionResult<List<TopPerformingAuctionDto>>> GetTopAuctions(
            [FromQuery] int topN = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    TopN = topN
                };

                var report = await _reportingService.GetAuctionPerformanceReportAsync(filters);
                return Ok(report.TopPerformingAuctions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top auctions");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get top bidders by activity
        /// </summary>
        /// <param name="topN">Number of top bidders to return (default: 10)</param>
        /// <param name="startDate">Start date (optional)</param>
        /// <param name="endDate">End date (optional)</param>
        /// <returns>List of top bidders with their statistics</returns>
        [HttpGet("top-bidders")]
        public async Task<ActionResult<List<TopBidderDto>>> GetTopBidders(
            [FromQuery] int topN = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    TopN = topN
                };

                var report = await _reportingService.GetBidderActivityReportAsync(filters);
                return Ok(report.TopBidders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top bidders");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get bidding trends over time
        /// </summary>
        /// <param name="startDate">Start date (optional)</param>
        /// <param name="endDate">End date (optional)</param>
        /// <returns>Daily bidding trends</returns>
        [HttpGet("bidding-trends")]
        public async Task<ActionResult<List<BiddingTrendDto>>> GetBiddingTrends(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var report = await _reportingService.GetBidderActivityReportAsync(filters);
                return Ok(report.BiddingTrends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bidding trends");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get revenue by category
        /// </summary>
        /// <param name="startDate">Start date (optional)</param>
        /// <param name="endDate">End date (optional)</param>
        /// <returns>Revenue breakdown by category</returns>
        [HttpGet("revenue-by-category")]
        public async Task<ActionResult<List<CategoryRevenueDto>>> GetRevenueByCategory(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var report = await _reportingService.GetRevenueTrendsReportAsync(filters);
                return Ok(report.CategoryRevenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue by category");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get monthly revenue trends
        /// </summary>
        /// <param name="startDate">Start date (optional, default: 6 months ago)</param>
        /// <param name="endDate">End date (optional, default: today)</param>
        /// <returns>Monthly revenue breakdown with growth rates</returns>
        [HttpGet("monthly-revenue")]
        public async Task<ActionResult<List<MonthlyRevenueDto>>> GetMonthlyRevenue(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var report = await _reportingService.GetRevenueTrendsReportAsync(filters);
                return Ok(report.MonthlyRevenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly revenue");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get daily revenue trends
        /// </summary>
        /// <param name="startDate">Start date (optional)</param>
        /// <param name="endDate">End date (optional)</param>
        /// <returns>Daily revenue breakdown</returns>
        [HttpGet("daily-revenue")]
        public async Task<ActionResult<List<DailyRevenueDto>>> GetDailyRevenue(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filters = new ReportFilterDto
                {
                    StartDate = startDate,
                    EndDate = endDate
                };

                var report = await _reportingService.GetRevenueTrendsReportAsync(filters);
                return Ok(report.DailyRevenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily revenue");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get revenue projection based on historical data
        /// </summary>
        /// <returns>Revenue projections for upcoming periods</returns>
        [HttpGet("revenue-projection")]
        public async Task<ActionResult<RevenueProjectionDto>> GetRevenueProjection()
        {
            try
            {
                var report = await _reportingService.GetRevenueTrendsReportAsync();
                return Ok(report.Projection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue projection");
                return StatusCode(500, new { message = "Error generating projection", error = ex.Message });
            }
        }

        /// <summary>
        /// Get key performance indicators (KPIs)
        /// </summary>
        /// <returns>List of key performance indicators with trends</returns>
        [HttpGet("kpis")]
        public async Task<ActionResult<List<PerformanceIndicatorDto>>> GetKeyPerformanceIndicators()
        {
            try
            {
                var dashboard = await _reportingService.GetAnalyticsDashboardAsync();
                return Ok(dashboard.KeyPerformanceIndicators);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPIs");
                return StatusCode(500, new { message = "Error generating KPIs", error = ex.Message });
            }
        }
    }
}

