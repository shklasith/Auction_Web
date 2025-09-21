using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public enum MessageType
    {
        General,
        Question,
        Dispute,
        System
    }

    public class Message
    {
        public int Id { get; set; }
        
        [Required]
        public required string FromUserId { get; set; }
        
        [Required]
        public required string ToUserId { get; set; }
        
        public int? AuctionId { get; set; }
        
        [StringLength(200)]
        public string? Subject { get; set; }
        
        [Required]
        public required string Content { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime SentDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ReadDate { get; set; }
        
        public MessageType MessageType { get; set; } = MessageType.General;
        
        // Navigation properties
        public virtual User FromUser { get; set; } = null!;
        public virtual User ToUser { get; set; } = null!;
        public virtual Auction? Auction { get; set; }
    }
    
    public enum ReviewType
    {
        Buyer,
        Seller
    }

    public class UserReview
    {
        public int Id { get; set; }
        
        [Required]
        public required string ReviewerId { get; set; }
        
        [Required]
        public required string ReviewedUserId { get; set; }
        
        public int? TransactionId { get; set; }
        
        public int? AuctionId { get; set; }
        
        // Review Details
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [StringLength(200)]
        public string? Title { get; set; }
        
        public string? Content { get; set; }
        
        [Required]
        public ReviewType ReviewType { get; set; }
        
        // Dates
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ModifiedDate { get; set; }
        
        // Status
        public bool IsVisible { get; set; } = true;
        
        public bool IsVerified { get; set; } = false;
        
        // Navigation properties
        public virtual User Reviewer { get; set; } = null!;
        public virtual User ReviewedUser { get; set; } = null!;
        public virtual Transaction? Transaction { get; set; }
        public virtual Auction? Auction { get; set; }
    }
    
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string Name { get; set; }
        
        public string? Description { get; set; }
        
        public int? ParentCategoryId { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public int DisplayOrder { get; set; } = 0;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Category? ParentCategory { get; set; }
        public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();
    }
    
    public enum DataType
    {
        String,
        Integer,
        Decimal,
        Boolean,
        Json
    }

    public class SystemSetting
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string SettingKey { get; set; }
        
        public string? SettingValue { get; set; }
        
        public string? Description { get; set; }
        
        public DataType DataType { get; set; } = DataType.String;
        
        [StringLength(50)]
        public string Category { get; set; } = "General";
        
        public bool IsSystem { get; set; } = false;
        
        public DateTime ModifiedDate { get; set; } = DateTime.UtcNow;
        
        public string? ModifiedBy { get; set; }
        
        // Navigation properties
        public virtual User? ModifiedByUser { get; set; }
    }
    
    public class AuditLog
    {
        public int Id { get; set; }
        
        public string? UserId { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string Action { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string EntityType { get; set; }
        
        [StringLength(100)]
        public string? EntityId { get; set; }
        
        public string? OldValues { get; set; } // JSON
        
        public string? NewValues { get; set; } // JSON
        
        [StringLength(45)]
        public string? IpAddress { get; set; }
        
        public string? UserAgent { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User? User { get; set; }
    }
}
