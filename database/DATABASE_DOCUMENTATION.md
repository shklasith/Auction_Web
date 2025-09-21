# Auction Web Database Documentation

## Overview
This document describes the complete MySQL database design for the Auction Web application, including schema design, implementation, and management procedures.

## Database Architecture

### Core Design Principles
- **Relational Integrity**: Full foreign key constraints to maintain data consistency
- **Scalability**: Optimized indexes and partitioning-ready design
- **Security**: Role-based access control and audit logging
- **Performance**: Strategic indexing and query optimization
- **Maintainability**: Automated cleanup and archival procedures

## Database Schema

### User Management Tables
The system uses ASP.NET Core Identity framework for user management:

#### AspNetUsers (Extended)
- **Purpose**: Core user information with custom auction-specific fields
- **Key Fields**: 
  - `Id` (Primary Key)
  - `FullName`, `Email`, `UserName`
  - `Rating`, `TotalSales`, `Role`
  - `IsActive`, `CreatedDate`, `LastLoginDate`
- **Relationships**: One-to-many with Auctions, Bids, WatchlistItems

#### Identity Tables
- `AspNetRoles`: User roles (Administrator, Seller, Buyer, Moderator)
- `AspNetUserRoles`: User-role assignments
- `AspNetUserClaims`: Additional user claims
- `AspNetUserLogins`: External login providers
- `AspNetUserTokens`: Security tokens

### Auction System Tables

#### Categories
- **Purpose**: Hierarchical categorization of auction items
- **Features**: 
  - Parent-child relationships for subcategories
  - Display ordering and active/inactive status
  - Supports unlimited nesting levels

#### Auctions
- **Purpose**: Core auction information
- **Key Features**:
  - Comprehensive pricing (starting, current, reserve, buy-now)
  - Detailed item specifications (brand, model, condition, etc.)
  - Shipping and handling information
  - Auction settings (auto-extend, bid increments)
  - Status tracking throughout auction lifecycle
  - Full-text search capabilities

#### AuctionImages
- **Purpose**: Image management for auctions
- **Features**:
  - Multiple image types (primary, gallery, thumbnail, detail)
  - Image metadata (dimensions, file size, format)
  - Display ordering and verification status
  - Responsive image URLs (thumbnail, medium, full)

#### Bids
- **Purpose**: Bid tracking and history
- **Features**:
  - Real-time bid validation
  - Winning bid tracking
  - Auto-bidding support
  - IP address and user agent logging for security

#### WatchlistItems
- **Purpose**: User watchlist functionality
- **Features**:
  - User-auction tracking
  - Notification preferences
  - Unique constraints to prevent duplicates

### Transaction Management

#### Transactions
- **Purpose**: Complete transaction lifecycle management
- **Features**:
  - Financial breakdown (bid amount, shipping, taxes, fees)
  - Status tracking from pending to completed
  - Payment method tracking
  - Shipping information and tracking
  - Internal notes for customer service

#### PaymentRecords
- **Purpose**: Detailed payment processing records
- **Features**:
  - Multiple payment methods support
  - Gateway integration tracking
  - Fee calculation and management
  - Refund tracking

### Communication System

#### Messages
- **Purpose**: User-to-user messaging system
- **Features**:
  - Auction-specific messaging
  - Message types (general, questions, disputes)
  - Read/unread status tracking
  - System message support

#### UserReviews
- **Purpose**: Feedback and rating system
- **Features**:
  - Buyer and seller reviews
  - 5-star rating system
  - Transaction-linked reviews
  - Visibility controls and verification

### Audit and Monitoring

#### AuditLogs
- **Purpose**: Complete system audit trail
- **Features**:
  - JSON-based old/new value tracking
  - User action logging
  - IP address and user agent tracking
  - Automated trigger-based logging

#### SystemSettings
- **Purpose**: Configurable system parameters
- **Features**:
  - Typed configuration values
  - Category-based organization
  - Change tracking with user attribution
  - System vs. user-configurable settings

## Performance Optimization

### Indexing Strategy
1. **Primary Indexes**: All tables have optimized primary keys
2. **Foreign Key Indexes**: All foreign keys are indexed
3. **Query-Specific Indexes**: Composite indexes for common query patterns
4. **Full-Text Indexes**: Search optimization for auctions

### Key Performance Indexes
```sql
-- Most critical performance indexes
INDEX IX_Auctions_Status_EndDate (Status, EndDate)
INDEX IX_Auctions_Category_Status (Category, Status)
INDEX IX_Bids_AuctionId_Amount (AuctionId, Amount DESC)
INDEX IX_Auctions_Featured_Active (IsFeatured, IsActive, Status)
FULLTEXT INDEX FT_Auctions_Search (Title, Description, Tags)
```

