-- Auction Web Application Database Schema
-- MySQL Database Implementation
-- Created: September 5, 2025

CREATE DATABASE IF NOT EXISTS auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auction_web;

-- =============================================
-- USER MANAGEMENT TABLES (Identity Framework)
-- =============================================

-- AspNet Identity Users Table (extends IdentityUser)
CREATE TABLE AspNetUsers (
    Id VARCHAR(255) PRIMARY KEY,
    UserName VARCHAR(256) UNIQUE,
    NormalizedUserName VARCHAR(256) UNIQUE,
    Email VARCHAR(256) UNIQUE,
    NormalizedEmail VARCHAR(256),
    EmailConfirmed BOOLEAN DEFAULT FALSE,
    PasswordHash LONGTEXT,
    SecurityStamp LONGTEXT,
    ConcurrencyStamp LONGTEXT,
    PhoneNumber VARCHAR(20),
    PhoneNumberConfirmed BOOLEAN DEFAULT FALSE,
    TwoFactorEnabled BOOLEAN DEFAULT FALSE,
    LockoutEnd DATETIME(6),
    LockoutEnabled BOOLEAN DEFAULT TRUE,
    AccessFailedCount INT DEFAULT 0,
    
    -- Custom User Properties
    FullName VARCHAR(200) NOT NULL,
    ProfileImage VARCHAR(500),
    CreatedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    Rating DECIMAL(3,2) DEFAULT 0.00,
    TotalSales INT DEFAULT 0,
    Role ENUM('Buyer', 'Seller', 'Administrator') DEFAULT 'Buyer',
    IsActive BOOLEAN DEFAULT TRUE,
    Address TEXT,
    LastLoginDate DATETIME(6),
    
    INDEX IX_Users_UserName (NormalizedUserName),
    INDEX IX_Users_Email (NormalizedEmail),
    INDEX IX_Users_Role (Role),
    INDEX IX_Users_CreatedDate (CreatedDate)
);

-- AspNet Roles
CREATE TABLE AspNetRoles (
    Id VARCHAR(255) PRIMARY KEY,
    Name VARCHAR(256),
    NormalizedName VARCHAR(256) UNIQUE,
    ConcurrencyStamp LONGTEXT
);

