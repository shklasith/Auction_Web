# MySQL Database Setup Guide

This guide provides step-by-step instructions for setting up MySQL database for the Auction Web application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MySQL Installation](#mysql-installation)
3. [Database Creation](#database-creation)
4. [Configuration](#configuration)
5. [Running Migrations](#running-migrations)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the database, ensure you have:
- MySQL Server 8.0 or higher installed
- .NET 9.0 SDK installed
- Entity Framework Core CLI tools installed

## MySQL Installation

### macOS (using Homebrew)
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure your MySQL installation
mysql_secure_installation
```

### macOS (using MySQL Installer)
1. Download MySQL Community Server from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Run the installer and follow the setup wizard
3. Remember the root password you set during installation

### Windows
1. Download MySQL Installer from [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
2. Choose "Custom" installation
3. Select MySQL Server 8.0+
4. Complete the installation wizard

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

---

## Database Creation

### Option 1: Using MySQL Command Line

1. **Login to MySQL as root:**
```bash
mysql -u root -p
```

2. **Create the database:**
```sql
CREATE DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Create a dedicated database user (recommended):**
```sql
CREATE USER 'auctionuser'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON auction_web.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;
```

4. **Verify the database was created:**
```sql
SHOW DATABASES;
USE auction_web;
```

5. **Exit MySQL:**
```sql
EXIT;
```

### Option 2: Using MySQL Workbench (GUI)

1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Click on "Create Schema" icon
4. Enter schema name: `auction_web`
5. Set charset to `utf8mb4` and collation to `utf8mb4_unicode_ci`
6. Click "Apply"

---

## Configuration

### 1. Update appsettings.json

Navigate to `Auction_Web/appsettings.json` and add/update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-that-is-at-least-32-characters-long!",
    "Issuer": "AuctionWebApp",
    "Audience": "AuctionWebUsers"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

### 2. Update appsettings.Development.json

For development environment (`Auction_Web/appsettings.Development.json`):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web_dev;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

### Connection String Parameters Explained:
- **Server**: MySQL server address (localhost for local development)
- **Database**: Name of the database
- **User**: MySQL username
- **Password**: MySQL user password
- **SslMode**: SSL connection mode (None for local development, Preferred/Required for production)

### Alternative Connection String Formats:

**Using root user (not recommended for production):**
```
Server=localhost;Database=auction_web;User=root;Password=your_root_password;SslMode=None;
```

**With port specification:**
```
Server=localhost;Port=3306;Database=auction_web;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;
```

**Using connection pooling:**
```
Server=localhost;Database=auction_web;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;Pooling=true;MinimumPoolSize=0;MaximumPoolSize=100;
```

---

## Running Migrations

### 1. Install EF Core Tools (if not already installed)

```bash
dotnet tool install --global dotnet-ef
```

Or update if already installed:
```bash
dotnet tool update --global dotnet-ef
```

### 2. Navigate to Project Directory

```bash
cd /Users/kaveeshalasith/Downloads/untitled\ folder\ 11/Auction_Web
```

### 3. Apply Existing Migrations

The project already has a migration (`InitialMySQLMigration`). Apply it to create all tables:

```bash
dotnet ef database update
```

### 4. Create New Migration (when you make model changes)

If you modify any models in the future:

```bash
# Create a new migration
dotnet ef migrations add YourMigrationName

# Apply the migration
dotnet ef database update
```

### 5. View Migration History

```bash
dotnet ef migrations list
```

### 6. Remove Last Migration (if needed)

```bash
dotnet ef migrations remove
```

---

## Verification

### 1. Verify Database Tables Were Created

Login to MySQL and check:

```bash
mysql -u auctionuser -p auction_web
```

```sql
-- Show all tables
SHOW TABLES;

-- Check specific tables
DESCRIBE AspNetUsers;
DESCRIBE Auctions;
DESCRIBE Bids;

-- View table count
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'auction_web';
```

Expected tables:
- AspNetUsers
- AspNetRoles
- AspNetUserRoles
- AspNetUserClaims
- AspNetUserLogins
- AspNetRoleClaims
- AspNetUserTokens
- Auctions
- AuctionImages
- AuctionViews
- Bids
- Categories
- PaymentRecords
- Transactions
- WatchlistItems

### 2. Test Application Connection

Run the application:

```bash
cd Auction_Web
dotnet run
```

Check the console output for any database connection errors.

### 3. Verify Data Access

Create a test query to verify connectivity:

```sql
-- Check if Identity tables are set up correctly
SELECT COUNT(*) FROM AspNetUsers;
SELECT COUNT(*) FROM AspNetRoles;
```

---

## Troubleshooting

### Issue: "Access denied for user"

**Solution:**
```sql
-- Grant proper privileges
GRANT ALL PRIVILEGES ON auction_web.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: "Unknown database 'auction_web'"

**Solution:**
```sql
CREATE DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Issue: "Unable to connect to any of the specified MySQL hosts"

**Solutions:**
1. Verify MySQL service is running:
   ```bash
   # macOS
   brew services list
   brew services restart mysql
   
   # Linux
   sudo systemctl status mysql
   sudo systemctl restart mysql
   ```

2. Check if MySQL is listening on port 3306:
   ```bash
   netstat -an | grep 3306
   ```

3. Verify connection string in appsettings.json

### Issue: Migration fails with "Table already exists"

**Solution:**
```bash
# Drop all tables and reapply migrations
dotnet ef database drop
dotnet ef database update
```

### Issue: "SSL Connection error"

**Solution:**
Add `SslMode=None` to your connection string for local development:
```
Server=localhost;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=None;
```

For production, configure proper SSL:
```
Server=yourserver.com;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=Required;
```

### Issue: "The specified framework 'Microsoft.NETCore.App', version '9.0.0' was not found"

**Solution:**
Install .NET 9.0 SDK from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)

### Issue: Character encoding problems

**Solution:**
Ensure database uses UTF8MB4:
```sql
ALTER DATABASE auction_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Production Considerations

### Security Best Practices

1. **Use environment variables for sensitive data:**
   ```bash
   export ConnectionStrings__DefaultConnection="Server=prod-server;Database=auction_web;User=auctionuser;Password=SecurePassword;"
   ```

2. **Use Azure Key Vault or AWS Secrets Manager** for production secrets

3. **Enable SSL/TLS:**
   ```
   Server=yourserver.com;Database=auction_web;User=auctionuser;Password=YourPassword;SslMode=Required;
   ```

4. **Restrict user permissions:**
   ```sql
   -- Don't use root in production
   -- Grant only necessary privileges
   GRANT SELECT, INSERT, UPDATE, DELETE ON auction_web.* TO 'auctionuser'@'%';
   ```

### Performance Optimization

1. **Enable connection pooling** (already in connection string)
2. **Configure proper indexes** (Entity Framework creates basic indexes)
3. **Set up regular backups:**
   ```bash
   mysqldump -u auctionuser -p auction_web > auction_web_backup_$(date +%Y%m%d).sql
   ```

4. **Monitor slow queries:**
   ```sql
   -- Enable slow query log
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

### Backup and Restore

**Backup:**
```bash
mysqldump -u auctionuser -p auction_web > backup.sql
```

**Restore:**
```bash
mysql -u auctionuser -p auction_web < backup.sql
```

---

## Quick Reference Commands

```bash
# Start MySQL
brew services start mysql          # macOS
sudo systemctl start mysql         # Linux

# Stop MySQL
brew services stop mysql           # macOS
sudo systemctl stop mysql          # Linux

# Restart MySQL
brew services restart mysql        # macOS
sudo systemctl restart mysql       # Linux

# Apply migrations
dotnet ef database update

# Create new migration
dotnet ef migrations add MigrationName

# Drop database (be careful!)
dotnet ef database drop

# View EF Core version
dotnet ef --version

# Restore NuGet packages
dotnet restore

# Build project
dotnet build

# Run project
dotnet run
```

---

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Identity](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Pomelo.EntityFrameworkCore.MySql](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql)

---

## Support

If you encounter issues not covered in this guide:
1. Check the application logs in the console output
2. Review MySQL error logs (usually in `/usr/local/var/mysql/` on macOS)
3. Verify all NuGet packages are properly installed
4. Ensure MySQL server version is 8.0 or higher

---

*Last Updated: October 2025*

