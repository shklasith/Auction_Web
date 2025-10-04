# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "userName": "johndoe",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "role": "Buyer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user-id-guid"
}
```

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiration": "2025-10-03T10:30:00Z",
  "user": {
    "id": "user-id-guid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "Buyer"
  }
}
```

### GET /api/auth/profile
Get current user profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user-id-guid",
  "fullName": "John Doe",
  "email": "john@example.com",
  "userName": "johndoe",
  "role": "Buyer",
  "rating": 4.5,
  "totalSales": 15,
  "totalPurchases": 8,
  "memberSince": "2024-01-15T00:00:00Z"
}
```

## Auction Endpoints

### GET /api/auctions
Get paginated list of auctions with filtering options.

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 50)
- `category`: Filter by category
- `status`: Filter by auction status
- `searchTerm`: Search in title and description
- `minPrice`: Minimum current price
- `maxPrice`: Maximum current price
- `sortBy`: Sort field (price, endDate, created)
- `sortOrder`: asc or desc

**Example Request:**
```
GET /api/auctions?page=1&pageSize=20&category=Electronics&status=Active&sortBy=endDate&sortOrder=asc
```

**Response:**
```json
{
  "auctions": [
    {
      "id": 1,
      "title": "Vintage Camera",
      "description": "Beautiful vintage camera in excellent condition",
      "currentPrice": 150.00,
      "startingPrice": 100.00,
      "buyNowPrice": 300.00,
      "bidCount": 5,
      "endDate": "2025-10-05T15:30:00Z",
      "status": "Active",
      "category": "Electronics",
      "condition": "Excellent",
      "images": [
        {
          "id": 1,
          "url": "/images/camera1.jpg",
          "isPrimary": true
        }
      ],
      "seller": {
        "id": "seller-id",
        "fullName": "Jane Smith",
        "rating": 4.8
      },
      "timeRemaining": "2.15:45:30",
      "isWatched": false
    }
  ],
  "totalCount": 156,
  "currentPage": 1,
  "totalPages": 8,
  "pageSize": 20
}
```

### GET /api/auctions/{id}
Get detailed information about a specific auction.

**Response:**
```json
{
  "id": 1,
  "title": "Vintage Camera",
  "description": "Beautiful vintage camera in excellent condition",
  "detailedDescription": "This camera has been well-maintained...",
  "currentPrice": 150.00,
  "startingPrice": 100.00,
  "buyNowPrice": 300.00,
  "reservePrice": 200.00,
  "bidCount": 5,
  "viewCount": 42,
  "watchlistCount": 8,
  "startDate": "2025-10-01T10:00:00Z",
  "endDate": "2025-10-05T15:30:00Z",
  "status": "Active",
  "type": "Reserve",
  "category": "Electronics",
  "subCategory": "Cameras",
  "condition": "Excellent",
  "conditionNotes": "Minor wear on strap",
  "brand": "Canon",
  "model": "AE-1",
  "yearManufactured": 1976,
  "shippingCost": 15.00,
  "freeShipping": false,
  "localPickupOnly": false,
  "itemLocation": "New York, NY",
  "images": [
    {
      "id": 1,
      "url": "/images/camera1.jpg",
      "isPrimary": true,
      "caption": "Front view"
    }
  ],
  "seller": {
    "id": "seller-id",
    "fullName": "Jane Smith",
    "rating": 4.8,
    "totalSales": 25,
    "memberSince": "2023-05-10T00:00:00Z"
  },
  "bids": [
    {
      "id": 15,
      "amount": 150.00,
      "bidTime": "2025-10-02T14:20:00Z",
      "bidder": {
        "userName": "bidder123",
        "rating": 4.2
      }
    }
  ],
  "timeRemaining": "2.15:45:30",
  "isWatched": false,
  "nextMinimumBid": 155.00
}
```

### POST /api/auctions
Create a new auction (Seller/Admin only).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Vintage Camera",
  "description": "Beautiful vintage camera",
  "detailedDescription": "Detailed description here...",
  "startingPrice": 100.00,
  "buyNowPrice": 300.00,
  "reservePrice": 200.00,
  "startDate": "2025-10-03T10:00:00Z",
  "endDate": "2025-10-07T10:00:00Z",
  "category": "Electronics",
  "subCategory": "Cameras",
  "condition": "Excellent",
  "brand": "Canon",
  "model": "AE-1",
  "shippingCost": 15.00,
  "itemLocation": "New York, NY",
  "type": "Reserve"
}
```

