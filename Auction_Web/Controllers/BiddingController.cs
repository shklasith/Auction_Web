using Microsoft.AspNetCore.Mvc;
using Auction_Web.Services;
using Auction_Web.Models.DTOs;

namespace Auction_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BiddingController : ControllerBase
    {
        private readonly IBiddingService _biddingService;
        private readonly ILogger<BiddingController> _logger;

        public BiddingController(IBiddingService biddingService, ILogger<BiddingController> logger)
        {
            _biddingService = biddingService;
            _logger = logger;
        }

        [HttpPost("place-bid")]
        public async Task<ActionResult<BidResult>> PlaceBid([FromBody] PlaceBidDto placeBidDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // In production, get bidderId from authenticated user context
                var bidderId = placeBidDto.BidderId;
                
                var result = await _biddingService.PlaceBidAsync(
                    placeBidDto.AuctionId, 
                    placeBidDto.Amount, 
                    bidderId);

                return result.Status == BidResultStatus.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error placing bid");
                return StatusCode(500, "An error occurred while placing the bid");
            }
        }

        [HttpGet("{auctionId}/next-minimum-bid")]
        public async Task<ActionResult<decimal>> GetNextMinimumBid(int auctionId)
        {
            try
            {
                var nextMinimumBid = await _biddingService.GetNextMinimumBidAsync(auctionId);
                return Ok(nextMinimumBid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting next minimum bid for auction {AuctionId}", auctionId);
                return StatusCode(500, "An error occurred while getting the next minimum bid");
            }
        }

        [HttpGet("{auctionId}/bids")]
        public async Task<ActionResult<IEnumerable<object>>> GetAuctionBids(int auctionId)
        {
            try
            {
                var bids = await _biddingService.GetAuctionBidsAsync(auctionId);
                
                var bidDtos = bids.Select(b => new
                {
                    Id = b.Id,
                    Amount = b.Amount,
                    BidDate = b.BidDate,
                    IsWinning = b.IsWinning,
                    BidderName = $"Bidder {b.BidderId}" // In production, get actual bidder name
                });

                return Ok(bidDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bids for auction {AuctionId}", auctionId);
                return StatusCode(500, "An error occurred while getting auction bids");
            }
        }

        [HttpGet("{auctionId}/highest-bid")]
        public async Task<ActionResult<object>> GetHighestBid(int auctionId)
        {
            try
            {
                var highestBid = await _biddingService.GetHighestBidAsync(auctionId);
                
                if (highestBid == null)
                {
                    return NotFound("No bids found for this auction");
                }

                var bidDto = new
                {
                    Id = highestBid.Id,
                    Amount = highestBid.Amount,
                    BidDate = highestBid.BidDate,
                    BidderName = $"Bidder {highestBid.BidderId}" // In production, get actual bidder name
                };

                return Ok(bidDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting highest bid for auction {AuctionId}", auctionId);
                return StatusCode(500, "An error occurred while getting the highest bid");
            }
        }

        [HttpPost("validate-bid")]
        public async Task<ActionResult<bool>> ValidateBid([FromBody] ValidateBidDto validateBidDto)
        {
            try
            {
                var isValid = await _biddingService.IsValidBidAsync(
                    validateBidDto.AuctionId,
                    validateBidDto.Amount,
                    validateBidDto.BidderId);

                return Ok(isValid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating bid");
                return StatusCode(500, "An error occurred while validating the bid");
            }
        }

        [HttpPost("automatic-bid")]
        public async Task<ActionResult> ProcessAutomaticBid([FromBody] AutomaticBidDto automaticBidDto)
        {
            try
            {
                await _biddingService.ProcessAutomaticBidAsync(
                    automaticBidDto.AuctionId,
                    automaticBidDto.MaxAmount,
                    automaticBidDto.BidderId);

                return Ok("Automatic bid processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing automatic bid");
                return StatusCode(500, "An error occurred while processing the automatic bid");
            }
        }
    }
}
