using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;

namespace Auction_Web.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto model);
        Task<AuthResponseDto> LoginAsync(LoginDto model);
        Task<AuthResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto model);
        Task<AuthResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto model);
        Task<UserProfileDto?> GetUserProfileAsync(string userId);
        Task<bool> DeactivateUserAsync(string userId);
        Task<bool> ActivateUserAsync(string userId);
        string GenerateJwtToken(User user);
    }

    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IImageService _imageService;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            IImageService imageService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _imageService = imageService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto model)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User with this email already exists."
                    };
                }

                existingUser = await _userManager.FindByNameAsync(model.Username);
                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Username is already taken."
                    };
                }

                // Create new user
                var user = new User
                {
                    UserName = model.Username,
                    Email = model.Email,
                    FullName = model.FullName,
                    Role = model.Role,
                    PhoneNumber = model.PhoneNumber,
                    Address = model.Address,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    var token = GenerateJwtToken(user);
                    var userProfile = new UserProfileDto
                    {
                        Id = user.Id,
                        Username = user.UserName,
                        Email = user.Email,
                        FullName = user.FullName,
                        Role = user.Role,
                        CreatedDate = user.CreatedDate,
                        PhoneNumber = user.PhoneNumber,
                        Address = user.Address,
                        Rating = user.Rating,
                        TotalSales = user.TotalSales
                    };

                    return new AuthResponseDto
                    {
                        Success = true,
                        Token = token,
                        User = userProfile,
                        Message = "Registration successful."
                    };
                }

                return new AuthResponseDto
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description).ToList(),
                    Message = "Registration failed."
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration."
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto model)
        {
            try
            {
                // Find user by username or email
                var user = await _userManager.FindByNameAsync(model.UsernameOrEmail) ??
                          await _userManager.FindByEmailAsync(model.UsernameOrEmail);

                if (user == null || !user.IsActive)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid credentials or account is deactivated."
                    };
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

                if (result.Succeeded)
                {
                    // Update last login date
                    user.LastLoginDate = DateTime.UtcNow;
                    await _userManager.UpdateAsync(user);

                    var token = GenerateJwtToken(user);
                    var userProfile = new UserProfileDto
                    {
                        Id = user.Id,
                        Username = user.UserName,
                        Email = user.Email,
                        FullName = user.FullName,
                        ProfileImage = user.ProfileImage,
                        Role = user.Role,
                        CreatedDate = user.CreatedDate,
                        PhoneNumber = user.PhoneNumber,
                        Address = user.Address,
                        Rating = user.Rating,
                        TotalSales = user.TotalSales,
                        LastLoginDate = user.LastLoginDate
                    };

                    return new AuthResponseDto
                    {
                        Success = true,
                        Token = token,
                        User = userProfile,
                        Message = "Login successful."
                    };
                }

                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid credentials."
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login."
                };
            }
        }

        public async Task<AuthResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User not found."
                    };
                }

                // Update profile information
                user.FullName = model.FullName;
                user.Email = model.Email;
                user.PhoneNumber = model.PhoneNumber;
                user.Address = model.Address;

                // Handle profile image upload
                if (model.ProfileImage != null)
                {
                    // Delete old profile image if exists
                    if (!string.IsNullOrEmpty(user.ProfileImage))
                    {
                        await _imageService.DeleteImageAsync(user.ProfileImage);
                    }

                    // Save new profile image
                    user.ProfileImage = await _imageService.SaveImageAsync(model.ProfileImage, "profiles");
                }

                var result = await _userManager.UpdateAsync(user);

                if (result.Succeeded)
                {
                    var userProfile = new UserProfileDto
                    {
                        Id = user.Id,
                        Username = user.UserName,
                        Email = user.Email,
                        FullName = user.FullName,
                        ProfileImage = user.ProfileImage,
                        Role = user.Role,
                        CreatedDate = user.CreatedDate,
                        PhoneNumber = user.PhoneNumber,
                        Address = user.Address,
                        Rating = user.Rating,
                        TotalSales = user.TotalSales,
                        LastLoginDate = user.LastLoginDate
                    };

                    return new AuthResponseDto
                    {
                        Success = true,
                        User = userProfile,
                        Message = "Profile updated successfully."
                    };
                }

                return new AuthResponseDto
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description).ToList(),
                    Message = "Profile update failed."
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating profile."
                };
            }
        }

        public async Task<AuthResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User not found."
                    };
                }

                var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

                if (result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = true,
                        Message = "Password changed successfully."
                    };
                }

                return new AuthResponseDto
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description).ToList(),
                    Message = "Password change failed."
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while changing password."
                };
            }
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                FullName = user.FullName,
                ProfileImage = user.ProfileImage,
                Role = user.Role,
                CreatedDate = user.CreatedDate,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Rating = user.Rating,
                TotalSales = user.TotalSales,
                LastLoginDate = user.LastLoginDate
            };
        }

        public async Task<bool> DeactivateUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<bool> ActivateUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.IsActive = true;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? "your-super-secret-key-that-is-at-least-32-characters-long!");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim("FullName", user.FullName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
