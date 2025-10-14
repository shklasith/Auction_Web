# Database Connection Guide for Auction Web Application

## Overview
This Auction Web application uses **MySQL** as its database with **Entity Framework Core** for data access. The backend is built with **.NET** and the frontend with **React**.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Connection Configuration](#connection-configuration)
4. [Running Migrations](#running-migrations)
5. [Verifying the Connection](#verifying-the-connection)
6. [Troubleshooting](#troubleshooting)
7. [Running the Application](#running-the-application)

---

## Prerequisites

Make sure you have the following installed:

- **MySQL Server 8.0+** ([Download here](https://dev.mysql.com/downloads/mysql/))
- **.NET 9.0 SDK** ([Download here](https://dotnet.microsoft.com/download))
- **Node.js 16+** and **npm** ([Download here](https://nodejs.org/))
- **Entity Framework Core CLI tools**

### Install EF Core Tools
```bash
dotnet tool install --global dotnet-ef
```

---

## Database Setup

### Step 1: Install and Start MySQL

#### macOS (using Homebrew)
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation (set root password)
mysql_secure_installation
```

#### macOS (manual download)
1. Download MySQL from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Install and follow the setup wizard
3. Remember the root password you set

#### Check MySQL is Running
```bash
mysql --version
mysql -u root -p
```

### Step 2: Create Database and User

Login to MySQL:
```bash
mysql -u root -p
```

Then run these SQL commands:
```sql
-- Create the database
CREATE DATABASE auction_web_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the application
CREATE USER 'auctionuser'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON auction_web_dev.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
EXIT;
```

---

## Connection Configuration

### Current Configuration

The application is already configured to connect to MySQL. Here's how it works:

#### 1. Connection String Location
The database connection string is stored in:
```
Auction_Web/appsettings.json
```

#### 2. Default Connection String
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web_dev;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;"
  }
}
```

#### 3. Customize Your Connection String

If you used different credentials, update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=YOUR_DATABASE_NAME;User=YOUR_USERNAME;Password=YOUR_PASSWORD;SslMode=None;"
  }
}
```

**Connection String Parameters:**
- `Server` - MySQL server address (usually `localhost`)
- `Database` - Database name (e.g., `auction_web_dev`)
- `User` - MySQL username (e.g., `auctionuser`)
- `Password` - MySQL password
- `SslMode` - SSL setting (`None` for local development)

#### 4. How It's Used in the Application

In `Program.cs`, the connection string is loaded:
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 21))));
```

---

## Running Migrations

Entity Framework Core migrations will create all the necessary tables automatically.

### Step 1: Navigate to Backend Directory
```bash
cd Auction_Web
```

### Step 2: Apply Migrations
```bash
dotnet ef database update
```

This command will:
- Connect to your MySQL database
- Create all required tables (Users, Auctions, Bids, etc.)
- Set up relationships and indexes

### Expected Output
```
Build started...
Build succeeded.
Applying migration '20250922202758_InitialMySQLMigration'.
Done.
```

### Tables Created
The migration creates these tables:
- `AspNetUsers` - User accounts
- `AspNetRoles` - User roles (Admin, Seller, Buyer)
- `Auctions` - Auction listings
- `Bids` - Bid records
- `AuctionImages` - Auction images
- `WatchlistItems` - User watchlists
- `Transactions` - Transaction history
- `PaymentRecords` - Payment records
- `Categories` - Product categories
- And more...

---

## Verifying the Connection

### Method 1: Check in MySQL
```bash
mysql -u auctionuser -p
```

```sql
USE auction_web_dev;
SHOW TABLES;
DESCRIBE AspNetUsers;
DESCRIBE Auctions;
EXIT;
```

### Method 2: Run the Backend
```bash
cd Auction_Web
dotnet run
```

Look for this output:
```
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (123ms) [Parameters=[], CommandType='Text']
```

If you see database-related logs without errors, the connection is successful!

---

## Troubleshooting

### Error: "Unable to connect to any of the specified MySQL hosts"

**Solution:**
1. Verify MySQL is running:
   ```bash
   brew services list | grep mysql
   # or
   ps aux | grep mysql
   ```

2. Start MySQL if stopped:
   ```bash
   brew services start mysql
   # or
   sudo systemctl start mysql
   ```

### Error: "Access denied for user 'auctionuser'@'localhost'"

**Solution:**
1. Check your password in `appsettings.json`
2. Recreate the user in MySQL:
   ```sql
   DROP USER 'auctionuser'@'localhost';
   CREATE USER 'auctionuser'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
   GRANT ALL PRIVILEGES ON auction_web_dev.* TO 'auctionuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Error: "Unknown database 'auction_web_dev'"

**Solution:**
Create the database:
```sql
CREATE DATABASE auction_web_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "No migrations configuration type was found"

**Solution:**
Make sure you're in the correct directory:
```bash
cd Auction_Web
dotnet ef database update
```

### Database Connection Timeout

**Solution:**
Increase timeout in connection string:
```json
"DefaultConnection": "Server=localhost;Database=auction_web_dev;User=auctionuser;Password=YourStrongPassword123!;SslMode=None;ConnectionTimeout=60;"
```

---

## Running the Application

Once the database is connected and migrations are applied, you're ready to run the application.

### Option 1: Automated Script (Recommended)
```bash
./start_both.sh
```

### Option 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd Auction_Web
dotnet run
```
Backend runs on: `https://localhost:7274` and `http://localhost:5103`

**Terminal 2 - Frontend:**
```bash
cd auction-frontend
npm install  # First time only
npm start
```
Frontend runs on: `http://localhost:3000`

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

---

## Production Configuration

For production deployment:

1. **Use Environment Variables:**
   ```bash
   export ConnectionStrings__DefaultConnection="Server=prod-server;Database=auction_web;User=produser;Password=SecurePassword;SslMode=Required;"
   ```

2. **Or use `appsettings.Production.json`:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=production-server;Database=auction_web;User=produser;Password=SecurePassword;SslMode=Required;"
     }
   }
   ```

3. **Enable SSL for production:**
   - Change `SslMode=None` to `SslMode=Required`
   - Use strong passwords
   - Restrict database user privileges

---

## Database Architecture

### Entity Framework Core
- **ORM**: Entity Framework Core
- **Database Provider**: Pomelo.EntityFrameworkCore.MySql
- **Migration Strategy**: Code-First

### Key Models
- **User**: ASP.NET Identity user with custom properties
- **Auction**: Auction listings with images and bids
- **Bid**: Bidding records
- **Transaction**: Purchase transactions
- **PaymentRecord**: Payment processing records

### Database Context
Location: `Auction_Web/Data/ApplicationDbContext.cs`

---

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Entity Framework Core Docs](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Identity](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity)

---

## Quick Reference Commands

```bash
# Check MySQL status
brew services list | grep mysql

# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql

# Access MySQL
mysql -u root -p

# Create database backup
mysqldump -u auctionuser -p auction_web_dev > backup.sql

# Restore database
mysql -u auctionuser -p auction_web_dev < backup.sql

# View EF Core migrations
cd Auction_Web
dotnet ef migrations list

# Create new migration
dotnet ef migrations add MigrationName

# Rollback migration
dotnet ef database update PreviousMigrationName

# Remove last migration
dotnet ef migrations remove
```

---

## Need Help?

Check these files for more information:
- `MYSQL_DATABASE_SETUP.md` - Detailed MySQL setup guide
- `HOW_TO_RUN.md` - Application startup guide
- `API_DOCUMENTATION.md` - API endpoint documentation
- `DEPLOYMENT_GUIDE.md` - Production deployment guide

---

**Created:** October 2025  
**Last Updated:** October 13, 2025  
**Version:** 1.0

