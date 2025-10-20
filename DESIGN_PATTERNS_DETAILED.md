# Design Patterns Documentation for Report

This document provides detailed explanations of all design patterns used in the Online Auction Platform for inclusion in the project report.

---

## 📚 Design Patterns Overview

The Online Auction Platform implements multiple design patterns to ensure maintainability, scalability, and code quality. This document details each pattern with explanations, benefits, and implementation examples.

---

## 1. Repository Pattern

### Description
The Repository Pattern provides an abstraction layer between the business logic and data access layers, encapsulating data access logic.

### Implementation in Project
- **Entity Framework Core DbContext** acts as the repository
- **ApplicationDbContext** provides access to all database entities
- Abstracts database operations from business logic

### Benefits
- ✅ **Separation of Concerns**: Business logic doesn't directly access database
- ✅ **Testability**: Easy to mock repositories for unit testing
- ✅ **Maintainability**: Database changes don't affect business logic
- ✅ **Flexibility**: Can switch ORM or database without changing business logic

### Code Example
```csharp
// ApplicationDbContext.cs - Acts as Repository
public class ApplicationDbContext : IdentityDbContext<User>
{
    public DbSet<Auction> Auctions { get; set; }
    public DbSet<Bid> Bids { get; set; }
    public DbSet<AuctionImage> AuctionImages { get; set; }
    public DbSet<WatchlistItem> WatchlistItems { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    
    // Provides abstraction for all data operations
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}

// Usage in Service
public class BiddingService : IBiddingService
{
    private readonly ApplicationDbContext _context;
    
    public async Task<Bid> PlaceBidAsync(PlaceBidDto dto)
    {
        // Business logic uses repository abstraction
        var auction = await _context.Auctions.FindAsync(dto.AuctionId);
        var bid = new Bid { /* ... */ };
        _context.Bids.Add(bid);
        await _context.SaveChangesAsync();
        return bid;
    }
}
```

### Diagram
```
┌──────────────────┐
│  BiddingService  │ ← Business Logic Layer
└────────┬─────────┘
         │ uses
         ▼
┌──────────────────┐
│ ApplicationDb    │ ← Repository Layer
│    Context       │
└────────┬─────────┘
         │ abstracts
         ▼
┌──────────────────┐
│  MySQL Database  │ ← Data Storage
└──────────────────┘
```

---

## 2. Dependency Injection (DI) Pattern

### Description
Dependency Injection is a design pattern that implements Inversion of Control (IoC) for resolving dependencies. Objects receive their dependencies from external sources rather than creating them.

### Implementation in Project
- **ASP.NET Core built-in DI container**
- Services registered in `Program.cs`
- Constructor injection in controllers and services

### Benefits
- ✅ **Loose Coupling**: Components don't create their dependencies
- ✅ **Testability**: Easy to inject mock dependencies for testing
- ✅ **Maintainability**: Easy to swap implementations
- ✅ **Lifecycle Management**: Container manages object lifetimes

### Service Lifetimes Used
1. **Scoped**: Created once per HTTP request
   - `IAuthService`, `IBiddingService`, `IAdminService`
2. **Singleton**: Created once for application lifetime
   - `IAuctionService`, `IImageService`
3. **Transient**: Created each time requested
   - Rarely used in this project

### Code Example
```csharp
// Program.cs - Service Registration
var builder = WebApplication.CreateBuilder(args);

// Register services with DI container
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBiddingService, BiddingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddSingleton<IAuctionService, AuctionService>();
builder.Services.AddSingleton<IImageService, ImageService>();
builder.Services.AddScoped<IReportingService, ReportingService>();

// Controller using DI
[ApiController]
[Route("api/[controller]")]
public class BiddingController : ControllerBase
{
    private readonly IBiddingService _biddingService;
    private readonly IHubContext<BiddingHub> _hubContext;
    
    // Dependencies injected via constructor
    public BiddingController(
        IBiddingService biddingService,
        IHubContext<BiddingHub> hubContext)
    {
        _biddingService = biddingService;
        _hubContext = hubContext;
    }
    
    [HttpPost("place-bid")]
    public async Task<IActionResult> PlaceBid([FromBody] PlaceBidDto dto)
    {
        var result = await _biddingService.PlaceBidAsync(dto);
        return Ok(result);
    }
}
```