**Response:**
```json
{
  "success": true,
  "auctionId": 123,
  "message": "Auction created successfully"
}
```

## Bidding Endpoints

### POST /api/bidding/place-bid
Place a bid on an auction.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "auctionId": 1,
  "bidAmount": 155.00,
  "isAutomaticBid": false,
  "maxAutomaticBid": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "bid": {
    "id": 16,
    "amount": 155.00,
    "bidTime": "2025-10-02T16:30:00Z",
    "auctionId": 1,
    "bidderId": "user-id"
  },
  "newCurrentPrice": 155.00,
  "nextMinimumBid": 160.00,
  "auctionExtended": false
}
```

### GET /api/bidding/{auctionId}/next-minimum-bid
Get the next minimum bid amount for an auction.

**Response:**
```json
{
  "auctionId": 1,
  "currentPrice": 155.00,
  "nextMinimumBid": 160.00,
  "bidIncrement": 5.00
}
```

### GET /api/bidding/{auctionId}/bids
Get bid history for an auction.

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)

**Response:**
```json
{
  "bids": [
    {
      "id": 16,
      "amount": 155.00,
      "bidTime": "2025-10-02T16:30:00Z",
      "bidder": {
        "userName": "bidder123",
        "rating": 4.2
      },
      "isWinning": true
    }
  ],
  "totalCount": 5,
  "currentPage": 1,
  "totalPages": 1
}
```

### POST /api/bidding/validate-bid
Validate a bid before placing it.

**Request Body:**
```json
{
  "auctionId": 1,
  "bidAmount": 160.00
}
```

**Response:**
```json
{
  "isValid": true,
  "message": "Bid is valid",
  "minimumBid": 160.00,
  "errors": []
}
```

## Admin Endpoints

### GET /api/admin/users
Get paginated list of users (Admin only).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number
- `pageSize`: Items per page
- `role`: Filter by role
- `searchTerm`: Search in name/email

**Response:**
```json
{
  "users": [
    {
      "id": "user-id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "Buyer",
      "isActive": true,
      "rating": 4.5,
      "totalSales": 15,
      "createdDate": "2024-01-15T00:00:00Z",
      "lastLoginDate": "2025-10-02T10:00:00Z"
    }
  ],
  "totalCount": 150,
  "currentPage": 1,
  "totalPages": 15
}
```

### POST /api/admin/approve-auction/{id}
Approve a pending auction (Admin only).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Auction approved successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "bidAmount",
      "message": "Bid amount must be greater than current price"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Auction not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An internal error occurred"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Bidding endpoints: 10 requests per minute
- General endpoints: 100 requests per minute

## WebSocket Events (SignalR)

### Joining Auction Groups
```javascript
connection.invoke("JoinAuctionGroup", auctionId);
```

### Receiving Bid Updates
```javascript
connection.on("BidUpdate", (data) => {
    // Handle bid update
    console.log(data);
});
```

**Bid Update Event Data:**
```json
{
  "auctionId": 1,
  "newBid": {
    "amount": 160.00,
    "bidderName": "bidder123",
    "bidTime": "2025-10-02T16:35:00Z"
  },
  "currentPrice": 160.00,
  "nextMinimumBid": 165.00,
  "bidCount": 6
}
```

### Receiving Timer Updates
```javascript
connection.on("TimerUpdate", (data) => {
    // Handle timer update
    console.log(data);
});
```

**Timer Update Event Data:**
```json
{
  "auctionId": 1,
  "timeRemaining": "1.05:25:30",
  "isEndingSoon": false,
  "hasEnded": false
}
```
