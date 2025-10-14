# Authentication System Implementation

## Overview
This document describes the complete frontend authentication system that has been implemented for the Auction Web application.

## ✅ Features Implemented

### 1. **User Authentication**
- User Registration (Buyers, Sellers)
- User Login (with JWT token)
- User Logout
- Remember Me functionality
- Persistent authentication (localStorage)

### 2. **User Profile Management**
- View user profile with detailed information
- Edit profile (name, email, phone, address)
- Upload profile image
- Change password functionality
- View user statistics (rating, total sales, member since)

### 3. **Role-Based Access Control**
- **Buyer**: Can browse and bid on auctions
- **Seller**: Can create auctions in addition to buyer features
- **Administrator**: Full access to all features including admin panel

### 4. **Protected Routes**
- Profile page (requires authentication)
- Watchlist (requires authentication)
- Create Auction (requires Seller or Administrator role)
- Automatic redirect to login for unauthenticated users

### 5. **UI Components**
- Login page with form validation
- Registration page with role selection
- Updated Header with authentication status
- User dropdown menu with profile actions
- Profile page with tabs and modals

## 📁 Files Created/Modified

### New Files Created:
```
auction-frontend/src/
├── services/
│   └── authService.js          # API calls for authentication
├── context/
│   └── AuthContext.js          # Global authentication state management
├── components/
│   └── PrivateRoute.js         # Protected route wrapper component
├── pages/
│   ├── Login.js                # Login page
│   └── Register.js             # Registration page
└── .env                        # API configuration
```

### Modified Files:
```
auction-frontend/src/
├── App.js                      # Added AuthProvider and new routes
├── components/
│   └── Header.js               # Added authentication UI
└── pages/
    └── Profile.js              # Connected to real authentication data
```

## 🔧 API Integration

### AuthService Methods:
- `register(userData)` - Register new user
- `login(credentials)` - Login user and get JWT token
- `getProfile()` - Fetch current user profile
- `updateProfile(formData)` - Update user profile
- `changePassword(passwordData)` - Change user password
- `logout()` - Clear authentication data

### Token Management:
- JWT tokens stored in localStorage
- Automatically attached to API requests via interceptor
- Token refresh on app initialization
- Automatic logout on invalid/expired token

## 🎨 User Interface

### Login Page (`/login`)
- Username or Email input
- Password input
- Remember Me checkbox
- Link to registration page
- Error message display

### Registration Page (`/register`)
- Username, Email, Full Name (required)
- Password and Confirm Password (min 6 chars)
- Role selection (Buyer/Seller)
- Phone Number and Address (optional)
- Link to login page
- Form validation and error display

### Profile Page (`/profile`)
**Tabs:**
1. **Overview** - Personal information and account settings
2. **My Auctions** - User's created auctions (seller only)
3. **My Bids** - User's active bids

**Features:**
- Display profile image or default avatar
- Edit profile modal with form
- Change password modal
- Show user statistics (rating, sales, member date)
- Role badge display

### Header Navigation
**When Authenticated:**
- Display username in dropdown
- User info card in dropdown menu
- Links to Profile, My Auctions, My Bids
- Admin Panel link (for administrators)
- Logout button
- Conditional "Sell Item" link (sellers only)

**When Not Authenticated:**
- Login button
- Sign Up button
- No protected features visible

## 🔐 Security Features

1. **JWT Token Authentication**
   - Secure token storage
   - Automatic token attachment to requests
   - Token validation on protected routes

2. **Role-Based Authorization**
   - Route protection based on user roles
   - Conditional UI rendering based on permissions
   - Server-side validation (backend already implemented)

3. **Form Validation**
   - Client-side validation
   - Password confirmation matching
   - Email format validation
   - Minimum password length (6 characters)

4. **Automatic Logout**
   - On token expiration
   - On invalid token response
   - Manual logout option

## 🚀 Usage

### For Developers:

#### Using Authentication Context:
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, isSeller, isAdmin } = useAuth();
  
  // Check if user is authenticated
  if (isAuthenticated()) {
    console.log('User:', user);
  }
  
  // Check user role
  if (isSeller()) {
    // Show seller features
  }
}
```

#### Creating Protected Routes:
```javascript
<Route 
  path="/protected" 
  element={
    <PrivateRoute requiredRole="Seller">
      <YourComponent />
    </PrivateRoute>
  } 
