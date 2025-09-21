using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public enum PaymentStatus
    {
        Pending,
        Processing,
        Completed,
        Failed,
        Cancelled,
        Refunded
    }

    public class PaymentRecord
    {
        public int Id { get; set; }
        
        [Required]
        public int TransactionId { get; set; }
        
        [StringLength(100)]
        public string? PaymentReference { get; set; }
        
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [StringLength(3)]
        public string Currency { get; set; } = "USD";
        
        // Payment Status
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        
        // Payment Gateway Information
        [StringLength(100)]
        public string? GatewayTransactionId { get; set; }
        
        public string? GatewayResponse { get; set; }
        
        public decimal GatewayFee { get; set; } = 0.00m;
        
        // Dates
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ProcessedDate { get; set; }
        
        // Additional Information
        public string? FailureReason { get; set; }
        
        public decimal RefundAmount { get; set; } = 0.00m;
        
        public DateTime? RefundDate { get; set; }
        
        // Navigation properties
        public virtual Transaction Transaction { get; set; } = null!;
    }
}