-- AspNet User Roles
CREATE TABLE AspNetUserRoles (
    UserId VARCHAR(255),
    RoleId VARCHAR(255),
    PRIMARY KEY (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES AspNetRoles(Id) ON DELETE CASCADE
);

-- AspNet User Claims
CREATE TABLE AspNetUserClaims (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId VARCHAR(255) NOT NULL,
    ClaimType LONGTEXT,
    ClaimValue LONGTEXT,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    INDEX IX_UserClaims_UserId (UserId)
);

-- AspNet User Logins
CREATE TABLE AspNetUserLogins (
    LoginProvider VARCHAR(255),
    ProviderKey VARCHAR(255),
    ProviderDisplayName LONGTEXT,
    UserId VARCHAR(255) NOT NULL,
    PRIMARY KEY (LoginProvider, ProviderKey),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    INDEX IX_UserLogins_UserId (UserId)
);

-- AspNet User Tokens
CREATE TABLE AspNetUserTokens (
    UserId VARCHAR(255),
    LoginProvider VARCHAR(255),
    Name VARCHAR(255),
    Value LONGTEXT,
    PRIMARY KEY (UserId, LoginProvider, Name),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

-- AspNet Role Claims
CREATE TABLE AspNetRoleClaims (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    RoleId VARCHAR(255) NOT NULL,
    ClaimType LONGTEXT,
    ClaimValue LONGTEXT,
    FOREIGN KEY (RoleId) REFERENCES AspNetRoles(Id) ON DELETE CASCADE,
    INDEX IX_RoleClaims_RoleId (RoleId)
);

-- =============================================
-- AUCTION SYSTEM TABLES
-- =============================================

-- Categories Table
CREATE TABLE Categories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    ParentCategoryId INT,
    IsActive BOOLEAN DEFAULT TRUE,
    DisplayOrder INT DEFAULT 0,
    CreatedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (ParentCategoryId) REFERENCES Categories(Id) ON DELETE SET NULL,
    INDEX IX_Categories_ParentId (ParentCategoryId),
    INDEX IX_Categories_IsActive (IsActive)
);

-- Auctions Table
CREATE TABLE Auctions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    DetailedDescription TEXT,
    
    -- Pricing
    StartingPrice DECIMAL(18,2) NOT NULL,
    CurrentPrice DECIMAL(18,2) NOT NULL,
    BuyNowPrice DECIMAL(18,2),
    ReservePrice DECIMAL(18,2),
    BidIncrement DECIMAL(18,2),
    
    -- Timing
    StartDate DATETIME(6) NOT NULL,
    EndDate DATETIME(6) NOT NULL,
    CreatedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    ModifiedDate DATETIME(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Categories and Classification
    Category VARCHAR(100) NOT NULL,
    SubCategory VARCHAR(100),
    
    -- Item Details
    ItemCondition VARCHAR(50) NOT NULL,
    ConditionNotes TEXT,
    Brand VARCHAR(100),
    Model VARCHAR(100),
    Size VARCHAR(50),
    Color VARCHAR(50),
    Material VARCHAR(50),
    YearManufactured INT,
    CountryOfOrigin VARCHAR(100),
    
    -- Status and Type
    Status ENUM('Draft', 'Scheduled', 'Active', 'Ended', 'Cancelled', 'Sold') DEFAULT 'Draft',
    Type ENUM('Standard', 'Reserve', 'BuyItNow', 'DutchAuction') DEFAULT 'Standard',
    
    -- Flags
    IsActive BOOLEAN DEFAULT TRUE,
    IsFeatured BOOLEAN DEFAULT FALSE,
    IsVerified BOOLEAN DEFAULT FALSE,
    
    -- Counters
    ViewCount INT DEFAULT 0,
    BidCount INT DEFAULT 0,
    WatchlistCount INT DEFAULT 0,
    
    -- Users
    SellerId VARCHAR(255) NOT NULL,
    WinnerId VARCHAR(255),
    VerifiedBy VARCHAR(255),
    VerifiedDate DATETIME(6),
    
    -- Shipping
    ShippingCost DECIMAL(10,2),
    FreeShipping BOOLEAN DEFAULT FALSE,
    LocalPickupOnly BOOLEAN DEFAULT FALSE,
    ShippingNotes TEXT,
    ItemLocation VARCHAR(100),
    
    -- Auction Settings
    AutoExtend BOOLEAN DEFAULT FALSE,
    AutoExtendMinutes INT,
    RequirePreApproval BOOLEAN DEFAULT FALSE,
    MaxBids INT,
    
    -- Metadata
    Tags VARCHAR(500),
    ExternalReference VARCHAR(200),
    
    FOREIGN KEY (SellerId) REFERENCES AspNetUsers(Id) ON DELETE RESTRICT,
    FOREIGN KEY (WinnerId) REFERENCES AspNetUsers(Id) ON DELETE SET NULL,
    FOREIGN KEY (VerifiedBy) REFERENCES AspNetUsers(Id) ON DELETE SET NULL,
    
    INDEX IX_Auctions_SellerId (SellerId),
    INDEX IX_Auctions_Status (Status),
    INDEX IX_Auctions_Category (Category),
    INDEX IX_Auctions_EndDate (EndDate),
    INDEX IX_Auctions_StartDate (StartDate),
    INDEX IX_Auctions_IsFeatured (IsFeatured),
    INDEX IX_Auctions_CurrentPrice (CurrentPrice),
    FULLTEXT INDEX FT_Auctions_Search (Title, Description, Tags)
);

-- Auction Images Table
CREATE TABLE AuctionImages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    AuctionId INT NOT NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    FileName VARCHAR(255),
    AltText VARCHAR(255),
    Caption VARCHAR(500),
    IsPrimary BOOLEAN DEFAULT FALSE,
    DisplayOrder INT DEFAULT 0,
    Type ENUM('Primary', 'Gallery', 'Thumbnail', 'Detail', 'Certificate', 'Damage') DEFAULT 'Gallery',
    FileSize BIGINT,
    Width INT,
    Height INT,
    Format VARCHAR(10),
    ThumbnailUrl VARCHAR(500),
    MediumUrl VARCHAR(500),
    UploadedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    IsVerified BOOLEAN DEFAULT FALSE,
    UploadedBy VARCHAR(255),
    
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id) ON DELETE CASCADE,
    FOREIGN KEY (UploadedBy) REFERENCES AspNetUsers(Id) ON DELETE SET NULL,
    
    INDEX IX_AuctionImages_AuctionId (AuctionId),
    INDEX IX_AuctionImages_IsPrimary (IsPrimary),
    INDEX IX_AuctionImages_DisplayOrder (DisplayOrder)
);

