# SOLUTION: Fix "Default ASP.NET Welcome Page" Issue

## The Problem

When you click "Run" in your IDE, it's only starting the .NET **backend**, which shows:
```
Welcome
Learn about building Web apps with ASP.NET Core.
```

Your auction website is actually a **React frontend** that needs BOTH servers running!

## STEP-BY-STEP SOLUTION

### Step 1: Stop the Backend Running in Your IDE

First, **STOP** the server that's currently running in your IDE:
- Look for a **Stop** button (usually a red square icon)
- Or close the Run/Debug panel

### Step 2: Open TWO Terminal Windows

You need to run both servers in separate terminals.

### Step 3: Start Backend (Terminal 1)

```bash
cd "/Users/kaveeshalasith/Downloads/untitled folder 11/Auction_Web"
dotnet run
```

Wait until you see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7274
```

### Step 4: Start Frontend (Terminal 2)

Open a **NEW** terminal window and run:

```bash
cd "/Users/kaveeshalasith/Downloads/untitled folder 11/auction-frontend"
npm start
```

This will automatically open your browser to `http://localhost:3000`

### Step 5: Access Your Auction Website

Your browser should open automatically to: **http://localhost:3000**

✅ You should now see **AuctionHub** with:
- Navigation menu (Home, All Auctions, Sell Item)
- Featured auctions
- Category cards
- Search bar

❌ NOT the "Welcome to ASP.NET Core" page!

## Quick Scripts (Alternative Method)

I've created helper scripts in your project folder:

### Option A: Start Both at Once
```bash
cd "/Users/kaveeshalasith/Downloads/untitled folder 11"
./start_both.sh
```

### Option B: Start Separately
**Terminal 1:**
```bash
./start_backend.sh
```

**Terminal 2:**
```bash
./start_frontend.sh
```

## Troubleshooting

### "Port already in use" Error?

1. Stop your IDE's run configuration
2. Run this command to kill all processes:
```bash
pkill -f "Auction_Web"; pkill -f "react-scripts"; sleep 2
```
3. Then start both servers again

### Still seeing ASP.NET welcome page?

Make sure you're accessing: **http://localhost:3000** (NOT 7274 or 5103)

### React app shows but no auction data?

Check that the backend terminal shows "Now listening on: https://localhost:7274"

## Important URLs

- ✅ **USE THIS:** http://localhost:3000 (React Frontend - Your Auction Website)
- ❌ DON'T USE: https://localhost:7274 (Backend API only - shows welcome page)

## What Each Server Does

- **Backend (Port 7274)**: Provides API for auctions, users, bidding (ASP.NET Core)
- **Frontend (Port 3000)**: Displays the website (React)

The React app on port 3000 calls the backend on port 7274 to get data!

