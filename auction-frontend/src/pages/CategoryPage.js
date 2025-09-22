import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Dropdown } from 'react-bootstrap';

const CategoryPage = () => {
  const { category } = useParams();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('ending-soon');
  const [priceRange, setPriceRange] = useState('all');

  // Mock auction data for each category
  const mockAuctions = {
    electronics: [
      {
        id: 1,
        title: "Vintage MacBook Pro 2019",
        description: "Excellent condition MacBook Pro with original charger and box",
        currentPrice: 899.00,
        startingPrice: 650.00,
        bidCount: 12,
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        viewCount: 156,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/4a90e2/ffffff?text=MacBook+Pro" }],
        condition: "Used - Excellent"
      },
      {
        id: 2,
        title: "Gaming Desktop PC Setup",
        description: "High-performance gaming PC with RGB lighting and peripherals",
        currentPrice: 1250.00,
        startingPrice: 800.00,
        bidCount: 8,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        viewCount: 203,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/50c878/ffffff?text=Gaming+PC" }],
        condition: "Used - Good"
      },
      {
        id: 3,
        title: "iPhone 14 Pro Max",
        description: "Unlocked iPhone 14 Pro Max 256GB in Space Black",
        currentPrice: 750.00,
        startingPrice: 500.00,
        bidCount: 15,
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        viewCount: 324,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=iPhone+14" }],
        condition: "Used - Excellent"
      }
    ],
    fashion: [
      {
        id: 4,
        title: "Designer Handbag Collection",
        description: "Authentic Louis Vuitton handbag in excellent condition",
        currentPrice: 450.00,
        startingPrice: 300.00,
        bidCount: 7,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        viewCount: 89,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/ffa726/ffffff?text=Designer+Bag" }],
        condition: "Used - Excellent"
      },
      {
        id: 5,
        title: "Vintage Leather Jacket",
        description: "Classic 1980s leather jacket, size medium",
        currentPrice: 120.00,
        startingPrice: 75.00,
        bidCount: 5,
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        viewCount: 67,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/795548/ffffff?text=Leather+Jacket" }],
        condition: "Used - Good"
      }
    ],
    furniture: [
      {
        id: 6,
        title: "Mid-Century Modern Chair",
        description: "Authentic Eames lounge chair with ottoman",
        currentPrice: 850.00,
        startingPrice: 600.00,
        bidCount: 9,
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        viewCount: 134,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/8e24aa/ffffff?text=Eames+Chair" }],
        condition: "Used - Excellent"
      },
      {
        id: 7,
        title: "Antique Oak Dining Table",
        description: "Beautiful solid oak dining table seats 6-8 people",
        currentPrice: 320.00,
        startingPrice: 200.00,
        bidCount: 4,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        viewCount: 78,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/6d4c41/ffffff?text=Oak+Table" }],
        condition: "Used - Good"
      }
    ],
    art: [
      {
        id: 8,
        title: "Original Oil Painting",
        description: "Beautiful landscape oil painting by local artist",
        currentPrice: 380.00,
        startingPrice: 250.00,
        bidCount: 6,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        viewCount: 92,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/e91e63/ffffff?text=Oil+Painting" }],
        condition: "New"
      }
    ],
    collectibles: [
      {
        id: 9,
        title: "Rare Pokemon Card Set",
        description: "First edition Charizard and complete base set",
        currentPrice: 1200.00,
        startingPrice: 800.00,
        bidCount: 18,
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        viewCount: 456,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/ff9800/ffffff?text=Pokemon+Cards" }],
        condition: "Used - Excellent"
      },
      {
        id: 10,
        title: "Vintage Comic Book Collection",
        description: "Marvel comics from the 1980s, mint condition",
        currentPrice: 650.00,
        startingPrice: 400.00,
        bidCount: 11,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        viewCount: 178,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/2196f3/ffffff?text=Comic+Books" }],
        condition: "Used - Excellent"
      }
    ],
    sports: [
      {
        id: 11,
        title: "Signed Baseball Memorabilia",
        description: "Baseball signed by legendary player with certificate",
        currentPrice: 280.00,
        startingPrice: 150.00,
        bidCount: 7,
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        viewCount: 123,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/009688/ffffff?text=Signed+Baseball" }],
        condition: "Used - Excellent"
      },
      {
        id: 12,
        title: "Professional Golf Club Set",
        description: "Complete set of Titleist golf clubs with bag",
        currentPrice: 450.00,
        startingPrice: 300.00,
        bidCount: 6,
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        viewCount: 87,
        images: [{ imageUrl: "https://via.placeholder.com/300x200/4caf50/ffffff?text=Golf+Clubs" }],
        condition: "Used - Good"
      }
    ]
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const categoryKey = category?.toLowerCase() || 'electronics';
      setAuctions(mockAuctions[categoryKey] || []);
      setLoading(false);
    }, 500);
  }, [category]);

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;
    
    if (timeDiff <= 0) return 'Ended';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      electronics: 'fa-laptop',
      fashion: 'fa-tshirt',
      furniture: 'fa-chair',
      art: 'fa-palette',
      collectibles: 'fa-gem',
      sports: 'fa-football-ball'
    };
    return icons[cat?.toLowerCase()] || 'fa-tag';
  };

  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1) || 'Category';

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading {categoryName} auctions...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Category Header */}
      <div className="category-header mb-4">
        <div className="d-flex align-items-center mb-3">
          <div className="category-icon me-3">
            <i className={`fas ${getCategoryIcon(category)} fa-3x text-primary`}></i>
          </div>
          <div>
            <h1 className="display-6 mb-2">{categoryName} Auctions</h1>
            <p className="text-muted mb-0">
              Discover amazing {categoryName.toLowerCase()} items up for auction
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <Row className="mb-4">
        <Col md={8}>
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <Form.Select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="most-bids">Most Bids</option>
              <option value="newest">Newest</option>
            </Form.Select>
            
            <Form.Select 
              value={priceRange} 
              onChange={(e) => setPriceRange(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Prices</option>
              <option value="under-100">Under $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="over-1000">Over $1,000</option>
            </Form.Select>
          </div>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <span className="text-muted">
            {auctions.length} item{auctions.length !== 1 ? 's' : ''} found
          </span>
        </Col>
      </Row>

      {/* Auction Items Grid */}
      {auctions.length === 0 ? (
        <div className="text-center py-5">
          <i className={`fas ${getCategoryIcon(category)} fa-4x text-muted mb-3`}></i>
          <h4>No {categoryName} Auctions Available</h4>
          <p className="text-muted">Check back later for new auctions in this category.</p>
          <Button as={Link} to="/" variant="primary">
            Browse All Categories
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {auctions.map((auction) => (
            <Col key={auction.id} sm={6} lg={4}>
              <Card className="h-100 auction-card shadow-sm border-0">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={auction.images[0]?.imageUrl} 
                    style={{ height: '200px', objectFit: 'cover' }}
                    alt={auction.title}
                  />
                  <Badge bg="primary" className="position-absolute top-0 start-0 m-2">
                    {categoryName}
                  </Badge>
                  <Badge bg="danger" className="position-absolute bottom-0 start-0 m-2">
                    {formatTimeRemaining(auction.endDate)}
                  </Badge>
                  <Badge bg="secondary" className="position-absolute top-0 end-0 m-2">
                    {auction.condition}
                  </Badge>
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6 mb-2">{auction.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1 mb-3">
                    {auction.description}
                  </Card.Text>
                  <div className="auction-info mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">Current Bid:</span>
                      <span className="fw-bold text-success">${auction.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted small">{auction.bidCount} bids</span>
                      <span className="text-muted small">{auction.viewCount} views</span>
                    </div>
                    <Button as={Link} to={`/auction/${auction.id}`} variant="primary" className="w-100">
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      {auctions.length > 0 && (
        <div className="d-flex justify-content-center mt-5">
          <nav>
            <ul className="pagination">
              <li className="page-item">
                <a className="page-link" href="#" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item">
                <a className="page-link" href="#" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </Container>
  );
};

export default CategoryPage;
