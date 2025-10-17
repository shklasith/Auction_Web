using System.ComponentModel.DataAnnotations;

namespace Auction_Web.Models
{
    public class WatchlistItem
    {
        public int Id { get; set; }
        
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public int AuctionId { get; set; }
        
        // Navigation properties
        public virtual User? User { get; set; }
        public virtual Auction? Auction { get; set; }
    }
}
