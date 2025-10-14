using Auction_Web.Models.DTOs;
using Auction_Web.Services;
using Microsoft.AspNetCore.Mvc;
using Auction_Web.Models;

namespace Auction_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly IAuctionService _auctionService;

        public AuctionsController(IAuctionService auctionService)
        {
            _auctionService = auctionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Auction>>> GetAuctions([FromQuery] AuctionSearchDto searchDto)
        {
            var auctions = await _auctionService.GetAuctionsAsync(searchDto);
            return Ok(auctions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Auction>> GetAuction(int id)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(id);
            if (auction == null)
            {
                return NotFound();
            }
            return Ok(auction);
        }

        [HttpPost]
        public async Task<ActionResult<Auction>> CreateAuction(CreateAuctionDto auctionDto)
        {
            // TODO: Get sellerId from authenticated user
            var sellerId = 1;
            var auction = await _auctionService.CreateAuctionAsync(auctionDto, sellerId);
            return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, auction);
        }

        [HttpPost("{id}/bid")]
        public ActionResult PlaceBid(int id, [FromBody] decimal bidAmount)
        {
            // This should be moved to BiddingService and use authenticated user
            return BadRequest("Bidding functionality is not implemented in this controller.");
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _auctionService.GetCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("categories/{category}/subcategories")]
        public async Task<ActionResult<IEnumerable<string>>> GetSubCategories(string category)
        {
            var subCategories = await _auctionService.GetSubCategoriesAsync(category);
            return Ok(subCategories);
        }
    }
}
