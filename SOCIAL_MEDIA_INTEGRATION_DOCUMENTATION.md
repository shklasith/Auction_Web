# Social Media Integration Documentation

## Overview

This document describes the comprehensive social media integration features implemented for the Auction Web platform. The system enables users to share auctions across multiple social platforms, track engagement, and analyze the effectiveness of social media promotions.

## Features Implemented

### ✅ Core Features

1. **Multi-Platform Sharing**
   - Facebook
   - Twitter (X)
   - LinkedIn
   - Instagram
   - WhatsApp
   - Pinterest
   - Email
   - Direct link copying

2. **Share Tracking & Analytics**
   - Track shares per auction
   - Monitor click-through rates
   - Track conversions (shares that lead to bids)
   - Platform-specific analytics

3. **Social Media Account Management**
   - Connect multiple social accounts
   - Auto-share new auctions
   - Manage account connections

4. **Share Templates**
   - Platform-specific templates
   - Custom message support
   - Hashtag management
   - Character limit validation

5. **Influencer/Referral System**
   - Track top sharers
   - Calculate conversion rates
   - Generate referral codes
   - Revenue attribution

## API Endpoints

### Base URL: `/api/socialmedia`

---

### 1. Share an Auction

**POST** `/api/socialmedia/share`

Share a single auction on a social media platform.

**Authentication:** Required

**Request Body:**
```json
{
  "auctionId": 123,
  "platform": "Facebook",
  "customMessage": "Check out this amazing vintage camera!",
  "hashtags": ["auction", "photography", "vintage"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auction shared successfully on Facebook",
  "shareUrl": "https://www.facebook.com/sharer/sharer.php?u=...",
  "shareText": "🔥 Vintage Camera - Current bid: $150.00! Don't miss out!",
  "platform": "Facebook",
  "metadata": {
    "title": "Vintage Camera - Online Auction",
    "description": "Amazing vintage camera in excellent condition...",
    "imageUrl": "https://example.com/images/camera.jpg",
    "url": "https://example.com/auction/123",
    "openGraphTags": { ... },
    "twitterCardTags": { ... }
  }
}
```

**Platform Options:**
- `Facebook`
- `Twitter`
- `LinkedIn`
- `Instagram`
- `WhatsApp`
- `Pinterest`
- `Email`
- `CopyLink`

---

### 2. Bulk Share Auctions

**POST** `/api/socialmedia/share/bulk`

Share multiple auctions across multiple platforms simultaneously.

**Authentication:** Required

**Request Body:**
```json
{
  "auctionIds": [123, 124, 125],
  "platforms": ["Facebook", "Twitter", "LinkedIn"],
  "customMessage": "Amazing auction deals!",
  "hashtags": ["auction", "deals", "bidding"]
}
```

**Response:**
```json
[
  {
    "success": true,
    "message": "Auction shared successfully on Facebook",
    "shareUrl": "...",
    "platform": "Facebook"
  },
  // ... more results
]
```

---

### 3. Get Share Metadata

**GET** `/api/socialmedia/metadata/{auctionId}`

Generate Open Graph and Twitter Card metadata for an auction.

**Query Parameters:**
- `platform` (optional): Target platform (default: Facebook)

**Response:**
```json
{
  "title": "Vintage Camera - Online Auction",
  "description": "Amazing vintage camera in excellent condition...",
  "imageUrl": "https://example.com/images/camera.jpg",
  "url": "https://example.com/auction/123",
  "openGraphTags": {
    "og:type": "product",
    "og:title": "Vintage Camera - Online Auction",
    "og:image": "https://example.com/images/camera.jpg",
    "product:price:amount": "150.00",
    "product:price:currency": "USD"
  },
  "twitterCardTags": {
    "twitter:card": "summary_large_image",
    "twitter:title": "Vintage Camera - Online Auction",
    "twitter:image": "https://example.com/images/camera.jpg"
  }
}
```

