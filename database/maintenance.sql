-- Database Maintenance and Management Scripts
-- MySQL Database Maintenance
-- Created: September 5, 2025

USE auction_web;

-- =============================================
-- DATABASE BACKUP PROCEDURES
-- =============================================

DELIMITER //

-- Procedure to backup user data
CREATE PROCEDURE BackupUserData()
BEGIN
    -- Create backup tables with timestamp
    SET @backup_suffix = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');
    
    SET @sql = CONCAT('CREATE TABLE backup_users_', @backup_suffix, ' AS SELECT * FROM AspNetUsers');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE backup_auctions_', @backup_suffix, ' AS SELECT * FROM Auctions');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE backup_bids_', @backup_suffix, ' AS SELECT * FROM Bids');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE backup_transactions_', @backup_suffix, ' AS SELECT * FROM Transactions');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Backup completed with suffix: ', @backup_suffix) AS BackupStatus;
END //

-- Procedure to clean old backup tables (older than 30 days)
CREATE PROCEDURE CleanOldBackups()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE backup_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'auction_web' 
        AND TABLE_NAME LIKE 'backup_%'
        AND CREATE_TIME < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN backup_cursor;
    read_loop: LOOP
        FETCH backup_cursor INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('DROP TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('Dropped old backup table: ', table_name) AS CleanupStatus;
    END LOOP;
    CLOSE backup_cursor;
END //

DELIMITER ;

-- =============================================
-- DATA ARCHIVAL PROCEDURES
-- =============================================

DELIMITER //

-- Archive completed transactions older than 1 year
CREATE PROCEDURE ArchiveOldTransactions()
BEGIN
    DECLARE archive_count INT DEFAULT 0;
    
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS archived_transactions LIKE Transactions;
    
    -- Move old completed transactions to archive
    INSERT INTO archived_transactions 
    SELECT * FROM Transactions 
    WHERE Status IN ('Completed', 'Cancelled', 'Refunded') 
    AND CreatedDate < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    GET DIAGNOSTICS archive_count = ROW_COUNT;
    
    -- Delete archived transactions from main table
    DELETE FROM Transactions 
    WHERE Status IN ('Completed', 'Cancelled', 'Refunded') 
    AND CreatedDate < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    SELECT CONCAT('Archived ', archive_count, ' old transactions') AS ArchiveStatus;
END //

-- Archive old audit logs (older than 6 months)
CREATE PROCEDURE ArchiveOldAuditLogs()
BEGIN
    DECLARE archive_count INT DEFAULT 0;
    
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS archived_audit_logs LIKE AuditLogs;
    
    -- Move old audit logs to archive
    INSERT INTO archived_audit_logs 
    SELECT * FROM AuditLogs 
    WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    GET DIAGNOSTICS archive_count = ROW_COUNT;
    
    -- Delete archived logs from main table
    DELETE FROM AuditLogs 
    WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    SELECT CONCAT('Archived ', archive_count, ' old audit log entries') AS ArchiveStatus;
END //

DELIMITER ;

-- =============================================
-- PERFORMANCE MONITORING PROCEDURES
-- =============================================

DELIMITER //

-- Get database performance statistics
CREATE PROCEDURE GetDatabaseStats()
BEGIN
    SELECT 
        'Total Users' AS Metric,
        COUNT(*) AS Value
    FROM AspNetUsers
    WHERE IsActive = TRUE
    
    UNION ALL
    
    SELECT 
        'Active Auctions',
        COUNT(*)
    FROM Auctions
    WHERE Status = 'Active'
    
    UNION ALL
    
    SELECT 
        'Total Bids Today',
        COUNT(*)
    FROM Bids
    WHERE DATE(BidDate) = CURDATE()
    
    UNION ALL
    
    SELECT 
        'Pending Transactions',
        COUNT(*)
    FROM Transactions
    WHERE Status IN ('Pending', 'PaymentPending')
    
    UNION ALL
    
    SELECT 
        'Database Size (MB)',
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2)
    FROM information_schema.tables
    WHERE table_schema = 'auction_web';
END //

-- Get slow query candidates
CREATE PROCEDURE GetSlowQueryCandidates()
BEGIN
    SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
        ROUND((data_length / (data_length + index_length)) * 100, 2) AS data_ratio
    FROM information_schema.tables
    WHERE table_schema = 'auction_web'
    AND table_rows > 1000
    ORDER BY size_mb DESC;
END //

DELIMITER ;

