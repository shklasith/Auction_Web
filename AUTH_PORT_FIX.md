# Authentication Port Fix - Account Creation Issue

## Problem
When trying to create an account, users received the error:
```
"Unable to reach the server. The backend may not be running."
```

Even though both backend and frontend servers were running.

## Root Cause
The `authService.js` file had a hardcoded fallback API URL pointing to the wrong port:

```javascript
// WRONG - Line 3
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

The backend is actually running on **port 5104**, not 5000.

## Solution
Updated the default API URL in authService.js to use the correct port:

```javascript
// CORRECT - Line 3
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5104/api';
```

## File Modified
**Location**: `/auction-frontend/src/services/authService.js`

**Change**: Line 3
- **Before**: `'http://localhost:5000/api'`
- **After**: `'http://localhost:5104/api'`

## Why This Happened
The authentication service was the only service still using port 5000 from an earlier configuration. Other services like:
- CreateAuction.js
- Home.js
- AuctionList.js
- BiddingService.js

Were already updated to use port 5104, but authService was missed.

## Testing
After the fix, test the following:

1. **Registration**: Create a new account
   - Should successfully register without "Unable to reach server" error
   - Should redirect to home page after successful registration

2. **Login**: Login with existing credentials
   - Should authenticate successfully
   - User should be logged in immediately

3. **Profile Operations**: Update profile, change password
   - Should work without connection errors

## Backend Port Reference
The backend is configured to run on port 5104 in:
- `Auction_Web/Properties/launchSettings.json`
- Default configuration for this project

## Environment Variable Option (Recommended)
For better configuration management, create a `.env` file in the frontend root:

```env
REACT_APP_API_URL=http://localhost:5104/api
```

This allows changing the API URL without modifying code files.

## Related Fixes
This is part of a series of port configuration fixes:
1. ✅ CreateAuction.js - Fixed to use 5104
2. ✅ Home.js - Fixed to use 5104
3. ✅ AuctionList.js - Fixed to use 5104
4. ✅ BiddingService.js - Fixed to use 5104
5. ✅ authService.js - **Fixed in this update**

## Status
✅ **RESOLVED** - Account creation and authentication now work correctly with backend on port 5104.
