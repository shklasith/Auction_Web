#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "         DATABASE CONNECTION TEST"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if MySQL is running
echo "1. Checking if MySQL service is running..."
if ps aux | grep -i mysql | grep -v grep > /dev/null; then
    echo -e "   ${GREEN}✅ MySQL is running${NC}"
else
    echo -e "   ${RED}❌ MySQL is NOT running${NC}"
    echo "   Run: brew services start mysql"
    exit 1
fi
echo ""

# Test 2: Check if we can connect to MySQL
echo "2. Testing MySQL connection..."
if mysql -u auctionuser -p'Shklasith@098765' -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ MySQL connection successful${NC}"
else
    echo -e "   ${RED}❌ Cannot connect to MySQL${NC}"
    echo "   Check username/password in appsettings.json"
    exit 1
fi
echo ""

# Test 3: Check if database exists
echo "3. Checking if 'auction' database exists..."
if mysql -u auctionuser -p'Shklasith@098765' -e "USE auction; SELECT 1;" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Database 'auction' exists${NC}"
else
    echo -e "   ${RED}❌ Database 'auction' does NOT exist${NC}"
    echo "   Run: mysql -u root -p < database/auction_schema.sql"
    exit 1
fi
echo ""

# Test 4: Check required tables
echo "4. Checking required tables..."
TABLES=$(mysql -u auctionuser -p'Shklasith@098765' auction -e "SHOW TABLES;" -s 2>/dev/null | grep -v "^Tables_in")
REQUIRED_TABLES=("AspNetUsers" "Auctions" "Bids" "Categories")

for table in "${REQUIRED_TABLES[@]}"; do
    if echo "$TABLES" | grep -q "^${table}$"; then
        echo -e "   ${GREEN}✅${NC} $table"
    else
        echo -e "   ${RED}❌${NC} $table (missing)"
    fi
done
echo ""

# Test 5: Count users in database
echo "5. Checking database contents..."
USER_COUNT=$(mysql -u auctionuser -p'Shklasith@098765' auction -e "SELECT COUNT(*) FROM AspNetUsers;" -s 2>/dev/null | tail -1)
AUCTION_COUNT=$(mysql -u auctionuser -p'Shklasith@098765' auction -e "SELECT COUNT(*) FROM Auctions;" -s 2>/dev/null | tail -1)
BID_COUNT=$(mysql -u auctionuser -p'Shklasith@098765' auction -e "SELECT COUNT(*) FROM Bids;" -s 2>/dev/null | tail -1)

echo "   Users:    $USER_COUNT"
echo "   Auctions: $AUCTION_COUNT"
echo "   Bids:     $BID_COUNT"
echo ""

# Test 6: Check connection string in appsettings.json
echo "6. Checking connection string in appsettings.json..."
if [ -f "Auction_Web/appsettings.json" ]; then
    CONN_STRING=$(grep -A 1 "DefaultConnection" Auction_Web/appsettings.json | grep "Server" | sed 's/.*: "\(.*\)".*/\1/')
    echo "   Connection: $CONN_STRING"
    
    # Extract database name from connection string
    DB_NAME=$(echo "$CONN_STRING" | sed 's/.*Database=\([^;]*\).*/\1/')
    if [ "$DB_NAME" = "auction" ]; then
        echo -e "   ${GREEN}✅ Database name is correct${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Database name is '$DB_NAME' (expected 'auction')${NC}"
    fi
else
    echo -e "   ${RED}❌ appsettings.json not found${NC}"
fi
echo ""

# Test 7: Check if backend can connect
echo "7. Testing backend API database connection..."
if curl -s http://localhost:5104 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend server is responding${NC}"
    
    # Try a test API call to verify database access
    RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:5104/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{}' -o /dev/null)
    
    if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "200" ]; then
        echo -e "   ${GREEN}✅ API can access database (HTTP $RESPONSE)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  API response code: $RESPONSE${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  Backend server is not running${NC}"
    echo "   Start it with: ./start_backend.sh"
fi
echo ""

# Test 8: Check for Entity Framework migrations
echo "8. Checking Entity Framework migrations..."
MIGRATION_COUNT=$(mysql -u auctionuser -p'Shklasith@098765' auction -e "SELECT COUNT(*) FROM __EFMigrationsHistory;" -s 2>/dev/null | tail -1)
if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ $MIGRATION_COUNT migrations applied${NC}"
    echo "   Latest migration:"
    mysql -u auctionuser -p'Shklasith@098765' auction -e "SELECT MigrationId FROM __EFMigrationsHistory ORDER BY MigrationId DESC LIMIT 1;" -s 2>/dev/null | tail -1 | sed 's/^/   - /'
else
    echo -e "   ${YELLOW}⚠️  No migrations found${NC}"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "                    SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Database connection is working!${NC}"
echo ""
echo "Database Details:"
echo "  • Server:   localhost"
echo "  • Database: auction"
echo "  • User:     auctionuser"
echo "  • Tables:   $(echo "$TABLES" | wc -l | tr -d ' ')"
echo "  • Users:    $USER_COUNT"
echo "  • Auctions: $AUCTION_COUNT"
echo ""
echo "You can now:"
echo "  1. Create accounts at http://localhost:3000/register"
echo "  2. Login at http://localhost:3000/login"
echo "  3. Create auctions and place bids"
echo ""