-- =============================================
-- DATA INTEGRITY CHECKS
-- =============================================

DELIMITER //

-- Check for data integrity issues
CREATE PROCEDURE CheckDataIntegrity()
BEGIN
    -- Check for orphaned bids
    SELECT 'Orphaned Bids' AS Issue, COUNT(*) AS Count
    FROM Bids b
    LEFT JOIN Auctions a ON b.AuctionId = a.Id
    WHERE a.Id IS NULL
    
    UNION ALL
    
    -- Check for auctions without sellers
    SELECT 'Auctions without Sellers', COUNT(*)
    FROM Auctions a
    LEFT JOIN AspNetUsers u ON a.SellerId = u.Id
    WHERE u.Id IS NULL
    
    UNION ALL
    
    -- Check for transactions without auctions
    SELECT 'Transactions without Auctions', COUNT(*)
    FROM Transactions t
    LEFT JOIN Auctions a ON t.AuctionId = a.Id
    WHERE a.Id IS NULL
    
    UNION ALL
    
    -- Check for duplicate winning bids
    SELECT 'Multiple Winning Bids per Auction', COUNT(*)
    FROM (
        SELECT AuctionId, COUNT(*) as winning_count
        FROM Bids
        WHERE IsWinning = TRUE
        GROUP BY AuctionId
        HAVING COUNT(*) > 1
    ) AS duplicate_winners
    
    UNION ALL
    
    -- Check for auctions with end date before start date
    SELECT 'Invalid Auction Dates', COUNT(*)
    FROM Auctions
    WHERE EndDate <= StartDate;
END //

-- Fix common data integrity issues
CREATE PROCEDURE FixDataIntegrityIssues()
BEGIN
    DECLARE fix_count INT DEFAULT 0;
    
    -- Remove orphaned bids
    DELETE b FROM Bids b
    LEFT JOIN Auctions a ON b.AuctionId = a.Id
    WHERE a.Id IS NULL;
    
    GET DIAGNOSTICS fix_count = ROW_COUNT;
    SELECT CONCAT('Removed ', fix_count, ' orphaned bids') AS FixStatus;
    
    -- Remove orphaned watchlist items
    DELETE w FROM WatchlistItems w
    LEFT JOIN Auctions a ON w.AuctionId = a.Id
    WHERE a.Id IS NULL;
    
    GET DIAGNOSTICS fix_count = ROW_COUNT;
    SELECT CONCAT('Removed ', fix_count, ' orphaned watchlist items') AS FixStatus;
    
    -- Fix duplicate winning bids (keep the highest bid as winning)
    UPDATE Bids b1
    SET IsWinning = FALSE
    WHERE IsWinning = TRUE
    AND EXISTS (
        SELECT 1 FROM Bids b2 
        WHERE b2.AuctionId = b1.AuctionId 
        AND b2.Amount > b1.Amount 
        AND b2.IsWinning = TRUE
    );
    
    GET DIAGNOSTICS fix_count = ROW_COUNT;
    SELECT CONCAT('Fixed ', fix_count, ' duplicate winning bids') AS FixStatus;
END //

DELIMITER ;

-- =============================================
-- AUTOMATED MAINTENANCE EVENTS
-- =============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Daily maintenance event
CREATE EVENT IF NOT EXISTS daily_maintenance
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE + INTERVAL 1 DAY, '02:00:00')
DO
BEGIN
    -- Update auction statuses
    UPDATE Auctions 
    SET Status = 'Ended', ModifiedDate = NOW()
    WHERE Status = 'Active' 
    AND EndDate <= NOW();
    
    -- Archive old audit logs weekly (runs on Sunday)
    IF DAYOFWEEK(NOW()) = 1 THEN
        CALL ArchiveOldAuditLogs();
    END IF;
    
    -- Clean old backup tables monthly (runs on 1st of month)
    IF DAY(NOW()) = 1 THEN
        CALL CleanOldBackups();
    END IF;
    
    -- Log maintenance completion
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Timestamp)
    VALUES ('MAINTENANCE', 'System', 'daily_cleanup', NOW());
END;

-- Weekly backup event
CREATE EVENT IF NOT EXISTS weekly_backup
ON SCHEDULE EVERY 1 WEEK
STARTS TIMESTAMP(CURRENT_DATE + INTERVAL (7 - DAYOFWEEK(CURRENT_DATE)) DAY, '01:00:00')
DO
BEGIN
    CALL BackupUserData();
    
    -- Log backup completion
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Timestamp)
    VALUES ('BACKUP', 'System', 'weekly_backup', NOW());
