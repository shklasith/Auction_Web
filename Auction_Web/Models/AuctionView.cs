using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public class AuctionView
    {
        public int Id { get; set; }
        
        [Required]
        public int AuctionId { get; set; }
        
        public string? UserId { get; set; }
        
        [StringLength(45)]
        public string? IpAddress { get; set; }
        
        [StringLength(500)]
        public string? UserAgent { get; set; }
        
        public DateTime ViewedDate { get; set; } = DateTime.UtcNow;
        
        public int Duration { get; set; } = 0; // in seconds
        
        [StringLength(200)]
        public string? ReferrerUrl { get; set; }

        // Navigation properties
        public virtual Auction Auction { get; set; }
        public virtual User? User { get; set; }
    }
}
