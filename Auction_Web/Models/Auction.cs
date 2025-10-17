using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public enum AuctionStatus
    {
        Draft,
        Scheduled,
        Active,
        Ended,
        Cancelled,
        Sold
    }

    public enum AuctionType
    {
        Standard,
        Reserve,
        BuyItNow,
        DutchAuction
    }

    public class Auction
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;
        
        [StringLength(5000)]
        public string? DetailedDescription { get; set; }
        
        [Required]
        public decimal StartingPrice { get; set; }
        
        public decimal CurrentPrice { get; set; }
        
        public decimal? BuyNowPrice { get; set; }
        
        public decimal? ReservePrice { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ModifiedDate { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? SubCategory { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Condition { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? ConditionNotes { get; set; }
        
        public AuctionStatus Status { get; set; } = AuctionStatus.Draft;
        
        public AuctionType Type { get; set; } = AuctionType.Standard;
        
        public bool IsActive { get; set; } = true;
        
        public bool IsFeatured { get; set; } = false;
        
        public int ViewCount { get; set; } = 0;
        
        public int BidCount { get; set; } = 0;
        
        public int WatchlistCount { get; set; } = 0;
        
        [Required]
        public string SellerId { get; set; } = string.Empty;
        
        public string? WinnerId { get; set; }
        
        // Item specifications
        [StringLength(100)]
        public string? Brand { get; set; }
        
        [StringLength(100)]
        public string? Model { get; set; }
        
        [StringLength(50)]
        public string? Size { get; set; }
        
        [StringLength(50)]
        public string? Color { get; set; }
        
        [StringLength(50)]
        public string? Material { get; set; }
        
        public int? YearManufactured { get; set; }
        
        [StringLength(100)]
        public string? CountryOfOrigin { get; set; }
        
        // Shipping and handling
        public decimal? ShippingCost { get; set; }
        
        public bool FreeShipping { get; set; } = false;
        
        public bool LocalPickupOnly { get; set; } = false;
        
        [StringLength(500)]
        public string? ShippingNotes { get; set; }
        
        [StringLength(100)]
        public string? ItemLocation { get; set; }
        
        // Auction settings
        public decimal? BidIncrement { get; set; }
        
        public bool AutoExtend { get; set; } = false;
        
        public int? AutoExtendMinutes { get; set; }
        
        public bool RequirePreApproval { get; set; } = false;
        
        public int? MaxBids { get; set; }
        
        // Additional metadata
        [StringLength(500)]
        public string? Tags { get; set; }
        
        [StringLength(200)]
        public string? ExternalReference { get; set; }
        
        public bool IsVerified { get; set; } = false;
        
        public DateTime? VerifiedDate { get; set; }
        
        public string? VerifiedBy { get; set; }

        // Navigation properties
        public virtual User? Winner { get; set; }
        public virtual User? VerifiedByUser { get; set; }
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public virtual ICollection<AuctionImage> Images { get; set; } = new List<AuctionImage>();
        public virtual ICollection<AuctionView> Views { get; set; } = new List<AuctionView>();
        
        // Computed properties for compatibility
        public bool IsLive => Status == AuctionStatus.Active && DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;
        public bool HasEnded => DateTime.UtcNow > EndDate || Status == AuctionStatus.Ended;
        public bool HasStarted => DateTime.UtcNow >= StartDate;
        public TimeSpan TimeRemaining => EndDate > DateTime.UtcNow ? EndDate - DateTime.UtcNow : TimeSpan.Zero;
    }
}
