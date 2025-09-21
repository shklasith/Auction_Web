using System.ComponentModel.DataAnnotations;
using Auction_Web.Models;

namespace Auction_Web.Models.DTOs
{
    public class CreateAuctionDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        [StringLength(2000)]
        public string Description { get; set; }
        
        [StringLength(5000)]
        public string? DetailedDescription { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Starting price must be greater than 0")]
        public decimal StartingPrice { get; set; }
        
        [Range(0.01, double.MaxValue, ErrorMessage = "Buy now price must be greater than 0")]
        public decimal? BuyNowPrice { get; set; }
        
        [Range(0.01, double.MaxValue, ErrorMessage = "Reserve price must be greater than 0")]
        public decimal? ReservePrice { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; }
        
        [StringLength(100)]
        public string? SubCategory { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Condition { get; set; }
        
        [StringLength(1000)]
        public string? ConditionNotes { get; set; }
        
        public AuctionType Type { get; set; } = AuctionType.Standard;
        
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
        
        [Range(1800, 2100)]
        public int? YearManufactured { get; set; }
        
        [StringLength(100)]
        public string? CountryOfOrigin { get; set; }
        
        // Shipping and handling
        [Range(0, double.MaxValue)]
        public decimal? ShippingCost { get; set; }
        
        public bool FreeShipping { get; set; } = false;
        
        public bool LocalPickupOnly { get; set; } = false;
        
        [StringLength(500)]
        public string? ShippingNotes { get; set; }
        
        [StringLength(100)]
        public string? ItemLocation { get; set; }
        
        // Auction settings
        [Range(0.01, double.MaxValue)]
        public decimal? BidIncrement { get; set; }
        
        public bool AutoExtend { get; set; } = false;
        
        [Range(1, 60)]
        public int? AutoExtendMinutes { get; set; }
        
        public bool RequirePreApproval { get; set; } = false;
        
        [Range(1, 1000)]
        public int? MaxBids { get; set; }
        
        [StringLength(500)]
        public string? Tags { get; set; }
        
        [StringLength(200)]
        public string? ExternalReference { get; set; }
        
        public List<CreateImageDto> Images { get; set; } = new List<CreateImageDto>();
    }
    
    public class CreateImageDto
    {
        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; }
        
        [StringLength(255)]
        public string? AltText { get; set; }
        
        [StringLength(500)]
        public string? Caption { get; set; }
        
        public bool IsPrimary { get; set; } = false;
        
        public int DisplayOrder { get; set; }
        
        public ImageType Type { get; set; } = ImageType.Gallery;
    }
    
    public class UpdateAuctionDto
    {
        [StringLength(200)]
        public string? Title { get; set; }
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [StringLength(5000)]
        public string? DetailedDescription { get; set; }
        
        [StringLength(1000)]
        public string? ConditionNotes { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? BuyNowPrice { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? ReservePrice { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [StringLength(500)]
        public string? ShippingNotes { get; set; }
        
        [StringLength(500)]
        public string? Tags { get; set; }
        
        public bool? IsFeatured { get; set; }
    }
    
    public class AuctionSearchDto
    {
        public string? Query { get; set; }
        public string? Category { get; set; }
        public string? SubCategory { get; set; }
        public string? Condition { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public AuctionStatus? Status { get; set; }
        public AuctionType? Type { get; set; }
        public bool? Featured { get; set; }
        public bool? HasBuyNow { get; set; }
        public bool? FreeShipping { get; set; }
        public string? Location { get; set; }
        public string? SortBy { get; set; } = "CreatedDate";
        public string? SortOrder { get; set; } = "desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
    
    public class ScheduleAuctionDto
    {
        [Required]
        public int AuctionId { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public bool AutoActivate { get; set; } = true;
        
        public bool SendNotifications { get; set; } = true;
    }

    public class PlaceBidDto
    {
        [Required]
        public int AuctionId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Bid amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public int BidderId { get; set; }
    }

    public class ValidateBidDto
    {
        [Required]
        public int AuctionId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Bid amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public int BidderId { get; set; }
    }

    public class AutomaticBidDto
    {
        [Required]
        public int AuctionId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Maximum amount must be greater than 0")]
        public decimal MaxAmount { get; set; }
        
        [Required]
        public int BidderId { get; set; }
    }

    public class BidNotificationDto
    {
        public int AuctionId { get; set; }
        public decimal Amount { get; set; }
        public string BidderName { get; set; } = string.Empty;
        public DateTime BidTime { get; set; }
        public decimal NextMinimumBid { get; set; }
        public TimeSpan TimeRemaining { get; set; }
    }

    public class CountdownTimerDto
    {
        public int AuctionId { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan TimeRemaining { get; set; }
        public bool IsEnding { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
