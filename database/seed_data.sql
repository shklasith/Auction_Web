-- Auction Web Application Seed Data
-- MySQL Database Initial Data
-- Created: September 5, 2025

USE auction_web;

-- =============================================
-- SEED DATA FOR CATEGORIES
-- =============================================

INSERT INTO Categories (Name, Description, IsActive, DisplayOrder) VALUES
-- Main Categories
('Electronics', 'Electronic devices and gadgets', TRUE, 1),
('Collectibles', 'Rare and collectible items', TRUE, 2),
('Fashion', 'Clothing, shoes, and accessories', TRUE, 3),
('Home & Garden', 'Home improvement and garden items', TRUE, 4),
('Automotive', 'Cars, motorcycles, and auto parts', TRUE, 5),
('Sports & Recreation', 'Sports equipment and recreational items', TRUE, 6),
('Books & Media', 'Books, movies, music, and games', TRUE, 7),
('Art & Antiques', 'Artwork, antiques, and crafts', TRUE, 8),
('Jewelry & Watches', 'Fine jewelry and timepieces', TRUE, 9),
('Industrial & Business', 'Business and industrial equipment', TRUE, 10);

-- Electronics Subcategories
INSERT INTO Categories (Name, Description, ParentCategoryId, IsActive, DisplayOrder) VALUES
('Smartphones', 'Mobile phones and accessories', 1, TRUE, 1),
('Laptops & Computers', 'Desktop and laptop computers', 1, TRUE, 2),
('Gaming Consoles', 'Video game systems and accessories', 1, TRUE, 3),
('Audio Equipment', 'Speakers, headphones, and audio gear', 1, TRUE, 4),
('Cameras & Photography', 'Digital cameras and photography equipment', 1, TRUE, 5),
('Smart Home', 'Smart home devices and automation', 1, TRUE, 6);

-- Collectibles Subcategories
INSERT INTO Categories (Name, Description, ParentCategoryId, IsActive, DisplayOrder) VALUES
('Trading Cards', 'Sports cards, gaming cards, collectible cards', 2, TRUE, 1),
('Coins & Currency', 'Rare coins and paper money', 2, TRUE, 2),
('Stamps', 'Postage stamps and philatelic items', 2, TRUE, 3),
('Vintage Toys', 'Classic and vintage toy collections', 2, TRUE, 4),
('Comic Books', 'Comic books and graphic novels', 2, TRUE, 5);

-- Fashion Subcategories
INSERT INTO Categories (Name, Description, ParentCategoryId, IsActive, DisplayOrder) VALUES
('Designer Clothing', 'High-end and designer fashion', 3, TRUE, 1),
('Vintage Fashion', 'Vintage and retro clothing', 3, TRUE, 2),
('Shoes & Footwear', 'All types of shoes and boots', 3, TRUE, 3),
('Handbags & Accessories', 'Purses, bags, and fashion accessories', 3, TRUE, 4);

-- =============================================
-- SEED DATA FOR ASPNET ROLES
-- =============================================

INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp) VALUES
(UUID(), 'Administrator', 'ADMINISTRATOR', UUID()),
(UUID(), 'Seller', 'SELLER', UUID()),
(UUID(), 'Buyer', 'BUYER', UUID()),
(UUID(), 'Moderator', 'MODERATOR', UUID());

-- =============================================
-- SEED DATA FOR SYSTEM SETTINGS
-- =============================================

INSERT INTO SystemSettings (SettingKey, SettingValue, Description, DataType, Category, IsSystem) VALUES
-- Platform Settings
('PlatformName', 'AuctionWeb', 'Name of the auction platform', 'String', 'Platform', TRUE),
('PlatformFeePercentage', '5.0', 'Platform fee percentage for transactions', 'Decimal', 'Fees', FALSE),
('MaxImageUploads', '10', 'Maximum number of images per auction', 'Integer', 'Uploads', FALSE),
('MaxImageSize', '5242880', 'Maximum image file size in bytes (5MB)', 'Integer', 'Uploads', FALSE),
('SupportedImageFormats', '["jpg", "jpeg", "png", "gif", "webp"]', 'Supported image formats', 'JSON', 'Uploads', FALSE),

