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
    Title, Description, DetailedDescription, StartingPrice, CurrentPrice, BuyNowPrice, ReservePrice,
    StartDate, EndDate, Category, SubCategory, Condition, ConditionNotes,
    SellerId, Status, Type, IsActive, IsFeatured, Brand, Model, Color, Size,
    ShippingCost, FreeShipping, ItemLocation, BidIncrement, AutoExtend, AutoExtendMinutes, Tags
) VALUES

-- Electronics Category
('MacBook Pro 16" M3 Max - Space Black', 
 'Latest MacBook Pro with M3 Max chip, 36GB RAM, 1TB SSD. Perfect for professionals and creatives.',
 'This MacBook Pro features the revolutionary M3 Max chip with 14-core CPU and 30-core GPU. Includes original box, charger, and documentation. No scratches or dents. AppleCare+ included until 2026. Perfect for video editing, 3D rendering, and software development.',
 2299.99, 2299.99, 2899.99, 2500.00,
 DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 7 DAY),
 'Electronics', 'Laptops & Computers', 'Excellent', 'Like new, minimal usage',
 @AdminId, 'Scheduled', 'Reserve', TRUE, TRUE, 'Apple', 'MacBook Pro 16"', 'Space Black', '16-inch',
 0.00, TRUE, 'San Francisco, CA', 50.00, TRUE, 5, 'laptop,apple,macbook,m3,professional'),

('Sony PlayStation 5 Digital Edition Bundle',
 'PS5 Digital with extra controller, charging station, and 5 games including Spider-Man 2.',
 'Barely used PlayStation 5 Digital Edition purchased 3 months ago. Includes: Console, 2 DualSense controllers, charging station, headset, and games: Spider-Man 2, God of War Ragnarök, Horizon Forbidden West, Gran Turismo 7, and The Last of Us Part I. All original packaging included.',
 399.99, 399.99, 649.99, NULL,
 DATE_ADD(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 5 DAY),
 'Electronics', 'Gaming Consoles', 'Very Good', 'Excellent working condition, minor shelf wear',
 @AdminId, 'Scheduled', 'BuyItNow', TRUE, TRUE, 'Sony', 'PlayStation 5', 'White', 'Standard',
 25.00, FALSE, 'Los Angeles, CA', 25.00, TRUE, 5, 'ps5,playstation,gaming,console,bundle'),

('Vintage Canon AE-1 35mm Film Camera',
 'Classic 1970s film camera with 50mm lens. Perfect working condition, recently serviced.',
 'This iconic Canon AE-1 from 1978 is in exceptional condition. Recently professionally cleaned and calibrated. Includes original 50mm f/1.4 lens, camera bag, manual, and fresh battery. Light meter works perfectly. A few minor cosmetic marks consistent with age but fully functional.',
 149.99, 149.99, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 6 DAY),
 'Electronics', 'Cameras & Photography', 'Good', 'Vintage item, professionally serviced',
 @AdminId, 'Scheduled', 'Standard', TRUE, FALSE, 'Canon', 'AE-1', 'Black', 'Standard',
 15.00, FALSE, 'Portland, OR', 10.00, FALSE, 0, 'canon,vintage,film,camera,photography'),

-- Collectibles Category
('1952 Mickey Mantle Topps Rookie Card PSA 8',
 'Professionally graded Mickey Mantle rookie card in Near Mint condition. Investment grade collectible.',
 'This is the holy grail of baseball cards - the 1952 Topps Mickey Mantle rookie card #311. Professionally graded by PSA as Near Mint 8, which is exceptional for this card. Sharp corners, good centering, minimal wear. Certificate of authenticity included. This card has consistently appreciated in value and is considered one of the best sports investments.',
 15000.00, 15000.00, 22000.00, 18000.00,
 DATE_ADD(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 10 DAY),
 'Collectibles', 'Trading Cards', 'Excellent', 'PSA 8 graded, authenticated',
 @AdminId, 'Scheduled', 'Reserve', TRUE, TRUE, 'Topps', '1952 #311', 'Color', 'Standard',
 50.00, FALSE, 'New York, NY', 500.00, TRUE, 10, 'mantle,rookie,baseball,psa,investment'),

