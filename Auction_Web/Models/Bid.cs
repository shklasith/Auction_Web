using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public class Bid
    {
        public int Id { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        public DateTime BidDate { get; set; } = DateTime.UtcNow;
        
        public bool IsWinning { get; set; } = false;
        
        [Required]
        public int AuctionId { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        // Alternative property name for compatibility
        public string BidderId => UserId;
        
        // Navigation properties
        public virtual Auction? Auction { get; set; }
        public virtual User? User { get; set; }
    }
}
