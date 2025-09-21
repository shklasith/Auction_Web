using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public enum TransactionStatus
    {
        Pending,
        PaymentPending,
        Paid,
        Shipped,
        Delivered,
        Completed,
        Disputed,
        Cancelled,
        Refunded
    }

    public enum PaymentMethod
    {
        CreditCard,
        PayPal,
        BankTransfer,
        Cash,
        Other
    }

    public class Transaction
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string TransactionId { get; set; }
        
        [Required]
        public int AuctionId { get; set; }
        
        [Required]
        public string BuyerId { get; set; }
        
        [Required]
        public string SellerId { get; set; }
        
        // Financial Details
        [Required]
        public decimal WinningBidAmount { get; set; }
        
        public decimal ShippingCost { get; set; } = 0.00m;
        
        public decimal TaxAmount { get; set; } = 0.00m;
        
        public decimal PlatformFee { get; set; } = 0.00m;
        
        [Required]
        public decimal TotalAmount { get; set; }
        
        // Status and Dates
        public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedDate { get; set; }
        
        // Payment Information
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CreditCard;
        
        [StringLength(100)]
        public string? PaymentReference { get; set; }
        
        public DateTime? PaymentDate { get; set; }
        
        // Shipping Information
        public string? ShippingAddress { get; set; }
        
        [StringLength(100)]
        public string? ShippingMethod { get; set; }
        
        [StringLength(100)]
        public string? TrackingNumber { get; set; }
        
        public DateTime? ShippedDate { get; set; }
        
        public DateTime? DeliveredDate { get; set; }
        
        // Additional Information
        public string? Notes { get; set; }
        
        public string? InternalNotes { get; set; }
        
        // Navigation properties
        public virtual Auction Auction { get; set; }
        public virtual User Buyer { get; set; }
        public virtual User Seller { get; set; }
    }
}
