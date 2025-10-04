# Auction Web Application

A comprehensive real-time auction platform built with ASP.NET Core 9.0 backend and React frontend, featuring live bidding, real-time notifications, and advanced auction management capabilities.

## 🚀 Features

### Core Auction Features
- **Real-time Bidding**: Live bidding with SignalR for instant updates
- **Multiple Auction Types**: Standard, Reserve, Buy-It-Now, and Dutch auctions
- **Automatic Bid Increments**: Dynamic increments based on price ranges
- **Auction Extensions**: Anti-sniping protection with automatic extensions
- **Proxy Bidding**: Automatic bidding up to user-defined maximum amounts
- **Live Countdown Timers**: Real-time auction end time tracking

### User Management
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin, Seller, Buyer, and Moderator roles
- **User Profiles**: Comprehensive user management with ratings and transaction history
- **Watchlist**: Save and track favorite auctions

### Advanced Features
- **Image Management**: Multi-image upload and management for auction listings
- **Category System**: Hierarchical categorization with subcategories
- **Search & Filtering**: Advanced search with multiple filter options
- **Payment Integration**: Ready for payment gateway integration
- **Responsive Design**: Mobile-first responsive interface

## 🏗️ Architecture

### Backend (.NET Core 9.0)
```
Auction_Web/
├── Controllers/          # API and MVC controllers
├── Models/              # Entity models and DTOs
├── Services/            # Business logic services
├── Hubs/               # SignalR hubs for real-time communication
├── Data/               # Entity Framework DbContext
├── Views/              # MVC views (optional)
└── wwwroot/            # Static files
```

### Frontend (React)
```
auction-frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── services/      # API and SignalR services
│   ├── hooks/         # Custom React hooks
│   └── styles/        # CSS and styling files
└── public/            # Static assets
```

### Database (MySQL)
- Entity Framework Core with Code-First migrations
- ASP.NET Core Identity for user management
- Optimized indexes for performance
- Foreign key constraints for data integrity

## 🛠️ Technology Stack

### Backend
- **Framework**: ASP.NET Core 9.0
- **Database**: MySQL 8.0+ with Entity Framework Core
- **Authentication**: JWT Bearer tokens with ASP.NET Core Identity
- **Real-time**: SignalR for live bidding and notifications
- **ORM**: Entity Framework Core with MySQL provider

### Frontend
- **Framework**: React 19.1.1
- **UI Library**: React Bootstrap 5.3.8
- **Real-time**: SignalR JavaScript client
- **HTTP Client**: Axios for API communication
- **Routing**: React Router DOM
- **Styling**: Bootstrap with custom CSS

### Key Dependencies

#### Backend NuGet Packages
```xml
<PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.1.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="9.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="9.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="9.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.0.2" />
```

#### Frontend NPM Packages
```json
{
  "@microsoft/signalr": "^9.0.6",
  "react": "^19.1.1",
  "react-bootstrap": "^2.10.10",
  "axios": "^1.11.0",
  "react-router-dom": "^7.8.2",
  "moment": "^2.30.1"
}
```

## 📋 Prerequisites

- **.NET 9.0 SDK**
- **Node.js 18+** and npm
- **MySQL 8.0+**
- **Visual Studio 2022** or **JetBrains Rider** (recommended)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd auction-web-project
```

### 2. Database Setup

#### Option A: MySQL Setup (Recommended)
1. Install MySQL 8.0 or higher
2. Create a new database:
```sql
CREATE DATABASE auction_web;
```

3. Update connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web;User=root;Password=your_password;"
  }
}
```

#### Option B: Use Setup Script
```bash
chmod +x setup_mysql.sh
./setup_mysql.sh
```

### 3. Backend Setup
```bash
cd Auction_Web

# Restore NuGet packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the application
dotnet run
```

The backend will be available at `https://localhost:7049`

### 4. Frontend Setup
```bash
cd auction-frontend

# Install npm packages
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Core Entities

#### Users (ASP.NET Identity Extended)
- User authentication and profile management
- Role-based access control
- User ratings and transaction history

#### Auctions
- Comprehensive auction information
- Multiple auction types and statuses
- Pricing: starting, current, reserve, buy-now
- Item specifications: brand, model, condition, etc.
- Shipping and handling details
- Auction settings: auto-extend, bid increments

#### Bids
- Bid history and tracking
- Automatic and manual bid support
- Bid validation and increment rules

#### Categories
- Hierarchical category system
- Support for unlimited nesting levels
- Category-specific attributes

#### Supporting Tables
- **AuctionImages**: Multi-image support for auctions
- **WatchlistItems**: User watchlist functionality
- **AuctionViews**: View tracking and analytics
- **PaymentRecords**: Payment transaction history
- **Transactions**: Complete transaction records

### Auction Status Flow
```
Draft → Scheduled → Active → Ended → Sold/Cancelled
```

### Auction Types
- **Standard**: Traditional auction with time limit
- **Reserve**: Minimum sale price required
- **BuyItNow**: Immediate purchase option
- **Dutch**: Price decreases over time

## 🔄 Real-Time Features

### SignalR Implementation

#### Backend Hub (`BiddingHub.cs`)
```csharp
public class BiddingHub : Hub
{
    public async Task JoinAuctionGroup(string auctionId)
    public async Task LeaveAuctionGroup(string auctionId)
    // Real-time group management
}
```

#### Frontend Integration
```javascript
// SignalR connection with automatic reconnection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/biddingHub")
    .withAutomaticReconnect()
    .build();
