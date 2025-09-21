#!/bin/bash

# Auction Web Database Setup Script
# This script sets up the complete MySQL database for the Auction Web application
# Created: September 5, 2025

set -e  # Exit on any error

# Configuration
DB_NAME="auction_web"
DB_USER="auction_app"
DB_PASSWORD="SecurePassword123!"
DB_ROOT_PASSWORD=""
DB_HOST="localhost"
DB_PORT="3306"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if MySQL is running
check_mysql() {
    print_status "Checking MySQL service..."
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL is not installed or not in PATH"
        exit 1
    fi
    
    if ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" --silent; then
        print_error "MySQL server is not running on $DB_HOST:$DB_PORT"
        exit 1
    fi
    
    print_success "MySQL server is running"
}

# Function to get root password if not provided
get_root_password() {
    if [ -z "$DB_ROOT_PASSWORD" ]; then
        echo -n "Enter MySQL root password: "
        read -s DB_ROOT_PASSWORD
        echo
    fi
}

# Function to test database connection
test_connection() {
    print_status "Testing database connection..."
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" -p"$DB_ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
    else
        print_error "Failed to connect to MySQL with provided credentials"
        exit 1
    fi
}

# Function to create database and user
setup_database() {
    print_status "Setting up database and user..."
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" -p"$DB_ROOT_PASSWORD" << EOF
-- Drop database if it exists (for clean setup)
DROP DATABASE IF EXISTS $DB_NAME;

-- Create fresh database
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
DROP USER IF EXISTS '$DB_USER'@'%';
CREATE USER '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;

-- Verify database creation
USE $DB_NAME;
SELECT 'Database created successfully' AS Status;
EOF

    print_success "Database and user created successfully"
}

# Function to run SQL scripts
run_sql_script() {
    local script_file=$1
    local description=$2
    
    print_status "Running $description..."
    
    if [ ! -f "$script_file" ]; then
        print_error "Script file not found: $script_file"
        exit 1
    fi
    
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" -p"$DB_ROOT_PASSWORD" "$DB_NAME" < "$script_file"; then
        print_success "$description completed successfully"
    else
        print_error "Failed to execute $description"
        exit 1
    fi
}

# Function to verify installation
verify_installation() {
    print_status "Verifying database installation..."
    
    # Check table count
    TABLE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" -p"$DB_ROOT_PASSWORD" -D"$DB_NAME" -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';")
    
    # Check procedure count
    PROC_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" -p"$DB_ROOT_PASSWORD" -D"$DB_NAME" -se "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = '$DB_NAME';")
    
    # Check event count
    EVENT_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"root" -p"$DB_ROOT_PASSWORD" -D"$DB_NAME" -se "SELECT COUNT(*) FROM information_schema.events WHERE event_schema = '$DB_NAME';")
    
    print_success "Installation verification:"
    echo "  - Tables created: $TABLE_COUNT"
    echo "  - Procedures/Functions: $PROC_COUNT" 
    echo "  - Scheduled Events: $EVENT_COUNT"
    
    if [ "$TABLE_COUNT" -lt 20 ]; then
        print_warning "Expected more tables. Installation may be incomplete."
    fi
}

# Function to create connection string
create_connection_string() {
    print_status "Creating connection string..."
    
    CONNECTION_STRING="Server=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Uid=$DB_USER;Pwd=$DB_PASSWORD;Convert Zero Datetime=True;Allow Zero Datetime=True;"
    
    echo ""
    print_success "Database setup complete!"
    echo ""
    echo "Connection String for appsettings.json:"
    echo "----------------------------------------"
    echo "\"DefaultConnection\": \"$CONNECTION_STRING\""
    echo ""
    echo "Environment Variables:"
    echo "---------------------"
    echo "DB_HOST=$DB_HOST"
    echo "DB_PORT=$DB_PORT"
    echo "DB_NAME=$DB_NAME"
    echo "DB_USER=$DB_USER"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo ""
}

# Function to show next steps
show_next_steps() {
    print_status "Next Steps:"
    echo "1. Update your appsettings.json with the connection string above"
    echo "2. Run 'dotnet ef database update' to apply Entity Framework migrations"
    echo "3. Start your application and verify database connectivity"
    echo "4. Check the database documentation in DATABASE_DOCUMENTATION.md"
    echo "5. Consider changing the default passwords for production use"
    echo ""
    print_warning "Security Notes:"
    echo "- Change default passwords before production deployment"
    echo "- Configure SSL/TLS for database connections"
    echo "- Review and adjust user privileges as needed"
    echo "- Enable MySQL slow query log for performance monitoring"
}

# Main execution
main() {
    echo "========================================"
    echo "  Auction Web Database Setup Script"
    echo "========================================"
    echo ""
    
    # Get directory of this script
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    
    # Check prerequisites
    check_mysql
    get_root_password
    test_connection
    
    # Setup database
    setup_database
    
    # Run setup scripts
    run_sql_script "$SCRIPT_DIR/schema.sql" "Database Schema Creation"
    run_sql_script "$SCRIPT_DIR/seed_data.sql" "Initial Data Population"
    run_sql_script "$SCRIPT_DIR/maintenance.sql" "Maintenance Procedures Setup"
    
    # Verify and provide information
    verify_installation
    create_connection_string
    show_next_steps
    
    print_success "Database setup completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --host HOST    Database host (default: localhost)"
        echo "  --port PORT    Database port (default: 3306)"
        echo "  --user USER    Application user name (default: auction_app)"
        echo "  --name NAME    Database name (default: auction_web)"
        echo ""
        echo "Environment Variables:"
        echo "  DB_ROOT_PASSWORD    MySQL root password"
        echo ""
        exit 0
        ;;
    --host)
        DB_HOST="$2"
        shift 2
        ;;
    --port)
        DB_PORT="$2"
        shift 2
        ;;
    --user)
        DB_USER="$2"
        shift 2
        ;;
    --name)
        DB_NAME="$2"
        shift 2
        ;;
    *)
        main "$@"
        ;;
esac