/>
```

#### Using Auth Service Directly:
```javascript
import authService from '../services/authService';

// Check authentication
if (authService.isAuthenticated()) {
  const user = authService.getUser();
}

// API calls
const result = await authService.login({ usernameOrEmail, password });
```

### For Users:

#### Registration:
1. Navigate to `/register`
2. Fill in required information
3. Select account type (Buyer/Seller)
4. Submit form
5. Automatically logged in and redirected

#### Login:
1. Navigate to `/login`
2. Enter username/email and password
3. Optionally check "Remember Me"
4. Submit form
5. Redirected based on role

#### Profile Management:
1. Click username in header dropdown
2. Select "My Profile"
3. View information in Overview tab
4. Click "Edit Profile" to update information
5. Click "Change Password" to update password

## 🔄 Authentication Flow

### Login Flow:
```
1. User enters credentials
2. AuthService.login() sends POST to /api/auth/login
3. Backend validates and returns JWT token + user data
4. Token stored in localStorage
5. User data stored in AuthContext
6. User redirected to home/dashboard
7. Token attached to all subsequent API requests
```

### Registration Flow:
```
1. User fills registration form
2. AuthService.register() sends POST to /api/auth/register
3. Backend creates user and returns JWT token
4. Same as login flow steps 4-7
```

### Authentication Check Flow:
```
1. App loads
2. AuthContext checks localStorage for token
3. If token exists, fetch user profile
4. Update context with user data
5. If token invalid, clear and show login
```

## 🔗 Backend Integration

### API Endpoints Used:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Backend Requirements:
✅ All endpoints already implemented in backend
✅ JWT token generation configured
✅ User roles (Buyer, Seller, Administrator)
✅ Profile image upload support
✅ Password change functionality

## 📝 Environment Configuration

Create `.env` file in `auction-frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Production:**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🧪 Testing

### Manual Testing Checklist:

**Registration:**
- [ ] Register as Buyer
- [ ] Register as Seller
- [ ] Validate password matching
- [ ] Check duplicate username/email validation
- [ ] Verify automatic login after registration

**Login:**
- [ ] Login with username
- [ ] Login with email
- [ ] Test "Remember Me" functionality
- [ ] Verify invalid credentials error
- [ ] Check automatic redirect after login

**Profile:**
- [ ] View profile information
- [ ] Edit profile details
- [ ] Upload profile image
- [ ] Change password
- [ ] Verify role-specific features

**Protected Routes:**
- [ ] Access protected route when logged out (redirects to login)
- [ ] Access seller route as buyer (redirects to home)
- [ ] Access protected routes when logged in (works)

**Logout:**
- [ ] Logout functionality
- [ ] Verify token cleared
- [ ] Verify redirect to home
- [ ] Confirm can't access protected routes after logout

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:** Ensure backend is running and REACT_APP_API_URL is correct

### Issue: "401 Unauthorized on protected routes"
**Solution:** Check if token is valid and not expired. Try logging in again.

### Issue: "Profile image not uploading"
**Solution:** Verify backend ImageService is configured and image directory exists

### Issue: "Can't access seller features as seller"
**Solution:** Verify user role in profile. May need to re-login to refresh token.

## 📚 Additional Resources

- React Context API: https://react.dev/reference/react/useContext
- React Router Protected Routes: https://reactrouter.com/
- JWT Authentication: https://jwt.io/
- Axios Interceptors: https://axios-http.com/docs/interceptors

## 🎉 Summary

The authentication system is now **fully implemented and integrated** with:
- ✅ Complete user registration and login
- ✅ JWT token-based authentication
- ✅ Role-based access control (Buyer, Seller, Administrator)
- ✅ Profile management with edit capabilities
- ✅ Password change functionality
- ✅ Protected routes
- ✅ Persistent authentication
- ✅ Responsive and user-friendly UI
- ✅ Full backend integration

**The system is production-ready and can be tested immediately!**

