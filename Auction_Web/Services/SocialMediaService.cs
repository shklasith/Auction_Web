using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Web;
using Auction_Web.Data;
using Auction_Web.Models;
using Auction_Web.Models.DTOs;

namespace Auction_Web.Services
{
    public interface ISocialMediaService
    {
        Task<ShareResponseDto> ShareAuctionAsync(string userId, ShareAuctionDto shareDto);
        Task<List<ShareResponseDto>> BulkShareAsync(string userId, BulkShareDto bulkShareDto);
        Task<ShareMetadataDto> GenerateShareMetadataAsync(int auctionId, SocialPlatform platform);
        Task<SocialPreviewDto> GetSocialPreviewAsync(int auctionId, SocialPlatform platform);
        Task<ShareAnalyticsDto> GetShareAnalyticsAsync(int auctionId);
        Task<ShareStatsSummaryDto> GetShareStatsSummaryAsync(string? userId = null);
        Task<List<SocialAccountDto>> GetUserSocialAccountsAsync(string userId);
        Task<bool> ConnectSocialAccountAsync(string userId, ConnectSocialAccountDto accountDto);
        Task<bool> DisconnectSocialAccountAsync(string userId, SocialPlatform platform);
        Task<bool> TrackShareClickAsync(int shareId, ShareClickDto clickDto);
        Task<List<InfluencerStatsDto>> GetTopInfluencersAsync(int topN = 10);
        Task<List<ShareTemplateDto>> GetShareTemplatesAsync(SocialPlatform? platform = null);
        Task<ShareTemplateDto> CreateShareTemplateAsync(CreateShareTemplateDto templateDto);
    }

    public class SocialMediaService : ISocialMediaService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SocialMediaService(
            ApplicationDbContext context,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ShareResponseDto> ShareAuctionAsync(string userId, ShareAuctionDto shareDto)
        {
            var auction = await _context.Auctions.FindAsync(shareDto.AuctionId);
            if (auction == null)
            {
                return new ShareResponseDto
                {
                    Success = false,
                    Message = "Auction not found"
                };
            }

            var metadata = await GenerateShareMetadataAsync(shareDto.AuctionId, shareDto.Platform);
            var shareUrl = GenerateShareUrl(shareDto.Platform, metadata, shareDto.CustomMessage, shareDto.Hashtags);
            var shareText = GenerateShareText(auction, shareDto.Platform, shareDto.CustomMessage, shareDto.Hashtags);

            // Record the share
            var socialShare = new SocialShare
            {
                AuctionId = shareDto.AuctionId,
                UserId = userId,
                Platform = shareDto.Platform,
                ShareUrl = shareUrl,
                ShareMessage = shareText,
                SharedDate = DateTime.UtcNow
            };

            _context.SocialShares.Add(socialShare);
            await _context.SaveChangesAsync();

            return new ShareResponseDto
            {
                Success = true,
                Message = $"Auction shared successfully on {shareDto.Platform}",
                ShareUrl = shareUrl,
                ShareText = shareText,
                Platform = shareDto.Platform,
                Metadata = metadata
            };
        }

        public async Task<List<ShareResponseDto>> BulkShareAsync(string userId, BulkShareDto bulkShareDto)
        {
            var responses = new List<ShareResponseDto>();

            foreach (var auctionId in bulkShareDto.AuctionIds)
            {
                foreach (var platform in bulkShareDto.Platforms)
                {
                    var shareDto = new ShareAuctionDto
                    {
                        AuctionId = auctionId,
                        Platform = platform,
                        CustomMessage = bulkShareDto.CustomMessage,
                        Hashtags = bulkShareDto.Hashtags
                    };

                    var response = await ShareAuctionAsync(userId, shareDto);
                    responses.Add(response);
                }
            }

            return responses;
        }

        public async Task<ShareMetadataDto> GenerateShareMetadataAsync(int auctionId, SocialPlatform platform)
        {
            var auction = await _context.Auctions
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null)
            {
                return new ShareMetadataDto();
            }

            var baseUrl = GetBaseUrl();
            var auctionUrl = $"{baseUrl}/auction/{auctionId}";
            var imageUrl = auction.Images?.FirstOrDefault()?.ImageUrl ?? $"{baseUrl}/images/default-auction.jpg";

            var title = $"{auction.Title} - Online Auction";
            var description = TruncateText(auction.Description, 200);

            var metadata = new ShareMetadataDto
            {
                Title = title,
                Description = description,
                ImageUrl = imageUrl,
                Url = auctionUrl
            };

            // Platform-specific metadata
            metadata.OpenGraphTags = new Dictionary<string, string>
            {
                { "og:type", "product" },
                { "og:title", title },
                { "og:description", description },
                { "og:image", imageUrl },
                { "og:url", auctionUrl },
                { "og:site_name", "Auction Platform" },
                { "product:price:amount", auction.CurrentPrice.ToString("F2") },
                { "product:price:currency", "USD" }
            };

            metadata.TwitterCardTags = new Dictionary<string, string>
            {
                { "twitter:card", "summary_large_image" },
                { "twitter:title", title },
                { "twitter:description", description },
                { "twitter:image", imageUrl },
                { "twitter:url", auctionUrl }
            };

            return metadata;
        }

