# Quick Fix: Network Error on Account Creation

## The Problem
You're seeing a "Network Error" message when trying to create an account because **the backend server is not running**.

## The Solution (3 Easy Steps)

### Step 1: Start the Backend Server
Open a terminal and run:
```bash
./start_backend.sh
```

OR manually:
```bash
cd Auction_Web
dotnet run
```

Wait until you see: `Now listening on: http://localhost:5104`

### Step 2: Start the Frontend Server
Open a **NEW** terminal (keep backend running) and run:
```bash
./start_frontend.sh
```

OR manually:
```bash
cd auction-frontend
npm start
```

Wait until it opens your browser to http://localhost:3000

### Step 3: Try Creating Account Again
Now go to http://localhost:3000/register and try creating an account.

---

## One-Command Solution
Start both servers at once:
```bash
./start_both.sh
```

---

## Verify Everything is Working
Run the diagnostic script:
```bash
./check_setup.sh
```

You should see:
- ✅ Backend is running on port 5104
- ✅ Frontend is running on port 3000
- ✅ API URL is correctly set

---

## Still Having Issues?

### Check Browser Console
1. Press F12 to open Developer Tools
2. Go to the "Console" tab
3. Try creating an account again
4. Look for error messages

### Common Error Messages and Fixes

**"ERR_CONNECTION_REFUSED"**
- Backend is not running → Start backend server

**"Network Error"**
- Backend is not running → Start backend server
- Wrong port → Check .env file has `REACT_APP_API_URL=http://localhost:5104/api`

**"CORS Error"**
- Backend needs to be restarted → Restart backend server

**"404 Not Found"**
- API endpoint doesn't exist → Check backend is running properly

---

## Testing With Sample Data

Once both servers are running, try registering with:
- **Username:** john_doe
- **Email:** john@example.com
- **Full Name:** John Doe
- **Password:** Test123!
- **Confirm Password:** Test123!
- **Account Type:** Buyer or Seller

---

## Technical Details

The error occurs because:
1. Frontend (React) runs on port **3000**
2. Backend (ASP.NET) runs on port **5104**
3. Frontend tries to call `http://localhost:5104/api/auth/register`
4. If backend isn't running, the request fails with "Network Error"

The fix is simple: **Make sure BOTH servers are running!**
