# Authentication Quick Start Guide

## 🚀 Getting Started

### Step 1: Start the Backend
```bash
cd Auction_Web
dotnet run
```
The backend should be running on `http://localhost:5000`

### Step 2: Start the Frontend
```bash
cd auction-frontend
npm install  # if not already installed
npm start
```
The frontend will open at `http://localhost:3000`

## 📋 Test the Authentication System

### Test User Registration:
1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - Username: `testbuyer`
   - Email: `buyer@test.com`
   - Full Name: `Test Buyer`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
   - Account Type: `Buyer`
3. Click "Create Account"
4. You should be automatically logged in and redirected to home

### Test User Login:
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Username or Email: `testbuyer` or `buyer@test.com`
   - Password: `Test123!`
3. Click "Sign In"
4. You should be logged in and see your username in the header

### Test Profile Management:
1. Click on your username in the header
2. Select "My Profile"
3. Click "Edit Profile" to update your information
4. Click "Change Password" to change your password
5. Upload a profile image (optional)

### Test Role-Based Access:
1. Try accessing `/create-auction` as a Buyer (should redirect to home)
2. Register as a Seller and try again (should work)

### Test Protected Routes:
1. Logout
2. Try accessing `/profile` (should redirect to login)
3. Login again
4. Access `/profile` (should work)

## 🔑 Default User Roles

### Buyer Account:
- Can browse auctions
- Can place bids
- Can add items to watchlist
- **Cannot** create auctions

### Seller Account:
- All Buyer features
- **Can** create auctions
- View their auction listings

### Administrator Account:
- All Seller features
- Access to Admin Panel
- Manage users
- Manage all auctions

## 🎯 Key Features

### Available Routes:
- `/` - Home page (public)
- `/auctions` - Browse auctions (public)
- `/auction/:id` - Auction details (public)
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/profile` - User profile (protected)
- `/watchlist` - User watchlist (protected)
- `/create-auction` - Create auction (Seller/Admin only)

### Header Features:
**When Logged Out:**
- Login button
- Sign Up button

**When Logged In:**
- Username dropdown with:
  - User info card
  - My Profile link
  - My Auctions link
  - My Bids link
  - Admin Panel (if admin)
  - Logout button

## 🔧 Configuration

### Frontend API URL:
File: `auction-frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### For Production:
Update the `.env` file with your production API URL:
```env
REACT_APP_API_URL=https://your-domain.com/api
```

## 📝 Code Examples

### Using Authentication in Components:
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated() ? (
        <>
          <h1>Welcome, {user.fullName}!</h1>
          {isSeller() && <button>Create Auction</button>}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Please Login</Link>
      )}
    </div>
  );
}
```

### Creating a Protected Route:
```javascript
<Route 
  path="/my-page" 
  element={
    <PrivateRoute requiredRole="Seller">
      <MyPage />
    </PrivateRoute>
  } 
/>
```

## 🐛 Troubleshooting

### Issue: Can't login
**Check:**
- Is the backend running?
- Is the API URL correct in `.env`?
- Check browser console for errors
- Verify user credentials are correct

### Issue: 404 on API calls
**Solution:**
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify `REACT_APP_API_URL` in `.env`

### Issue: Token expired
**Solution:**
- Logout and login again
- Token is automatically refreshed on app load

### Issue: Can't upload profile image
**Solution:**
- Check backend ImageService configuration
- Verify `wwwroot/images/profiles` folder exists
- Check file size and format (should be image files)

## ✅ Feature Checklist

After implementation, verify:
- [x] User can register
- [x] User can login
- [x] User can logout
- [x] User can view profile
- [x] User can edit profile
- [x] User can change password
- [x] User can upload profile image
- [x] Protected routes work
- [x] Role-based access control works
- [x] Header shows correct UI based on auth state
- [x] JWT token persists across page refreshes
- [x] Token automatically attached to API requests

## 🎉 What's Next?

Now that authentication is complete, you can:
1. Connect profile auctions/bids tabs to real API
2. Implement auction creation with user authentication
3. Add user authentication to bidding system
4. Implement watchlist with user data
5. Add admin panel for user management

## 📞 Support

For issues or questions:
1. Check the comprehensive documentation in `AUTHENTICATION_IMPLEMENTATION.md`
2. Review the API documentation in `API_DOCUMENTATION.md`
3. Check browser console for detailed error messages
4. Verify backend logs for API issues

---

**Authentication system is fully implemented and ready to use!** 🚀

