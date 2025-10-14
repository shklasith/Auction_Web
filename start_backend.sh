#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")/Auction_Web"

# Kill any existing dotnet processes on these ports
echo "Stopping any existing backend processes..."
lsof -ti :5103 :7274 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2

# Ensure the HTTPS certificate is trusted
echo "Checking HTTPS development certificate..."
dotnet dev-certs https --trust 2>/dev/null || true

# Start the application with HTTPS profile
echo "Starting backend with HTTPS on port 7274 and HTTP on port 5103..."
echo "Logs will be saved to /tmp/backend.log"
nohup dotnet run --launch-profile https > /tmp/backend.log 2>&1 &

# Wait for startup
sleep 3

# Check if application started successfully
if lsof -i :5103 >/dev/null 2>&1 || lsof -i :7274 >/dev/null 2>&1; then
    echo "✅ Backend started successfully!"
    echo "HTTP:  http://localhost:5103"
    echo "HTTPS: https://localhost:7274"
    echo ""
    echo "Check logs with: tail -f /tmp/backend.log"
else
    echo "❌ Backend failed to start. Showing last 20 lines of log:"
    tail -20 /tmp/backend.log 2>/dev/null || echo "No log file found"
fi
