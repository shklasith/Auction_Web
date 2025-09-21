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

        public AdminController(IAuthService authService, UserManager<User> userManager, ApplicationDbContext context)
        {
            _authService = authService;
            _userManager = userManager;
            _context = context;
        }

        public async Task<IActionResult> Users(int page = 1, int pageSize = 20, string searchTerm = "", UserRole? role = null)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => u.UserName.Contains(searchTerm) || 
                                       u.Email.Contains(searchTerm) || 
                                       u.FullName.Contains(searchTerm));
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
                    Username = u.UserName,
                    Email = u.Email,
                    FullName = u.FullName,
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

        public async Task<IActionResult> Dashboard()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var totalBuyers = await _userManager.Users.CountAsync(u => u.Role == UserRole.Buyer);
            var totalSellers = await _userManager.Users.CountAsync(u => u.Role == UserRole.Seller);
            var totalAdmins = await _userManager.Users.CountAsync(u => u.Role == UserRole.Administrator);
            var activeUsers = await _userManager.Users.CountAsync(u => u.IsActive);
            var inactiveUsers = await _userManager.Users.CountAsync(u => !u.IsActive);

            var recentUsers = await _userManager.Users
                .OrderByDescending(u => u.CreatedDate)
                .Take(10)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Username = u.UserName,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    CreatedDate = u.CreatedDate,
                    LastLoginDate = u.LastLoginDate
                })
                .ToListAsync();

            var model = new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalBuyers = totalBuyers,
                TotalSellers = totalSellers,
                TotalAdmins = totalAdmins,
                ActiveUsers = activeUsers,
                InactiveUsers = inactiveUsers,
                RecentUsers = recentUsers
            };

            return View(model);
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

    // Admin DTOs
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int TotalBuyers { get; set; }
        public int TotalSellers { get; set; }
        public int TotalAdmins { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public List<UserProfileDto> RecentUsers { get; set; } = new();
    }

    public class CreateAdminDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
