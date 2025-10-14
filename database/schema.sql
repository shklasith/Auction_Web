-- Auction Web Database Schema
-- MySQL 8.0+
-- Character Set: utf8mb4

-- Create database
CREATE DATABASE IF NOT EXISTS auction_web 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE auction_web;

-- Note: The actual tables are created by Entity Framework Core migrations.
-- This file serves as a reference for manual setup if needed.

-- To apply the schema using Entity Framework migrations, run:
-- dotnet ef database update

-- Database will contain the following tables:
-- 1. AspNetUsers - User accounts (ASP.NET Identity)
-- 2. AspNetRoles - User roles
-- 3. AspNetUserRoles - User-Role relationships
-- 4. AspNetUserClaims - User claims
-- 5. AspNetUserLogins - External login providers
-- 6. AspNetRoleClaims - Role claims
-- 7. AspNetUserTokens - Authentication tokens
-- 8. Auctions - Auction listings
-- 9. AuctionImages - Images for auctions
-- 10. AuctionViews - Auction view tracking
-- 11. Bids - Bid records
-- 12. Categories - Product categories
-- 13. PaymentRecords - Payment transactions
-- 14. Transactions - Transaction history
-- 15. WatchlistItems - User watchlists

-- Sample query to verify tables after migration:
-- SHOW TABLES;

-- Sample query to check table structures:
-- DESCRIBE AspNetUsers;
-- DESCRIBE Auctions;
-- DESCRIBE Bids;

