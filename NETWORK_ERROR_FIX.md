# Network Error Fix for Account Creation

## Problem
When trying to create an account, a network error message appears at the top of the page.

## Root Cause
The issue occurs because:
1. The backend server is not running, or
2. The frontend is trying to connect to the wrong port
3. The React app hasn't picked up environment variable changes

## Solution

### Step 1: Verify Backend is Running
The backend should be running on port **5104** (as configured in `launchSettings.json`)

```bash
# Start the backend server
cd Auction_Web
dotnet run
```

Or use the provided script:
```bash
./start_backend.sh
```

### Step 2: Verify Frontend Environment Variables
Check that `auction-frontend/.env` has the correct API URL:

```
REACT_APP_API_URL=http://localhost:5104/api
```

### Step 3: Restart Frontend (IMPORTANT!)
After any `.env` file changes, you MUST restart the React development server:

```bash
# Stop the current frontend server (Ctrl+C)
# Then restart it:
cd auction-frontend
npm start
```

Or use the provided script:
```bash
./start_frontend.sh
```

### Step 4: Start Both Servers Together
Use the convenience script to start both servers:

```bash
./start_both.sh
```

## Verification Steps

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:5104/api/auth/register -X POST -H "Content-Type: application/json" -d '{}'
   ```
   You should see a BadRequest response (400) with validation errors, not a connection refused error.

2. **Check Frontend is Running:**
   Open browser to http://localhost:3000

3. **Check Browser Console:**
   Open browser developer tools (F12) and check the Console and Network tabs for any errors.

## Common Issues

### Issue 1: Port Already in Use
If you see "port already in use" error:
```bash
# Find process using port 5104
lsof -i :5104
# Kill the process
kill -9 <PID>
```

### Issue 2: CORS Error
If you see CORS errors in browser console, verify:
- Backend CORS policy allows `http://localhost:3000`
- Backend is running and accessible

### Issue 3: .env Changes Not Picked Up
React only reads .env files at startup. Always restart the dev server after changing .env:
```bash
# Stop server (Ctrl+C)
npm start
```

## Testing Registration

After both servers are running, try registering with these test values:
- **Username:** testuser
- **Email:** test@example.com
- **Full Name:** Test User
- **Password:** Test123! (min 6 chars)
- **Confirm Password:** Test123!
- **Role:** Buyer or Seller
- **Phone:** (optional)
- **Address:** (optional)

## API Endpoint Details

**Endpoint:** POST `/api/auth/register`
**URL:** `http://localhost:5104/api/auth/register`

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "fullName": "Test User",
  "password": "Test123!",
  "confirmPassword": "Test123!",
  "role": "Buyer",
  "phoneNumber": "",
  "address": ""
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "Buyer",
    ...
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error detail 1", "Error detail 2"]
}
```