('Pokémon Charizard Base Set 1st Edition Shadowless',
 'Mint condition Charizard from original Base Set. Unplayed, pack fresh condition.',
 'The most iconic Pokémon card ever printed. This Charizard is from the 1998 Base Set 1st Edition Shadowless print run. Card has been stored in protective sleeve since opening. No scratches, edge wear, or whitening. Colors are vibrant. A true gem for any collector.',
 2499.99, 2499.99, 3500.00, NULL,
 DATE_ADD(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 8 DAY),
 'Collectibles', 'Trading Cards', 'Mint', 'Pack fresh, never played',
 @AdminId, 'Scheduled', 'BuyItNow', TRUE, TRUE, 'Wizards of the Coast', 'Base Set 4/102', 'Holo', 'Standard',
 20.00, FALSE, 'Seattle, WA', 100.00, TRUE, 5, 'pokemon,charizard,base set,mint,1st edition'),

('Star Wars Original Trilogy Action Figures - Complete Set',
 'Complete set of original Kenner Star Wars figures from 1977-1985. All with original accessories.',
 'Incredible complete collection of 96 original Kenner Star Wars action figures spanning A New Hope, Empire Strikes Back, and Return of the Jedi. All figures include original weapons and accessories where applicable. Condition ranges from Good to Excellent. Includes rare figures like Yak Face and Blue Snaggletooth. Display cases included.',
 1899.99, 1899.99, 2800.00, 2200.00,
 DATE_ADD(NOW(), INTERVAL 6 HOUR), DATE_ADD(NOW(), INTERVAL 9 DAY),
 'Collectibles', 'Vintage Toys', 'Very Good', 'Complete collection, various conditions',
 @AdminId, 'Scheduled', 'Reserve', TRUE, FALSE, 'Kenner', 'Original Trilogy', 'Various', 'Various',
 35.00, FALSE, 'Chicago, IL', 75.00, TRUE, 5, 'starwars,kenner,vintage,complete,collection'),

-- Fashion Category
('Hermès Birkin 35 Togo Leather Handbag',
 'Authentic Hermès Birkin in Étoupe Togo leather with palladium hardware. Pristine condition.',
 'This stunning Birkin 35 in Étoupe (taupe gray) Togo leather is a timeless classic. Purchased from Hermès boutique in Paris in 2022. Includes dustbag, box, ribbon, care booklet, and authenticity card. No scratches on hardware, leather is supple and unblemished. A true investment piece that holds its value exceptionally well.',
 8999.99, 8999.99, 12500.00, 10500.00,
 DATE_ADD(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 12 DAY),
 'Fashion', 'Handbags & Accessories', 'Excellent', 'Like new, stored in dust bag',
 @AdminId, 'Scheduled', 'Reserve', TRUE, TRUE, 'Hermès', 'Birkin 35', 'Étoupe', '35cm',
 0.00, TRUE, 'Beverly Hills, CA', 250.00, TRUE, 10, 'hermes,birkin,luxury,authentic,investment'),

('Vintage Levi\'s 501 Jeans - 1960s Big E',
 'Rare 1960s Levi\'s 501s with Big E red tab and single stitch construction. Size 32x32.',
 'These are authentic 1960s Levi\'s 501s featuring the coveted Big E red tab and single stitch back seam construction. Hidden rivets, no back pocket stitching, and original Levi\'s buttons. Some fading and wear consistent with age and use, but no holes or major damage. A true piece of American fashion history.',
 749.99, 749.99, NULL, NULL,
 DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY),
 'Fashion', 'Vintage Fashion', 'Good', 'Authentic vintage wear, no holes',
 @AdminId, 'Scheduled', 'Standard', TRUE, FALSE, 'Levi\'s', '501', 'Indigo', '32x32',
 12.00, FALSE, 'Austin, TX', 25.00, FALSE, 0, 'levis,vintage,big e,denim,collectible'),

