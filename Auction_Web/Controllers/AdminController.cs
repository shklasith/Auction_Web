using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Auction_Web.Data;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;
using Auction_Web.Services;

namespace Auction_Web.Controllers
{
    [Authorize(Roles = "Administrator")]
    public class AdminController : Controller
    {
        private readonly IAuthService _authService;
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IAdminService _adminService;

        public AdminController(
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

        public async Task<IActionResult> Users(int page = 1, int pageSize = 20, string searchTerm = "", UserRole? role = null)
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

            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = (int)Math.Ceiling((double)totalUsers / pageSize);
            ViewBag.SearchTerm = searchTerm;
            ViewBag.SelectedRole = role;
            ViewBag.TotalUsers = totalUsers;

            return View(users);
        }

        public async Task<IActionResult> UserDetail(string id)
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

                ViewBag.AuctionCount = auctionCount;
                ViewBag.BidCount = bidCount;
                ViewBag.WatchlistCount = watchlistCount;
            }

            return View(profile);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found." });
            }

            bool result;
            string message;

            if (user.IsActive)
            {
                result = await _authService.DeactivateUserAsync(userId);
                message = result ? "User deactivated successfully." : "Failed to deactivate user.";
            }
            else
            {
                result = await _authService.ActivateUserAsync(userId);
                message = result ? "User activated successfully." : "Failed to activate user.";
            }

            return Json(new { success = result, message = message, isActive = !user.IsActive });
        }

        // Admin Profile Management
        [HttpGet]
        public async Task<IActionResult> Profile()
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

            return View(profile);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile([FromForm] Models.DTOs.UpdateProfileDto model)
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return Json(new { success = false, message = "Unauthorized" });
            }

            var result = await _adminService.UpdateAdminProfileAsync(adminId, model);
            
            return Json(new { success = result, message = result ? "Profile updated successfully" : "Failed to update profile" });
        }

        [HttpGet]
        public async Task<IActionResult> ActivityLog(int days = 30)
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminId))
            {
                return Unauthorized();
            }

            var activities = await _adminService.GetActivityLogAsync(adminId, days);
            return Json(activities);
        }

        [HttpGet]
        public async Task<IActionResult> Statistics()
        {
            var stats = await _adminService.GetStatisticsAsync();
            return Json(stats);
        }

        // Dashboard
        [HttpGet]
        public async Task<IActionResult> Dashboard()
        {
            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(adminId))
            {
                await _adminService.LogAdminActionAsync(adminId, "Dashboard Accessed", "Admin viewed the dashboard");
            }

            var dashboardData = await _adminService.GetDashboardDataAsync();
            return View(dashboardData);
        }

        [HttpPost]
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
                return Json(new { success = true, message = "Administrator created successfully." });
            }

            return Json(new { success = false, message = result.Message, errors = result.Errors });
        }
    }
}
