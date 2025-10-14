using Auction_Web.Models;
using Auction_Web.Models.DTOs;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace Auction_Web.Services
{
    public interface IAuctionService
    {
        Task<IEnumerable<Auction>> GetAuctionsAsync(AuctionSearchDto searchDto);
        Task<Auction?> GetAuctionByIdAsync(int id, bool incrementViewCount = true);
        Task<Auction> CreateAuctionAsync(CreateAuctionDto createDto, int sellerId);
        Task<Auction?> UpdateAuctionAsync(int id, UpdateAuctionDto updateDto, int userId);
        Task<bool> DeleteAuctionAsync(int id, int userId);
        Task<bool> ScheduleAuctionAsync(ScheduleAuctionDto scheduleDto, int userId);
        Task<bool> ActivateAuctionAsync(int id, int userId);
        Task<bool> CancelAuctionAsync(int id, int userId, string reason);
        Task<bool> EndAuctionAsync(int id, int userId);
        Task<IEnumerable<string>> GetCategoriesAsync();
        Task<IEnumerable<string>> GetSubCategoriesAsync(string category);
        Task<bool> AddImageAsync(int auctionId, CreateImageDto imageDto, int userId);
        Task<bool> RemoveImageAsync(int auctionId, int imageId, int userId);
        Task<bool> SetPrimaryImageAsync(int auctionId, int imageId, int userId);
        Task<decimal> CalculateNextBidAmount(int auctionId);
        Task<bool> ValidateAuctionDatesAsync(DateTime startDate, DateTime endDate);
        Task<AuctionStatus> GetAuctionStatusAsync(int auctionId);
        Task UpdateAuctionStatusesAsync();
    }

    public class AuctionService : IAuctionService
    {
        // In a real application, this would use Entity Framework and a database
        private static List<Auction> _auctions = new List<Auction>();
        private static int _nextId = 1;
        private readonly IImageService _imageService;

        public AuctionService(IImageService imageService)
        {
            _imageService = imageService;
            if (!_auctions.Any())
            {
                InitializeSampleData();
            }
        }

        public async Task<IEnumerable<Auction>> GetAuctionsAsync(AuctionSearchDto searchDto)
        {
            await UpdateAuctionStatusesAsync();
            
            var query = _auctions.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(searchDto.Query))
            {
                query = query.Where(a => a.Title.Contains(searchDto.Query, StringComparison.OrdinalIgnoreCase) ||
                                        a.Description.Contains(searchDto.Query, StringComparison.OrdinalIgnoreCase) ||
                                        (a.Tags != null && a.Tags.Contains(searchDto.Query, StringComparison.OrdinalIgnoreCase)));
            }

            if (!string.IsNullOrEmpty(searchDto.Category))
            {
                query = query.Where(a => a.Category.Equals(searchDto.Category, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(searchDto.SubCategory))
            {
                query = query.Where(a => a.SubCategory != null && a.SubCategory.Equals(searchDto.SubCategory, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(searchDto.Condition))
            {
                query = query.Where(a => a.Condition.Equals(searchDto.Condition, StringComparison.OrdinalIgnoreCase));
            }

            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(a => a.CurrentPrice >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(a => a.CurrentPrice <= searchDto.MaxPrice.Value);
            }

            if (searchDto.Status.HasValue)
            {
                query = query.Where(a => a.Status == searchDto.Status.Value);
            }

            if (searchDto.Type.HasValue)
            {
                query = query.Where(a => a.Type == searchDto.Type.Value);
            }

            if (searchDto.Featured.HasValue)
            {
                query = query.Where(a => a.IsFeatured == searchDto.Featured.Value);
            }

            if (searchDto.HasBuyNow.HasValue && searchDto.HasBuyNow.Value)
            {
                query = query.Where(a => a.BuyNowPrice.HasValue);
            }

            if (searchDto.FreeShipping.HasValue && searchDto.FreeShipping.Value)
            {
                query = query.Where(a => a.FreeShipping);
            }

            if (!string.IsNullOrEmpty(searchDto.Location))
            {
                query = query.Where(a => a.ItemLocation != null && a.ItemLocation.Contains(searchDto.Location, StringComparison.OrdinalIgnoreCase));
            }

            // Apply sorting
            query = searchDto.SortBy?.ToLower() switch
            {
                "title" => searchDto.SortOrder?.ToLower() == "asc" ? query.OrderBy(a => a.Title) : query.OrderByDescending(a => a.Title),
                "price" => searchDto.SortOrder?.ToLower() == "asc" ? query.OrderBy(a => a.CurrentPrice) : query.OrderByDescending(a => a.CurrentPrice),
                "enddate" => searchDto.SortOrder?.ToLower() == "asc" ? query.OrderBy(a => a.EndDate) : query.OrderByDescending(a => a.EndDate),
                "bids" => searchDto.SortOrder?.ToLower() == "asc" ? query.OrderBy(a => a.BidCount) : query.OrderByDescending(a => a.BidCount),
                "views" => searchDto.SortOrder?.ToLower() == "asc" ? query.OrderBy(a => a.ViewCount) : query.OrderByDescending(a => a.ViewCount),
                _ => searchDto.SortOrder?.ToLower() == "asc" ? query.OrderBy(a => a.CreatedDate) : query.OrderByDescending(a => a.CreatedDate)
            };

            // Apply pagination
            var skip = (searchDto.Page - 1) * searchDto.PageSize;
            return query.Skip(skip).Take(searchDto.PageSize).ToList();
        }

        public async Task<Auction?> GetAuctionByIdAsync(int id, bool incrementViewCount = true)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            
            if (auction != null && incrementViewCount)
            {
                auction.ViewCount++;
                auction.Views.Add(new AuctionView
                {
                    Id = auction.Views.Count + 1,
                    AuctionId = id,
                    ViewedDate = DateTime.UtcNow
                });
            }

            return await Task.FromResult(auction);
        }

        public async Task<Auction> CreateAuctionAsync(CreateAuctionDto createDto, int sellerId)
        {
            if (!await ValidateAuctionDatesAsync(createDto.StartDate, createDto.EndDate))
            {
                throw new ArgumentException("Invalid auction dates");
            }

            var auction = new Auction
            {
                Id = _nextId++,
                Title = createDto.Title,
                Description = createDto.Description,
                DetailedDescription = createDto.DetailedDescription,
                StartingPrice = createDto.StartingPrice,
                CurrentPrice = createDto.StartingPrice,
                BuyNowPrice = createDto.BuyNowPrice,
                ReservePrice = createDto.ReservePrice,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                Category = createDto.Category,
                SubCategory = createDto.SubCategory,
                Condition = createDto.Condition,
                ConditionNotes = createDto.ConditionNotes,
                Type = createDto.Type,
                Brand = createDto.Brand,
                Model = createDto.Model,
                Size = createDto.Size,
                Color = createDto.Color,
                Material = createDto.Material,
                YearManufactured = createDto.YearManufactured,
                CountryOfOrigin = createDto.CountryOfOrigin,
                ShippingCost = createDto.ShippingCost,
                FreeShipping = createDto.FreeShipping,
                LocalPickupOnly = createDto.LocalPickupOnly,
                ShippingNotes = createDto.ShippingNotes,
                ItemLocation = createDto.ItemLocation,
                BidIncrement = createDto.BidIncrement,
                AutoExtend = createDto.AutoExtend,
                AutoExtendMinutes = createDto.AutoExtendMinutes,
                RequirePreApproval = createDto.RequirePreApproval,
                MaxBids = createDto.MaxBids,
                Tags = createDto.Tags,
                ExternalReference = createDto.ExternalReference,
                SellerId = sellerId.ToString(),
                Status = createDto.StartDate <= DateTime.UtcNow ? AuctionStatus.Active : AuctionStatus.Scheduled
            };

            // Add images
            for (int i = 0; i < createDto.Images.Count; i++)
            {
                var imageDto = createDto.Images[i];
                
                // Handle base64 image data
                if (imageDto.ImageUrl.StartsWith("data:image"))
                {
                    var base64Data = imageDto.ImageUrl.Substring(imageDto.ImageUrl.IndexOf(',') + 1);
                    var fileBytes = Convert.FromBase64String(base64Data);
                    var stream = new MemoryStream(fileBytes);
                    var formFile = new FormFile(stream, 0, fileBytes.Length, "image", "image.png");
                    
                    imageDto.ImageUrl = await _imageService.SaveImageAsync(formFile, "auctions");
                }

                auction.Images.Add(new AuctionImage
                {
                    Id = i + 1,
                    ImageUrl = imageDto.ImageUrl,
                    AltText = imageDto.AltText,
                    Caption = imageDto.Caption,
                    IsPrimary = imageDto.IsPrimary || (i == 0 && !createDto.Images.Any(img => img.IsPrimary)),
                    DisplayOrder = imageDto.DisplayOrder > 0 ? imageDto.DisplayOrder : i + 1,
                    Type = imageDto.Type,
                    AuctionId = auction.Id
                });
            }

            _auctions.Add(auction);
            return await Task.FromResult(auction);
        }

        public async Task<Auction?> UpdateAuctionAsync(int id, UpdateAuctionDto updateDto, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return null;

            // Only allow updates if auction hasn't started or has started but certain fields can still be modified
            if (auction.HasStarted && auction.Status == AuctionStatus.Active)
            {
                // Limited updates allowed for active auctions
                if (updateDto.ConditionNotes != null) auction.ConditionNotes = updateDto.ConditionNotes;
                if (updateDto.ShippingNotes != null) auction.ShippingNotes = updateDto.ShippingNotes;
                if (updateDto.Tags != null) auction.Tags = updateDto.Tags;
            }
            else if (auction.Status == AuctionStatus.Draft || auction.Status == AuctionStatus.Scheduled)
            {
                // Full updates allowed for draft/scheduled auctions
                if (updateDto.Title != null) auction.Title = updateDto.Title;
                if (updateDto.Description != null) auction.Description = updateDto.Description;
                if (updateDto.DetailedDescription != null) auction.DetailedDescription = updateDto.DetailedDescription;
                if (updateDto.ConditionNotes != null) auction.ConditionNotes = updateDto.ConditionNotes;
                if (updateDto.BuyNowPrice != null) auction.BuyNowPrice = updateDto.BuyNowPrice;
                if (updateDto.ReservePrice != null) auction.ReservePrice = updateDto.ReservePrice;
                if (updateDto.EndDate != null) auction.EndDate = updateDto.EndDate.Value;
                if (updateDto.ShippingNotes != null) auction.ShippingNotes = updateDto.ShippingNotes;
                if (updateDto.Tags != null) auction.Tags = updateDto.Tags;
            }

            if (updateDto.IsFeatured != null) auction.IsFeatured = updateDto.IsFeatured.Value;
            
            auction.ModifiedDate = DateTime.UtcNow;
            return await Task.FromResult(auction);
        }

        public async Task<bool> DeleteAuctionAsync(int id, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            // Only allow deletion if no bids have been placed
            if (auction.BidCount > 0)
                return false;

            _auctions.Remove(auction);
            return await Task.FromResult(true);
        }

        public async Task<bool> ScheduleAuctionAsync(ScheduleAuctionDto scheduleDto, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == scheduleDto.AuctionId);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            if (!await ValidateAuctionDatesAsync(scheduleDto.StartDate, scheduleDto.EndDate))
                return false;

            auction.StartDate = scheduleDto.StartDate;
            auction.EndDate = scheduleDto.EndDate;
            auction.Status = scheduleDto.StartDate <= DateTime.UtcNow ? AuctionStatus.Active : AuctionStatus.Scheduled;
            auction.ModifiedDate = DateTime.UtcNow;

            return await Task.FromResult(true);
        }

        public async Task<bool> ActivateAuctionAsync(int id, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            if (auction.Status != AuctionStatus.Draft && auction.Status != AuctionStatus.Scheduled)
                return false;

            auction.Status = AuctionStatus.Active;
            auction.StartDate = DateTime.UtcNow;
            auction.ModifiedDate = DateTime.UtcNow;

            return await Task.FromResult(true);
        }

        public async Task<bool> CancelAuctionAsync(int id, int userId, string reason)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            if (auction.Status == AuctionStatus.Ended || auction.Status == AuctionStatus.Sold)
                return false;

            auction.Status = AuctionStatus.Cancelled;
            auction.ModifiedDate = DateTime.UtcNow;

            return await Task.FromResult(true);
        }

        public async Task<bool> EndAuctionAsync(int id, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == id);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            if (auction.Status != AuctionStatus.Active)
                return false;

            auction.Status = AuctionStatus.Ended;
            auction.EndDate = DateTime.UtcNow;
            auction.ModifiedDate = DateTime.UtcNow;

            return await Task.FromResult(true);
        }

        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            var categories = _auctions.Where(a => !string.IsNullOrEmpty(a.Category))
                                    .Select(a => a.Category)
                                    .Distinct()
                                    .OrderBy(c => c)
                                    .ToList();

            // Add default categories if none exist
            if (!categories.Any())
            {
                categories = new List<string> { "Electronics", "Fashion", "Furniture", "Art", "Collectibles", "Automotive", "Sports", "Books", "Jewelry", "Other" };
            }

            return await Task.FromResult(categories);
        }

        public async Task<IEnumerable<string>> GetSubCategoriesAsync(string category)
        {
            var subCategories = _auctions.Where(a => a.Category.Equals(category, StringComparison.OrdinalIgnoreCase) && 
                                                   !string.IsNullOrEmpty(a.SubCategory))
                                       .Select(a => a.SubCategory!)
                                       .Distinct()
                                       .OrderBy(sc => sc)
                                       .ToList();

            return await Task.FromResult(subCategories);
        }

        public async Task<bool> AddImageAsync(int auctionId, CreateImageDto imageDto, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == auctionId);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            var newImage = new AuctionImage
            {
                Id = auction.Images.Count + 1,
                ImageUrl = imageDto.ImageUrl,
                AltText = imageDto.AltText,
                Caption = imageDto.Caption,
                IsPrimary = imageDto.IsPrimary,
                DisplayOrder = imageDto.DisplayOrder > 0 ? imageDto.DisplayOrder : auction.Images.Count + 1,
                Type = imageDto.Type,
                AuctionId = auctionId
            };

            auction.Images.Add(newImage);
            return await Task.FromResult(true);
        }

        public async Task<bool> RemoveImageAsync(int auctionId, int imageId, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == auctionId);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            var image = auction.Images.FirstOrDefault(i => i.Id == imageId);
            if (image == null)
                return false;

            auction.Images.Remove(image);
            return await Task.FromResult(true);
        }

        public async Task<bool> SetPrimaryImageAsync(int auctionId, int imageId, int userId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == auctionId);
            
            if (auction == null || auction.SellerId != userId.ToString())
                return false;

            // Remove primary flag from all images
            foreach (var img in auction.Images)
            {
                img.IsPrimary = false;
            }

            // Set new primary image
            var primaryImage = auction.Images.FirstOrDefault(i => i.Id == imageId);
            if (primaryImage == null)
                return false;

            primaryImage.IsPrimary = true;
            return await Task.FromResult(true);
        }

        public async Task<decimal> CalculateNextBidAmount(int auctionId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == auctionId);
            
            if (auction == null)
                return 0;

            var increment = auction.BidIncrement ?? CalculateDefaultBidIncrement(auction.CurrentPrice);
            return await Task.FromResult(auction.CurrentPrice + increment);
        }

        public async Task<bool> ValidateAuctionDatesAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate >= endDate)
                return false;

            if (endDate <= DateTime.UtcNow)
                return false;

            if (startDate < DateTime.UtcNow.AddMinutes(-5)) // Allow 5 minute grace period
                return false;

            return await Task.FromResult(true);
        }

        public async Task<AuctionStatus> GetAuctionStatusAsync(int auctionId)
        {
            var auction = _auctions.FirstOrDefault(a => a.Id == auctionId);
            
            if (auction == null)
                return AuctionStatus.Cancelled;

            return await Task.FromResult(auction.Status);
        }

        public async Task UpdateAuctionStatusesAsync()
        {
            var now = DateTime.UtcNow;
            
            foreach (var auction in _auctions)
            {
                if (auction.Status == AuctionStatus.Scheduled && auction.StartDate <= now)
                {
                    auction.Status = AuctionStatus.Active;
                }
                else if (auction.Status == AuctionStatus.Active && auction.EndDate <= now)
                {
                    auction.Status = AuctionStatus.Ended;
                }
            }

            await Task.CompletedTask;
        }

        private static decimal CalculateDefaultBidIncrement(decimal currentPrice)
        {
            return currentPrice switch
            {
                < 25 => 1,
                < 100 => 2.50m,
                < 250 => 5,
                < 500 => 10,
                < 1000 => 25,
                < 2500 => 50,
                _ => 100
            };
        }

        private static void InitializeSampleData()
        {
            _auctions.AddRange(new List<Auction>
            {
                new Auction
                {
                    Id = _nextId++,
                    Title = "Vintage Leica Camera Collection",
                    Description = "Beautiful vintage Leica camera in excellent condition. Perfect for collectors or photography enthusiasts.",
                    DetailedDescription = "This stunning Leica IIIf camera from 1952 is a true collector's piece. Features include a 50mm Summitar lens, rangefinder focusing, and original leather case. The camera has been well-maintained and is in working condition. Minor cosmetic wear consistent with age. Includes original manual and lens cap.",
                    StartingPrice = 50.00m,
                    CurrentPrice = 125.50m,
                    BuyNowPrice = 300.00m,
                    StartDate = DateTime.UtcNow.AddDays(-2),
                    EndDate = DateTime.UtcNow.AddDays(3),
                    Category = "Electronics",
                    SubCategory = "Cameras",
                    Condition = "Excellent",
                    Brand = "Leica",
                    Model = "IIIf",
                    YearManufactured = 1952,
                    CountryOfOrigin = "Germany",
                    ShippingCost = 15.00m,
                    ItemLocation = "New York, NY",
                    ViewCount = 45,
                    BidCount = 8,
                    SellerId = "1",
                    IsFeatured = true,
                    Status = AuctionStatus.Active,
                    Type = AuctionType.Standard,
                    Tags = "vintage,camera,leica,photography,collector",
                    Images = new List<AuctionImage>
                    {
                        new AuctionImage 
                        { 
                            Id = 1, 
                            ImageUrl = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&w=400", 
                            IsPrimary = true, 
                            DisplayOrder = 1, 
                            Type = ImageType.Primary,
                            AltText = "Vintage Leica Camera - Front View"
                        }
                    }
                },
                new Auction
                {
                    Id = _nextId++,
                    Title = "Designer Watch - Limited Edition Rolex Submariner",
                    Description = "Luxury Rolex Submariner watch with original box and papers. Excellent investment piece.",
                    DetailedDescription = "This authentic Rolex Submariner Date 116610LN is a modern classic. Features include a ceramic bezel, automatic movement, and 300m water resistance. Purchased new in 2020, worn sparingly, and maintained by authorized Rolex service center. Comes with original box, papers, warranty card, and purchase receipt.",
                    StartingPrice = 200.00m,
                    CurrentPrice = 450.00m,
                    BuyNowPrice = 8000.00m,
                    ReservePrice = 7500.00m,
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(2),
                    Category = "Fashion",
                    SubCategory = "Watches",
                    Condition = "Like New",
                    Brand = "Rolex",
                    Model = "Submariner Date 116610LN",
                    YearManufactured = 2020,
                    CountryOfOrigin = "Switzerland",
                    ShippingCost = 50.00m,
                    ItemLocation = "Los Angeles, CA",
                    ViewCount = 67,
                    BidCount = 12,
                    SellerId = "2",
                    IsFeatured = true,
                    Status = AuctionStatus.Active,
                    Type = AuctionType.Reserve,
                    Tags = "rolex,watch,luxury,submariner,investment",
                    Images = new List<AuctionImage>
                    {
                        new AuctionImage 
                        { 
                            Id = 2, 
                            ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&w=400", 
                            IsPrimary = true, 
                            DisplayOrder = 1, 
                            Type = ImageType.Primary,
                            AltText = "Rolex Submariner Watch"
                        }
                    }
                }
            });
        }
    }
}