### Database Views
1. **ActiveAuctions**: Pre-joined view of active auctions with seller info
2. **UserStatistics**: Aggregated user performance metrics
3. **TransactionSummary**: Complete transaction overview with participant details

## Stored Procedures

### Core Business Logic
1. **PlaceBid()**: Atomic bid placement with validation
2. **EndAuction()**: Auction completion and transaction creation
3. **CalculateUserRating()**: Real-time rating calculation
4. **GetTimeRemaining()**: Auction countdown calculation

### Maintenance Procedures
1. **BackupUserData()**: Automated backup creation
2. **ArchiveOldTransactions()**: Data archival for performance
3. **CheckDataIntegrity()**: Data consistency validation
4. **FixDataIntegrityIssues()**: Automated data cleanup

### Monitoring Procedures
1. **GetDatabaseStats()**: Performance metrics
2. **GetSlowQueryCandidates()**: Performance analysis

## Automated Maintenance

### Daily Maintenance Event
- Updates expired auction statuses
- Performs weekly audit log archival
- Monthly backup cleanup
- Logs all maintenance activities

### Weekly Backup Event
- Creates comprehensive data backups
- Maintains backup rotation
- Logs backup completion

## Security Implementation

### Database Users
1. **auction_app**: Application user with read/write access
2. **auction_readonly**: Reporting user with read-only access
3. **auction_backup**: Backup user with minimal required privileges

### Security Features
- Password policies enforced at application level
- Audit logging for all critical operations
- IP address tracking for bids and transactions
- Data encryption support for sensitive fields

## Data Archival Strategy

### Automatic Archival
- **Transactions**: Completed transactions older than 1 year
- **Audit Logs**: Entries older than 6 months
- **Backup Tables**: Backup tables older than 30 days

### Archive Tables
- `archived_transactions`: Long-term transaction storage
- `archived_audit_logs`: Historical audit trail
- `backup_*`: Timestamped backup tables

## Installation and Setup

### Prerequisites
- MySQL 8.0 or higher
- Sufficient storage space (minimum 10GB recommended)
- Appropriate user privileges for database creation

### Setup Process
1. Run `schema.sql` to create database structure
2. Run `seed_data.sql` to populate initial data
3. Run `maintenance.sql` to set up procedures and events
4. Configure application connection strings
5. Run database migrations from the application

### Connection String Example
```
Server=localhost;Database=auction_web;Uid=auction_app;Pwd=SecurePassword123!;
```

## Monitoring and Maintenance

### Regular Monitoring
- Database size and growth trends
- Query performance metrics
- Index utilization statistics
- Transaction volume and patterns

### Maintenance Schedule
- **Daily**: Automatic status updates and cleanup
- **Weekly**: Data backups and integrity checks
- **Monthly**: Performance optimization and archival
- **Quarterly**: Full database analysis and tuning

## Backup and Recovery

### Backup Strategy
- **Automated**: Weekly full backups via scheduled events
- **Manual**: On-demand backups before major changes
- **Point-in-time**: Binary log retention for recovery

### Recovery Procedures
1. Stop application services
2. Restore from most recent backup
3. Apply binary logs for point-in-time recovery
4. Verify data integrity
5. Restart application services

## Performance Tuning

### Query Optimization
- Use of prepared statements
- Proper index utilization
- Query plan analysis
- Connection pooling

### Database Configuration
```sql
-- Recommended MySQL settings for auction system
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
max_connections = 200
query_cache_size = 128M
tmp_table_size = 64M
max_heap_table_size = 64M
```

## Troubleshooting

### Common Issues
1. **Slow Queries**: Check index usage and query plans
2. **Deadlocks**: Review transaction isolation levels
3. **Connection Limits**: Monitor and adjust max_connections
4. **Disk Space**: Implement archival procedures

### Diagnostic Procedures
- Run `CheckDataIntegrity()` for data issues
- Use `GetDatabaseStats()` for performance metrics
- Monitor slow query log for optimization opportunities

## Future Enhancements

### Planned Features
1. **Sharding**: Horizontal partitioning for large datasets
2. **Read Replicas**: Separate read and write operations
3. **Caching**: Redis integration for frequently accessed data
4. **Analytics**: Data warehouse integration for reporting

### Scalability Considerations
- Table partitioning by date ranges
- Archive database for historical data
- CDN integration for image storage
- Microservices data separation
