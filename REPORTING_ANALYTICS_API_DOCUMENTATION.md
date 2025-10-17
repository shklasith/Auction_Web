# Reporting and Analytics API Documentation

## Overview

This document describes the comprehensive reporting and analytics APIs implemented in the Auction Web platform. These APIs provide detailed insights into auction performance, bidder activity, revenue trends, and overall platform analytics to support data-driven decision-making.

## Authentication

All reporting endpoints require **Administrator** role authentication. Include the JWT token in the request header:

```
Authorization: Bearer {your-jwt-token}
```

## API Endpoints

### Base URL
```
/api/reports
```

---

## 1. Auction Performance Report

### GET `/api/reports/auction-performance`

Get comprehensive auction performance metrics and analytics.

**Query Parameters:**
- `startDate` (DateTime, optional) - Start date for the report
- `endDate` (DateTime, optional) - End date for the report
- `category` (string, optional) - Filter by category
- `status` (AuctionStatus, optional) - Filter by auction status (Draft, Active, Ended, Cancelled, Sold)
- `topN` (int, optional) - Number of top performers to include (default: 10)

**Example Request:**
```
GET /api/reports/auction-performance?startDate=2025-01-01&endDate=2025-10-15&topN=20
```

**Response:**
```json
{
  "totalAuctions": 150,
  "activeAuctions": 25,
  "completedAuctions": 100,
  "cancelledAuctions": 10,
  "averageCompletionRate": 66.67,
  "averageBidsPerAuction": 12.5,
  "averageSalePrice": 450.75,
  "totalRevenue": 45075.00,
  "categoryPerformance": [
    {
      "category": "Electronics",
      "totalAuctions": 50,
      "completedAuctions": 40,
      "totalRevenue": 25000.00,
      "averageSalePrice": 625.00,
      "totalBids": 600
    }
  ],
  "topPerformingAuctions": [
    {
      "auctionId": 123,
      "title": "Vintage Camera",
      "category": "Electronics",
      "finalPrice": 1500.00,
      "totalBids": 45,
      "uniqueViewers": 120,
      "endDate": "2025-10-10T18:00:00Z"
    }
  ]
}
```

**Use Cases:**
- Identify best-performing categories
- Track auction success rates
- Analyze pricing trends
- Optimize auction strategies

---

## 2. Bidder Activity Report

### GET `/api/reports/bidder-activity`

Get detailed bidder activity and engagement metrics.

**Query Parameters:**
- `startDate` (DateTime, optional) - Start date for the report
- `endDate` (DateTime, optional) - End date for the report
- `topN` (int, optional) - Number of top bidders to include (default: 10)

**Example Request:**
```
GET /api/reports/bidder-activity?startDate=2025-09-01&topN=15
```

**Response:**
```json
{
  "totalBidders": 250,
  "activeBidders": 180,
  "averageBidsPerBidder": 8.5,
  "totalBidVolume": 125000.00,
  "topBidders": [
    {
      "userId": "user-123",
      "username": "john_doe",
      "email": "john@example.com",
      "totalBids": 85,
      "totalBidAmount": 15000.00,
      "auctionsWon": 12,
      "totalSpent": 8500.00,
      "winRate": 45.5
    }
  ],
  "biddingTrends": [
    {
      "date": "2025-10-01",
      "totalBids": 150,
      "totalBidAmount": 5000.00,
      "uniqueBidders": 45
    }
  ],
  "engagementMetrics": {
    "averageBidResponseTime": 0,
    "peakBiddingHour": 18,
    "mostActiveDay": "Saturday",
    "repeatBidderRate": 72.5
  }
}
```

**Use Cases:**
- Identify top bidders for targeted marketing
- Analyze bidding patterns
- Understand user engagement
- Optimize bidding experience

---

## 3. Revenue Trends Report

### GET `/api/reports/revenue-trends`

Get revenue trends, projections, and financial analytics.