        public async Task<SocialPreviewDto> GetSocialPreviewAsync(int auctionId, SocialPlatform platform)
        {
            var metadata = await GenerateShareMetadataAsync(auctionId, platform);
            var auction = await _context.Auctions.FindAsync(auctionId);

            if (auction == null)
            {
                return new SocialPreviewDto { IsValid = false };
            }

            var shareText = GenerateShareText(auction, platform, null, null);
            var (charLimit, isValid, errors) = ValidateShareContent(shareText, platform);

            return new SocialPreviewDto
            {
                Platform = platform,
                Title = metadata.Title,
                Description = metadata.Description,
                ImageUrl = metadata.ImageUrl,
                CharacterCount = shareText.Length,
                CharacterLimit = charLimit,
                IsValid = isValid,
                ValidationErrors = errors,
                PreviewHtml = GeneratePreviewHtml(metadata, platform, shareText)
            };
        }

        public async Task<ShareAnalyticsDto> GetShareAnalyticsAsync(int auctionId)
        {
            var auction = await _context.Auctions.FindAsync(auctionId);
            var shares = await _context.SocialShares
                .Include(s => s.User)
                .Where(s => s.AuctionId == auctionId)
                .ToListAsync();

            var totalShares = shares.Count;
            var totalClicks = shares.Sum(s => s.Clicks);
            var totalConversions = shares.Sum(s => s.Conversions);
            var conversionRate = totalClicks > 0 ? (decimal)totalConversions / totalClicks * 100 : 0;

            var sharesByPlatform = shares.GroupBy(s => s.Platform)
                .Select(g => new PlatformShareDto
                {
                    Platform = g.Key,
                    ShareCount = g.Count(),
                    Clicks = g.Sum(s => s.Clicks),
                    Conversions = g.Sum(s => s.Conversions),
                    ConversionRate = g.Sum(s => s.Clicks) > 0 
                        ? (decimal)g.Sum(s => s.Conversions) / g.Sum(s => s.Clicks) * 100 
                        : 0
                })
                .OrderByDescending(p => p.ShareCount)
                .ToList();

            var topSharers = shares.GroupBy(s => s.UserId)
                .Select(g => new TopSharerDto
                {
                    UserId = g.Key,
                    Username = g.First().User?.UserName ?? "Unknown",
                    ShareCount = g.Count(),
                    TotalClicks = g.Sum(s => s.Clicks),
                    TotalConversions = g.Sum(s => s.Conversions)
                })
                .OrderByDescending(t => t.ShareCount)
                .Take(10)
                .ToList();

            return new ShareAnalyticsDto
            {
                AuctionId = auctionId,
                AuctionTitle = auction?.Title ?? "Unknown",
                TotalShares = totalShares,
                TotalClicks = totalClicks,
                TotalConversions = totalConversions,
                ConversionRate = conversionRate,
                SharesByPlatform = sharesByPlatform,
                TopSharers = topSharers
            };
        }

