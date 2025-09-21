using Microsoft.AspNetCore.Mvc;
using Auction_Web.Models;

namespace Auction_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        // Sample data for demo purposes - in production, use Entity Framework with database
        private static List<Auction> _auctions = new List<Auction>
        {
            new Auction
            {
                Id = 1,
                Title = "Vintage Camera Collection",
                Description = "Beautiful vintage camera in excellent condition. Perfect for collectors or photography enthusiasts.",
                StartingPrice = 50.00m,
                CurrentPrice = 125.50m,
                BuyNowPrice = 300.00m,
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(3),
                Category = "Electronics",
                Condition = "Excellent",
                ViewCount = 45,
                BidCount = 8,
                SellerId = "1",
                IsFeatured = true,
                Images = new List<AuctionImage>
                {
                    new AuctionImage { Id = 1, ImageUrl = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&w=400", IsPrimary = true, DisplayOrder = 1 }
                }
            },
            new Auction
            {
                Id = 2,
                Title = "Designer Watch - Limited Edition",
                Description = "Luxury designer watch with leather strap. Comes with original box and papers.",
                StartingPrice = 200.00m,
                CurrentPrice = 450.00m,
                BuyNowPrice = 800.00m,
                StartDate = DateTime.UtcNow.AddDays(-1),
                EndDate = DateTime.UtcNow.AddDays(2),
                Category = "Fashion",
                Condition = "Like New",
                ViewCount = 67,
                BidCount = 12,
                SellerId = "2",
                IsFeatured = true,
                Images = new List<AuctionImage>
                {
                    new AuctionImage { Id = 2, ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&w=400", IsPrimary = true, DisplayOrder = 1 }
                }
            },
            new Auction
            {
                Id = 3,
                Title = "Antique Wooden Desk",
                Description = "Beautiful handcrafted wooden desk from the 1920s. Perfect for home office or study.",
                StartingPrice = 100.00m,
                CurrentPrice = 275.00m,
                StartDate = DateTime.UtcNow.AddHours(-12),
                EndDate = DateTime.UtcNow.AddDays(5),
                Category = "Furniture",
                Condition = "Good",
                ViewCount = 23,
                BidCount = 5,
                SellerId = "3",
                Images = new List<AuctionImage>
                {
                    new AuctionImage { Id = 3, ImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400", IsPrimary = true, DisplayOrder = 1 }
                }
            }
        };

        [HttpGet]
        public ActionResult<IEnumerable<Auction>> GetAuctions([FromQuery] string? category = null, [FromQuery] bool featured = false)
        {
            var auctions = _auctions.Where(a => a.IsActive).AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                auctions = auctions.Where(a => a.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            if (featured)
            {
                auctions = auctions.Where(a => a.IsFeatured);
            }

            return Ok(auctions.OrderByDescending(a => a.CreatedDate));
        }

        [HttpGet("{id}")]
        public ActionResult<Auction> GetAuction(int id)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            if (auction == null)
            {
                return NotFound();
            }

            // Increment view count
            auction.ViewCount++;

            return Ok(auction);
        }

        [HttpPost]
        public ActionResult<Auction> CreateAuction(Auction auction)
        {
            auction.Id = _auctions.Count + 1;
            auction.CreatedDate = DateTime.UtcNow;
            auction.CurrentPrice = auction.StartingPrice;
            _auctions.Add(auction);

            return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, auction);
        }

        [HttpPost("{id}/bid")]
        public ActionResult PlaceBid(int id, [FromBody] decimal bidAmount)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            if (auction == null)
            {
                return NotFound();
            }

            if (bidAmount <= auction.CurrentPrice)
            {
                return BadRequest("Bid amount must be higher than current price");
            }

            if (DateTime.UtcNow > auction.EndDate)
            {
                return BadRequest("Auction has ended");
            }

            auction.CurrentPrice = bidAmount;
            auction.BidCount++;

            return Ok(new { success = true, newPrice = auction.CurrentPrice });
        }

        [HttpGet("categories")]
        public ActionResult<IEnumerable<string>> GetCategories()
        {
            var categories = _auctions.Select(a => a.Category).Distinct().OrderBy(c => c);
            return Ok(categories);
        }
    }
}
