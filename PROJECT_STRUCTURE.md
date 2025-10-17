# Complete Project Structure Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Database Structure](#database-structure)
- [File Organization](#file-organization)

---

## 🎯 Overview

This is a full-stack **Online Auction Platform** built with modern web technologies. The application allows users to create auctions, place bids in real-time, manage watchlists, and includes comprehensive admin functionality.

### Key Features
- Real-time bidding with SignalR/WebSocket
- JWT-based authentication
- Admin dashboard with analytics
- Social media integration
- Payment processing
- Watchlist management
- Responsive modern UI

---

## 🛠️ Technology Stack

### Backend
- **Framework**: ASP.NET Core 9.0 (C#)
- **Database**: MySQL 8.0+ with Entity Framework Core
- **Authentication**: ASP.NET Identity + JWT
- **Real-time**: SignalR
- **ORM**: Entity Framework Core 9.0
- **Key Libraries**:
  - Pomelo.EntityFrameworkCore.MySql
  - Microsoft.AspNetCore.Authentication.JwtBearer
  - Microsoft.AspNetCore.SignalR
  - System.IdentityModel.Tokens.Jwt

### Frontend
- **Framework**: React 19.1.1
- **UI Library**: React Bootstrap 2.10.10 + Bootstrap 5.3.8
- **Routing**: React Router DOM 7.8.2
- **HTTP Client**: Axios 1.12.2
- **Real-time**: SignalR Client 9.0.6
- **Icons**: FontAwesome 7.0.1
- **Date Handling**: Moment.js 2.30.1
- **Testing**: React Testing Library + Jest

---

## 🏗️ Project Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   React SPA     │ ←─────→ │  ASP.NET Core    │ ←─────→ │    MySQL     │
│   (Frontend)    │  REST   │     Web API      │   EF    │   Database   │
│                 │  + WSS  │   (Backend)      │  Core   │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
        ↑                            ↑
        │                            │
   Port 3000                    Port 5103
```

### Communication Flow
1. **HTTP/HTTPS**: REST API calls for CRUD operations
2. **WebSocket**: Real-time bidding updates via SignalR
3. **JWT**: Token-based authentication
4. **Proxy**: Frontend proxies API requests to backend

---

## 🔧 Backend Structure

### Root Directory: `/Auction_Web`

```
Auction_Web/
├── 📄 Program.cs                    # Application entry point & configuration
├── 📄 Auction_Web.csproj           # Project file with dependencies
├── 📄 appsettings.json             # Production configuration
├── 📄 appsettings.Development.json # Development configuration
├── 📄 AuctionWeb.db               # SQLite fallback database
│
├── 📁 Controllers/                 # API Controllers (MVC)
│   ├── AdminController.cs         # Admin management endpoints
│   ├── AuctionsController.cs      # Auction CRUD operations
│   ├── AuthController.cs          # Authentication API
│   ├── AuthWebController.cs       # Web-based auth
│   ├── BiddingController.cs       # Bidding operations
│   ├── HomeController.cs          # Home page controller
│   ├── ReportsController.cs       # Analytics & reports
│   └── SocialMediaController.cs   # Social media integration
│
├── 📁 Models/                      # Data Models & Entities
│   ├── Auction.cs                 # Auction entity
│   ├── AuctionImage.cs            # Auction images
│   ├── AuctionView.cs             # View tracking
│   ├── Bid.cs                     # Bid entity
│   ├── User.cs                    # User entity (Identity)
│   ├── WatchlistItem.cs           # Watchlist
│   ├── Transaction.cs             # Transaction records
│   ├── PaymentRecord.cs           # Payment tracking
│   ├── SocialShare.cs             # Social sharing
│   ├── SocialMediaModels.cs       # Social media models
│   ├── AdminModels.cs             # Admin-specific models
│   ├── SupportingModels.cs        # Helper models
│   ├── ErrorViewModel.cs          # Error handling
│   └── DTOs/                      # Data Transfer Objects
│       ├── AdminDtos.cs           # Admin DTOs
│       ├── AuctionDtos.cs         # Auction DTOs
│       ├── AuthDtos.cs            # Auth DTOs
│       ├── ReportingDtos.cs       # Reporting DTOs
│       └── SocialMediaDtos.cs     # Social media DTOs
│
├── 📁 Data/                        # Database Context
│   └── ApplicationDbContext.cs    # EF Core DbContext
│
├── 📁 Services/                    # Business Logic Layer
│   ├── AdminService.cs            # Admin operations
│   ├── AuctionService.cs          # Auction business logic
│   ├── AuctionStatusUpdateService.cs # Status management
│   ├── AuctionTimerService.cs     # Timer/scheduling
│   ├── AuthService.cs             # Authentication logic
│   ├── BiddingService.cs          # Bidding logic
│   ├── ImageService.cs            # Image handling
│   ├── ReportingService.cs        # Analytics generation
│   └── SocialMediaService.cs      # Social media ops
│
├── 📁 Hubs/                        # SignalR Real-time Hubs
│   └── BiddingHub.cs              # Real-time bidding hub
│
├── 📁 Migrations/                  # EF Core Migrations
│   ├── 20250922202758_InitialMySQLMigration.cs
│   ├── 20251014213325_SyncDatabase.cs
│   └── ApplicationDbContextModelSnapshot.cs
│
├── 📁 Views/                       # Razor Views (if using MVC)
│   ├── Auth/                      # Authentication views
│   ├── Home/                      # Home views
│   ├── Shared/                    # Shared components
│   ├── _ViewImports.cshtml
│   └── _ViewStart.cshtml
│
├── 📁 wwwroot/                     # Static Files
│   ├── css/                       # Stylesheets
│   ├── js/                        # JavaScript files
│   ├── lib/                       # Third-party libraries
│   └── favicon.ico
│
├── 📁 Properties/                  # Project properties
│   └── launchSettings.json
│
├── 📁 bin/                         # Compiled binaries
└── 📁 obj/                         # Build artifacts
```

### Backend API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

#### Auctions (`/api/auctions`)
- `GET /api/auctions` - List all auctions
- `GET /api/auctions/{id}` - Get auction details
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/{id}` - Update auction
- `DELETE /api/auctions/{id}` - Delete auction
- `GET /api/auctions/category/{category}` - Filter by category

#### Bidding (`/api/bidding`)
- `POST /api/bidding/place` - Place bid
- `GET /api/bidding/auction/{id}` - Get auction bids
- `GET /api/bidding/user` - Get user's bids

#### Admin (`/api/admin`)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/auctions` - Manage auctions

#### Reports (`/api/reports`)
- `GET /api/reports/analytics` - Get analytics
- `GET /api/reports/revenue` - Revenue reports
- `GET /api/reports/users` - User statistics

#### Social Media (`/api/social`)
- `POST /api/social/share` - Share auction
- `GET /api/social/shares/{id}` - Get shares

---

## ⚛️ Frontend Structure

### Root Directory: `/auction-frontend`

```
auction-frontend/
├── 📄 package.json                 # Dependencies & scripts
├── 📄 README.md                    # Frontend documentation
│
├── 📁 public/                      # Public static assets
│   ├── index.html                 # HTML template
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── 📁 src/                         # Source code
│   ├── 📄 index.js                # Application entry point
│   ├── 📄 index.css               # Global styles
│   ├── 📄 App.js                  # Main App component
│   ├── 📄 App.css                 # App styles
│   ├── 📄 setupTests.js           # Test configuration
│   ├── 📄 reportWebVitals.js      # Performance monitoring
│   │
│   ├── 📁 components/             # Reusable Components
│   │   ├── Header.js              # Navigation header
│   │   ├── Footer.js              # Footer component
│   │   ├── BiddingInterface.js    # Real-time bidding UI
│   │   ├── BiddingInterface.css   # Bidding styles
│   │   └── PrivateRoute.js        # Protected route wrapper
│   │
│   ├── 📁 pages/                  # Page Components
│   │   ├── Home.js                # Home page
│   │   ├── Login.js               # Login page
│   │   ├── Register.js            # Registration page
│   │   ├── Profile.js             # User profile
│   │   ├── AuctionList.js         # Auction listings
│   │   ├── AuctionDetail.js       # Auction detail view
│   │   ├── CreateAuction.js       # Create auction form
│   │   ├── CategoryPage.js        # Category filtering
│   │   ├── Watchlist.js           # User watchlist
│   │   └── admin/                 # Admin Pages
│   │       ├── AdminDashboard.js  # Admin dashboard
│   │       └── AdminProfile.js    # Admin profile
│   │
│   ├── 📁 context/                # React Context (State Management)
│   │   └── AuthContext.js         # Authentication context
│   │
│   ├── 📁 services/               # API Service Layer
│   │   ├── authService.js         # Auth API calls
│   │   ├── BiddingService.js      # Bidding API calls
│   │   └── adminService.js        # Admin API calls
│   │
│   ├── 📁 hooks/                  # Custom React Hooks
│   │   └── useAnimations.js       # Animation hooks
│   │
│   └── 📁 styles/                 # Stylesheets
│       ├── Auth.css               # Authentication styles
│       ├── Profile.css            # Profile styles
│       ├── animations.css         # Animation definitions
│       └── admin/                 # Admin styles
│
└── 📁 build/                       # Production build output
```

### Frontend Component Hierarchy

```
App.js
├── AuthContext.Provider
│   ├── Header
│   │   └── Navigation Links
│   │
│   ├── Routes
│   │   ├── / (Home)
│   │   ├── /login (Login)
│   │   ├── /register (Register)
│   │   ├── /auctions (AuctionList)
│   │   ├── /auction/:id (AuctionDetail)
│   │   │   └── BiddingInterface
│   │   ├── /create-auction (CreateAuction) [Protected]
│   │   ├── /profile (Profile) [Protected]
│   │   ├── /watchlist (Watchlist) [Protected]
│   │   ├── /category/:name (CategoryPage)
│   │   └── /admin/* (Admin) [Protected + Admin Role]
│   │       ├── /admin/dashboard (AdminDashboard)
│   │       └── /admin/profile (AdminProfile)
│   │
│   └── Footer
```

### Frontend Services

#### authService.js
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user
- `getProfile()` - Fetch user profile
- `updateProfile(data)` - Update profile

#### BiddingService.js
- `connectToBiddingHub()` - WebSocket connection
- `placeBid(auctionId, amount)` - Place bid
- `getBids(auctionId)` - Get auction bids
- `subscribeToBidUpdates(callback)` - Real-time updates

#### adminService.js
- `getDashboardStats()` - Get statistics
- `getUsers()` - List all users
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user
- `getAuctions()` - Manage auctions

---

## 🗄️ Database Structure

### Database: `auction_web` (MySQL)

#### Core Tables

**AspNetUsers** - User Accounts
```sql
- Id (PK)
- UserName
- Email
- PasswordHash
- PhoneNumber
- FirstName
- LastName
- Address
- DateJoined
- ProfilePicture
```

**Auctions** - Auction Listings
```sql
- Id (PK)
- Title
- Description
- Category
- StartingPrice
- CurrentPrice
- StartTime
- EndTime
- Status (Active/Closed/Cancelled)
- SellerId (FK -> AspNetUsers)
- WinnerBidId (FK -> Bids)
- ImageUrl
- CreatedAt
- UpdatedAt
```

**Bids** - Bid Records
```sql
- Id (PK)
- AuctionId (FK -> Auctions)
- BidderId (FK -> AspNetUsers)
- Amount
- BidTime
- IsWinning
```

**WatchlistItems** - User Watchlists
```sql
- Id (PK)
- UserId (FK -> AspNetUsers)
- AuctionId (FK -> Auctions)
- AddedAt
```

**Transactions** - Transaction History
```sql
- Id (PK)
- AuctionId (FK -> Auctions)
- BuyerId (FK -> AspNetUsers)
- SellerId (FK -> AspNetUsers)
- Amount
- Status
- TransactionDate
```

**PaymentRecords** - Payment Processing
```sql
- Id (PK)
- TransactionId (FK -> Transactions)
- PaymentMethod
- PaymentStatus
- ProcessedAt
```

**AuctionImages** - Multiple Images
```sql
- Id (PK)
- AuctionId (FK -> Auctions)
- ImageUrl
- IsPrimary
- UploadedAt
```

**AuctionViews** - View Tracking
```sql
- Id (PK)
- AuctionId (FK -> Auctions)
- UserId (FK -> AspNetUsers)
- ViewedAt
- IpAddress
```

**SocialShares** - Social Media Shares
```sql
- Id (PK)
- AuctionId (FK -> Auctions)
- UserId (FK -> AspNetUsers)
- Platform (Facebook/Twitter/etc)
- SharedAt
```

#### Identity Tables (ASP.NET)
- AspNetRoles
- AspNetUserRoles
- AspNetUserClaims
- AspNetUserLogins
- AspNetRoleClaims
- AspNetUserTokens

---

## 📂 File Organization

### Configuration Files

#### Backend Configuration
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "MySQL connection string"
  },
  "Jwt": {
    "Secret": "JWT secret key",
    "Issuer": "API issuer",
    "Audience": "API audience",
    "ExpirationMinutes": 60
  },
  "Logging": { ... },
  "AllowedHosts": "*"
}
```

#### Frontend Configuration
```json
// package.json
{
  "name": "auction-frontend",
  "version": "0.1.0",
  "proxy": "http://localhost:5103",
  "dependencies": { ... },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
```

### Startup Scripts

**Backend**
```bash
#!/bin/bash
# start_backend.sh
cd Auction_Web
dotnet restore
dotnet run
```

**Frontend**
```bash
#!/bin/bash
# start_frontend.sh
cd auction-frontend
npm install
npm start
```

**Both (Concurrent)**
```bash
#!/bin/bash
# start_both.sh
./start_backend.sh &
./start_frontend.sh &
wait
```

### Database Scripts

**Database Setup**
```bash
#!/bin/bash
# database/setup_database.sh
mysql -u root -p < database/schema.sql
mysql -u root -p auction_web < database/seed_data.sql
```

**Migrations**
```bash
# Create migration
dotnet ef migrations add MigrationName

# Apply migration
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName
```

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based auth
- **ASP.NET Identity**: Built-in user management
- **Password Policies**: Strong password requirements
- **Role-based Access**: Admin, User roles
- **Protected Routes**: Frontend route guards

### Security Best Practices
- HTTPS in production
- SQL injection prevention (EF Core)
- XSS protection (React sanitization)
- CORS configuration
- Request validation
- File upload validation

---

## 🚀 Deployment Structure

### Development Environment
- **Backend**: http://localhost:5103
- **Frontend**: http://localhost:3000
- **Database**: localhost:3306

### Production Deployment
```
┌─────────────────────────────────────┐
│          Load Balancer              │
└─────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐         ┌───▼────┐
│  Web   │         │  API   │
│ Server │         │ Server │
│ (React)│         │ (.NET) │
└────────┘         └────┬───┘
                        │
                   ┌────▼────┐
                   │  MySQL  │
                   │Database │
                   └─────────┘
```

---

## 📊 Project Statistics

### Backend
- **Controllers**: 8
- **Models**: 15+
- **Services**: 9
- **DTOs**: 5 files
- **Migrations**: 2
- **Language**: C# (.NET 9.0)

### Frontend
- **Pages**: 10+
- **Components**: 5
- **Services**: 3
- **Contexts**: 1
- **Custom Hooks**: 1
- **Language**: JavaScript (React 19)

### Database
- **Tables**: 15+
- **Relationships**: Complex with FKs
- **Database**: MySQL 8.0+

---

## 📝 Key Documentation Files

- `README.md` - General project overview
- `HOW_TO_RUN.md` - Setup and run instructions
- `API_DOCUMENTATION.md` - API endpoint documentation
- `DATABASE_CONNECTION_README.md` - Database setup
- `AUTHENTICATION_QUICKSTART.md` - Auth implementation
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `ADMIN_ACCESS_GUIDE.md` - Admin features
- `SOCIAL_MEDIA_INTEGRATION_DOCUMENTATION.md` - Social features
- `REPORTING_ANALYTICS_API_DOCUMENTATION.md` - Analytics
- `MODERN_UI_DOCUMENTATION.md` - UI/UX guide

---

## 🔄 Data Flow

### Creating an Auction
1. User fills form in `CreateAuction.js`
2. Form data sent to `/api/auctions` (POST)
3. `AuctionsController` validates data
4. `AuctionService` handles business logic
5. EF Core saves to MySQL database
6. `ImageService` processes images
7. Response sent back to frontend
8. UI updates with new auction

### Real-time Bidding
1. User connects via `BiddingService.js`
2. SignalR hub connection established
3. User places bid through `BiddingInterface`
4. Bid sent to `BiddingHub.cs`
5. `BiddingService` validates bid
6. Database updated
7. Hub broadcasts to all connected clients
8. UI updates in real-time for all users

### Authentication Flow
1. User enters credentials in `Login.js`
2. `authService.login()` calls `/api/auth/login`
3. `AuthController` validates credentials
4. `AuthService` generates JWT token
5. Token returned to frontend
6. Token stored in localStorage
7. `AuthContext` updates application state
8. Protected routes become accessible

---

## 🛠️ Development Workflow

### Backend Development
1. Create/modify models in `/Models`
2. Update `ApplicationDbContext` if needed
3. Create migration: `dotnet ef migrations add Name`
4. Update database: `dotnet ef database update`
5. Implement business logic in `/Services`
6. Add controller endpoints in `/Controllers`
7. Test API with Postman/Swagger

### Frontend Development
1. Create/modify components in `/components` or `/pages`
2. Add styles in `/styles`
3. Implement API calls in `/services`
4. Update routing in `App.js`
5. Test in browser
6. Build for production: `npm run build`

---

## 📦 Build & Run

### Prerequisites
- .NET 9.0 SDK
- Node.js 16+
- MySQL 8.0+
- Git

### Quick Start
```bash
# 1. Clone repository
git clone <repository-url>

# 2. Setup database
cd database
./setup_database.sh

# 3. Backend setup
cd ../Auction_Web
dotnet restore
dotnet ef database update
dotnet run

# 4. Frontend setup (new terminal)
cd ../auction-frontend
npm install
npm start

# Or run both together
./start_both.sh
```

---

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts for bids
- [ ] Advanced search with filters
- [ ] Auction recommendations
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Chat system between users
- [ ] Auction history export
- [ ] Advanced analytics dashboard

---

*Last Updated: October 15, 2025*

