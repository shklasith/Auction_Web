using Auction_Web.Models;
using Auction_Web.Models.DTOs;

namespace Auction_Web.Services
{
    public interface IImageService
    {
        Task<string> UploadImageAsync(IFormFile file, string folderPath = "auctions");
        Task<string> SaveImageAsync(IFormFile file, string folderPath = "auctions");
        Task<bool> DeleteImageAsync(string imageUrl);
        Task<(string originalUrl, string thumbnailUrl, string mediumUrl)> ProcessImageAsync(IFormFile file, string folderPath = "auctions");
        Task<bool> ValidateImageAsync(IFormFile file);
        string GenerateImageUrl(string fileName, string folderPath = "auctions");
        Task<ImageMetadata> GetImageMetadataAsync(IFormFile file);
    }

    public class ImageMetadata
    {
        public long FileSize { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string Format { get; set; }
        public string FileName { get; set; }
    }

    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ImageService> _logger;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB
        private readonly int _maxWidth = 2048;
        private readonly int _maxHeight = 2048;

        public ImageService(IWebHostEnvironment environment, ILogger<ImageService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folderPath = "auctions")
        {
            if (!await ValidateImageAsync(file))
            {
                throw new ArgumentException("Invalid image file");
            }

            var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", folderPath);
            Directory.CreateDirectory(uploadPath);

            var fileName = GenerateUniqueFileName(file.FileName);
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return GenerateImageUrl(fileName, folderPath);
        }

        public async Task<string> SaveImageAsync(IFormFile file, string folderPath = "auctions")
        {
            _logger.LogInformation("Attempting to save image...");

            if (!await ValidateImageAsync(file))
            {
                _logger.LogWarning("Invalid image file provided.");
                throw new ArgumentException("Invalid image file");
            }

            var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", folderPath);
            Directory.CreateDirectory(uploadPath);
            _logger.LogInformation("Upload path: {UploadPath}", uploadPath);

            var fileName = GenerateUniqueFileName(file.FileName);
            var filePath = Path.Combine(uploadPath, fileName);
            _logger.LogInformation("File path: {FilePath}", filePath);

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                _logger.LogInformation("Image saved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving image to disk.");
                throw;
            }

            var imageUrl = GenerateImageUrl(fileName, folderPath);
            _logger.LogInformation("Generated image URL: {ImageUrl}", imageUrl);

            return imageUrl;
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl) || !imageUrl.Contains("/uploads/"))
                {
                    return false;
                }

                // Extract the relative path from the URL
                var relativePath = imageUrl.Substring(imageUrl.IndexOf("/uploads/"));
                var filePath = Path.Combine(_environment.WebRootPath, relativePath.TrimStart('/'));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    
                    // Also delete thumbnail and medium versions if they exist
                    var directory = Path.GetDirectoryName(filePath);
                    var fileNameWithoutExt = Path.GetFileNameWithoutExtension(filePath);
                    var extension = Path.GetExtension(filePath);
                    
                    var thumbnailPath = Path.Combine(directory!, $"{fileNameWithoutExt}_thumb{extension}");
                    var mediumPath = Path.Combine(directory!, $"{fileNameWithoutExt}_medium{extension}");
                    
                    if (File.Exists(thumbnailPath)) File.Delete(thumbnailPath);
                    if (File.Exists(mediumPath)) File.Delete(mediumPath);
                    
                    return true;
                }

                return await Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {ImageUrl}", imageUrl);
                return false;
            }
        }

        public async Task<(string originalUrl, string thumbnailUrl, string mediumUrl)> ProcessImageAsync(IFormFile file, string folderPath = "auctions")
        {
            var originalUrl = await UploadImageAsync(file, folderPath);
            
            // In a real implementation, you would use an image processing library like ImageSharp
            // For now, we'll return the same URL for all sizes
            var thumbnailUrl = originalUrl.Replace(".", "_thumb.");
            var mediumUrl = originalUrl.Replace(".", "_medium.");
            
            // Simulate image processing
            await Task.Delay(100);
            
            return (originalUrl, thumbnailUrl, mediumUrl);
        }

        public async Task<bool> ValidateImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > _maxFileSize)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

            // Additional validation could include checking file headers, etc.
            return await Task.FromResult(true);
        }

        public string GenerateImageUrl(string fileName, string folderPath = "auctions")
        {
            return $"/uploads/{folderPath}/{fileName}";
        }

        public async Task<ImageMetadata> GetImageMetadataAsync(IFormFile file)
        {
            var metadata = new ImageMetadata
            {
                FileSize = file.Length,
                FileName = file.FileName,
                Format = Path.GetExtension(file.FileName).TrimStart('.').ToUpperInvariant()
            };

            // In a real implementation, you would use an image library to get actual dimensions
            // For demo purposes, we'll use placeholder values
            metadata.Width = 800;
            metadata.Height = 600;

            return await Task.FromResult(metadata);
        }

        private string GenerateUniqueFileName(string originalFileName)
        {
            var extension = Path.GetExtension(originalFileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            return fileName;
        }
    }
}
