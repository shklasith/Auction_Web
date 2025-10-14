# How to Run the Auction Web Application

## Problem: Default React Page Showing Instead of Auction Site

The issue is that you need to run **BOTH** the backend (.NET) and frontend (React) servers simultaneously.

## Quick Start

### Option 1: Use the Startup Script (Easiest)
```bash
./start_both.sh
```

### Option 2: Run Manually in Separate Terminals

#### Terminal 1 - Backend (.NET)
```bash
cd Auction_Web
dotnet run
```
This will start the backend on:
- HTTPS: https://localhost:7274
- HTTP: http://localhost:5103

#### Terminal 2 - Frontend (React)
```bash
cd auction-frontend
npm start
```
This will start the frontend on:
- http://localhost:3000

## Accessing the Application

Once both servers are running:

1. **Open your browser** and go to: `http://localhost:3000`
2. You should now see the **AuctionHub** website (not the default React page)

## Troubleshooting

### Issue: Still seeing default React page?

1. **Check both servers are running:**
   - Backend should show: "Now listening on: https://localhost:7274"
   - Frontend should show: "webpack compiled successfully"

2. **Clear browser cache:**
   - Press `Cmd + Shift + R` (Mac) to hard refresh
   - Or open in incognito/private window

3. **Check the browser console:**
   - Press `F12` or `Cmd + Option + I`
   - Look for any red errors in the Console tab

### Issue: Connection errors in browser console?

This means the React app can't connect to the backend:

1. Make sure the backend is running on port 7274 or 5103
2. Check the `proxy` setting in `auction-frontend/package.json`:
   ```json
   "proxy": "https://localhost:7049"
   ```
   Should match your backend URL (currently set to 7049, but backend runs on 7274)

### Issue: Database errors?

Run the database setup:
```bash
cd Auction_Web
dotnet ef database update
```

## Configuration Files

- **Backend URL:** Set in `Auction_Web/Properties/launchSettings.json`
- **Frontend Proxy:** Set in `auction-frontend/package.json` (proxy field)
- **CORS:** Configured in `Auction_Web/Program.cs` (allows localhost:3000)

## What You Should See

When working correctly:
- ✅ AuctionHub header with navigation
- ✅ Featured auctions carousel
- ✅ Category cards
- ✅ Search functionality

When NOT working (default React page):
- ❌ Just a blank page or React logo spinning
- ❌ "Edit src/App.js and save to reload" message