### Diagram
```
┌─────────────────┐
│   DI Container  │
└────────┬────────┘
         │ resolves
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Controller│ │ Service │
│   ↓     │ │    ↓    │
│ needs   │ │interface│
│IBiddingSvc│ │ impl   │
└─────────┘ └──────────┘
```

---

## 3. Observer Pattern (Publish-Subscribe)

### Description
The Observer Pattern defines a one-to-many dependency between objects. When one object changes state, all its dependents are notified and updated automatically.

### Implementation in Project
- **SignalR Hub** for real-time notifications
- Clients subscribe to auction groups
- Server publishes bid updates to all subscribers

### Benefits
- ✅ **Real-time Updates**: Instant notification to all connected clients
- ✅ **Decoupling**: Publishers don't need to know about subscribers
- ✅ **Scalability**: Can handle multiple observers efficiently
- ✅ **Event-Driven**: Reactive architecture

### Code Example
```csharp
// BiddingHub.cs - Observable (Subject)
public class BiddingHub : Hub
{
    // Clients subscribe to auction groups
    public async Task JoinAuction(string auctionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, auctionId);
        await Clients.Group(auctionId).SendAsync("UserJoined", Context.ConnectionId);
    }
    
    public async Task LeaveAuction(string auctionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, auctionId);
    }
}

// BiddingService.cs - Publisher
public class BiddingService : IBiddingService
{
    private readonly IHubContext<BiddingHub> _hubContext;
    
    public async Task<Bid> PlaceBidAsync(PlaceBidDto dto)
    {
        // Process bid...
        var bid = new Bid { /* ... */ };
        
        // Notify all observers (subscribers) in the auction group
        await _hubContext.Clients.Group(dto.AuctionId.ToString())
            .SendAsync("ReceiveBid", new BidNotificationDto
            {
                AuctionId = bid.AuctionId,
                Amount = bid.Amount,
                BidderName = bid.User.UserName,
                BidTime = bid.BidTime
            });
        
        return bid;
    }
}

// Frontend - Observer (Subscriber)
useEffect(() => {
    const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5103/biddingHub")
        .build();
    
    // Subscribe to bid updates
    connection.on("ReceiveBid", (notification) => {
        // Update UI when notified
        setCurrentPrice(notification.Amount);
        setBidHistory(prev => [notification, ...prev]);
    });
    
    connection.start().then(() => {
        connection.invoke("JoinAuction", auctionId);
    });
    
    return () => {
        connection.invoke("LeaveAuction", auctionId);
        connection.stop();
    };
}, [auctionId]);
```

### Diagram
```
                ┌─────────────────┐
                │   BiddingHub    │ ← Subject
                │   (SignalR)     │
                └────────┬────────┘
                         │ notifies
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Client 1    │  │  Client 2    │  │  Client 3    │ ← Observers
│  (React)     │  │  (React)     │  │  (React)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 4. Strategy Pattern

### Description
The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

### Implementation in Project
1. **Auction Types**: Different auction strategies (Standard, Reserve, Buy-It-Now, Dutch)
2. **Bid Increment Calculation**: Dynamic algorithm based on price ranges
3. **Payment Methods**: Different payment processing strategies

### Benefits
- ✅ **Flexibility**: Easy to add new strategies without modifying existing code
- ✅ **Open/Closed Principle**: Open for extension, closed for modification
- ✅ **Testability**: Each strategy can be tested independently
- ✅ **Runtime Selection**: Strategy can be chosen at runtime

### Code Example
```csharp
// Strategy Interface
public interface IBidIncrementStrategy
{
    decimal CalculateIncrement(decimal currentPrice);
}

// Concrete Strategy 1: Standard Increment
public class StandardBidIncrementStrategy : IBidIncrementStrategy
{
    public decimal CalculateIncrement(decimal currentPrice)
    {
        if (currentPrice < 25) return 0.50m;
        if (currentPrice < 100) return 1.00m;
        if (currentPrice < 500) return 5.00m;
        if (currentPrice < 1000) return 10.00m;
        if (currentPrice < 5000) return 25.00m;
        return 50.00m;
    }
}

// Concrete Strategy 2: Aggressive Increment
public class AggressiveBidIncrementStrategy : IBidIncrementStrategy
{
    public decimal CalculateIncrement(decimal currentPrice)
    {
        return currentPrice * 0.1m; // 10% of current price
    }
}

// Context using Strategy
public class BiddingService : IBiddingService
{
    private IBidIncrementStrategy _incrementStrategy;
    