-- Bids Table
CREATE TABLE Bids (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    AuctionId INT NOT NULL,
    UserId VARCHAR(255) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    BidDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    IsWinning BOOLEAN DEFAULT FALSE,
    IsAutoBid BOOLEAN DEFAULT FALSE,
    MaxAutoBidAmount DECIMAL(18,2),
    BidType ENUM('Manual', 'Automatic', 'BuyNow', 'Reserve') DEFAULT 'Manual',
    IpAddress VARCHAR(45),
    UserAgent TEXT,
    
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE RESTRICT,
    
    INDEX IX_Bids_AuctionId (AuctionId),
    INDEX IX_Bids_UserId (UserId),
    INDEX IX_Bids_BidDate (BidDate),
    INDEX IX_Bids_Amount (Amount),
    INDEX IX_Bids_IsWinning (IsWinning)
);

-- Watchlist Table
CREATE TABLE WatchlistItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId VARCHAR(255) NOT NULL,
    AuctionId INT NOT NULL,
    AddedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    NotificationsEnabled BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id) ON DELETE CASCADE,
    
    UNIQUE KEY UK_Watchlist_User_Auction (UserId, AuctionId),
    INDEX IX_WatchlistItems_UserId (UserId),
    INDEX IX_WatchlistItems_AuctionId (AuctionId)
);

-- =============================================
-- TRANSACTION AND PAYMENT TABLES
-- =============================================

-- Transactions Table
CREATE TABLE Transactions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TransactionId VARCHAR(100) UNIQUE NOT NULL,
    AuctionId INT NOT NULL,
    BuyerId VARCHAR(255) NOT NULL,
    SellerId VARCHAR(255) NOT NULL,
    
    -- Financial Details
    WinningBidAmount DECIMAL(18,2) NOT NULL,
    ShippingCost DECIMAL(10,2) DEFAULT 0.00,
    TaxAmount DECIMAL(10,2) DEFAULT 0.00,
    PlatformFee DECIMAL(10,2) DEFAULT 0.00,
    TotalAmount DECIMAL(18,2) NOT NULL,
    
    -- Status and Dates
    Status ENUM('Pending', 'PaymentPending', 'Paid', 'Shipped', 'Delivered', 'Completed', 'Disputed', 'Cancelled', 'Refunded') DEFAULT 'Pending',
    CreatedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CompletedDate DATETIME(6),
    
    -- Payment Information
    PaymentMethod ENUM('CreditCard', 'PayPal', 'BankTransfer', 'Cash', 'Other') DEFAULT 'CreditCard',
    PaymentReference VARCHAR(100),
    PaymentDate DATETIME(6),
    
    -- Shipping Information
    ShippingAddress TEXT,
    ShippingMethod VARCHAR(100),
    TrackingNumber VARCHAR(100),
    ShippedDate DATETIME(6),
    DeliveredDate DATETIME(6),
    
    -- Additional Information
    Notes TEXT,
    InternalNotes TEXT,
    
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id) ON DELETE RESTRICT,
    FOREIGN KEY (BuyerId) REFERENCES AspNetUsers(Id) ON DELETE RESTRICT,
    FOREIGN KEY (SellerId) REFERENCES AspNetUsers(Id) ON DELETE RESTRICT,
    
    INDEX IX_Transactions_AuctionId (AuctionId),
    INDEX IX_Transactions_BuyerId (BuyerId),
    INDEX IX_Transactions_SellerId (SellerId),
    INDEX IX_Transactions_Status (Status),
    INDEX IX_Transactions_CreatedDate (CreatedDate),
    INDEX IX_Transactions_TransactionId (TransactionId)
);

