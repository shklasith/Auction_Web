# API Port Configuration Fix

## Problem
The Category and Condition dropdowns were not working on the Create Auction page because the frontend was trying to connect to the wrong backend port.

## Root Cause
The frontend code had hardcoded API URLs pointing to **port 5103**, but the backend server was actually running on **port 5104**.

This caused all API requests to fail, including:
- Fetching categories for the dropdown
- Fetching subcategories
- Creating auctions
- Fetching featured auctions
- SignalR bidding hub connection

## Solution
Updated all API endpoint URLs across the frontend to use the correct port **5104**.

## Files Modified

### 1. **CreateAuction.js** (`/auction-frontend/src/pages/CreateAuction.js`)
- Line 76: `http://localhost:5103/api/auctions/categories` → `http://localhost:5104/api/auctions/categories`
- Line 85: `http://localhost:5103/api/auctions/categories/${category}/subcategories` → `http://localhost:5104/api/auctions/categories/${category}/subcategories`
- Line 234: `http://localhost:5103/api/auctions` → `http://localhost:5104/api/auctions`

### 2. **Home.js** (`/auction-frontend/src/pages/Home.js`)
- Line 84: `http://localhost:5103/api/Auctions?featured=true` → `http://localhost:5104/api/Auctions?featured=true`
- Line 97: `http://localhost:5103/api/Auctions/categories` → `http://localhost:5104/api/Auctions/categories`

### 3. **AuctionList.js** (`/auction-frontend/src/pages/AuctionList.js`)
- Line 28: `http://localhost:5103/api/Auctions?${params}` → `http://localhost:5104/api/Auctions?${params}`
- Line 67: `http://localhost:5103/api/Auctions/categories` → `http://localhost:5104/api/Auctions/categories`

### 4. **BiddingService.js** (`/auction-frontend/src/services/BiddingService.js`)
- Line 14: `http://localhost:5103/biddingHub` → `http://localhost:5104/biddingHub`
- Line 104: `http://localhost:5103/api/bidding/place-bid` → `http://localhost:5104/api/bidding/place-bid`
- Line 125: `http://localhost:5103/api/bidding/${auctionId}/next-minimum-bid` → `http://localhost:5104/api/bidding/${auctionId}/next-minimum-bid`
- Line 130: `http://localhost:5103/api/bidding/${auctionId}/bids` → `http://localhost:5104/api/bidding/${auctionId}/bids`

## Testing
After this fix:
1. **Category Dropdown**: Now loads categories from the backend successfully
2. **Condition Dropdown**: Works as expected (uses hardcoded list)
3. **Subcategory Dropdown**: Loads dynamically based on selected category
4. **Auction Creation**: Submits data to the correct backend endpoint
5. **Home Page**: Loads featured auctions and categories
6. **Auction List**: Displays auctions correctly
7. **Real-time Bidding**: SignalR connects to the correct hub

## Better Solution (Recommended)
Instead of hardcoding URLs, use an environment variable or configuration file:

### Option 1: Use Environment Variable
1. Create `.env` file in `auction-frontend/`:
```
REACT_APP_API_URL=http://localhost:5104
```

2. Update code to use:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5104';
const response = await axios.get(`${API_URL}/api/auctions/categories`);
```

### Option 2: Use Config File
Create `src/config.js`:
```javascript
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5104',
  signalRUrl: process.env.REACT_APP_SIGNALR_URL || 'http://localhost:5104'
};

export default config;
```

Then import and use:
```javascript
import config from '../config';
const response = await axios.get(`${config.apiUrl}/api/auctions/categories`);
```

This makes it easier to change the API URL in one place and supports different environments (development, staging, production).

## Note
The `authService.js` already uses `process.env.REACT_APP_API_URL` with a fallback to `http://localhost:5000`. This is the recommended pattern that should be followed across all API calls.