**Query Parameters:**
- `startDate` (DateTime, optional) - Start date (default: 6 months ago)
- `endDate` (DateTime, optional) - End date (default: today)

**Example Request:**
```
GET /api/reports/revenue-trends?startDate=2025-04-01
```

**Response:**
```json
{
  "totalRevenue": 125000.00,
  "revenueThisMonth": 15000.00,
  "revenueLastMonth": 12000.00,
  "revenueGrowthRate": 25.0,
  "averageRevenuePerAuction": 450.00,
  "averageRevenuePerDay": 700.00,
  "dailyRevenue": [
    {
      "date": "2025-10-01",
      "revenue": 1500.00,
      "completedAuctions": 3,
      "totalBids": 45
    }
  ],
  "monthlyRevenue": [
    {
      "year": 2025,
      "month": 10,
      "monthName": "October 2025",
      "revenue": 15000.00,
      "completedAuctions": 30,
      "growthRate": 25.0
    }
  ],
  "categoryRevenue": [
    {
      "category": "Electronics",
      "totalRevenue": 50000.00,
      "percentageOfTotal": 40.0,
      "auctionCount": 100
    }
  ],
  "projection": {
    "projectedMonthlyRevenue": 16500.00,
    "projectedYearlyRevenue": 198000.00,
    "confidence": "High"
  }
}
```

**Use Cases:**
- Track revenue growth
- Forecast future revenue
- Identify revenue trends
- Make financial decisions

---

## 4. Analytics Dashboard

### GET `/api/reports/analytics-dashboard`

Get comprehensive analytics dashboard with all key metrics.

**Example Request:**
```
GET /api/reports/analytics-dashboard
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 500,
    "totalAuctions": 250,
    "totalBids": 3000,
    "totalRevenue": 125000.00,
    "newUsersThisMonth": 45,
    "newAuctionsThisMonth": 30,
    "revenueThisMonth": 15000.00
  },
  "userGrowth": {
    "totalUsers": 500,
    "activeUsers": 420,
    "newUsersToday": 5,
    "newUsersThisWeek": 25,
    "newUsersThisMonth": 45,
    "growthRate": 12.5,
    "growthTrend": []
  },
  "auctionMetrics": {
    "totalAuctions": 250,
    "activeAuctions": 35,
    "completedAuctions": 180,
    "completionRate": 72.0,
    "averageDuration": 7.5,
    "averageBidsPerAuction": 12.0
  },
  "revenueMetrics": {
    "totalRevenue": 125000.00,
    "revenueToday": 500.00,
    "revenueThisWeek": 3500.00,
    "revenueThisMonth": 15000.00,
    "revenueThisYear": 85000.00,
    "growthRate": 25.0
  },
  "keyPerformanceIndicators": [
    {
      "name": "User Growth",
      "value": "+45",
      "change": "12.5%",
      "trend": "up",
      "description": "New users this month"
    }
  ]
}
```

**Use Cases:**
- Executive dashboard overview
- Monitor platform health
- Track all key metrics
- Quick decision-making

---

## 5. Additional Endpoints

### GET `/api/reports/summary`

Get quick summary statistics.

**Response:**
```json
{
  "totalRevenue": 125000.00,
  "totalUsers": 500,
  "totalAuctions": 250,
  "totalBids": 3000,
  "activeAuctions": 35,
  "revenueThisMonth": 15000.00,
  "revenueGrowth": 25.0,
  "userGrowth": 12.5,
  "completionRate": 72.0
}
```

---

### GET `/api/reports/category-performance`

Get performance metrics by category.

**Query Parameters:**
- `startDate` (DateTime, optional)
- `endDate` (DateTime, optional)

**Response:**
```json
[
  {
    "category": "Electronics",
    "totalAuctions": 50,
    "completedAuctions": 40,
    "totalRevenue": 25000.00,
    "averageSalePrice": 625.00,
    "totalBids": 600
  }
]
```

