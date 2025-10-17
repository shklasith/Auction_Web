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
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
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
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
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
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
    }

    public class AuctionManagementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public decimal StartingPrice { get; set; }
        public decimal? CurrentBid { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalBids { get; set; }
        public bool IsFlagged { get; set; }
    }

    public class UserReportDto
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
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
        public string Title { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string WinnerName { get; set; } = string.Empty;
        public decimal StartingPrice { get; set; }
        public decimal FinalPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalBids { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
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
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }
}

