using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models.DTOs
{
    public class AdminProfileDto : UserProfileDto
    {
        public int TotalManagedUsers { get; set; }
        public int TotalManagedAuctions { get; set; }
        public int TotalReportedIssues { get; set; }
        public DateTime LastAdminActionDate { get; set; }
        public List<AdminActivityLogDto> RecentActivities { get; set; } = new();
        public AdminStatistics Statistics { get; set; } = new();
    }

    public class AdminActivityLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; }
        public string Description { get; set; }
        public DateTime Timestamp { get; set; }
        public string? IpAddress { get; set; }
    }

    public class AdminStatistics
    {
        public int UsersCreatedToday { get; set; }
        public int AuctionsCreatedToday { get; set; }
        public int BidsPlacedToday { get; set; }
        public decimal TotalRevenueToday { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveAuctions { get; set; }
        public int TotalBidsToday { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int TotalBuyers { get; set; }
        public int TotalSellers { get; set; }
        public int TotalAdmins { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int TotalAuctions { get; set; }
        public int ActiveAuctions { get; set; }
        public int CompletedAuctions { get; set; }
        public int TotalBids { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<UserProfileDto> RecentUsers { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
        public SystemHealthDto SystemHealth { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string Type { get; set; }
        public string Description { get; set; }
        public string UserName { get; set; }
        public DateTime Timestamp { get; set; }
        public string Icon { get; set; }
        public string Color { get; set; }
    }

    public class SystemHealthDto
    {
        public string Status { get; set; } = "Healthy";
        public double CpuUsage { get; set; }
        public double MemoryUsage { get; set; }
        public long DatabaseSize { get; set; }
        public int ActiveSessions { get; set; }
    }

    public class CreateAdminDto
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(200)]
        public string FullName { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        public string? PhoneNumber { get; set; }
    }

    public class AuctionManagementDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string SellerName { get; set; }
        public string SellerId { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal? CurrentBid { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public int TotalBids { get; set; }
        public bool IsFlagged { get; set; }
    }

    public class UserReportDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreatedDate { get; set; }
        public int AuctionsCreated { get; set; }
        public int BidsPlaced { get; set; }
        public int AuctionsWon { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal TotalEarned { get; set; }
        public bool IsActive { get; set; }
    }

    public class AuctionReportDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string SellerName { get; set; }
        public string WinnerName { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal FinalPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalBids { get; set; }
        public string Status { get; set; }
        public string Category { get; set; }
    }

    public class RevenueReportDto
    {
        public DateTime Date { get; set; }
        public int TotalAuctions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageBidAmount { get; set; }
        public int TotalBids { get; set; }
        public int NewUsers { get; set; }
    }

    public class SystemSettingDto
    {
        public int Id { get; set; }
        public string SettingKey { get; set; }
        public string SettingValue { get; set; }
        public string Category { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