-- Art & Antiques
('Original Oil Painting by Listed Artist - "Sunset Harbor"',
 'Beautiful seascape oil painting by renowned artist James Mitchell (1922-1998). Gallery framed.',
 'This stunning 24"x36" oil on canvas depicts a serene harbor at sunset. Painted by James Mitchell, whose works are held in several museum collections. The painting features his signature impressionistic style with masterful use of light and color. Recently restored and professionally framed. Includes certificate of authenticity and provenance documentation.',
 1299.99, 1299.99, 1899.00, NULL,
 DATE_ADD(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 14 DAY),
 'Art & Antiques', NULL, 'Excellent', 'Recently restored, museum quality',
 @AdminId, 'Scheduled', 'BuyItNow', TRUE, TRUE, NULL, NULL, 'Multi-color', '24"x36"',
 45.00, FALSE, 'Boston, MA', 50.00, TRUE, 5, 'painting,oil,seascape,listed artist,original'),

('Antique Victorian Mahogany Dining Table',
 '1880s Victorian dining table in solid mahogany. Seats 8-10 people. Excellent condition.',
 'Magnificent Victorian dining table from approximately 1880. Solid mahogany construction with beautiful grain patterns. Pedestal base with carved details. Table measures 8 feet long and can comfortably seat 8-10 people. Recently professionally refinished. Minor age-appropriate wear but structurally sound and stunning.',
 899.99, 899.99, 1400.00, NULL,
 DATE_ADD(NOW(), INTERVAL 12 HOUR), DATE_ADD(NOW(), INTERVAL 11 DAY),
 'Home & Garden', NULL, 'Very Good', 'Professionally refinished, minor age wear',
 @AdminId, 'Scheduled', 'BuyItNow', TRUE, FALSE, NULL, NULL, 'Mahogany', '8 feet',
 150.00, FALSE, 'Philadelphia, PA', 40.00, FALSE, 0, 'victorian,mahogany,dining,antique,furniture'),

-- Jewelry & Watches
('Rolex Submariner Date 116610LN - Box & Papers',
 'Authentic Rolex Submariner with ceramic bezel. Purchased new in 2019. Complete set.',
 'This classic Rolex Submariner Date ref. 116610LN features the iconic black dial and black Cerachrom bezel. 40mm stainless steel case, automatic movement with 48-hour power reserve. Purchased from authorized dealer in 2019. Includes original box, papers, warranty card, and all links. Excellent condition with minimal wear.',
 7899.99, 7899.99, 9200.00, 8500.00,
 DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY),
 'Jewelry & Watches', NULL, 'Excellent', 'Minimal wear, complete set',
 @AdminId, 'Scheduled', 'Reserve', TRUE, TRUE, 'Rolex', 'Submariner 116610LN', 'Black', '40mm',
 0.00, TRUE, 'Miami, FL', 200.00, TRUE, 10, 'rolex,submariner,luxury,watch,authentic'),

-- Automotive
('1969 Ford Mustang Mach 1 - Numbers Matching',
 'Restored 1969 Mustang Mach 1 with 428 Cobra Jet engine. Numbers matching, show quality.',
 'Frame-off restoration completed in 2020. Original 428 Cobra Jet V8 engine with numbers matching transmission. New interior, paint, chrome, and weather stripping. Shaker hood scoop, Magnum 500 wheels. Runs and drives excellent. Extensive documentation of restoration process. Ready for car shows or weekend cruising.',
 45000.00, 45000.00, 65000.00, 52000.00,
 DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY),
 'Automotive', NULL, 'Excellent', 'Frame-off restoration, show quality',
 @AdminId, 'Scheduled', 'Reserve', TRUE, TRUE, 'Ford', 'Mustang Mach 1', 'Grabber Blue', 'Standard',
 500.00, FALSE, 'Detroit, MI', 1000.00, TRUE, 15, 'mustang,mach 1,cobra jet,restored,classic'),

