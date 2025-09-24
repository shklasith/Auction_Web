#!/bin/bash

# MySQL Database Setup Script for Auction Web Application

echo "🚀 Setting up MySQL Database for Auction Web Application"
echo "========================================================"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Installing via Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    echo "Installing MySQL..."
    brew install mysql
    
    echo "Starting MySQL service..."
    brew services start mysql
else
    echo "✅ MySQL is already installed"
    
    # Start MySQL service if not running
    if ! brew services list | grep mysql | grep started &> /dev/null; then
        echo "Starting MySQL service..."
        brew services start mysql
    else
        echo "✅ MySQL service is already running"
    fi
fi

echo ""
echo "📝 Please enter your MySQL root password when prompted"
echo "If this is a fresh installation, the password might be empty (just press Enter)"
echo ""

# Create database and user
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS AuctionWebDb;
CREATE USER IF NOT EXISTS 'auctionuser'@'localhost' IDENTIFIED BY 'AuctionWeb2024!';
GRANT ALL PRIVILEGES ON AuctionWebDb.* TO 'auctionuser'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully!' as Status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your appsettings.json with the correct password"
    echo "2. Run: cd Auction_Web && dotnet ef database update"
    echo "3. Run: dotnet run"
    echo ""
    echo "💡 Connection string options:"
    echo "   Using root: Server=localhost;Database=AuctionWebDb;User=root;Password=YOUR_ROOT_PASSWORD;"
    echo "   Using new user: Server=localhost;Database=AuctionWebDb;User=auctionuser;Password=AuctionWeb2024!;"
else
    echo ""
    echo "❌ Database setup failed. Please check your MySQL installation and try again."
    echo "💡 You can also set up the database manually using the commands in mysql_setup.md"
fi
