# MySQL Database Documentation

Complete documentation for setting up and managing the MySQL database for the Auction Web Application.

## 📚 Documentation Files

1. **[MYSQL_DATABASE_SETUP.md](MYSQL_DATABASE_SETUP.md)** - Complete setup guide with detailed instructions
2. **[QUICKSTART_DATABASE.md](QUICKSTART_DATABASE.md)** - Quick 3-step setup reference
3. **[database/schema.sql](database/schema.sql)** - Database schema reference

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
./setup_mysql.sh
```

This interactive script will guide you through the entire setup process.

### Option 2: Manual Setup

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auctionuser'@'localhost' IDENTIFIED BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON auction_web.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 2. Update configuration
# Edit Auction_Web/appsettings.json with your connection string

# 3. Apply migrations
cd Auction_Web
dotnet ef database update
```

## 📋 Database Information

### Database Name
- **Production**: `auction_web`
- **Development**: `auction_web_dev`

### Character Set
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

### Minimum MySQL Version
- **MySQL**: 8.0 or higher
- **MariaDB**: 10.5 or higher (compatible)

## 🗄️ Database Schema

The database schema is managed by Entity Framework Core migrations. The following tables are created:

### Identity & Authentication
- `AspNetUsers` - User accounts
- `AspNetRoles` - User roles (Admin, Buyer, Seller)
- `AspNetUserRoles` - User-role relationships
- `AspNetUserClaims` - Additional user claims
- `AspNetUserLogins` - External authentication providers
- `AspNetRoleClaims` - Role-based claims
- `AspNetUserTokens` - Authentication tokens

### Core Application Tables
- `Auctions` - Auction listings
- `AuctionImages` - Auction photos
- `Bids` - Bid records
- `Categories` - Product categories
- `AuctionViews` - View tracking
- `WatchlistItems` - User watchlists
- `PaymentRecords` - Payment transactions
- `Transactions` - Transaction history

## 🔧 Configuration

### Connection String Format

```
Server=<hostname>;Database=<database>;User=<username>;Password=<password>;SslMode=<mode>;
```

### Example Configurations

**Local Development:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=None;"
  }
}
```

**Production with SSL:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-db.example.com;Database=auction_web;User=auctionuser;Password=SecurePassword;SslMode=Required;"
  }
}
```

**Using Environment Variables:**
```bash
export ConnectionStrings__DefaultConnection="Server=localhost;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=None;"
```

## 🛠️ Management Commands

### Entity Framework Commands

```bash
# Install EF Core tools
dotnet tool install --global dotnet-ef

# Apply migrations
dotnet ef database update

# Create new migration
dotnet ef migrations add MigrationName

# Remove last migration
dotnet ef migrations remove

# List all migrations
dotnet ef migrations list

# Drop database
dotnet ef database drop

# Generate SQL script
dotnet ef migrations script
```

### MySQL Commands

```bash
# Connect to database
mysql -u auctionuser -p auction_web

# Show tables
mysql -u auctionuser -p auction_web -e "SHOW TABLES;"

# Backup database
mysqldump -u auctionuser -p auction_web > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u auctionuser -p auction_web < backup.sql

# Check database size
mysql -u auctionuser -p auction_web -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema='auction_web' GROUP BY table_schema;"
```

## 🔒 Security Best Practices

1. **Never commit passwords** to version control
2. **Use strong passwords** (min 12 characters, mixed case, numbers, symbols)
3. **Use environment variables** for production credentials
4. **Enable SSL/TLS** for production databases
5. **Regular backups** (automated daily backups recommended)
6. **Least privilege principle** - grant only necessary permissions
7. **Monitor access logs** regularly

### Secure Password Storage

For production, use one of these methods:

**1. Environment Variables:**
```bash
export ConnectionStrings__DefaultConnection="..."
```

**2. User Secrets (Development):**
```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=..."
```

**3. Azure Key Vault / AWS Secrets Manager (Production)**

## 🔍 Troubleshooting

### Common Issues

**1. "Access denied for user"**
```sql
GRANT ALL PRIVILEGES ON auction_web.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;
```

**2. "Unknown database"**
```sql
CREATE DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**3. "Can't connect to MySQL server"**
```bash
# macOS
brew services restart mysql

# Linux
sudo systemctl restart mysql