-- Books & Media
('Harry Potter First Edition Book Set - Complete Series',
 'Complete first edition Harry Potter series including Philosopher\'s Stone first print.',
 'Extremely rare complete set of Harry Potter first editions including the coveted first print of Philosopher\'s Stone with the "1 wand" error on page 53. All books are first UK editions published by Bloomsbury. Dust jackets present on all books in very good condition. Books 1-3 show minimal shelf wear, later books are near fine.',
 12500.00, 12500.00, 18000.00, 15000.00,
 DATE_ADD(NOW(), INTERVAL 10 HOUR), DATE_ADD(NOW(), INTERVAL 16 DAY),
 'Books & Media', NULL, 'Very Good', 'First editions, dust jackets present',
 @AdminId, 'Scheduled', 'Reserve', TRUE, TRUE, 'Bloomsbury', 'Harry Potter Series', 'Various', 'Standard',
 25.00, FALSE, 'London, UK', 300.00, TRUE, 10, 'harry potter,first edition,bloomsbury,complete,rare'),

-- Sports & Recreation
('Tiger Woods Signed 2019 Masters Flag - PSA/DNA Authenticated',
 'Official Augusta National pin flag signed by Tiger Woods after his 2019 Masters victory.',
 'This official Augusta National pin flag was signed by Tiger Woods following his historic 2019 Masters Tournament victory - his first major championship in 11 years. The signature is authenticated by PSA/DNA with matching hologram and certificate. Flag is in pristine condition and professionally framed with UV-protective glass.',
 1299.99, 1299.99, 1899.00, NULL,
 DATE_ADD(NOW(), INTERVAL 14 HOUR), DATE_ADD(NOW(), INTERVAL 13 DAY),
 'Sports & Recreation', NULL, 'Excellent', 'PSA/DNA authenticated, professionally framed',
 @AdminId, 'Scheduled', 'BuyItNow', TRUE, FALSE, NULL, NULL, 'Green/White', 'Standard',
 30.00, FALSE, 'Augusta, GA', 50.00, TRUE, 5, 'tiger woods,masters,signed,authenticated,golf'),

-- Industrial & Business
('Commercial Espresso Machine - La Marzocco Linea PB',
 'Professional 2-group espresso machine. Excellent condition, regularly serviced.',
 'La Marzocco Linea PB 2-group commercial espresso machine used in upscale café for 2 years. Dual boilers, PID temperature control, pre-infusion system. Recently serviced with new seals and calibration. Produces consistently excellent espresso. Perfect for serious coffee shop or high-end restaurant.',
 4999.99, 4999.99, 7200.00, NULL,
 DATE_ADD(NOW(), INTERVAL 18 HOUR), DATE_ADD(NOW(), INTERVAL 17 DAY),
 'Industrial & Business', NULL, 'Very Good', 'Recently serviced, café used',
 @AdminId, 'Scheduled', 'BuyItNow', TRUE, FALSE, 'La Marzocco', 'Linea PB', 'Stainless Steel', '2-Group',
 200.00, FALSE, 'San Francisco, CA', 150.00, FALSE, 0, 'espresso,commercial,la marzocco,café,professional');

-- Add some sample auction images
INSERT INTO AuctionImages (AuctionId, ImageUrl, IsPrimary, DisplayOrder, Caption, UploadedBy, UploadedDate) 
SELECT Id, 
       CASE 
           WHEN Title LIKE '%MacBook%' THEN 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'
           WHEN Title LIKE '%PlayStation%' THEN 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'
           WHEN Title LIKE '%Canon%' THEN 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
           WHEN Title LIKE '%Mantle%' THEN 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
           WHEN Title LIKE '%Charizard%' THEN 'https://images.unsplash.com/photo-1613963761787-fbc2135e5b3b?w=800'
           WHEN Title LIKE '%Hermès%' THEN 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'
           WHEN Title LIKE '%Rolex%' THEN 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd6eaf?w=800'
           WHEN Title LIKE '%Mustang%' THEN 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800'
           ELSE 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'
       END,
       TRUE, 1, 'Primary product image', @AdminId, CURRENT_TIMESTAMP(6)
FROM Auctions 
WHERE SellerId = @AdminId;

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