---

### GET `/api/reports/top-auctions`

Get top performing auctions.

**Query Parameters:**
- `topN` (int, optional) - Number of auctions to return (default: 10)
- `startDate` (DateTime, optional)
- `endDate` (DateTime, optional)

---

### GET `/api/reports/top-bidders`

Get top bidders by activity.

**Query Parameters:**
- `topN` (int, optional) - Number of bidders to return (default: 10)
- `startDate` (DateTime, optional)
- `endDate` (DateTime, optional)

---

### GET `/api/reports/bidding-trends`

Get bidding trends over time.

**Query Parameters:**
- `startDate` (DateTime, optional)
- `endDate` (DateTime, optional)

**Response:**
```json
[
  {
    "date": "2025-10-01",
    "totalBids": 150,
    "totalBidAmount": 5000.00,
    "uniqueBidders": 45
  }
]
```

---

### GET `/api/reports/revenue-by-category`

Get revenue breakdown by category.

**Query Parameters:**
- `startDate` (DateTime, optional)
- `endDate` (DateTime, optional)

**Response:**
```json
[
  {
    "category": "Electronics",
    "totalRevenue": 50000.00,
    "percentageOfTotal": 40.0,
    "auctionCount": 100
  }
]
```

---

### GET `/api/reports/monthly-revenue`

Get monthly revenue trends.

**Query Parameters:**
- `startDate` (DateTime, optional)
- `endDate` (DateTime, optional)

**Response:**
```json
[
  {
    "year": 2025,
    "month": 10,
    "monthName": "October 2025",
    "revenue": 15000.00,
    "completedAuctions": 30,
    "growthRate": 25.0
  }
]
```

---

### GET `/api/reports/daily-revenue`

Get daily revenue breakdown.

---

### GET `/api/reports/revenue-projection`

Get revenue projections based on historical data.

**Response:**
```json
{
  "projectedMonthlyRevenue": 16500.00,
  "projectedYearlyRevenue": 198000.00,
  "confidence": "High"
}
```

---

### GET `/api/reports/kpis`

Get key performance indicators with trends.

**Response:**
```json
[
  {
    "name": "User Growth",
    "value": "+45",
    "change": "12.5%",
    "trend": "up",
    "description": "New users this month"
  }
]
```

---

## Error Responses

All endpoints return standard error responses:

**500 Internal Server Error:**
```json
{
  "message": "Error generating report",
  "error": "Detailed error message"
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized access"
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions. Administrator role required."
}
```

---

## Data Models

### ReportFilterDto
```csharp
{
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "category": "Electronics",
  "status": "Sold",
  "topN": 10
}
```

---

## Best Practices

1. **Date Ranges**: Always specify date ranges for better performance
2. **Pagination**: Use `topN` parameter to limit result size
3. **Caching**: Consider caching report results for frequently accessed data
4. **Scheduled Reports**: Generate reports during off-peak hours for large datasets
5. **Export**: Use the data for further analysis in BI tools

---

## Integration Examples

### JavaScript/React
```javascript
const getAuctionPerformance = async () => {
  const response = await fetch('/api/reports/auction-performance?topN=20', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

### C# Client
```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", token);
    
var response = await client.GetAsync(
    "/api/reports/analytics-dashboard");
var dashboard = await response.Content
    .ReadAsAsync<AnalyticsDashboardDto>();
```

---

## Performance Considerations

- Reports are generated in real-time from the database
- Large date ranges may take longer to process
- Consider implementing caching for frequently accessed reports
- Use filters to reduce data processing time
- Top-N queries are optimized for performance

---

## Future Enhancements

- Export to CSV/Excel formats
- Scheduled report generation
- Custom report builder
- Real-time analytics dashboard
- Email report delivery
- Comparative analytics (year-over-year)
- Predictive analytics using ML

---

## Support

For questions or issues with the reporting APIs, please contact the development team or refer to the main API documentation.