```

### Real-Time Events
- **Bid Updates**: Instant bid notifications to all participants
- **Price Changes**: Live current price updates
- **Countdown Timers**: Real-time auction countdown
- **Auction Extensions**: Automatic extension notifications
- **Connection Status**: Live connection monitoring

## 💰 Bidding System

### Automatic Bid Increments
Dynamic increments based on current price:

| Price Range | Increment |
|-------------|-----------|
| Under $25 | $0.50 |
| $25 - $100 | $1.00 |
| $100 - $500 | $5.00 |
| $500 - $1,000 | $10.00 |
| $1,000 - $5,000 | $25.00 |
| Over $5,000 | $50.00 |

### Bid Validation
- Minimum bid requirements
- Auction status validation
- User permission checks
- Maximum bid limits
- Pre-approval requirements

### Anti-Sniping Protection
- Automatic auction extensions
- Configurable extension duration (default: 5 minutes)
- Extension triggers in final minutes
- Real-time extension notifications

## 🔐 Authentication & Authorization

### JWT Authentication
- Secure token-based authentication
- Configurable token expiration
- Refresh token support
- Role-based claims

### User Roles
- **Administrator**: Full system access
- **Seller**: Create and manage auctions
- **Buyer**: Participate in auctions
- **Moderator**: Content moderation

### API Security
```csharp
[Authorize(Roles = "Seller,Administrator")]
public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto dto)
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - User profile

### Auctions
- `GET /api/auctions` - List auctions with pagination and filtering
- `GET /api/auctions/{id}` - Get auction details
- `POST /api/auctions` - Create new auction
- `PUT /api/auctions/{id}` - Update auction
- `DELETE /api/auctions/{id}` - Delete auction
- `POST /api/auctions/{id}/images` - Upload auction images

### Bidding
- `POST /api/bidding/place-bid` - Place a bid
- `GET /api/bidding/{auctionId}/next-minimum-bid` - Get minimum bid
- `GET /api/bidding/{auctionId}/bids` - Get bid history
- `POST /api/bidding/validate-bid` - Validate bid
- `POST /api/bidding/automatic-bid` - Set up proxy bidding

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/auctions` - Manage auctions
- `POST /api/admin/approve-auction/{id}` - Approve auction

## 🎨 Frontend Components

### Key Components

#### BiddingInterface
- Real-time bidding interface
- Live price updates with animations
- Quick bid buttons (+$5, +$10, +$25, +$50)
- Countdown timer with visual urgency
- Bid history with smooth animations
- Connection status indicator

#### AuctionCard
- Auction preview with image
- Current price and bid count
- Time remaining display
- Quick actions (watch, bid)

#### AuctionDetail
- Complete auction information
- Image carousel
- Integrated bidding interface
- Seller information
- Shipping details

### Styling & UX
- Responsive Bootstrap-based design
- Professional auction house aesthetics
- Smooth animations and transitions
- Accessibility-friendly design
- Mobile-first approach

## 🔧 Configuration

### Backend Configuration (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auction_web;User=root;Password=password;"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-here",
    "ExpirationInMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend Configuration
```javascript
// API base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7049';

// SignalR hub URL
const HUB_URL = `${API_BASE_URL}/biddingHub`;
```

## 🚀 Deployment

### Backend Deployment
1. **Build the application**:
```bash
dotnet publish -c Release -o ./publish
```

2. **Configure production settings**:
   - Update connection strings
   - Set JWT secrets
   - Configure CORS for production domain

3. **Deploy to hosting service**:
   - Azure App Service
   - AWS Elastic Beanstalk
   - Docker containers

### Frontend Deployment
1. **Build for production**:
```bash
npm run build
```

2. **Deploy static files**:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Azure Static Web Apps

### Database Deployment
1. **Production database setup**:
   - MySQL on cloud provider
   - Azure Database for MySQL
   - AWS RDS MySQL

2. **Run migrations**:
```bash
dotnet ef database update --connection "production-connection-string"
```

## 🧪 Testing

### Backend Testing
```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Testing
```bash
# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📈 Performance Optimization

### Database Optimization
- Optimized indexes on frequently queried columns
- Connection pooling configuration
- Query performance monitoring
- Automated cleanup procedures

### Backend Optimization
- Async/await patterns throughout
- Caching strategies for frequently accessed data
- SignalR connection management
- Background services for heavy operations

### Frontend Optimization
- Component memoization with React.memo
- Lazy loading for routes and components
- Image optimization and lazy loading
- Bundle size optimization

## 🔍 Monitoring & Logging

### Backend Logging
- Structured logging with Serilog
- Application Insights integration
- Error tracking and reporting
- Performance monitoring

### Database Monitoring
- Query performance tracking
- Connection pool monitoring
- Automated backup procedures
- Health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow C# coding conventions
- Use async/await for all async operations
- Write unit tests for new features
- Update documentation for API changes
- Follow React best practices for frontend

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review existing issues and discussions

## 🚧 Future Enhancements

### Planned Features
- **Mobile Apps**: React Native mobile applications
- **Payment Integration**: Stripe, PayPal integration
- **Advanced Analytics**: Detailed auction analytics dashboard
- **AI Features**: Price prediction and recommendation engine
- **Social Features**: User following and social bidding
- **Multi-language**: Internationalization support
- **Advanced Search**: Elasticsearch integration

### Technical Improvements
- **Microservices**: Break down into microservices architecture
- **Event Sourcing**: Implement event sourcing for audit trails
- **CQRS**: Command Query Responsibility Segregation
- **GraphQL**: GraphQL API alongside REST
- **WebAssembly**: Blazor WebAssembly components

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintainer**: Development Team
