using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;
using Auction_Web.Services;

namespace Auction_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SocialMediaController : ControllerBase
    {
        private readonly ISocialMediaService _socialMediaService;
        private readonly ILogger<SocialMediaController> _logger;

        public SocialMediaController(
            ISocialMediaService socialMediaService,
            ILogger<SocialMediaController> logger)
        {
            _socialMediaService = socialMediaService;
            _logger = logger;
        }

        /// <summary>
        /// Share an auction on social media
        /// </summary>
        [HttpPost("share")]
        [Authorize]
        public async Task<ActionResult<ShareResponseDto>> ShareAuction([FromBody] ShareAuctionDto shareDto)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var result = await _socialMediaService.ShareAuctionAsync(userId, shareDto);
                
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing auction");
                return StatusCode(500, new { message = "Error sharing auction", error = ex.Message });
            }
        }

        /// <summary>
        /// Share multiple auctions on multiple platforms
        /// </summary>
        [HttpPost("share/bulk")]
        [Authorize]
        public async Task<ActionResult<List<ShareResponseDto>>> BulkShare([FromBody] BulkShareDto bulkShareDto)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var results = await _socialMediaService.BulkShareAsync(userId, bulkShareDto);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk share");
                return StatusCode(500, new { message = "Error sharing auctions", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate share metadata for an auction
        /// </summary>
        [HttpGet("metadata/{auctionId}")]
        public async Task<ActionResult<ShareMetadataDto>> GetShareMetadata(
            int auctionId,
            [FromQuery] SocialPlatform platform = SocialPlatform.Facebook)
        {
            try
            {
                var metadata = await _socialMediaService.GenerateShareMetadataAsync(auctionId, platform);
                return Ok(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating share metadata");
                return StatusCode(500, new { message = "Error generating metadata", error = ex.Message });
            }
        }

        /// <summary>
        /// Get social media preview for an auction
        /// </summary>
        [HttpGet("preview/{auctionId}")]
        public async Task<ActionResult<SocialPreviewDto>> GetSocialPreview(
            int auctionId,
            [FromQuery] SocialPlatform platform = SocialPlatform.Facebook)
        {
            try
            {
                var preview = await _socialMediaService.GetSocialPreviewAsync(auctionId, platform);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating social preview");
                return StatusCode(500, new { message = "Error generating preview", error = ex.Message });
            }
        }

        /// <summary>
        /// Get share analytics for an auction
        /// </summary>
        [HttpGet("analytics/auction/{auctionId}")]
        [Authorize]
        public async Task<ActionResult<ShareAnalyticsDto>> GetShareAnalytics(int auctionId)
        {
            try
            {
                var analytics = await _socialMediaService.GetShareAnalyticsAsync(auctionId);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting share analytics");
                return StatusCode(500, new { message = "Error getting analytics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get share statistics summary
        /// </summary>
        [HttpGet("stats/summary")]
        [Authorize]
        public async Task<ActionResult<ShareStatsSummaryDto>> GetShareStatsSummary(
            [FromQuery] bool userOnly = false)
        {
            try
            {
                string? userId = null;
                if (userOnly)
                {
                    userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                }

                var stats = await _socialMediaService.GetShareStatsSummaryAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting share stats");
                return StatusCode(500, new { message = "Error getting statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get user's connected social media accounts
        /// </summary>
        [HttpGet("accounts")]
        [Authorize]
        public async Task<ActionResult<List<SocialAccountDto>>> GetUserSocialAccounts()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var accounts = await _socialMediaService.GetUserSocialAccountsAsync(userId);
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting social accounts");
                return StatusCode(500, new { message = "Error getting accounts", error = ex.Message });
            }
        }

        /// <summary>
        /// Connect a social media account
        /// </summary>
        [HttpPost("accounts/connect")]
        [Authorize]
        public async Task<ActionResult> ConnectSocialAccount([FromBody] ConnectSocialAccountDto accountDto)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var result = await _socialMediaService.ConnectSocialAccountAsync(userId, accountDto);
                
                if (result)
                {
                    return Ok(new { message = $"{accountDto.Platform} account connected successfully" });
                }

                return BadRequest(new { message = "Failed to connect account" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error connecting social account");
                return StatusCode(500, new { message = "Error connecting account", error = ex.Message });
            }
        }

        /// <summary>
        /// Disconnect a social media account
        /// </summary>
        [HttpPost("accounts/disconnect/{platform}")]
        [Authorize]
        public async Task<ActionResult> DisconnectSocialAccount(SocialPlatform platform)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var result = await _socialMediaService.DisconnectSocialAccountAsync(userId, platform);
                
                if (result)
                {
                    return Ok(new { message = $"{platform} account disconnected successfully" });
                }

                return NotFound(new { message = "Account not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disconnecting social account");
                return StatusCode(500, new { message = "Error disconnecting account", error = ex.Message });
            }
        }

        /// <summary>
        /// Track a share link click
        /// </summary>
        [HttpPost("track-click/{shareId}")]
        public async Task<ActionResult> TrackShareClick(int shareId, [FromBody] ShareClickDto clickDto)
        {
            try
            {
                var result = await _socialMediaService.TrackShareClickAsync(shareId, clickDto);
                
                if (result)
                {
                    return Ok(new { message = "Click tracked successfully" });
                }

                return NotFound(new { message = "Share not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking click");
                return StatusCode(500, new { message = "Error tracking click", error = ex.Message });
            }
        }

        /// <summary>
        /// Get top influencers/sharers
        /// </summary>
        [HttpGet("influencers/top")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<List<InfluencerStatsDto>>> GetTopInfluencers(
            [FromQuery] int topN = 10)
        {
            try
            {
                var influencers = await _socialMediaService.GetTopInfluencersAsync(topN);
                return Ok(influencers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top influencers");
                return StatusCode(500, new { message = "Error getting influencers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get share templates
        /// </summary>
        [HttpGet("templates")]
        [Authorize]
        public async Task<ActionResult<List<ShareTemplateDto>>> GetShareTemplates(
            [FromQuery] SocialPlatform? platform = null)
        {
            try
            {
                var templates = await _socialMediaService.GetShareTemplatesAsync(platform);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting share templates");
                return StatusCode(500, new { message = "Error getting templates", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a share template
        /// </summary>
        [HttpPost("templates")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ShareTemplateDto>> CreateShareTemplate(
            [FromBody] CreateShareTemplateDto templateDto)
        {
            try
            {
                var template = await _socialMediaService.CreateShareTemplateAsync(templateDto);
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating share template");
                return StatusCode(500, new { message = "Error creating template", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate quick share links for all platforms
        /// </summary>
        [HttpGet("quick-share/{auctionId}")]
        public async Task<ActionResult<Dictionary<string, string>>> GetQuickShareLinks(int auctionId)
        {
            try
            {
                var links = new Dictionary<string, string>();
                var platforms = Enum.GetValues<SocialPlatform>();

                foreach (var platform in platforms)
                {
                    if (platform == SocialPlatform.CopyLink) continue;

                    var metadata = await _socialMediaService.GenerateShareMetadataAsync(auctionId, platform);
                    var shareDto = new ShareAuctionDto
                    {
                        AuctionId = auctionId,
                        Platform = platform
                    };

                    // This is a simplified version - in production you'd want to cache this
                    links[platform.ToString()] = metadata.Url;
                }

                return Ok(links);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating quick share links");
                return StatusCode(500, new { message = "Error generating links", error = ex.Message });
            }
        }
    }
}

