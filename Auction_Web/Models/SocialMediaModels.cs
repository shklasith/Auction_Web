using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_Web.Models
{
    public enum SocialPlatform
    {
        Facebook,
        Twitter,
        Instagram,
        LinkedIn,
        WhatsApp,
        Pinterest,
        Email,
        CopyLink
    }

    public class SocialShare
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AuctionId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public SocialPlatform Platform { get; set; }

        public DateTime SharedDate { get; set; } = DateTime.UtcNow;

        public string? ShareUrl { get; set; }

        public string? ShareMessage { get; set; }

        // Track engagement from shared links
        public int Clicks { get; set; } = 0;
        public int Conversions { get; set; } = 0; // Bids from this share

        // Navigation properties
        [ForeignKey("AuctionId")]
        public virtual Auction? Auction { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }

    public class SocialMediaAccount
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public SocialPlatform Platform { get; set; }

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; } = string.Empty;

        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? TokenExpiry { get; set; }

        public bool IsConnected { get; set; } = true;
        public bool AutoShare { get; set; } = false; // Auto-share new auctions

        public DateTime ConnectedDate { get; set; } = DateTime.UtcNow;
        public DateTime? LastUsedDate { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }

    public class ShareTemplate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public SocialPlatform Platform { get; set; }

        [Required]
        [StringLength(500)]
        public string Template { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Hashtags { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