---

### 4. Get Social Preview

**GET** `/api/socialmedia/preview/{auctionId}`

Get a preview of how the auction will appear on a social platform.

**Query Parameters:**
- `platform` (optional): Target platform (default: Facebook)

**Response:**
```json
{
  "platform": "Twitter",
  "title": "Vintage Camera - Online Auction",
  "description": "Amazing vintage camera...",
  "imageUrl": "https://example.com/images/camera.jpg",
  "characterCount": 75,
  "characterLimit": 280,
  "isValid": true,
  "validationErrors": [],
  "previewHtml": "<div class='social-preview twitter'>...</div>"
}
```

---

### 5. Get Share Analytics

**GET** `/api/socialmedia/analytics/auction/{auctionId}`

Get detailed analytics for an auction's social media shares.

**Authentication:** Required

**Response:**
```json
{
  "auctionId": 123,
  "auctionTitle": "Vintage Camera",
  "totalShares": 45,
  "totalClicks": 320,
  "totalConversions": 15,
  "conversionRate": 4.69,
  "sharesByPlatform": [
    {
      "platform": "Facebook",
      "shareCount": 20,
      "clicks": 150,
      "conversions": 8,
      "conversionRate": 5.33
    },
    {
      "platform": "Twitter",
      "shareCount": 15,
      "clicks": 120,
      "conversions": 5,
      "conversionRate": 4.17
    }
  ],
  "topSharers": [
    {
      "userId": "user-123",
      "username": "john_doe",
      "shareCount": 5,
      "totalClicks": 45,
      "totalConversions": 3
    }
  ]
}
```

---

### 6. Get Share Statistics Summary

**GET** `/api/socialmedia/stats/summary`

Get overall share statistics for the platform or user.

**Authentication:** Required

**Query Parameters:**
- `userOnly` (boolean): Get stats for current user only (default: false)

**Response:**
```json
{
  "totalShares": 1250,
  "totalClicks": 8500,
  "totalConversions": 425,
  "overallConversionRate": 5.0,
  "mostPopularPlatform": "Facebook",
  "sharesThisWeek": 150,
  "sharesThisMonth": 600,
  "growthRate": 15.5
}
```

---

### 7. Manage Social Media Accounts

#### Get Connected Accounts

**GET** `/api/socialmedia/accounts`