        public async Task<ShareStatsSummaryDto> GetShareStatsSummaryAsync(string? userId = null)
        {
            var query = _context.SocialShares.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(s => s.UserId == userId);
            }

            var shares = await query.ToListAsync();
            var totalShares = shares.Count;
            var totalClicks = shares.Sum(s => s.Clicks);
            var totalConversions = shares.Sum(s => s.Conversions);
            var conversionRate = totalClicks > 0 ? (decimal)totalConversions / totalClicks * 100 : 0;

            var now = DateTime.UtcNow;
            var weekAgo = now.AddDays(-7);
            var monthAgo = now.AddMonths(-1);
            var twoMonthsAgo = now.AddMonths(-2);

            var sharesThisWeek = shares.Count(s => s.SharedDate >= weekAgo);
            var sharesThisMonth = shares.Count(s => s.SharedDate >= monthAgo);
            var sharesLastMonth = shares.Count(s => s.SharedDate >= twoMonthsAgo && s.SharedDate < monthAgo);

            var growthRate = sharesLastMonth > 0 
                ? ((decimal)(sharesThisMonth - sharesLastMonth) / sharesLastMonth) * 100 
                : 0;

            var mostPopular = shares.GroupBy(s => s.Platform)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault();

            return new ShareStatsSummaryDto
            {
                TotalShares = totalShares,
                TotalClicks = totalClicks,
                TotalConversions = totalConversions,
                OverallConversionRate = conversionRate,
                MostPopularPlatform = mostPopular,
                SharesThisWeek = sharesThisWeek,
                SharesThisMonth = sharesThisMonth,
                GrowthRate = growthRate
            };
        }

        public async Task<List<SocialAccountDto>> GetUserSocialAccountsAsync(string userId)
        {
            var accounts = await _context.SocialMediaAccounts
                .Where(a => a.UserId == userId)
                .Select(a => new SocialAccountDto
                {
                    Id = a.Id,
                    Platform = a.Platform,
                    AccountName = a.AccountName,
                    IsConnected = a.IsConnected,
                    AutoShare = a.AutoShare,
                    ConnectedDate = a.ConnectedDate,
                    LastUsedDate = a.LastUsedDate
                })
                .ToListAsync();

            return accounts;
        }

        public async Task<bool> ConnectSocialAccountAsync(string userId, ConnectSocialAccountDto accountDto)
        {
            // Check if account already exists
            var existing = await _context.SocialMediaAccounts
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Platform == accountDto.Platform);

            if (existing != null)
            {
                // Update existing
                existing.AccountName = accountDto.AccountName;
                existing.AccessToken = accountDto.AccessToken;
                existing.RefreshToken = accountDto.RefreshToken;
                existing.IsConnected = true;
                existing.AutoShare = accountDto.AutoShare;
                existing.LastUsedDate = DateTime.UtcNow;
            }
            else
            {
                // Create new
                var account = new SocialMediaAccount
                {
                    UserId = userId,
                    Platform = accountDto.Platform,
                    AccountName = accountDto.AccountName,
                    AccessToken = accountDto.AccessToken,
                    RefreshToken = accountDto.RefreshToken,
                    IsConnected = true,
                    AutoShare = accountDto.AutoShare,
                    ConnectedDate = DateTime.UtcNow
                };

                _context.SocialMediaAccounts.Add(account);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DisconnectSocialAccountAsync(string userId, SocialPlatform platform)
        {
            var account = await _context.SocialMediaAccounts
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Platform == platform);

            if (account == null) return false;

            account.IsConnected = false;
            account.AccessToken = null;
            account.RefreshToken = null;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TrackShareClickAsync(int shareId, ShareClickDto clickDto)
        {
            var share = await _context.SocialShares.FindAsync(shareId);
            if (share == null) return false;

            share.Clicks++;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<InfluencerStatsDto>> GetTopInfluencersAsync(int topN = 10)
        {
            var influencers = await _context.SocialShares
                .Include(s => s.User)
                .GroupBy(s => s.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    User = g.First().User,
                    TotalShares = g.Count(),
                    TotalClicks = g.Sum(s => s.Clicks),
                    TotalConversions = g.Sum(s => s.Conversions)
                })
                .OrderByDescending(x => x.TotalConversions)
                .ThenByDescending(x => x.TotalClicks)
                .Take(topN)
                .ToListAsync();

            var result = new List<InfluencerStatsDto>();
            var rank = 1;

            foreach (var influencer in influencers)
            {
                var conversionRate = influencer.TotalClicks > 0 
                    ? (decimal)influencer.TotalConversions / influencer.TotalClicks * 100 
                    : 0;

                // Calculate revenue (this is simplified - in reality you'd track actual revenue)
                var revenue = await _context.Bids
                    .Where(b => b.UserId == influencer.UserId)
                    .SumAsync(b => (decimal?)b.Amount);
                
                var totalRevenue = revenue ?? 0;

                result.Add(new InfluencerStatsDto
                {
                    UserId = influencer.UserId,
                    Username = influencer.User?.UserName ?? "Unknown",
                    TotalShares = influencer.TotalShares,
                    TotalClicks = influencer.TotalClicks,
                    TotalConversions = influencer.TotalConversions,
                    ConversionRate = conversionRate,
                    TotalRevenueGenerated = totalRevenue,
                    ReferralCode = GenerateReferralCode(influencer.UserId),
                    Rank = rank++
                });
            }

            return result;
        }

        public async Task<List<ShareTemplateDto>> GetShareTemplatesAsync(SocialPlatform? platform = null)
        {
            var query = _context.ShareTemplates.Where(t => t.IsActive);

            if (platform.HasValue)
            {
                query = query.Where(t => t.Platform == platform.Value);
            }

            return await query.Select(t => new ShareTemplateDto
            {
                Id = t.Id,
                Platform = t.Platform,
                Template = t.Template,
                Hashtags = t.Hashtags,
                IsActive = t.IsActive,
                IsDefault = t.IsDefault
            }).ToListAsync();
        }

        public async Task<ShareTemplateDto> CreateShareTemplateAsync(CreateShareTemplateDto templateDto)
        {
            if (templateDto.IsDefault)
            {
                // Unset other defaults for this platform
                var existingDefaults = await _context.ShareTemplates
                    .Where(t => t.Platform == templateDto.Platform && t.IsDefault)
                    .ToListAsync();

                foreach (var existing in existingDefaults)
                {
                    existing.IsDefault = false;
                }
            }

            var template = new ShareTemplate
            {
                Platform = templateDto.Platform,
                Template = templateDto.Template,
                Hashtags = templateDto.Hashtags,
                IsActive = true,
                IsDefault = templateDto.IsDefault,
                CreatedDate = DateTime.UtcNow
            };

            _context.ShareTemplates.Add(template);
            await _context.SaveChangesAsync();

            return new ShareTemplateDto
            {
                Id = template.Id,
                Platform = template.Platform,
                Template = template.Template,
                Hashtags = template.Hashtags,
                IsActive = template.IsActive,
                IsDefault = template.IsDefault
            };
        }

        // Helper Methods
        private string GenerateShareUrl(SocialPlatform platform, ShareMetadataDto metadata, string? customMessage, List<string>? hashtags)
        {
            var encodedUrl = HttpUtility.UrlEncode(metadata.Url);
            var encodedTitle = HttpUtility.UrlEncode(metadata.Title);
            var encodedDescription = HttpUtility.UrlEncode(metadata.Description);
            var message = customMessage ?? metadata.Title;
            var encodedMessage = HttpUtility.UrlEncode(message);

            var hashtagString = hashtags != null && hashtags.Any() 
                ? string.Join(",", hashtags.Select(h => h.TrimStart('#'))) 
                : "";

            return platform switch
            {
                SocialPlatform.Facebook => $"https://www.facebook.com/sharer/sharer.php?u={encodedUrl}",
                SocialPlatform.Twitter => $"https://twitter.com/intent/tweet?url={encodedUrl}&text={encodedMessage}&hashtags={hashtagString}",
                SocialPlatform.LinkedIn => $"https://www.linkedin.com/sharing/share-offsite/?url={encodedUrl}",
                SocialPlatform.WhatsApp => $"https://wa.me/?text={encodedMessage}%20{encodedUrl}",
                SocialPlatform.Pinterest => $"https://pinterest.com/pin/create/button/?url={encodedUrl}&description={encodedDescription}&media={HttpUtility.UrlEncode(metadata.ImageUrl)}",
                SocialPlatform.Email => $"mailto:?subject={encodedTitle}&body={encodedMessage}%0A%0A{encodedUrl}",
                _ => metadata.Url
            };
        }

        private string GenerateShareText(Auction auction, SocialPlatform platform, string? customMessage, List<string>? hashtags)
        {
            var template = customMessage ?? GetDefaultTemplate(platform);
            
            var text = template
                .Replace("{title}", auction.Title)
                .Replace("{price}", $"${auction.CurrentPrice:F2}")
                .Replace("{endDate}", auction.EndDate.ToString("MMM dd, yyyy"))
                .Replace("{description}", TruncateText(auction.Description, 100));

            if (hashtags != null && hashtags.Any())
            {
                var hashtagString = string.Join(" ", hashtags.Select(h => h.StartsWith('#') ? h : $"#{h}"));
                text += $" {hashtagString}";
            }

            return text;
        }

        private string GetDefaultTemplate(SocialPlatform platform)
        {
            return platform switch
            {
                SocialPlatform.Twitter => "🔥 {title} - Current bid: {price}! Don't miss out! Ends {endDate}",
                SocialPlatform.Facebook => "Check out this amazing auction: {title}! Current price: {price}. Auction ends {endDate}.",
                SocialPlatform.Instagram => "✨ {title} ✨\n💰 {price}\n⏰ Ends {endDate}\nLink in bio!",
                SocialPlatform.LinkedIn => "Exciting auction opportunity: {title}. Current price: {price}. Bidding ends {endDate}.",
                _ => "{title} - {price}. Ends {endDate}. Place your bid now!"
            };
        }

        private (int limit, bool isValid, List<string> errors) ValidateShareContent(string text, SocialPlatform platform)
        {
            var errors = new List<string>();
            var limit = platform switch
            {
                SocialPlatform.Twitter => 280,
                SocialPlatform.Instagram => 2200,
                SocialPlatform.Facebook => 63206,
                SocialPlatform.LinkedIn => 3000,
                _ => int.MaxValue
            };

            var isValid = text.Length <= limit;
            if (!isValid)
            {
                errors.Add($"Content exceeds {limit} character limit for {platform}");
            }

            return (limit, isValid, errors);
        }

        private string GeneratePreviewHtml(ShareMetadataDto metadata, SocialPlatform platform, string text)
        {
            return $@"
                <div class='social-preview {platform.ToString().ToLower()}'>
                    <img src='{metadata.ImageUrl}' alt='Preview' />
                    <h3>{metadata.Title}</h3>
                    <p>{text}</p>
                    <span class='url'>{metadata.Url}</span>
                </div>";
        }

        private string TruncateText(string text, int maxLength)
        {
            if (string.IsNullOrEmpty(text) || text.Length <= maxLength)
                return text;

            return text.Substring(0, maxLength - 3) + "...";
        }

        private string GetBaseUrl()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            return request != null 
                ? $"{request.Scheme}://{request.Host}" 
                : _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";
        }

        private string GenerateReferralCode(string userId)
        {
            return $"REF-{userId.Substring(0, Math.Min(8, userId.Length)).ToUpper()}";
        }
    }
}