-- Auction Settings
('MinAuctionDuration', '1', 'Minimum auction duration in hours', 'Integer', 'Auctions', FALSE),
('MaxAuctionDuration', '720', 'Maximum auction duration in hours (30 days)', 'Integer', 'Auctions', FALSE),
('DefaultBidIncrement', '1.00', 'Default bid increment amount', 'Decimal', 'Auctions', FALSE),
('AutoExtendEnabled', 'true', 'Enable automatic auction extension', 'Boolean', 'Auctions', FALSE),
('AutoExtendMinutes', '5', 'Minutes to extend auction when bid placed near end', 'Integer', 'Auctions', FALSE),
('RequireEmailVerification', 'true', 'Require email verification for new users', 'Boolean', 'Users', FALSE),

-- Payment Settings
('AcceptedPaymentMethods', '["CreditCard", "PayPal", "BankTransfer"]', 'Accepted payment methods', 'JSON', 'Payment', FALSE),
('PaymentProcessingFee', '2.9', 'Payment processing fee percentage', 'Decimal', 'Fees', FALSE),
('RefundPeriodDays', '14', 'Number of days for refund eligibility', 'Integer', 'Payment', FALSE),

-- Communication Settings
('MaxMessageLength', '2000', 'Maximum message length in characters', 'Integer', 'Communication', FALSE),
('EnableUserMessages', 'true', 'Allow users to send messages to each other', 'Boolean', 'Communication', FALSE),
('NotificationEmailEnabled', 'true', 'Send email notifications for important events', 'Boolean', 'Notifications', FALSE),

-- Security Settings
('MaxLoginAttempts', '5', 'Maximum failed login attempts before lockout', 'Integer', 'Security', FALSE),
('LockoutDurationMinutes', '30', 'Duration of account lockout in minutes', 'Integer', 'Security', FALSE),
('PasswordRequireDigit', 'true', 'Require at least one digit in passwords', 'Boolean', 'Security', FALSE),
('PasswordRequireUppercase', 'true', 'Require at least one uppercase letter in passwords', 'Boolean', 'Security', FALSE),
('PasswordMinLength', '8', 'Minimum password length', 'Integer', 'Security', FALSE),

-- Display Settings
('ItemsPerPage', '20', 'Number of items to display per page', 'Integer', 'Display', FALSE),
('FeaturedAuctionSlots', '8', 'Number of featured auction slots on homepage', 'Integer', 'Display', FALSE),
('RecentAuctionsCount', '12', 'Number of recent auctions to display', 'Integer', 'Display', FALSE),

-- Business Rules
('MinStartingPrice', '0.01', 'Minimum starting price for auctions', 'Decimal', 'Business', FALSE),
('MaxStartingPrice', '1000000.00', 'Maximum starting price for auctions', 'Decimal', 'Business', FALSE),
('AllowReserveAuctions', 'true', 'Allow auctions with reserve prices', 'Boolean', 'Business', FALSE),
('AllowBuyItNow', 'true', 'Allow Buy It Now auctions', 'Boolean', 'Business', FALSE),

-- SEO and Marketing
('MetaDescription', 'Premier online auction platform for buying and selling unique items', 'Site meta description', 'String', 'SEO', FALSE),
('MetaKeywords', 'auction, online bidding, buy, sell, collectibles, electronics', 'Site meta keywords', 'String', 'SEO', FALSE),
('EnableSitemap', 'true', 'Generate XML sitemap', 'Boolean', 'SEO', FALSE),

-- Maintenance
('MaintenanceMode', 'false', 'Enable maintenance mode', 'Boolean', 'System', FALSE),
('MaintenanceMessage', 'Site is currently under maintenance. Please try again later.', 'Maintenance mode message', 'String', 'System', FALSE),
('BackupFrequencyHours', '24', 'Database backup frequency in hours', 'Integer', 'System', FALSE);

-- =============================================
-- SAMPLE DEMO DATA (OPTIONAL)
-- =============================================

-- Sample Admin User (Password should be changed in production)
-- Note: This creates a demo admin account. In production, create this through the application.
SET @AdminId = UUID();
INSERT INTO AspNetUsers (
    Id, UserName, NormalizedUserName, Email, NormalizedEmail, 
    EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp,
    FullName, Role, IsActive, CreatedDate
) VALUES (
    @AdminId, 'admin@auctionweb.com', 'ADMIN@AUCTIONWEB.COM', 
    'admin@auctionweb.com', 'ADMIN@AUCTIONWEB.COM', TRUE,
    -- This is a hashed password for 'Admin123!' - should be generated properly
    'AQAAAAEAACcQAAAAEJ5Z1qB2fQw9z6OhM+7G8R3YwZjDY+KJHFECBq4XVNHf9L2kW8VeR1M3Q7N6P5S4T==',
    UUID(), UUID(), 'System Administrator', 'Administrator', TRUE, CURRENT_TIMESTAMP(6)
);