END;

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

DELIMITER //

-- Function to calculate user rating
CREATE FUNCTION CalculateUserRating(user_id VARCHAR(255))
RETURNS DECIMAL(3,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE avg_rating DECIMAL(3,2) DEFAULT 0.00;
    
    SELECT COALESCE(AVG(Rating), 0.00) INTO avg_rating
    FROM UserReviews
    WHERE ReviewedUserId = user_id
    AND IsVisible = TRUE;
    
    RETURN avg_rating;
END //

-- Function to get auction time remaining
CREATE FUNCTION GetTimeRemaining(auction_id INT)
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE time_diff INT;
    DECLARE result VARCHAR(100);
    DECLARE end_date DATETIME(6);
    
    SELECT EndDate INTO end_date
    FROM Auctions
    WHERE Id = auction_id;
    
    SET time_diff = TIMESTAMPDIFF(SECOND, NOW(), end_date);
    
    IF time_diff <= 0 THEN
        SET result = 'Ended';
    ELSEIF time_diff < 3600 THEN
        SET result = CONCAT(FLOOR(time_diff / 60), 'm ', (time_diff % 60), 's');
    ELSEIF time_diff < 86400 THEN
        SET result = CONCAT(FLOOR(time_diff / 3600), 'h ', FLOOR((time_diff % 3600) / 60), 'm');
    ELSE
        SET result = CONCAT(FLOOR(time_diff / 86400), 'd ', FLOOR((time_diff % 86400) / 3600), 'h');
    END IF;
    
    RETURN result;
END //

DELIMITER ;

-- =============================================
-- SECURITY PROCEDURES
-- =============================================

DELIMITER //

-- Create database users with appropriate privileges
CREATE PROCEDURE CreateDatabaseUsers()
BEGIN
    -- Application user (read/write access to application tables)
    CREATE USER IF NOT EXISTS 'auction_app'@'%' IDENTIFIED BY 'SecurePassword123!';
    
    GRANT SELECT, INSERT, UPDATE, DELETE ON auction_web.* TO 'auction_app'@'%';
    GRANT EXECUTE ON PROCEDURE auction_web.PlaceBid TO 'auction_app'@'%';
    GRANT EXECUTE ON PROCEDURE auction_web.EndAuction TO 'auction_app'@'%';
    
    -- Read-only user for reporting
    CREATE USER IF NOT EXISTS 'auction_readonly'@'%' IDENTIFIED BY 'ReadOnlyPassword123!';
    
    GRANT SELECT ON auction_web.* TO 'auction_readonly'@'%';
    GRANT EXECUTE ON PROCEDURE auction_web.GetDatabaseStats TO 'auction_readonly'@'%';
    
    -- Backup user
    CREATE USER IF NOT EXISTS 'auction_backup'@'localhost' IDENTIFIED BY 'BackupPassword123!';
    
    GRANT SELECT, LOCK TABLES ON auction_web.* TO 'auction_backup'@'localhost';
    GRANT EXECUTE ON PROCEDURE auction_web.BackupUserData TO 'auction_backup'@'localhost';
    
    FLUSH PRIVILEGES;
    
    SELECT 'Database users created successfully' AS Status;
END //

DELIMITER ;

-- =============================================
-- PERFORMANCE OPTIMIZATION
-- =============================================

-- Analyze tables for optimization
ANALYZE TABLE AspNetUsers, Auctions, Bids, Transactions, AuctionImages, WatchlistItems;

-- Optimize tables
OPTIMIZE TABLE AspNetUsers, Auctions, Bids, Transactions, AuctionImages, WatchlistItems;

-- =============================================
-- FINAL VERIFICATION
-- =============================================

-- Verify all procedures and functions are created
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE,
    CREATED
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'auction_web'
ORDER BY ROUTINE_TYPE, ROUTINE_NAME;

-- Verify all events are created
SELECT 
    EVENT_NAME,
    STATUS,
    EVENT_DEFINITION
FROM information_schema.EVENTS
WHERE EVENT_SCHEMA = 'auction_web';

-- Display final database summary
SELECT 
    'Database Setup Complete' AS Status,
    COUNT(DISTINCT TABLE_NAME) AS Tables,
    (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'auction_web') AS Procedures_Functions,
    (SELECT COUNT(*) FROM information_schema.EVENTS WHERE EVENT_SCHEMA = 'auction_web') AS Events
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'auction_web';
