# MySQL Database Setup for Auction Web Application

## Prerequisites
1. Install MySQL Server on your macOS
2. Install MySQL Workbench (optional, for GUI management)

## Installation Steps

### 1. Install MySQL using Homebrew
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure MySQL installation (optional but recommended)
mysql_secure_installation
```

### 2. Alternative: Download MySQL from Official Website
- Visit: https://dev.mysql.com/downloads/mysql/
- Download MySQL Community Server for macOS
- Follow the installation wizard
- Note down the temporary root password

### 3. Create Database and User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the database
CREATE DATABASE AuctionWebDb;

-- Create a user for the application (optional, you can use root)
CREATE USER 'auctionuser'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON AuctionWebDb.* TO 'auctionuser'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

## Configuration

### Update Connection String
The connection string has been updated in `appsettings.json`:

**Option 1: Using root user (current setup)**
```json
"DefaultConnection": "Server=localhost;Database=AuctionWebDb;User=root;Password=your_password;"
```

**Option 2: Using dedicated user (recommended)**
```json
"DefaultConnection": "Server=localhost;Database=AuctionWebDb;User=auctionuser;Password=your_secure_password;"
```

## Apply Database Migrations

After setting up MySQL, run the following commands to create the database schema:

```bash
cd /Users/kaveeshalasith/Downloads/Auction_Web/Auction_Web

# Update the database with the new migration
dotnet ef database update
```

## Verification

### 1. Check if MySQL is running
```bash
brew services list | grep mysql
# Should show mysql as "started"
```

### 2. Test database connection
```bash
mysql -u root -p -e "SHOW DATABASES;"
# Should show AuctionWebDb in the list
```

### 3. Run the application
```bash
dotnet run
```

## Troubleshooting

### Common Issues:

1. **MySQL service not running**
   ```bash
   brew services start mysql
   ```

2. **Access denied for user 'root'@'localhost'**
   - Reset MySQL root password
   - Update connection string with correct password

3. **Connection timeout**
   - Check if MySQL is running on port 3306
   - Verify firewall settings

4. **Database doesn't exist**
   ```sql
   CREATE DATABASE AuctionWebDb;
   ```

## Next Steps

1. Install and start MySQL
2. Update the password in `appsettings.json`
3. Run `dotnet ef database update`
4. Start your application with `dotnet run`

Your application will now use MySQL instead of SQLite!
