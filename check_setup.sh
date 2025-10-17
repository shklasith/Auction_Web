#!/bin/bash

echo "====================================="
echo "Auction System Setup Verification"
echo "====================================="
echo ""

# Check if backend is running
echo "1. Checking Backend Server (Port 5104)..."
if curl -s -f http://localhost:5104/api/auth/register -X POST -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5104"
else
    if curl -s http://localhost:5104 > /dev/null 2>&1; then
        echo "   ⚠️  Backend is running but API endpoint may not be available"
    else
        echo "   ❌ Backend is NOT running"
        echo "   → Run: ./start_backend.sh or cd Auction_Web && dotnet run"
    fi
fi
echo ""

# Check if frontend is running
echo "2. Checking Frontend Server (Port 3000)..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 3000"
else
    echo "   ❌ Frontend is NOT running"
    echo "   → Run: ./start_frontend.sh or cd auction-frontend && npm start"
fi
echo ""

# Check .env file
echo "3. Checking Frontend Configuration..."
if [ -f "auction-frontend/.env" ]; then
    echo "   ✅ .env file exists"
    API_URL=$(grep REACT_APP_API_URL auction-frontend/.env | cut -d '=' -f2)
    if [ "$API_URL" = "http://localhost:5104/api" ]; then
        echo "   ✅ API URL is correctly set to: $API_URL"
    else
        echo "   ⚠️  API URL is set to: $API_URL"
        echo "   → Expected: http://localhost:5104/api"
    fi
else
    echo "   ❌ .env file not found"
    echo "   → Create auction-frontend/.env with: REACT_APP_API_URL=http://localhost:5104/api"
fi
echo ""

# Check node_modules
echo "4. Checking Frontend Dependencies..."
if [ -d "auction-frontend/node_modules" ]; then
    echo "   ✅ node_modules folder exists"
else
    echo "   ❌ node_modules not found"
    echo "   → Run: cd auction-frontend && npm install"
fi
echo ""

# Check database connection
echo "5. Checking Database Configuration..."
if [ -f "Auction_Web/appsettings.json" ]; then
    echo "   ✅ appsettings.json exists"
    if grep -q "DefaultConnection" Auction_Web/appsettings.json; then
        echo "   ✅ Database connection string found"
    else
        echo "   ⚠️  Database connection string may not be configured"
    fi
else
    echo "   ❌ appsettings.json not found"
fi
echo ""

echo "====================================="
echo "Summary & Next Steps"
echo "====================================="
echo ""
echo "To fix the network error:"
echo "1. Make sure BOTH servers are running"
echo "2. If you changed .env, RESTART the frontend (npm start)"
echo "3. Check browser console (F12) for specific error messages"
echo ""
echo "Quick Start Commands:"
echo "  Start Both:    ./start_both.sh"
echo "  Start Backend: ./start_backend.sh"
echo "  Start Frontend: ./start_frontend.sh"
echo ""
