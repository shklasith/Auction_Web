using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Auction_Web.Data;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;

namespace Auction_Web.Services
{
    public interface IAdminService
    {
        Task<AdminProfileDto?> GetAdminProfileAsync(string adminId);
        Task<bool> UpdateAdminProfileAsync(string adminId, UpdateProfileDto model);
        Task<List<AdminActivityLogDto>> GetActivityLogAsync(string adminId, int days = 30);
        Task<AdminStatistics> GetStatisticsAsync();
        Task LogAdminActionAsync(string adminId, string action, string description, string? ipAddress = null);
        Task<AdminDashboardDto> GetDashboardDataAsync();
        Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10);
        Task<SystemHealthDto> GetSystemHealthAsync();
    }

    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IAuthService _authService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AdminService(
            ApplicationDbContext context, 
            UserManager<User> userManager,
            IAuthService authService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _userManager = userManager;
            _authService = authService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<AdminProfileDto?> GetAdminProfileAsync(string adminId)
        {
            var userProfile = await _authService.GetUserProfileAsync(adminId);
            if (userProfile == null) return null;

            var admin = await _userManager.FindByIdAsync(adminId);
            if (admin == null || admin.Role != UserRole.Administrator) return null;

            var totalManagedUsers = await _userManager.Users.CountAsync();
            var totalManagedAuctions = await _context.Auctions.CountAsync();
            var totalReportedIssues = 0; // Implement when you add reporting system

            var recentActivities = await _context.AdminActivityLogs
                .Where(a => a.AdminId == adminId)
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .Select(a => new AdminActivityLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    Description = a.Description ?? "",
                    Timestamp = a.Timestamp,
                    IpAddress = a.IpAddress
                })
                .ToListAsync();

            var lastActivity = await _context.AdminActivityLogs
                .Where(a => a.AdminId == adminId)
                .OrderByDescending(a => a.Timestamp)
                .FirstOrDefaultAsync();

            var statistics = await GetStatisticsAsync();

            return new AdminProfileDto
            {
                Id = userProfile.Id,
                Username = userProfile.Username,
                Email = userProfile.Email,
                FullName = userProfile.FullName,
                ProfileImage = userProfile.ProfileImage,
                CreatedDate = userProfile.CreatedDate,
                Rating = userProfile.Rating,
                TotalSales = userProfile.TotalSales,
                Role = userProfile.Role,
                PhoneNumber = userProfile.PhoneNumber,
                Address = userProfile.Address,
                LastLoginDate = userProfile.LastLoginDate,
                TotalManagedUsers = totalManagedUsers,
                TotalManagedAuctions = totalManagedAuctions,
                TotalReportedIssues = totalReportedIssues,
                LastAdminActionDate = lastActivity?.Timestamp ?? DateTime.UtcNow,
                RecentActivities = recentActivities,
                Statistics = statistics
            };
        }

        public async Task<bool> UpdateAdminProfileAsync(string adminId, UpdateProfileDto model)
        {
            var admin = await _userManager.FindByIdAsync(adminId);
            if (admin == null || admin.Role != UserRole.Administrator) return false;

            // Use the existing auth service to update profile
            var result = await _authService.UpdateProfileAsync(adminId, model);
            
            if (result.Success)
            {
                await LogAdminActionAsync(adminId, "Profile Updated", "Admin updated their profile information");
            }

            return result.Success;
        }

        public async Task<List<AdminActivityLogDto>> GetActivityLogAsync(string adminId, int days = 30)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            
            return await _context.AdminActivityLogs
                .Where(a => a.AdminId == adminId && a.Timestamp >= startDate)
                .OrderByDescending(a => a.Timestamp)
                .Select(a => new AdminActivityLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    Description = a.Description ?? "",
                    Timestamp = a.Timestamp,
                    IpAddress = a.IpAddress
                })
                .ToListAsync();
        }

        public async Task<AdminStatistics> GetStatisticsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var usersCreatedToday = await _userManager.Users
                .CountAsync(u => u.CreatedDate >= today && u.CreatedDate < tomorrow);

            var auctionsCreatedToday = await _context.Auctions
                .CountAsync(a => a.CreatedDate >= today && a.CreatedDate < tomorrow);

            var bidsPlacedToday = await _context.Bids
                .CountAsync(b => b.BidDate >= today && b.BidDate < tomorrow);

            var revenueToday = await _context.Bids
                .Where(b => b.BidDate >= today && b.BidDate < tomorrow)
                .SumAsync(b => (decimal?)b.Amount) ?? 0;

            var totalUsers = await _userManager.Users.CountAsync();
            var activeAuctions = await _context.Auctions.CountAsync(a => a.Status == AuctionStatus.Active);
            var totalRevenue = await _context.Bids.SumAsync(b => (decimal?)b.Amount) ?? 0;

            return new AdminStatistics
            {
                UsersCreatedToday = usersCreatedToday,
                AuctionsCreatedToday = auctionsCreatedToday,
                BidsPlacedToday = bidsPlacedToday,
                TotalRevenueToday = revenueToday,
                TotalUsers = totalUsers,
                ActiveAuctions = activeAuctions,
                TotalBidsToday = bidsPlacedToday,
                TotalRevenue = totalRevenue
            };
        }

        public async Task LogAdminActionAsync(string adminId, string action, string description, string? ipAddress = null)
        {
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            }

            var log = new AdminActivityLog
            {
                AdminId = adminId,
                Action = action,
                Description = description,
                Timestamp = DateTime.UtcNow,
                IpAddress = ipAddress
            };

            _context.AdminActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<AdminDashboardDto> GetDashboardDataAsync()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var totalBuyers = await _userManager.Users.CountAsync(u => u.Role == UserRole.Buyer);
            var totalSellers = await _userManager.Users.CountAsync(u => u.Role == UserRole.Seller);
            var totalAdmins = await _userManager.Users.CountAsync(u => u.Role == UserRole.Administrator);
            var activeUsers = await _userManager.Users.CountAsync(u => u.IsActive);
            var inactiveUsers = totalUsers - activeUsers;

            var totalAuctions = await _context.Auctions.CountAsync();
            var activeAuctions = await _context.Auctions.CountAsync(a => a.Status == AuctionStatus.Active);
            var completedAuctions = await _context.Auctions.CountAsync(a => a.Status == AuctionStatus.Sold);
            
            var totalBids = await _context.Bids.CountAsync();
            var totalRevenue = await _context.Bids.SumAsync(b => (decimal?)b.Amount) ?? 0;

            var recentUsers = await _userManager.Users
                .OrderByDescending(u => u.CreatedDate)
                .Take(10)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Username = u.UserName ?? "",
                    Email = u.Email ?? "",
                    FullName = u.FullName,
                    Role = u.Role,
                    CreatedDate = u.CreatedDate,
                    LastLoginDate = u.LastLoginDate,
                    ProfileImage = u.ProfileImage
                })
                .ToListAsync();

            var recentActivities = await GetRecentActivitiesAsync();
            var systemHealth = await GetSystemHealthAsync();

            return new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalBuyers = totalBuyers,
                TotalSellers = totalSellers,
                TotalAdmins = totalAdmins,
                ActiveUsers = activeUsers,
                InactiveUsers = inactiveUsers,
                TotalAuctions = totalAuctions,
                ActiveAuctions = activeAuctions,
                CompletedAuctions = completedAuctions,
                TotalBids = totalBids,
                TotalRevenue = totalRevenue,
                RecentUsers = recentUsers,
                RecentActivities = recentActivities,
                SystemHealth = systemHealth
            };
        }

        public async Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10)
        {
            var activities = new List<RecentActivityDto>();

            // Recent user registrations
            var recentUsers = await _userManager.Users
                .OrderByDescending(u => u.CreatedDate)
                .Take(count / 2)
                .ToListAsync();

            foreach (var user in recentUsers)
            {
                activities.Add(new RecentActivityDto
                {
                    Type = "User Registration",
                    Description = $"New user registered: {user.FullName}",
                    UserName = user.UserName ?? "",
                    Timestamp = user.CreatedDate,
                    Icon = "user-plus",
                    Color = "success"
                });
            }

            // Recent auctions
            var recentAuctions = await _context.Auctions
                .OrderByDescending(a => a.CreatedDate)
                .Take(count / 2)
                .ToListAsync();

            foreach (var auction in recentAuctions)
            {
                var seller = await _userManager.FindByIdAsync(auction.SellerId);
                activities.Add(new RecentActivityDto
                {
                    Type = "Auction Created",
                    Description = $"New auction: {auction.Title}",
                    UserName = seller?.UserName ?? "Unknown",
                    Timestamp = auction.CreatedDate,
                    Icon = "gavel",
                    Color = "primary"
                });
            }

            return activities.OrderByDescending(a => a.Timestamp).Take(count).ToList();
        }

        public async Task<SystemHealthDto> GetSystemHealthAsync()
        {
            var activeSessions = await _userManager.Users.CountAsync(u => u.LastLoginDate >= DateTime.UtcNow.AddHours(-1));
            
            // Simple database size estimation (you may need to adjust based on your DB)
            var totalRecords = await _context.Auctions.CountAsync() + 
                              await _context.Bids.CountAsync() + 
                              await _userManager.Users.CountAsync();

            return new SystemHealthDto
            {
                Status = "Healthy",
                CpuUsage = 0, // Implement actual CPU monitoring if needed
                MemoryUsage = 0, // Implement actual memory monitoring if needed
                DatabaseSize = totalRecords,
                ActiveSessions = activeSessions
            };
        }
    }
}