Get user's connected social media accounts.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": 1,
    "platform": "Facebook",
    "accountName": "John's Page",
    "isConnected": true,
    "autoShare": true,
    "connectedDate": "2025-09-15T10:30:00Z",
    "lastUsedDate": "2025-10-14T15:45:00Z"
  }
]
```

#### Connect Account

**POST** `/api/socialmedia/accounts/connect`

Connect a social media account.

**Authentication:** Required

**Request Body:**
```json
{
  "platform": "Facebook",
  "accountName": "My Business Page",
  "accessToken": "token_here",
  "refreshToken": "refresh_token_here",
  "autoShare": true
}
```

#### Disconnect Account

**POST** `/api/socialmedia/accounts/disconnect/{platform}`

Disconnect a social media account.

**Authentication:** Required

---

### 8. Share Templates

#### Get Templates

**GET** `/api/socialmedia/templates`

Get available share templates.

**Query Parameters:**
- `platform` (optional): Filter by platform

**Response:**
```json
[
  {
    "id": 1,
    "platform": "Twitter",
    "template": "🔥 {title} - Current bid: {price}! Don't miss out! Ends {endDate}",
    "hashtags": "#auction #bidding #deals",
    "isActive": true,
    "isDefault": true
  }
]
```

#### Create Template

**POST** `/api/socialmedia/templates`

Create a new share template (Admin only).

**Authentication:** Required (Administrator role)

**Request Body:**
```json
{
  "platform": "Twitter",
  "template": "Amazing deal: {title} at {price}! Ends {endDate}",
  "hashtags": "#auction #deals",
  "isDefault": false
}
```

---

### 9. Track Share Click

**POST** `/api/socialmedia/track-click/{shareId}`

Track when someone clicks on a shared link.

**Request Body:**
```json
{
  "shareId": "share-123",
  "referrerUrl": "https://facebook.com",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
}
```

---

### 10. Get Top Influencers

**GET** `/api/socialmedia/influencers/top`

Get top influencers/sharers (Admin only).

**Authentication:** Required (Administrator role)

**Query Parameters:**
- `topN` (int): Number of influencers to return (default: 10)

**Response:**
```json
[
  {
    "userId": "user-123",
    "username": "john_doe",
    "totalShares": 150,
    "totalClicks": 1200,
    "totalConversions": 65,
    "conversionRate": 5.42,
    "totalRevenueGenerated": 15000.00,
    "referralCode": "REF-USER123",
    "rank": 1
  }
]
```

---

### 11. Get Quick Share Links

**GET** `/api/socialmedia/quick-share/{auctionId}`

Generate share links for all platforms at once.

**Response:**
```json
{
  "Facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
  "Twitter": "https://twitter.com/intent/tweet?url=...",
  "LinkedIn": "https://www.linkedin.com/sharing/share-offsite/?url=...",
  "WhatsApp": "https://wa.me/?text=...",
  "Pinterest": "https://pinterest.com/pin/create/button/?url=...",
  "Email": "mailto:?subject=..."
}
```

---

## Template Variables

When creating share templates, you can use these variables:

- `{title}` - Auction title
- `{price}` - Current price
- `{endDate}` - Auction end date
- `{description}` - Auction description (truncated)

**Example:**
```
"🔥 {title} - Current bid: {price}! Don't miss out! Ends {endDate}"
```

**Result:**
```
"🔥 Vintage Camera - Current bid: $150.00! Don't miss out! Ends Oct 20, 2025"
```

---

## Character Limits by Platform

- **Twitter**: 280 characters
- **Instagram**: 2,200 characters
- **Facebook**: 63,206 characters
- **LinkedIn**: 3,000 characters
- **Others**: No limit

The system automatically validates content length and provides warnings if limits are exceeded.

---

## Open Graph & Twitter Card Tags

The system automatically generates proper meta tags for rich previews:

### Open Graph (Facebook, LinkedIn)
```html
<meta property="og:type" content="product">
<meta property="og:title" content="Vintage Camera - Online Auction">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">
<meta property="product:price:amount" content="150.00">
<meta property="product:price:currency" content="USD">
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Vintage Camera - Online Auction">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

---

## Integration Examples

### JavaScript/React

