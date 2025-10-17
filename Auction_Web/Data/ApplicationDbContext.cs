using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Auction_Web.Models;

namespace Auction_Web.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Existing DbSets
        public DbSet<Auction> Auctions { get; set; }
        public DbSet<Bid> Bids { get; set; }
        public DbSet<AuctionImage> AuctionImages { get; set; }
        public DbSet<WatchlistItem> WatchlistItems { get; set; }
        
        // New DbSets for enhanced functionality
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<PaymentRecord> PaymentRecords { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<UserReview> UserReviews { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        
        // Admin tables
        public DbSet<AdminActivityLog> AdminActivityLogs { get; set; }
        
        // Social Media Integration tables
        public DbSet<SocialShare> SocialShares { get; set; }
        public DbSet<SocialMediaAccount> SocialMediaAccounts { get; set; }
        public DbSet<ShareTemplate> ShareTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure User entity
            builder.Entity<User>(entity =>
            {
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");
                entity.HasIndex(e => e.UserName).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Role);
                entity.HasIndex(e => e.CreatedDate);
            });

            // Configure Auction entity
            builder.Entity<Auction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StartingPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CurrentPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BuyNowPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ReservePrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BidIncrement).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ShippingCost).HasColumnType("decimal(10,2)");
                                    
                entity.HasOne(e => e.Winner)
                    .WithMany()
                    .HasForeignKey(e => e.WinnerId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasOne(e => e.VerifiedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.VerifiedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                // Indexes for performance
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.EndDate);
                entity.HasIndex(e => e.StartDate);
                entity.HasIndex(e => e.IsFeatured);
                entity.HasIndex(e => e.CurrentPrice);
                entity.HasIndex(e => new { e.Status, e.EndDate });
                entity.HasIndex(e => new { e.Category, e.Status });
                entity.HasIndex(e => new { e.IsFeatured, e.IsActive, e.Status });
            });

            // Configure Bid entity
            builder.Entity<Bid>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Bids)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(e => e.Auction)
                    .WithMany(a => a.Bids)
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                // Indexes for performance
                entity.HasIndex(e => e.AuctionId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.BidDate);
                entity.HasIndex(e => e.Amount);
                entity.HasIndex(e => e.IsWinning);
                entity.HasIndex(e => new { e.AuctionId, e.Amount });
            });

            // Configure WatchlistItem entity
            builder.Entity<WatchlistItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.WatchlistItems)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Auction)
                    .WithMany()
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                // Unique constraint to prevent duplicate watchlist entries
                entity.HasIndex(e => new { e.UserId, e.AuctionId }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.AuctionId);
            });

            // Configure AuctionImage entity
            builder.Entity<AuctionImage>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Auction)
                    .WithMany(a => a.Images)
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(e => e.UploadedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.UploadedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasIndex(e => e.AuctionId);
                entity.HasIndex(e => e.IsPrimary);
                entity.HasIndex(e => e.DisplayOrder);
            });

            // Configure Transaction entity
            builder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.WinningBidAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ShippingCost).HasColumnType("decimal(10,2)");
                entity.Property(e => e.TaxAmount).HasColumnType("decimal(10,2)");
                entity.Property(e => e.PlatformFee).HasColumnType("decimal(10,2)");
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                
                entity.HasOne(e => e.Auction)
                    .WithMany()
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Seller)
                    .WithMany()
                    .HasForeignKey(e => e.SellerId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasIndex(e => e.TransactionId).IsUnique();
                entity.HasIndex(e => e.AuctionId);
                entity.HasIndex(e => e.BuyerId);
                entity.HasIndex(e => e.SellerId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedDate);
                entity.HasIndex(e => new { e.Status, e.CreatedDate });
            });

            // Configure PaymentRecord entity
            builder.Entity<PaymentRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.GatewayFee).HasColumnType("decimal(10,2)");
                entity.Property(e => e.RefundAmount).HasColumnType("decimal(18,2)");
                
                entity.HasOne(e => e.Transaction)
                    .WithMany()
                    .HasForeignKey(e => e.TransactionId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasIndex(e => e.TransactionId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.PaymentReference);
            });

            // Configure Message entity
            builder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.FromUser)
                    .WithMany()
                    .HasForeignKey(e => e.FromUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.ToUser)
                    .WithMany()
                    .HasForeignKey(e => e.ToUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Auction)
                    .WithMany()
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasIndex(e => e.FromUserId);
                entity.HasIndex(e => e.ToUserId);
                entity.HasIndex(e => e.AuctionId);
                entity.HasIndex(e => e.SentDate);
                entity.HasIndex(e => e.IsRead);
            });

            // Configure UserReview entity
            builder.Entity<UserReview>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Reviewer)
                    .WithMany()
                    .HasForeignKey(e => e.ReviewerId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.ReviewedUser)
                    .WithMany()
                    .HasForeignKey(e => e.ReviewedUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasOne(e => e.Transaction)
                    .WithMany()
                    .HasForeignKey(e => e.TransactionId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasOne(e => e.Auction)
                    .WithMany()
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                // Unique constraint to prevent multiple reviews per transaction by same reviewer
                entity.HasIndex(e => new { e.TransactionId, e.ReviewerId }).IsUnique();
                entity.HasIndex(e => e.ReviewedUserId);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.CreatedDate);
                entity.HasIndex(e => new { e.Rating, e.IsVisible });
            });

            // Configure Category entity
            builder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                
                entity.HasOne(e => e.ParentCategory)
                    .WithMany(c => c.SubCategories)
                    .HasForeignKey(e => e.ParentCategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasIndex(e => e.ParentCategoryId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Configure SystemSetting entity
            builder.Entity<SystemSetting>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SettingKey).IsRequired().HasMaxLength(100);
                
                entity.HasOne(e => e.ModifiedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.ModifiedBy)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasIndex(e => e.SettingKey).IsUnique();
                entity.HasIndex(e => e.Category);
            });

            // Configure AuditLog entity
            builder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.EntityType);
                entity.HasIndex(e => e.Timestamp);
            });

            // Configure AdminActivityLog entity
            builder.Entity<AdminActivityLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Admin)
                    .WithMany()
                    .HasForeignKey(e => e.AdminId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasIndex(e => e.AdminId);
                entity.HasIndex(e => e.Action);
                entity.HasIndex(e => e.Timestamp);
            });

            // Configure SocialShare entity
            builder.Entity<SocialShare>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Auction)
                    .WithMany()
                    .HasForeignKey(e => e.AuctionId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasIndex(e => e.AuctionId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Platform);
                entity.HasIndex(e => e.SharedDate);
                entity.HasIndex(e => new { e.AuctionId, e.Platform });
            });

            // Configure SocialMediaAccount entity
            builder.Entity<SocialMediaAccount>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                // Unique constraint: one account per platform per user
                entity.HasIndex(e => new { e.UserId, e.Platform }).IsUnique();
                entity.HasIndex(e => e.Platform);
                entity.HasIndex(e => e.IsConnected);
            });

            // Configure ShareTemplate entity
            builder.Entity<ShareTemplate>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasIndex(e => e.Platform);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsDefault);
                entity.HasIndex(e => new { e.Platform, e.IsDefault });
            });
        }
    }
}
