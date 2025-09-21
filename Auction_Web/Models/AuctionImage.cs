using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public enum ImageType
    {
        Primary,
        Gallery,
        Thumbnail,
        Detail,
        Certificate,
        Damage
    }

    public class AuctionImage
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; }
        
        [StringLength(255)]
        public string? FileName { get; set; }
        
        [StringLength(255)]
        public string? AltText { get; set; }
        
        [StringLength(500)]
        public string? Caption { get; set; }
        
        public bool IsPrimary { get; set; } = false;
        
        public int DisplayOrder { get; set; }
        
        public ImageType Type { get; set; } = ImageType.Gallery;
        
        public long? FileSize { get; set; }
        
        public int? Width { get; set; }
        
        public int? Height { get; set; }
        
        [StringLength(10)]
        public string? Format { get; set; }
        
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        
        public bool IsVerified { get; set; } = false;
        
        [StringLength(500)]
        public string? ThumbnailUrl { get; set; }
        
        [StringLength(500)]
        public string? MediumUrl { get; set; }
        
        [Required]
        public int AuctionId { get; set; }
        
        public string? UploadedBy { get; set; }

        // Navigation properties
        public virtual Auction Auction { get; set; }
        public virtual User? UploadedByUser { get; set; }
    }
}