    public decimal CalculateNextMinimumBid(Auction auction)
    {
        // Strategy pattern: algorithm chosen based on auction type
        _incrementStrategy = auction.AuctionType switch
        {
            "Standard" => new StandardBidIncrementStrategy(),
            "Aggressive" => new AggressiveBidIncrementStrategy(),
            _ => new StandardBidIncrementStrategy()
        };
        
        var increment = _incrementStrategy.CalculateIncrement(auction.CurrentPrice);
        return auction.CurrentPrice + increment;
    }
}
```

### Diagram
```
┌──────────────────────┐
│   BiddingService     │ ← Context
│  (uses strategy)     │
└──────────┬───────────┘
           │ has-a
           ▼
┌──────────────────────┐
│ <<interface>>        │
│IBidIncrementStrategy │
└──────────┬───────────┘
           △
           │ implements
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│Standard │ │Aggressive│ ← Concrete Strategies
│Strategy │ │Strategy  │
└─────────┘ └─────────┘
```

---

## 5. Model-View-Controller (MVC) Pattern

### Description
MVC separates an application into three interconnected components: Model (data), View (UI), and Controller (logic).

### Implementation in Project
- **Model**: Entity classes (`Auction`, `Bid`, `User`)
- **View**: React components (frontend)
- **Controller**: API controllers (`AuctionsController`, `BiddingController`)

### Benefits
- ✅ **Separation of Concerns**: UI, data, and logic are separated
- ✅ **Parallel Development**: Teams can work on different components
- ✅ **Maintainability**: Changes in one component don't affect others
- ✅ **Testability**: Each component can be tested independently

### Code Example
```csharp
// MODEL - Auction.cs
public class Auction
{
    public int Id { get; set; }
    public string Title { get; set; }
    public decimal CurrentPrice { get; set; }
    public DateTime EndDate { get; set; }
    // ... other properties
}

// CONTROLLER - AuctionsController.cs
[ApiController]
[Route("api/[controller]")]
public class AuctionsController : ControllerBase
{
    private readonly IAuctionService _auctionService;
    
    [HttpGet]
    public async Task<IActionResult> GetAuctions([FromQuery] string category)
    {
        var auctions = await _auctionService.GetAuctionsAsync(category);
        return Ok(auctions); // Returns data to View
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto dto)
    {
        var auction = await _auctionService.CreateAuctionAsync(dto);
        return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, auction);
    }
}

// VIEW - React Component (AuctionList.js)
function AuctionList() {
    const [auctions, setAuctions] = useState([]);
    
    useEffect(() => {
        // Fetch data from Controller
        auctionService.getAuctions()
            .then(data => setAuctions(data));
    }, []);
    
    // Render UI (View)
    return (
        <div>
            {auctions.map(auction => (
                <AuctionCard key={auction.id} auction={auction} />
            ))}
        </div>
    );
}
```

### Diagram
```
┌────────────┐
│    VIEW    │ ← React Components
│  (React)   │   (User Interface)
└──────┬─────┘
       │ HTTP Requests
       ▼
┌────────────┐
│ CONTROLLER │ ← API Controllers
│ (ASP.NET)  │   (Request Handling)
└──────┬─────┘
       │ manipulates
       ▼
┌────────────┐
│   MODEL    │ ← Entity Classes
│ (Classes)  │   (Business Data)
└────────────┘
```

---

## 6. Data Transfer Object (DTO) Pattern

### Description
DTOs are simple objects used to transfer data between layers or across network boundaries. They contain no business logic.

### Implementation in Project
- Separate DTOs for requests and responses
- Used in API communication
- Provides data validation and transformation

### Benefits
- ✅ **Security**: Hide sensitive entity properties
- ✅ **Decoupling**: API contract independent of entity structure
- ✅ **Validation**: Centralized input validation
- ✅ **Versioning**: Easy to version APIs without changing entities
- ✅ **Performance**: Transfer only necessary data

### Code Example
```csharp
// Entity (Internal Model)
public class User : IdentityUser
{
    public string FullName { get; set; }
    public string PasswordHash { get; set; } // Sensitive!
    public string Role { get; set; }
    public decimal Rating { get; set; }
    public bool IsApproved { get; set; }
    // ... many other properties
}

// DTO for Registration (Input)
public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; }
    
    [Required]
    public string FullName { get; set; }
    
    public string Role { get; set; } = "Buyer";
}

// DTO for Response (Output)
public class UserDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Role { get; set; }
    public decimal Rating { get; set; }
    // NO PasswordHash - Security!
    // NO IsApproved - Internal detail!
}

