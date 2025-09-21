using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models.DTOs
{
    public class RegisterDto
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

        public UserRole Role { get; set; } = UserRole.Buyer;

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }
    }

    public class LoginDto
    {
        [Required]
        public string UsernameOrEmail { get; set; }

        [Required]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }

    public class UpdateProfileDto
    {
        [Required]
        [StringLength(200)]
        public string FullName { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public IFormFile? ProfileImage { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmNewPassword { get; set; }
    }

    public class UserProfileDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string? ProfileImage { get; set; }
        public DateTime CreatedDate { get; set; }
        public decimal Rating { get; set; }
        public int TotalSales { get; set; }
        public UserRole Role { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }

    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public UserProfileDto? User { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }
    }
}