-- Sample Demo Auctions (for testing purposes)
INSERT INTO Auctions (
    Title, Description, StartingPrice, CurrentPrice, StartDate, EndDate,
    Category, ItemCondition, SellerId, Status, IsActive
) VALUES
('Vintage iPhone 12 Pro Max', 'Excellent condition iPhone 12 Pro Max in original packaging', 
 499.99, 499.99, DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 7 DAY),
 'Electronics', 'Excellent', @AdminId, 'Scheduled', TRUE),

('Rare Baseball Card Collection', 'Collection of rare baseball cards from the 1980s', 
 99.99, 99.99, DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 5 DAY),
 'Collectibles', 'Very Good', @AdminId, 'Scheduled', TRUE),

('Designer Handbag', 'Authentic Louis Vuitton handbag in perfect condition', 
 299.99, 299.99, DATE_ADD(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 3 DAY),
 'Fashion', 'Like New', @AdminId, 'Scheduled', TRUE);

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Additional performance indexes
CREATE INDEX IX_Auctions_CreatedDate ON Auctions(CreatedDate);
CREATE INDEX IX_Auctions_Featured_Active ON Auctions(IsFeatured, IsActive, Status);
CREATE INDEX IX_Bids_AuctionId_Amount ON Bids(AuctionId, Amount DESC);
CREATE INDEX IX_Transactions_Status_Date ON Transactions(Status, CreatedDate);
CREATE INDEX IX_UserReviews_Rating_Visible ON UserReviews(Rating, IsVisible);

-- Composite indexes for common queries
CREATE INDEX IX_Auctions_Category_Status_EndDate ON Auctions(Category, Status, EndDate);
CREATE INDEX IX_Auctions_Seller_Status ON Auctions(SellerId, Status);
CREATE INDEX IX_WatchlistItems_User_Added ON WatchlistItems(UserId, AddedDate DESC);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Active Auctions View
CREATE VIEW ActiveAuctions AS
SELECT 
    a.*,
    u.FullName as SellerName,
    u.Rating as SellerRating,
    (SELECT COUNT(*) FROM Bids b WHERE b.AuctionId = a.Id) as TotalBids,
    (SELECT MAX(Amount) FROM Bids b WHERE b.AuctionId = a.Id) as HighestBid,
    (SELECT ImageUrl FROM AuctionImages ai WHERE ai.AuctionId = a.Id AND ai.IsPrimary = TRUE LIMIT 1) as PrimaryImage
FROM Auctions a
LEFT JOIN AspNetUsers u ON a.SellerId = u.Id
WHERE a.Status = 'Active' AND a.IsActive = TRUE;

-- User Statistics View
CREATE VIEW UserStatistics AS
SELECT 
    u.Id,
    u.FullName,
    u.Rating,
    u.TotalSales,
    (SELECT COUNT(*) FROM Auctions a WHERE a.SellerId = u.Id AND a.Status = 'Sold') as CompletedAuctions,
    (SELECT COUNT(*) FROM Bids b WHERE b.UserId = u.Id) as TotalBids,
    (SELECT AVG(r.Rating) FROM UserReviews r WHERE r.ReviewedUserId = u.Id AND r.IsVisible = TRUE) as AverageRating,
    (SELECT COUNT(*) FROM UserReviews r WHERE r.ReviewedUserId = u.Id AND r.IsVisible = TRUE) as ReviewCount
FROM AspNetUsers u;

-- Transaction Summary View
CREATE VIEW TransactionSummary AS
SELECT 
    t.*,
    a.Title as AuctionTitle,
    buyer.FullName as BuyerName,
    seller.FullName as SellerName,
    DATEDIFF(t.CompletedDate, t.CreatedDate) as DaysToComplete
FROM Transactions t
LEFT JOIN Auctions a ON t.AuctionId = a.Id
LEFT JOIN AspNetUsers buyer ON t.BuyerId = buyer.Id
LEFT JOIN AspNetUsers seller ON t.SellerId = seller.Id;

-- =============================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =============================================

DELIMITER //