// DTO for Bid Placement
public class PlaceBidDto
{
    [Required]
    public int AuctionId { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    
    public bool IsAutomaticBid { get; set; }
    public decimal? MaxAmount { get; set; }
}

// Usage in Controller
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto dto)
{
    // Convert DTO to Entity
    var user = new User
    {
        Email = dto.Email,
        FullName = dto.FullName,
        Role = dto.Role
    };
    
    var result = await _authService.RegisterAsync(user, dto.Password);
    
    // Convert Entity to DTO for response
    var userDto = new UserDto
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        Role = user.Role
    };
    
    return Ok(userDto); // Safe to send to client
}
```

### DTO Categories in Project
```
Input DTOs (Request):
- RegisterDto
- LoginDto
- CreateAuctionDto
- PlaceBidDto
- UpdateProfileDto

Output DTOs (Response):
- UserDto
- AuctionDto
- AuctionDetailDto
- BidDto
- BidNotificationDto

Validation DTOs:
- ValidateBidDto
- ChangePasswordDto
```

### Diagram
```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ sends RegisterDto
       ▼
┌──────────────┐
│  Controller  │
└──────┬───────┘
       │ converts DTO → Entity
       ▼
┌──────────────┐
│   Service    │ ← Works with Entity
└──────┬───────┘
       │ Entity → DTO
       ▼
┌──────────────┐
│  Database    │
└──────────────┘
```

---

## 7. Facade Pattern

### Description
The Facade Pattern provides a simplified interface to a complex subsystem. It hides the complexities of the system and provides an easy-to-use interface.

### Implementation in Project
- **Service Layer** acts as facade for complex operations
- Controllers use simple service methods
- Services encapsulate complex business logic

### Benefits
- ✅ **Simplification**: Complex operations hidden behind simple interface
- ✅ **Loose Coupling**: Controllers don't know implementation details
- ✅ **Maintainability**: Internal changes don't affect controllers
- ✅ **Reusability**: Common operations centralized

### Code Example
```csharp
// Complex subsystem components
public class BidValidator { /* validation logic */ }
public class AuctionExtensionChecker { /* extension logic */ }
public class BidNotificationSender { /* notification logic */ }
public class AuctionUpdater { /* update logic */ }

// FACADE - BiddingService simplifies complex operations
public class BiddingService : IBiddingService
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<BiddingHub> _hubContext;
    private readonly BidValidator _validator;
    private readonly AuctionExtensionChecker _extensionChecker;
    private readonly BidNotificationSender _notificationSender;
    
    // Simple interface for complex operation
    public async Task<BidResult> PlaceBidAsync(PlaceBidDto dto)
    {
        // Facade coordinates multiple complex operations:
        
        // 1. Validate bid (complex validation rules)
        var validationResult = await _validator.ValidateBidAsync(dto);
        if (!validationResult.IsValid)
            return BidResult.Failed(validationResult.Errors);
        
        // 2. Check if auction needs extension (complex time logic)
        var needsExtension = await _extensionChecker.CheckAsync(dto.AuctionId);
        if (needsExtension)
            await ExtendAuctionAsync(dto.AuctionId);
        
        // 3. Process bid (complex database operations)
        var bid = await ProcessBidAsync(dto);
        
        // 4. Update auction (complex price calculations)
        await UpdateAuctionAsync(dto.AuctionId, bid.Amount);
        
        // 5. Send notifications (complex SignalR operations)
        await _notificationSender.NotifyAllClientsAsync(bid);
        
        // 6. Update related data (watchlists, statistics, etc.)
        await UpdateRelatedDataAsync(dto.AuctionId);
        
        return BidResult.Success(bid);
    }
    
    // Other complex methods simplified...
}

// Controller uses simple facade interface
[ApiController]
public class BiddingController : ControllerBase
{
    private readonly IBiddingService _biddingService; // Facade
    
    [HttpPost("place-bid")]
    public async Task<IActionResult> PlaceBid([FromBody] PlaceBidDto dto)
    {
        // Controller doesn't know about complex internal operations
        var result = await _biddingService.PlaceBidAsync(dto);
        
        if (result.IsSuccess)
            return Ok(result.Bid);
        else
            return BadRequest(result.Errors);
    }
}
```

### Diagram
```
┌──────────────────┐
│   Controller     │ ← Client (simple interface)
└────────┬─────────┘
         │ uses simple method
         ▼
