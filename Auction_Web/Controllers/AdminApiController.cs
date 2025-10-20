using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using Auction_Web.Data;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;
using Auction_Web.Services;

namespace Auction_Web.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [EnableCors("AllowAll")]
    public class AdminApiController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IAdminService _adminService;

        public AdminApiController(
            IAuthService authService, 
            UserManager<User> userManager, 
            ApplicationDbContext context,
            IAdminService adminService)
        {
            _authService = authService;
            _userManager = userManager;
            _context = context;
            _adminService = adminService;
        }

        // Dashboard endpoint - No authentication required
        [HttpGet("dashboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDashboardData()
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(adminId))
            {
                await _adminService.LogAdminActionAsync(adminId, "Dashboard Accessed", "Admin viewed the dashboard");
            }

            var dashboardData = await _adminService.GetDashboardDataAsync();
            return Ok(dashboardData);
        }

        // Profile endpoints
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return Unauthorized();
            }

            var profile = await _adminService.GetAdminProfileAsync(adminId);
            if (profile == null)
            {
                return NotFound();
            }

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto model)
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return Unauthorized();
            }

            var result = await _adminService.UpdateAdminProfileAsync(adminId, model);
            
            if (result)
            {
                return Ok(new { success = true, message = "Profile updated successfully" });
            }

            return BadRequest(new { success = false, message = "Failed to update profile" });
        }

        // Activity log
        [HttpGet("activity-log")]
        public async Task<IActionResult> GetActivityLog([FromQuery] int days = 30)
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return Unauthorized();
            }

            var activities = await _adminService.GetActivityLogAsync(adminId, days);
            return Ok(activities);
        }

        // Statistics
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var stats = await _adminService.GetStatisticsAsync();
            return Ok(stats);
        }

        // User management
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 20, 
            [FromQuery] string searchTerm = "", 
            [FromQuery] UserRole? role = null)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => (u.UserName != null && u.UserName.Contains(searchTerm)) || 
                                       (u.Email != null && u.Email.Contains(searchTerm)) || 
                                       (u.FullName != null && u.FullName.Contains(searchTerm)));
            }

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            var totalUsers = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Username = u.UserName ?? string.Empty,
                    Email = u.Email ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    ProfileImage = u.ProfileImage,
                    Role = u.Role,
                    CreatedDate = u.CreatedDate,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    Rating = u.Rating,
                    TotalSales = u.TotalSales,
                    LastLoginDate = u.LastLoginDate
                })
                .ToListAsync();

            return Ok(new
            {
                users = users,
                totalUsers = totalUsers,
                currentPage = page,
                totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
            });
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserDetail(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return NotFound();
            }

            var profile = await _authService.GetUserProfileAsync(id);
            if (profile == null)
            {
                return NotFound();
            }

            // Get additional statistics
            var user = await _userManager.FindByIdAsync(id);
            if (user != null)
            {
                var auctionCount = await _context.Auctions.CountAsync(a => a.SellerId == id);
                var bidCount = await _context.Bids.CountAsync(b => b.UserId == id);
                var watchlistCount = await _context.WatchlistItems.CountAsync(w => w.UserId == id);

                return Ok(new
                {
                    profile = profile,
                    auctionCount = auctionCount,
                    bidCount = bidCount,
                    watchlistCount = watchlistCount
                });
            }

            return Ok(new { profile = profile });
        }

        [HttpPost("toggle-user-status")]
        public async Task<IActionResult> ToggleUserStatus([FromBody] ToggleUserStatusDto model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            bool result;
            string message;

            if (user.IsActive)
            {
                result = await _authService.DeactivateUserAsync(model.UserId);
                message = result ? "User deactivated successfully." : "Failed to deactivate user.";
            }
            else
            {
                result = await _authService.ActivateUserAsync(model.UserId);
                message = result ? "User activated successfully." : "Failed to activate user.";
            }

            return Ok(new { success = result, message = message, isActive = !user.IsActive });
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid input data." });
            }

            var registerDto = new RegisterDto
            {
                Username = model.Username,
                Email = model.Email,
                FullName = model.FullName,
                Password = model.Password,
                ConfirmPassword = model.ConfirmPassword,
                Role = UserRole.Administrator
            };

            var result = await _authService.RegisterAsync(registerDto);
            
            if (result.Success)
            {
                return Ok(new { success = true, message = "Administrator created successfully." });
            }

            return BadRequest(new { success = false, message = result.Message, errors = result.Errors });
        }
    }

    public class ToggleUserStatusDto
    {
        public string UserId { get; set; } = string.Empty;
    }
}
