#!/bin/bash

# MySQL Setup Script for Auction Web Application
# This script automates the MySQL database setup process

set -e  # Exit on error

echo "========================================="
echo "Auction Web - MySQL Database Setup"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DB_NAME="auction_web"
DB_USER="auctionuser"
DB_HOST="localhost"
DB_PORT="3306"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if MySQL is installed
check_mysql() {
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL is not installed!"
        echo ""
        echo "Please install MySQL first:"
        echo "  macOS:   brew install mysql"
        echo "  Ubuntu:  sudo apt install mysql-server"
        echo ""
        exit 1
    fi
    print_success "MySQL is installed"
}

# Check if MySQL service is running
check_mysql_service() {
    if ! pgrep -x mysqld > /dev/null && ! pgrep -x mysql > /dev/null; then
        print_info "MySQL service is not running. Attempting to start..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start mysql
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo systemctl start mysql
        fi
        sleep 3
    fi
    print_success "MySQL service is running"
}

# Get database credentials
get_credentials() {
    echo ""
    print_info "Please provide MySQL credentials"
    echo ""
    
    read -p "MySQL Root Username [root]: " MYSQL_ROOT_USER
    MYSQL_ROOT_USER=${MYSQL_ROOT_USER:-root}
    
    read -sp "MySQL Root Password: " MYSQL_ROOT_PASSWORD
    echo ""
    
    read -p "New Database Name [auction_web]: " DB_NAME
    DB_NAME=${DB_NAME:-auction_web}
    
    read -p "New Database User [auctionuser]: " DB_USER
    DB_USER=${DB_USER:-auctionuser}
    
    read -sp "New Database User Password: " DB_PASSWORD
    echo ""
    
    read -sp "Confirm Password: " DB_PASSWORD_CONFIRM
    echo ""
    
    if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
        print_error "Passwords do not match!"
        exit 1
    fi
    
    if [ -z "$DB_PASSWORD" ]; then
        print_error "Password cannot be empty!"
        exit 1
    fi
}

# Test MySQL connection
test_connection() {
    print_info "Testing MySQL connection..."
    if mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        print_success "MySQL connection successful"
        return 0
    else
        print_error "Failed to connect to MySQL. Please check your credentials."
        return 1
    fi
}

# Create database and user
create_database() {
    print_info "Creating database and user..."
    
    mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASSWORD" <<MYSQL_SCRIPT
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;

-- Verify
USE $DB_NAME;
SELECT 'Database created successfully!' as Status;
MYSQL_SCRIPT

    if [ $? -eq 0 ]; then
        print_success "Database '$DB_NAME' created successfully"
        print_success "User '$DB_USER' created and granted privileges"
    else
        print_error "Failed to create database"
        exit 1
    fi
}

# Update appsettings.json
update_appsettings() {
    print_info "Updating appsettings.json..."
    
    APPSETTINGS_FILE="Auction_Web/appsettings.json"
    
    if [ ! -f "$APPSETTINGS_FILE" ]; then
        print_error "appsettings.json not found at $APPSETTINGS_FILE"
        return 1
    fi
    
    # Create backup
    cp "$APPSETTINGS_FILE" "${APPSETTINGS_FILE}.backup"
    
    # Connection string
    CONN_STRING="Server=$DB_HOST;Database=$DB_NAME;User=$DB_USER;Password=$DB_PASSWORD;SslMode=None;"
    
    # Update the file
    cat > "$APPSETTINGS_FILE" <<JSON
{
  "ConnectionStrings": {
    "DefaultConnection": "$CONN_STRING"
  },
  "Jwt": {
    "Secret": "$(openssl rand -base64 32)",
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
JSON
    
    print_success "appsettings.json updated (backup created: ${APPSETTINGS_FILE}.backup)"
}

# Update appsettings.Development.json
update_appsettings_dev() {
    print_info "Updating appsettings.Development.json..."
    
    APPSETTINGS_DEV_FILE="Auction_Web/appsettings.Development.json"
    
    # Create backup if file exists
    if [ -f "$APPSETTINGS_DEV_FILE" ]; then
        cp "$APPSETTINGS_DEV_FILE" "${APPSETTINGS_DEV_FILE}.backup"
    fi
    
    # Connection string for development
    CONN_STRING_DEV="Server=$DB_HOST;Database=${DB_NAME}_dev;User=$DB_USER;Password=$DB_PASSWORD;SslMode=None;"
    
    # Create development database
    mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME}_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    mysql -u"$MYSQL_ROOT_USER" -p"$MYSQL_ROOT_PASSWORD" -e "GRANT ALL PRIVILEGES ON ${DB_NAME}_dev.* TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null
    
    # Update the file
    cat > "$APPSETTINGS_DEV_FILE" <<JSON
{
  "ConnectionStrings": {
    "DefaultConnection": "$CONN_STRING_DEV"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
JSON
    
    print_success "appsettings.Development.json updated"
    print_success "Development database '${DB_NAME}_dev' created"
}

# Run EF Core migrations
run_migrations() {
    print_info "Running Entity Framework migrations..."
    
    cd Auction_Web
    
    # Check if dotnet-ef is installed
    if ! dotnet ef --version &> /dev/null; then
        print_info "Installing dotnet-ef tools..."
        dotnet tool install --global dotnet-ef
    fi
    
    # Restore packages
    print_info "Restoring NuGet packages..."
    dotnet restore
    
    # Apply migrations
    print_info "Applying database migrations..."
    if dotnet ef database update; then
        print_success "Migrations applied successfully"
    else
        print_error "Migration failed. Please check the error messages above."
        cd ..
        return 1
    fi
    
    cd ..
}

# Verify database setup
verify_setup() {
    print_info "Verifying database setup..."
    
    TABLES_COUNT=$(mysql -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';")
    
    if [ "$TABLES_COUNT" -gt 0 ]; then
        print_success "Database contains $TABLES_COUNT tables"
        
        echo ""
        echo "Tables created:"
        mysql -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -e "SHOW TABLES;"
    else
        print_error "No tables found in database"
        return 1
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "========================================="
    echo "Setup Complete!"
    echo "========================================="
    echo ""
    echo "Database Details:"
    echo "  Host:     $DB_HOST"
    echo "  Port:     $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User:     $DB_USER"
    echo ""
    echo "Connection String:"
    echo "  Server=$DB_HOST;Database=$DB_NAME;User=$DB_USER;Password=****;SslMode=None;"
    echo ""
    echo "Next Steps:"
    echo "  1. Review the configuration in Auction_Web/appsettings.json"
    echo "  2. Run the application: cd Auction_Web && dotnet run"
    echo "  3. Access the application at: http://localhost:5000"
    echo ""
    print_success "MySQL database is ready to use!"
    echo ""
}

# Main execution
main() {
    check_mysql
    check_mysql_service
    get_credentials
    
    if ! test_connection; then
        exit 1
    fi
    
    create_database
    update_appsettings
    update_appsettings_dev
    run_migrations
    verify_setup
    print_summary
}

# Run main function
main