┌──────────────────┐
│  BiddingService  │ ← FACADE
│  (Facade)        │
└────────┬─────────┘
         │ coordinates
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌────────┐ ┌───────┐ ┌────┐ ┌────────┐
│Validator│ │Checker│ │Notif│ │Updater│ ← Complex Subsystems
└────────┘ └───────┘ └────┘ └────────┘
```

---

## 8. Singleton Pattern

### Description
The Singleton Pattern ensures a class has only one instance and provides a global point of access to it.

### Implementation in Project
- Services registered as Singleton in DI container
- `AuctionService` and `ImageService` use singleton lifetime
- Configuration objects

### Benefits
- ✅ **Resource Efficiency**: One instance shared across application
- ✅ **Consistent State**: All components access same instance
- ✅ **Global Access**: Available throughout application
- ✅ **Lazy Initialization**: Created only when first needed

### Code Example
```csharp
// Program.cs - Register as Singleton
builder.Services.AddSingleton<IAuctionService, AuctionService>();
builder.Services.AddSingleton<IImageService, ImageService>();

// AuctionService - Singleton implementation
public class AuctionService : IAuctionService
{
    private readonly ILogger<AuctionService> _logger;
    private static readonly object _lock = new object();
    private Dictionary<string, List<Auction>> _categoryCache;
    
    public AuctionService(ILogger<AuctionService> logger)
    {
        _logger = logger;
        _categoryCache = new Dictionary<string, List<Auction>>();
    }
    
    // Singleton maintains state across all requests
    public async Task<List<Auction>> GetCachedAuctionsByCategory(string category)
    {
        lock (_lock) // Thread-safe access to shared state
        {
            if (_categoryCache.ContainsKey(category))
                return _categoryCache[category];
            
            // Load and cache
            var auctions = LoadAuctionsFromDatabase(category);
            _categoryCache[category] = auctions;
            return auctions;
        }
    }
    
    public void InvalidateCache(string category)
    {
        lock (_lock)
        {
            _categoryCache.Remove(category);
        }
    }
}

// All controllers share same instance
public class AuctionsController : ControllerBase
{
    private readonly IAuctionService _auctionService; // Same instance everywhere
    
    public AuctionsController(IAuctionService auctionService)
    {
        _auctionService = auctionService; // Injected singleton
    }
}
```

### When to Use Singleton vs Scoped
```
✅ Singleton - Use when:
- Service maintains shared state (caching)
- Service is stateless and thread-safe
- Service is expensive to create
- One instance needed for entire application lifetime

❌ Avoid Singleton when:
- Service depends on scoped services (DbContext)
- Service maintains per-request state
- Service is not thread-safe
```

---

## 9. Factory Pattern (Implicit)

### Description
The Factory Pattern creates objects without specifying the exact class to create. ASP.NET Core's DI container acts as a factory.

### Implementation in Project
- DI container creates service instances
- Service registration defines which implementation to create

### Code Example
```csharp
// Registration (Factory configuration)
builder.Services.AddScoped<IBiddingService, BiddingService>();

// Usage (Factory in action)
public class BiddingController : ControllerBase
{
    // DI container (factory) creates the correct implementation
    public BiddingController(IBiddingService biddingService)
    {
        // We get BiddingService instance without knowing how it was created
    }
}
```

---

## Summary Table

| Pattern | Purpose | Implementation | Benefits |
|---------|---------|----------------|----------|
| Repository | Data access abstraction | ApplicationDbContext | Testability, maintainability |
| Dependency Injection | Loose coupling | ASP.NET Core DI | Flexibility, testability |
| Observer | Real-time updates | SignalR Hub | Reactive, scalable |
| Strategy | Algorithm selection | Bid increment calculation | Flexibility, extensibility |
| MVC | Separation of concerns | Controllers, Models, Views | Maintainability, parallel dev |
| DTO | Data transfer | Request/Response DTOs | Security, decoupling |
| Facade | Simplified interface | Service layer | Simplicity, encapsulation |
| Singleton | Single instance | AuctionService | Resource efficiency |

---

## Pattern Interactions

```
Request Flow:
Client → Controller (MVC)
    ↓
    Uses Service (Facade + DI)
    ↓
    Accesses Data (Repository)
    ↓
    Transfers Data (DTO)
    ↓
    Notifies Others (Observer)
    ↓
    Uses Algorithm (Strategy)
```

---

**This document should be used as the foundation for Section 4 (Design Patterns) of the project report.**

