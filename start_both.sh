#!/bin/bash

# Script to start both the .NET backend and React frontend

echo "🚀 Starting Auction Web Application..."
echo "========================================"

# Kill any existing processes
echo "🧹 Cleaning up any existing processes..."
pkill -f "dotnet run" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "node.*react-scripts" 2>/dev/null
sleep 2

# Start .NET backend in the background
echo "📦 Starting .NET Backend on http://0.0.0.0:5104..."
cd "Auction_Web" || exit
dotnet run --launch-profile http > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 8

# Start React frontend
echo "⚛️  Starting React Frontend on http://localhost:3000..."
cd auction-frontend || exit

# Set environment to not auto-open browser (we'll open it manually to the right URL)
BROWSER=none npm start &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 8

# Open browser to the React app
echo "🌐 Opening browser to http://localhost:3000..."
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

echo ""
echo "✅ Both servers are running!"
echo "================================"
echo "Backend:  http://0.0.0.0:5104 (http://10.19.21.151:5104)"
echo "Frontend: http://0.0.0.0:3000 (http://10.19.21.151:3000)"
echo "================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "dotnet run" 2>/dev/null
    pkill -f "react-scripts" 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
