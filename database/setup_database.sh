#!/bin/bash

# Quick Database Setup Script
# This script sets up the database using existing configuration

set -e

echo "Setting up Auction Web Database..."

# Database configuration
DB_NAME="auction_web"
DB_USER="auctionuser"
DB_PASSWORD="YourStrongPassword123!"

# MySQL root credentials
read -sp "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
echo ""

# Create database and user
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS ${DB_NAME}_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}_dev.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "✓ Database created"

# Navigate to project directory
cd "$(dirname "$0")/Auction_Web"

# Apply migrations
echo "Applying migrations..."
dotnet ef database update

echo "✓ Setup complete!"
echo ""
echo "Database: $DB_NAME"
echo "Dev Database: ${DB_NAME}_dev"
echo "User: $DB_USER"
echo ""
echo "You can now run the application with: dotnet run"
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