-- Procedure to place a bid
CREATE PROCEDURE PlaceBid(
    IN p_AuctionId INT,
    IN p_UserId VARCHAR(255),
    IN p_Amount DECIMAL(18,2),
    IN p_IpAddress VARCHAR(45),
    IN p_UserAgent TEXT
)
BEGIN
    DECLARE current_highest DECIMAL(18,2) DEFAULT 0;
    DECLARE auction_end_date DATETIME(6);
    DECLARE auction_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Get current auction details
    SELECT CurrentPrice, EndDate, Status INTO current_highest, auction_end_date, auction_status
    FROM Auctions WHERE Id = p_AuctionId AND IsActive = TRUE;
    
    -- Validate bid
    IF auction_status != 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Auction is not active';
    END IF;
    
    IF p_Amount <= current_highest THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid amount must be higher than current price';
    END IF;
    
    IF NOW() >= auction_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Auction has ended';
    END IF;
    
    -- Mark previous winning bids as not winning
    UPDATE Bids SET IsWinning = FALSE WHERE AuctionId = p_AuctionId;
    
    -- Insert new bid
    INSERT INTO Bids (AuctionId, UserId, Amount, IsWinning, IpAddress, UserAgent)
    VALUES (p_AuctionId, p_UserId, p_Amount, TRUE, p_IpAddress, p_UserAgent);
    
    -- Update auction current price and bid count
    UPDATE Auctions 
    SET CurrentPrice = p_Amount, BidCount = BidCount + 1, ModifiedDate = NOW()
    WHERE Id = p_AuctionId;
    
    COMMIT;
END //

-- Procedure to end an auction
CREATE PROCEDURE EndAuction(IN p_AuctionId INT)
BEGIN
    DECLARE winning_bid_amount DECIMAL(18,2);
    DECLARE winning_user_id VARCHAR(255);
    DECLARE seller_id VARCHAR(255);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Get winning bid details
    SELECT b.Amount, b.UserId, a.SellerId 
    INTO winning_bid_amount, winning_user_id, seller_id
    FROM Bids b
    JOIN Auctions a ON b.AuctionId = a.Id
    WHERE b.AuctionId = p_AuctionId AND b.IsWinning = TRUE;
    
    -- Update auction status
    UPDATE Auctions 
    SET Status = CASE 
        WHEN winning_user_id IS NOT NULL THEN 'Sold'
        ELSE 'Ended'
    END,
    WinnerId = winning_user_id,
    ModifiedDate = NOW()
    WHERE Id = p_AuctionId;
    
    -- Create transaction record if there's a winner
    IF winning_user_id IS NOT NULL THEN
        INSERT INTO Transactions (
            TransactionId, AuctionId, BuyerId, SellerId, 
            WinningBidAmount, TotalAmount, Status
        ) VALUES (
            CONCAT('TXN_', p_AuctionId, '_', UNIX_TIMESTAMP()),
            p_AuctionId, winning_user_id, seller_id,
            winning_bid_amount, winning_bid_amount, 'Pending'
        );
    END IF;
    
    COMMIT;
END //

DELIMITER ;

-- =============================================
-- TRIGGERS FOR AUDIT LOGGING
-- =============================================

DELIMITER //

CREATE TRIGGER tr_auctions_audit_insert
AFTER INSERT ON Auctions
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, NewValues, Timestamp)
    VALUES ('INSERT', 'Auction', NEW.Id, JSON_OBJECT(
        'Title', NEW.Title,
        'StartingPrice', NEW.StartingPrice,
        'SellerId', NEW.SellerId,
        'Status', NEW.Status
    ), NOW());
END //

CREATE TRIGGER tr_auctions_audit_update
AFTER UPDATE ON Auctions
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, OldValues, NewValues, Timestamp)
    VALUES ('UPDATE', 'Auction', NEW.Id, 
        JSON_OBJECT('Status', OLD.Status, 'CurrentPrice', OLD.CurrentPrice),
        JSON_OBJECT('Status', NEW.Status, 'CurrentPrice', NEW.CurrentPrice),
        NOW());
END //

CREATE TRIGGER tr_bids_audit_insert
AFTER INSERT ON Bids
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (UserId, Action, EntityType, EntityId, NewValues, Timestamp)
    VALUES (NEW.UserId, 'INSERT', 'Bid', NEW.Id, JSON_OBJECT(
        'AuctionId', NEW.AuctionId,
        'Amount', NEW.Amount,
        'IsWinning', NEW.IsWinning
    ), NOW());
END //

DELIMITER ;

-- =============================================
-- INITIAL DATA VERIFICATION
-- =============================================

-- Verify the setup
SELECT 'Categories Created' as Status, COUNT(*) as Count FROM Categories
UNION ALL
SELECT 'System Settings Created', COUNT(*) FROM SystemSettings
UNION ALL
SELECT 'Roles Created', COUNT(*) FROM AspNetRoles;