```javascript
// Share an auction
const shareAuction = async (auctionId, platform) => {
  const response = await fetch('/api/socialmedia/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      auctionId: auctionId,
      platform: platform,
      hashtags: ['auction', 'deals']
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Open share URL in new window
    window.open(result.shareUrl, '_blank', 'width=600,height=400');
  }
};

// Get analytics
const getShareAnalytics = async (auctionId) => {
  const response = await fetch(`/api/socialmedia/analytics/auction/${auctionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### C# Client

```csharp
// Share an auction
var shareDto = new ShareAuctionDto
{
    AuctionId = 123,
    Platform = SocialPlatform.Facebook,
    CustomMessage = "Check this out!",
    Hashtags = new List<string> { "auction", "deals" }
};

var response = await client.PostAsJsonAsync("/api/socialmedia/share", shareDto);
var result = await response.Content.ReadAsAsync<ShareResponseDto>();
```

---

## Frontend Components

### Share Button Component (React)

```jsx
import React, { useState } from 'react';

const ShareButton = ({ auctionId, platform }) => {
  const [sharing, setSharing] = useState(false);
  
  const handleShare = async () => {
    setSharing(true);
    try {
      const response = await fetch('/api/socialmedia/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          auctionId,
          platform,
          hashtags: ['auction']
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.open(result.shareUrl, '_blank', 'width=600,height=400');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setSharing(false);
    }
  };
  
  return (
    <button onClick={handleShare} disabled={sharing}>
      Share on {platform}
    </button>
  );
};
```

### Share Analytics Dashboard

```jsx
const ShareAnalytics = ({ auctionId }) => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetch(`/api/socialmedia/analytics/auction/${auctionId}`)
      .then(res => res.json())
      .then(setAnalytics);
  }, [auctionId]);
  
  if (!analytics) return <div>Loading...</div>;
  
  return (
    <div className="share-analytics">
      <h3>Social Media Performance</h3>
      <div className="stats">
        <div>Total Shares: {analytics.totalShares}</div>
        <div>Total Clicks: {analytics.totalClicks}</div>
        <div>Conversions: {analytics.totalConversions}</div>
        <div>Conversion Rate: {analytics.conversionRate}%</div>
      </div>
      
      <h4>By Platform</h4>
      {analytics.sharesByPlatform.map(platform => (
        <div key={platform.platform}>
          {platform.platform}: {platform.shareCount} shares, 
          {platform.clicks} clicks ({platform.conversionRate}% conversion)
        </div>
      ))}
    </div>
  );
};
```

---

## Database Schema

### SocialShare Table
```sql
CREATE TABLE SocialShares (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    AuctionId INT NOT NULL,
    UserId VARCHAR(255) NOT NULL,
    Platform ENUM('Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'WhatsApp', 'Pinterest', 'Email', 'CopyLink'),
    SharedDate DATETIME NOT NULL,
    ShareUrl TEXT,
    ShareMessage TEXT,
    Clicks INT DEFAULT 0,
    Conversions INT DEFAULT 0,
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
);
```

### SocialMediaAccount Table
```sql
CREATE TABLE SocialMediaAccounts (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId VARCHAR(255) NOT NULL,
    Platform ENUM(...),
    AccountName VARCHAR(100) NOT NULL,
    AccessToken TEXT,
    RefreshToken TEXT,
    TokenExpiry DATETIME,
    IsConnected BOOLEAN DEFAULT TRUE,
    AutoShare BOOLEAN DEFAULT FALSE,
    ConnectedDate DATETIME NOT NULL,
    LastUsedDate DATETIME,
    UNIQUE(UserId, Platform),
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
);
```

### ShareTemplate Table
```sql
CREATE TABLE ShareTemplates (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Platform ENUM(...),
    Template VARCHAR(500) NOT NULL,
    Hashtags VARCHAR(200),
    IsActive BOOLEAN DEFAULT TRUE,
    IsDefault BOOLEAN DEFAULT FALSE,
    CreatedDate DATETIME NOT NULL
);
```

---

## Best Practices

1. **Always track shares** to measure effectiveness
2. **Use platform-specific templates** for better engagement
3. **Monitor conversion rates** to optimize strategies
4. **Leverage influencers** with high conversion rates
5. **Test different messages** and hashtags
6. **Include compelling images** in auctions for better social previews
7. **Time shares strategically** based on platform analytics
8. **Use auto-share sparingly** to avoid spam

---

## Security Considerations

1. **Authentication Required**: All write operations require authentication
2. **Rate Limiting**: Consider implementing rate limits on share endpoints
3. **Token Security**: Social media tokens are stored securely and can be revoked
4. **Input Validation**: All inputs are validated and sanitized
5. **CORS**: Properly configured for frontend integration

---

## Future Enhancements

- Direct posting to social media (not just share URLs)
- Scheduled sharing
- A/B testing for share messages
- Advanced analytics with machine learning
- Social media listening and monitoring
- Automated hashtag suggestions
- Image optimization for each platform
- Video sharing support
- Story/Reel integration for Instagram

---

## Support

For issues or questions about the social media integration, refer to the main API documentation or contact the development team.

