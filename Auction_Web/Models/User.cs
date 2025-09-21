using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Auction_Web.Models
{
    public enum UserRole
    {
        Buyer,
        Seller,
        Administrator
    }

    public class User : IdentityUser
    {
        [Required]
        [StringLength(200)]
        public string FullName { get; set; }
        
        public string? ProfileImage { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public decimal Rating { get; set; } = 0;
        
        public int TotalSales { get; set; } = 0;
        
        public UserRole Role { get; set; } = UserRole.Buyer;
        
        public bool IsActive { get; set; } = true;
        
        public string? Address { get; set; }
        
        public string? PhoneNumber { get; set; }
        
        public DateTime? LastLoginDate { get; set; }
        
        // Navigation properties
        public virtual ICollection<Auction> Auctions { get; set; } = new List<Auction>();
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public virtual ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
    }
}
