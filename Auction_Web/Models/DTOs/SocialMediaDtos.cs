using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Auction_Web.Models;

namespace Auction_Web.Models.DTOs
{
    // Share Request
    public class ShareAuctionDto
    {
        public int AuctionId { get; set; }
        public SocialPlatform Platform { get; set; }
        public string? CustomMessage { get; set; }
        public List<string>? Hashtags { get; set; }
    }

    // Share Response
    public class ShareResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string ShareUrl { get; set; } = string.Empty;
        public string ShareText { get; set; } = string.Empty;
        public SocialPlatform Platform { get; set; }
        public ShareMetadataDto? Metadata { get; set; }
    }

    public class ShareMetadataDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public Dictionary<string, string> OpenGraphTags { get; set; } = new();
        public Dictionary<string, string> TwitterCardTags { get; set; } = new();
    }

    // Social Share Analytics
    public class ShareAnalyticsDto
    {
        public int AuctionId { get; set; }
        public string AuctionTitle { get; set; } = string.Empty;
        public int TotalShares { get; set; }
        public int TotalClicks { get; set; }
        public int TotalConversions { get; set; }
        public decimal ConversionRate { get; set; }
        public List<PlatformShareDto> SharesByPlatform { get; set; } = new();
        public List<TopSharerDto> TopSharers { get; set; } = new();
    }

    public class PlatformShareDto
    {
        public SocialPlatform Platform { get; set; }
        public int ShareCount { get; set; }
        public int Clicks { get; set; }
        public int Conversions { get; set; }
        public decimal ConversionRate { get; set; }
    }

    public class TopSharerDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int ShareCount { get; set; }
        public int TotalClicks { get; set; }
        public int TotalConversions { get; set; }
    }

    // Social Media Account Management
    public class SocialAccountDto
    {
        public int Id { get; set; }
        public SocialPlatform Platform { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
        public bool AutoShare { get; set; }
        public DateTime ConnectedDate { get; set; }
        public DateTime? LastUsedDate { get; set; }
    }

    public class ConnectSocialAccountDto
    {
        public SocialPlatform Platform { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public bool AutoShare { get; set; } = false;
    }

    // Share Template
    public class ShareTemplateDto
    {
        public int Id { get; set; }
        public SocialPlatform Platform { get; set; }
        public string Template { get; set; } = string.Empty;
        public string? Hashtags { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
    }

    public class CreateShareTemplateDto
    {
        public SocialPlatform Platform { get; set; }
        public string Template { get; set; } = string.Empty;
        public string? Hashtags { get; set; }
        public bool IsDefault { get; set; } = false;
    }

    // Bulk Share Request
    public class BulkShareDto
    {
        public List<int> AuctionIds { get; set; } = new();
        public List<SocialPlatform> Platforms { get; set; } = new();
        public string? CustomMessage { get; set; }
        public List<string>? Hashtags { get; set; }
    }

    // Share Link Click Tracking
    public class ShareClickDto
    {
        public string ShareId { get; set; } = string.Empty;
        public string? ReferrerUrl { get; set; }
        public string? UserAgent { get; set; }
        public string? IpAddress { get; set; }
    }

    // Social Media Campaign
    public class SocialCampaignDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<int> AuctionIds { get; set; } = new();
        public List<SocialPlatform> Platforms { get; set; } = new();
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public int TotalShares { get; set; }
        public int TotalClicks { get; set; }
        public int TotalConversions { get; set; }
    }

    // Share Stats Summary
    public class ShareStatsSummaryDto
    {
        public int TotalShares { get; set; }
        public int TotalClicks { get; set; }
        public int TotalConversions { get; set; }
        public decimal OverallConversionRate { get; set; }
        public SocialPlatform MostPopularPlatform { get; set; }
        public int SharesThisWeek { get; set; }
        public int SharesThisMonth { get; set; }
        public decimal GrowthRate { get; set; }
    }

    // Social Media Preview
    public class SocialPreviewDto
    {
        public SocialPlatform Platform { get; set; }
        public string PreviewHtml { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int CharacterCount { get; set; }
        public int CharacterLimit { get; set; }
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
    }

    // Influencer/Referral Tracking
    public class InfluencerStatsDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int TotalShares { get; set; }
        public int TotalClicks { get; set; }
        public int TotalConversions { get; set; }
        public decimal ConversionRate { get; set; }
        public decimal TotalRevenueGenerated { get; set; }
        public string ReferralCode { get; set; } = string.Empty;
        public int Rank { get; set; }
    }
}