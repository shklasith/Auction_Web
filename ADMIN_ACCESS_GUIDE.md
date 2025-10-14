# 🔐 Admin Dashboard Access Guide

## Quick Access Steps

### Step 1: Create/Update an Admin User

You have **3 options** to create an admin account:

---

#### **Option A: Update Existing User via MySQL (Fastest)**

1. Open a terminal and connect to MySQL:
```bash
mysql -u auctionuser -p
# Password: Shklasith@098765
```

2. Run this SQL command to make an existing user an admin:
```sql
USE auction;

-- See all users
SELECT Id, UserName, Email, FullName, Role FROM AspNetUsers;

-- Update a user to Administrator role (Role = 2)
UPDATE AspNetUsers 
SET Role = 2 
WHERE Email = 'your-email@example.com';
-- Replace 'your-email@example.com' with your actual email

-- Verify the change
SELECT Id, UserName, Email, FullName, Role FROM AspNetUsers WHERE Role = 2;
```

---

#### **Option B: Register a New Admin Account**

1. Make sure both servers are running (backend and frontend)
2. Go to: `http://localhost:3000/register`
3. Fill in the registration form:
   - **Username**: admin
   - **Email**: admin@example.com
   - **Full Name**: Admin User
   - **Password**: Admin@123
   - **Confirm Password**: Admin@123
   - **Role**: Select "Administrator" (if available in UI)

4. If role selection is not in the UI, register normally, then use Option A to update the role via MySQL.

---

#### **Option C: Use MySQL Direct Insert**

```sql
USE auction;

-- First, you'll need a password hash. Register any user first, then update their role.
-- OR create directly (complex due to password hashing)
```

---

### Step 2: Login as Admin

1. Go to: `http://localhost:3000/login`
2. Enter your admin credentials
3. Click "Login"
4. You'll be automatically redirected to the admin dashboard

---

### Step 3: Access Admin Dashboard

After logging in as an admin, you have several ways to access the admin dashboard:

1. **Direct URL**: `http://localhost:3000/admin/dashboard`
2. **Via Header Navigation**: 
   - Click on your profile dropdown (top-right)
   - Click "Admin Panel"

---

## 🎯 Admin Dashboard Features

Once logged in, you'll have access to:

- **📊 Dashboard**: Real-time statistics, charts, and system health
  - URL: `http://localhost:3000/admin/dashboard`
  
- **👤 Admin Profile**: Manage your admin profile and view activity logs
  - URL: `http://localhost:3000/admin/profile`

- **👥 User Management**: View and manage all users (if implemented)

- **📈 Statistics**: System-wide analytics and reports

- **📝 Activity Logs**: Track all admin actions

---

## 🚨 Troubleshooting

### Issue: "Access Denied" or redirected to login

**Solution**: Make sure your user's Role is set to `2` (Administrator) in the database.

```sql
-- Check your role
USE auction;
SELECT Email, Role FROM AspNetUsers WHERE Email = 'your-email@example.com';

-- If Role is not 2, update it
UPDATE AspNetUsers SET Role = 2 WHERE Email = 'your-email@example.com';
```

### Issue: Can't see "Admin Panel" in dropdown

**Solution**: 
1. Clear browser cache (Cmd + Shift + R on Mac)
2. Log out and log back in
3. Verify your role is set to Administrator (2) in database

### Issue: 404 Not Found on admin routes

**Solution**: Make sure the React frontend is running on `http://localhost:3000`

---

## 📝 Role Values Reference

- `0` = Buyer (default)
- `1` = Seller
- `2` = Administrator

---

## ⚡ Quick Command for Admin Access

Run this one-liner after registering a user:

```bash
mysql -u auctionuser -pShklasith@098765 auction -e "UPDATE AspNetUsers SET Role = 2 WHERE Email = 'your-email@example.com';"
```

Replace `your-email@example.com` with your actual email address.

---

## 🎉 You're All Set!

Once you have admin access, visit:
**http://localhost:3000/admin/dashboard**

Enjoy managing your auction platform! 🚀