-- Payment Records Table
CREATE TABLE PaymentRecords (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TransactionId INT NOT NULL,
    PaymentReference VARCHAR(100) UNIQUE,
    PaymentMethod ENUM('CreditCard', 'PayPal', 'BankTransfer', 'Cash', 'Other') NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment Status
    Status ENUM('Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded') DEFAULT 'Pending',
    
    -- Payment Gateway Information
    GatewayTransactionId VARCHAR(100),
    GatewayResponse TEXT,
    GatewayFee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Dates
    CreatedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    ProcessedDate DATETIME(6),
    
    -- Additional Information
    FailureReason TEXT,
    RefundAmount DECIMAL(18,2) DEFAULT 0.00,
    RefundDate DATETIME(6),
    
    FOREIGN KEY (TransactionId) REFERENCES Transactions(Id) ON DELETE CASCADE,
    
    INDEX IX_PaymentRecords_TransactionId (TransactionId),
    INDEX IX_PaymentRecords_Status (Status),
    INDEX IX_PaymentRecords_PaymentReference (PaymentReference)
);

-- =============================================
-- COMMUNICATION AND MESSAGING
-- =============================================

-- Messages Table (for user-to-user communication)
CREATE TABLE Messages (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FromUserId VARCHAR(255) NOT NULL,
    ToUserId VARCHAR(255) NOT NULL,
    AuctionId INT,
    Subject VARCHAR(200),
    Content TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    SentDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    ReadDate DATETIME(6),
    MessageType ENUM('General', 'Question', 'Dispute', 'System') DEFAULT 'General',
    
    FOREIGN KEY (FromUserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (ToUserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id) ON DELETE SET NULL,
    
    INDEX IX_Messages_FromUserId (FromUserId),
    INDEX IX_Messages_ToUserId (ToUserId),
    INDEX IX_Messages_AuctionId (AuctionId),
    INDEX IX_Messages_SentDate (SentDate),
    INDEX IX_Messages_IsRead (IsRead)
);

-- =============================================
-- REVIEWS AND RATINGS
-- =============================================

-- User Reviews Table
CREATE TABLE UserReviews (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ReviewerId VARCHAR(255) NOT NULL,
    ReviewedUserId VARCHAR(255) NOT NULL,
    TransactionId INT,
    AuctionId INT,
    
    -- Review Details
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    Title VARCHAR(200),
    Content TEXT,
    ReviewType ENUM('Buyer', 'Seller') NOT NULL,
    
    -- Dates
    CreatedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    ModifiedDate DATETIME(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Status
    IsVisible BOOLEAN DEFAULT TRUE,
    IsVerified BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (ReviewerId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (ReviewedUserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (TransactionId) REFERENCES Transactions(Id) ON DELETE SET NULL,
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id) ON DELETE SET NULL,
    
    UNIQUE KEY UK_UserReviews_Transaction_Reviewer (TransactionId, ReviewerId),
    INDEX IX_UserReviews_ReviewedUserId (ReviewedUserId),
    INDEX IX_UserReviews_Rating (Rating),
    INDEX IX_UserReviews_CreatedDate (CreatedDate)
);

-- =============================================
-- AUDIT AND LOGGING
-- =============================================

-- Audit Log Table
CREATE TABLE AuditLogs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId VARCHAR(255),
    Action VARCHAR(100) NOT NULL,
    EntityType VARCHAR(100) NOT NULL,
    EntityId VARCHAR(100),
    OldValues JSON,
    NewValues JSON,
    IpAddress VARCHAR(45),
    UserAgent TEXT,
    Timestamp DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE SET NULL,
    
    INDEX IX_AuditLogs_UserId (UserId),
    INDEX IX_AuditLogs_EntityType (EntityType),
    INDEX IX_AuditLogs_Timestamp (Timestamp)
);

-- System Settings Table
CREATE TABLE SystemSettings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SettingKey VARCHAR(100) UNIQUE NOT NULL,
    SettingValue TEXT,
    Description TEXT,
    DataType ENUM('String', 'Integer', 'Decimal', 'Boolean', 'JSON') DEFAULT 'String',
    Category VARCHAR(50) DEFAULT 'General',
    IsSystem BOOLEAN DEFAULT FALSE,
    ModifiedDate DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    ModifiedBy VARCHAR(255),
    
    FOREIGN KEY (ModifiedBy) REFERENCES AspNetUsers(Id) ON DELETE SET NULL,
    
    INDEX IX_SystemSettings_Category (Category)
);