# Check if MySQL is running
ps aux | grep mysql
```

**4. "SSL connection error"**
Add `SslMode=None` to connection string for local development.

**5. Migration fails**
```bash
# Reset database
dotnet ef database drop -f
dotnet ef database update
```

### Checking Logs

**Application Logs:**
- Console output when running `dotnet run`
- Check `Logging:LogLevel:Microsoft.EntityFrameworkCore` in appsettings

**MySQL Logs:**
```bash
# macOS
tail -f /usr/local/var/mysql/*.err

# Linux
sudo tail -f /var/log/mysql/error.log
```

## 📊 Performance Optimization

### Recommended Settings

**Connection Pooling:**
```
Server=localhost;Database=auction_web;User=auctionuser;Password=***;Pooling=true;MinimumPoolSize=0;MaximumPoolSize=100;
```

**MySQL Configuration** (my.cnf):
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

### Indexes

Entity Framework automatically creates indexes for:
- Primary keys
- Foreign keys
- Unique constraints

Additional indexes are defined in model configurations.

## 🔄 Backup & Recovery

### Automated Backup Script

Create a cron job for daily backups:

```bash
# Create backup script
cat > ~/backup_auction_db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR=~/auction_backups
mkdir -p $BACKUP_DIR
mysqldump -u auctionuser -p'YourPassword' auction_web | gzip > $BACKUP_DIR/auction_web_$(date +%Y%m%d_%H%M%S).sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "auction_web_*.sql.gz" -mtime +7 -delete
EOF

chmod +x ~/backup_auction_db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup_auction_db.sh") | crontab -
```

### Recovery

```bash
# Restore from backup
gunzip < backup.sql.gz | mysql -u auctionuser -p auction_web
```

## 📈 Monitoring

### Key Metrics to Monitor

1. **Connection count**
2. **Query performance** (slow query log)
3. **Database size**
4. **Table locks**
5. **Replication lag** (if applicable)

### Monitoring Queries

```sql
-- Active connections
SHOW PROCESSLIST;

-- Database size
SELECT table_schema AS 'Database', 
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
FROM information_schema.tables 
WHERE table_schema='auction_web';

-- Table sizes
SELECT table_name AS 'Table',
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'auction_web'
ORDER BY (data_length + index_length) DESC;
```

## 🌐 Production Deployment

### Checklist

- [ ] Use strong, unique password
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring
- [ ] Use environment variables for secrets
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up replication (if needed)
- [ ] Configure log rotation

### Cloud Providers

**AWS RDS:**
- Use RDS for MySQL
- Enable automated backups
- Use Parameter Groups for configuration
- Enable Enhanced Monitoring

**Azure Database for MySQL:**
- Use Azure Database for MySQL
- Enable automatic backups
- Configure firewall rules
- Use Azure Key Vault for secrets

**Google Cloud SQL:**
- Use Cloud SQL for MySQL
- Enable automated backups
- Configure authorized networks
- Use Secret Manager

## 📞 Support & Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Pomelo MySQL Provider](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql)
- [ASP.NET Core Identity](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## 📝 Migration History

- `20250922202758_InitialMySQLMigration` - Initial database schema

To view migration details:
```bash
dotnet ef migrations list
```

---

*For additional help, see [MYSQL_DATABASE_SETUP.md](MYSQL_DATABASE_SETUP.md) for detailed setup instructions.*
# Quick Start: MySQL Database Setup

This is a quick reference guide for setting up the MySQL database for the Auction Web application.

## Prerequisites
- MySQL 8.0+ installed and running
- .NET 9.0 SDK installed
- EF Core tools installed (`dotnet tool install --global dotnet-ef`)

## Quick Setup (3 Steps)

### Step 1: Create Database & User

Login to MySQL and run:

```sql
CREATE DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auctionuser'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON auction_web.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Configure Connection String

Update `Auction_Web/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;"
  }
}
```

### Step 3: Apply Migrations

```bash
cd Auction_Web
dotnet ef database update
```

That's it! Your database is ready.

## Automated Setup

Alternatively, use the automated setup script:

```bash
./setup_mysql.sh
```

This script will:
- ✓ Check MySQL installation
- ✓ Create database and user
- ✓ Update configuration files
- ✓ Apply migrations automatically

## Verify Setup

```bash
# Check database
mysql -u auctionuser -p auction_web -e "SHOW TABLES;"

# Run application
cd Auction_Web
dotnet run
```

## Troubleshooting

**Can't connect to MySQL?**
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

**Migration errors?**
```bash
dotnet ef database drop
dotnet ef database update
```

**Need more help?**
See the complete guide: [MYSQL_DATABASE_SETUP.md](MYSQL_DATABASE_SETUP.md)

## Connection String Formats

**Local Development:**
```
Server=localhost;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=None;
```

**Production (with SSL):**
```
Server=prod-server.com;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=Required;
```

**With Custom Port:**
```
Server=localhost;Port=3307;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=None;
```

## Common Commands

```bash
# Apply migrations
dotnet ef database update

# Create new migration
dotnet ef migrations add MigrationName

# List migrations
dotnet ef migrations list

# Drop database
dotnet ef database drop

# Backup database
mysqldump -u auctionuser -p auction_web > backup.sql

# Restore database
mysql -u auctionuser -p auction_web < backup.sql
```

## Database Schema Overview

The application uses Entity Framework Core migrations to create:

- **Authentication**: AspNetUsers, AspNetRoles, AspNetUserRoles, etc.
- **Core Features**: Auctions, Bids, Categories
- **Media**: AuctionImages, AuctionViews
- **Transactions**: PaymentRecords, Transactions
- **User Features**: WatchlistItems

All tables are managed by Entity Framework - you don't need to create them manually.

