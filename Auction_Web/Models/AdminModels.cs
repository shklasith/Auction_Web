using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_Web.Models
{
    public class AdminActivityLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AdminId { get; set; } = string.Empty;

        [ForeignKey("AdminId")]
        public virtual User? Admin { get; set; }

        [Required]
        [StringLength(100)]
        public string Action { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string? IpAddress { get; set; }
    }
}
