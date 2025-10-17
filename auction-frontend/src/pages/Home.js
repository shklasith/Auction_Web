import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [trendingAuctions, setTrendingAuctions] = useState([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 50000,
    itemsSold: 25000,
    satisfactionRate: 98,
    activeAuctions: 1250
  });

  // Mock data for trending and ending soon auctions
  const mockTrendingAuctions = [
    {
      id: 101,
      title: "Vintage Watch Collection",
      currentPrice: 1250.00,
      startingPrice: 800.00,
      bidCount: 28,
      endDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
      images: [{ imageUrl: "https://via.placeholder.com/200x150/4a90e2/ffffff?text=Vintage+Watch" }],
      category: "Collectibles"
    },
    {
      id: 102,
      title: "Gaming Laptop RTX 4080",
      currentPrice: 1899.00,
      startingPrice: 1200.00,
      bidCount: 45,
      endDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      images: [{ imageUrl: "https://via.placeholder.com/200x150/50c878/ffffff?text=Gaming+Laptop" }],
      category: "Electronics"
    },
    {
      id: 103,
      title: "Designer Handbag Set",
      currentPrice: 650.00,
      startingPrice: 400.00,
      bidCount: 22,
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      images: [{ imageUrl: "https://via.placeholder.com/200x150/ff6b6b/ffffff?text=Designer+Bag" }],
      category: "Fashion"
    }
  ];

  const mockEndingSoonAuctions = [
    {
      id: 104,
      title: "Rare Art Print",
      currentPrice: 380.00,
      bidCount: 15,
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      images: [{ imageUrl: "https://via.placeholder.com/200x150/e91e63/ffffff?text=Art+Print" }],
      category: "Art"
    },
    {
      id: 105,
      title: "Antique Furniture",
      currentPrice: 520.00,
      bidCount: 12,
      endDate: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      images: [{ imageUrl: "https://via.placeholder.com/200x150/795548/ffffff?text=Antique" }],
      category: "Furniture"
    }
  ];

  useEffect(() => {
    fetchFeaturedAuctions();
    fetchCategories();
    setTrendingAuctions(mockTrendingAuctions);
    setEndingSoonAuctions(mockEndingSoonAuctions);
  }, []);

  const fetchFeaturedAuctions = async () => {
    try {
            const response = await axios.get('http://localhost:5104/api/Auctions?featured=true');
      setFeaturedAuctions(response.data);
    } catch (error) {
      console.error('Error fetching featured auctions:', error);
      // Use mock data for demo
      setFeaturedAuctions(mockTrendingAuctions);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
            const response = await axios.get('http://localhost:5104/api/Auctions/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;
    
    if (timeDiff <= 0) return 'Ended';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgressPercentage = (current, starting) => {
    const increase = ((current - starting) / starting) * 100;
    return Math.min(increase, 100);
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/auctions?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* Enhanced Hero Section */}
      <section className="hero-section-enhanced bg-primary text-white position-relative">
        <Container>
          <Row className="align-items-center min-vh-60">
            <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
              <div className="hero-content">
                <h1 className="display-3 fw-bold mb-4 hero-title">
                  Discover <span className="text-warning">Amazing</span> Auctions
                </h1>
                <p className="lead mb-4 hero-subtitle">
                  Join thousands of buyers and sellers in the world's most trusted auction marketplace. 
                  Find unique treasures and bid with confidence.
                </p>
                
                {/* Hero Search Bar */}
                <Form onSubmit={handleHeroSearch} className="hero-search mb-4">
                  <InputGroup size="lg">
                    <Form.Control
                      type="text"
                      placeholder="Search for auctions, categories, or items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="hero-search-input"
                    />
                    <Button variant="warning" type="submit" className="hero-search-btn">
                      <i className="fas fa-search me-2"></i>Search
                    </Button>
                  </InputGroup>
                </Form>

                <div className="hero-buttons d-flex gap-3 justify-content-center justify-content-lg-start flex-wrap">
                  <Button as={Link} to="/auctions" variant="light" size="lg" className="hero-btn">
                    <i className="fas fa-eye me-2"></i>Browse Auctions
                  </Button>
                  <Button as={Link} to="/create-auction" variant="outline-light" size="lg" className="hero-btn">
                    <i className="fas fa-plus me-2"></i>Start Selling
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-visual">
                <div className="hero-icon-container">
                  <div className="floating-card">
                    <i className="fas fa-gavel display-1 text-warning hero-gavel"></i>
                  </div>
                  <div className="hero-stats-mini">
                    <div className="stat-bubble">
                      <span className="fw-bold">50K+</span>
                      <small>Users</small>
                    </div>
                    <div className="stat-bubble">
                      <span className="fw-bold">25K+</span>
                      <small>Sales</small>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Stats Bar */}
      <section className="quick-stats bg-white shadow-sm">
        <Container>
          <Row className="py-4">
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="stat-item-inline">
                <i className="fas fa-users text-primary me-2"></i>
                <span className="fw-bold fs-5">{stats.totalUsers.toLocaleString()}+</span>
                <small className="text-muted ms-2">Active Users</small>
              </div>
            </Col>
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="stat-item-inline">
                <i className="fas fa-shopping-cart text-success me-2"></i>
                <span className="fw-bold fs-5">{stats.itemsSold.toLocaleString()}+</span>
                <small className="text-muted ms-2">Items Sold</small>
              </div>
            </Col>
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="stat-item-inline">
                <i className="fas fa-star text-warning me-2"></i>
                <span className="fw-bold fs-5">{stats.satisfactionRate}%</span>
                <small className="text-muted ms-2">Satisfaction</small>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="stat-item-inline">
                <i className="fas fa-clock text-info me-2"></i>
                <span className="fw-bold fs-5">{stats.activeAuctions.toLocaleString()}</span>
                <small className="text-muted ms-2">Live Auctions</small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-5 categories-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Explore Categories</h2>
            <p className="text-muted fs-5">Discover amazing items across our diverse marketplace</p>
          </div>
          <Row className="g-4">
            {['Electronics', 'Fashion', 'Furniture', 'Art', 'Collectibles', 'Sports'].map((category, index) => (
              <Col xs={6} md={4} lg={2} key={index}>
                <Card 
                  as={Link} 
                  to={`/category/${category.toLowerCase()}`}
                  className="h-100 category-card-enhanced shadow-sm border-0 text-center text-decoration-none"
                >
                  <Card.Body className="p-4">
                    <div className="category-icon-enhanced mb-3">
                      <i className={`fas ${
                        category === 'Electronics' ? 'fa-laptop' :
                        category === 'Fashion' ? 'fa-tshirt' :
                        category === 'Furniture' ? 'fa-chair' :
                        category === 'Art' ? 'fa-palette' :
                        category === 'Collectibles' ? 'fa-gem' :
                        'fa-football-ball'
                      } fa-3x text-primary`}></i>
                    </div>
                    <h6 className="card-title fw-bold mb-2 text-dark">{category}</h6>
                    <small className="text-muted">Browse {category}</small>
                    <div className="category-arrow mt-2">
                      <i className="fas fa-arrow-right text-primary"></i>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Hot Auctions Section */}
      <section className="py-5 bg-light hot-auctions-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">
              <i className="fas fa-fire text-danger me-2"></i>
              Trending Auctions
            </h2>
            <p className="text-muted">The hottest items everyone's bidding on</p>
          </div>
          
          <Row className="g-4">
            {trendingAuctions.map((auction) => (
              <Col md={6} lg={4} key={auction.id}>
                <Card className="h-100 trending-auction-card shadow border-0">
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={auction.images[0]?.imageUrl} 
                      style={{ height: '200px', objectFit: 'cover' }}
                      alt={auction.title}
                    />
                    <Badge bg="danger" className="position-absolute top-0 start-0 m-2 trending-badge">
                      <i className="fas fa-fire me-1"></i>HOT
                    </Badge>
                    <Badge bg="dark" className="position-absolute bottom-0 start-0 m-2">
                      {formatTimeRemaining(auction.endDate)}
                    </Badge>
                    <div className="bid-progress position-absolute bottom-0 start-0 w-100">
                      <ProgressBar 
                        now={getProgressPercentage(auction.currentPrice, auction.startingPrice)} 
                        variant="warning"
                        style={{ height: '4px', borderRadius: 0 }}
                      />
                    </div>
                  </div>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="h6 mb-0">{auction.title}</Card.Title>
                      <Badge bg="outline-primary" className="category-badge">{auction.category}</Badge>
                    </div>
                    <div className="price-info mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">Current Bid</small>
                          <div className="fw-bold text-success fs-5">${auction.currentPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">{auction.bidCount} bids</small>
                          <div className="bid-activity">
                            <i className="fas fa-trending-up text-success me-1"></i>
                            <small className="text-success">Active</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button as={Link} to={`/auction/${auction.id}`} variant="primary" className="w-100">
                      Place Bid
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Ending Soon Section */}
      <section className="py-5 ending-soon-section">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h2 className="display-6 fw-bold mb-2">
                <i className="fas fa-clock text-warning me-2"></i>
                Ending Soon
              </h2>
              <p className="text-muted mb-0">Last chance to bid on these items</p>
            </div>
            <Button as={Link} to="/auctions?sort=ending-soon" variant="outline-primary">
              View All <i className="fas fa-arrow-right ms-1"></i>
            </Button>
          </div>
          
          <Row className="g-4">
            {endingSoonAuctions.map((auction) => (
              <Col md={6} key={auction.id}>
                <Card className="ending-soon-card border-warning border-2 h-100">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={4}>
                        <img 
                          src={auction.images[0]?.imageUrl} 
                          alt={auction.title}
                          className="img-fluid rounded"
                          style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col md={8}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-1">{auction.title}</h6>
                          <Badge bg="warning" text="dark">
                            {formatTimeRemaining(auction.endDate)}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <span className="text-muted small">Current Bid: </span>
                          <span className="fw-bold text-success">${auction.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted">{auction.bidCount} bids • {auction.category}</small>
                        </div>
                        <Button as={Link} to={`/auction/${auction.id}`} variant="warning" size="sm" className="w-100">
                          Quick Bid
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Enhanced How It Works */}
      <section className="py-5 bg-light how-it-works-enhanced">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">How AuctionHub Works</h2>
            <p className="text-muted fs-5">Start your auction journey in three simple steps</p>
          </div>
          <Row className="g-5">
            <Col md={4}>
              <div className="text-center step-content-enhanced">
                <div className="step-number-container mb-4">
                  <div className="step-number">1</div>
                  <div className="step-icon">
                    <i className="fas fa-search fa-2x text-primary"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Browse & Discover</h4>
                <p className="text-muted mb-4">
                  Explore thousands of unique items across various categories. Use our advanced search and filters to find exactly what you're looking for.
                </p>
                <Button as={Link} to="/auctions" variant="outline-primary" size="sm">
                  Start Browsing
                </Button>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center step-content-enhanced">
                <div className="step-number-container mb-4">
                  <div className="step-number">2</div>
                  <div className="step-icon">
                    <i className="fas fa-hand-paper fa-2x text-primary"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Place Your Bid</h4>
                <p className="text-muted mb-4">
                  Bid on items you love and track your progress in real-time. Get notifications when you're outbid and never miss an opportunity.
                </p>
                <Button as={Link} to="/auctions" variant="outline-primary" size="sm">
                  View Live Auctions
                </Button>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center step-content-enhanced">
                <div className="step-number-container mb-4">
                  <div className="step-number">3</div>
                  <div className="step-icon">
                    <i className="fas fa-trophy fa-2x text-primary"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-3">Win & Enjoy</h4>
                <p className="text-muted mb-4">
                  Win auctions and get your items delivered safely to your door. Our secure payment system ensures a worry-free experience.
                </p>
                <Button as={Link} to="/create-auction" variant="outline-primary" size="sm">
                  Start Selling
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Statistics Section */}
      <section className="py-5 bg-primary text-white stats-section-enhanced">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Join Our Growing Community</h2>
            <p className="lead opacity-75">Trusted by thousands of buyers and sellers worldwide</p>
          </div>
          <Row className="text-center">
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-item-enhanced">
                <div className="stat-icon mb-3">
                  <i className="fas fa-users fa-3x"></i>
                </div>
                <h3 className="display-4 fw-bold mb-2 counter-number">50K+</h3>
                <p className="mb-0 opacity-75">Active Users</p>
              </div>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-item-enhanced">
                <div className="stat-icon mb-3">
                  <i className="fas fa-handshake fa-3x"></i>
                </div>
                <h3 className="display-4 fw-bold mb-2 counter-number">25K+</h3>
                <p className="mb-0 opacity-75">Successful Transactions</p>
              </div>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-item-enhanced">
                <div className="stat-icon mb-3">
                  <i className="fas fa-smile fa-3x"></i>
                </div>
                <h3 className="display-4 fw-bold mb-2 counter-number">98%</h3>
                <p className="mb-0 opacity-75">Customer Satisfaction</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-item-enhanced">
                <div className="stat-icon mb-3">
                  <i className="fas fa-headset fa-3x"></i>
                </div>
                <h3 className="display-4 fw-bold mb-2 counter-number">24/7</h3>
                <p className="mb-0 opacity-75">Customer Support</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-5 newsletter-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h3 className="fw-bold mb-3">Stay Updated with AuctionHub</h3>
              <p className="text-muted mb-0">
                Get the latest auction alerts, exclusive deals, and insider tips delivered to your inbox.
              </p>
            </Col>
            <Col lg={6}>
              <Form className="newsletter-form">
                <InputGroup size="lg">
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    className="newsletter-input"
                  />
                  <Button variant="primary" className="newsletter-btn">
                    <i className="fas fa-envelope me-2"></i>Subscribe
                  </Button>
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
