import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAuctions();
    fetchCategories();
  }, []);

  const fetchFeaturedAuctions = async () => {
    try {
      const response = await axios.get('/api/auctions?featured=true');
      setFeaturedAuctions(response.data);
    } catch (error) {
      console.error('Error fetching featured auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/auctions/categories');
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
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Discover Amazing Auctions
              </h1>
              <p className="lead mb-4">
                Find unique items, place bids, and win amazing deals on our trusted auction platform.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/auctions" variant="light" size="lg">
                  <i className="fas fa-search me-2"></i>Browse Auctions
                </Button>
                <Button as={Link} to="/create-auction" variant="outline-light" size="lg">
                  <i className="fas fa-plus me-2"></i>Start Selling
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <i className="fas fa-gavel display-1 text-warning"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Shop by Category</h2>
          <Row>
            {['Electronics', 'Fashion', 'Furniture', 'Art', 'Collectibles', 'Sports'].map((category, index) => (
              <Col md={4} lg={2} key={index} className="mb-3">
                <Card className="h-100 category-card shadow-sm border-0">
                  <Card.Body className="text-center p-3">
                    <div className="category-icon mb-2">
                      <i className={`fas ${
                        category === 'Electronics' ? 'fa-laptop' :
                        category === 'Fashion' ? 'fa-tshirt' :
                        category === 'Furniture' ? 'fa-chair' :
                        category === 'Art' ? 'fa-palette' :
                        category === 'Collectibles' ? 'fa-gem' :
                        'fa-football-ball'
                      } fa-2x text-primary`}></i>
                    </div>
                    <h6 className="card-title">{category}</h6>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Auctions */}
      <section className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Featured Auctions</h2>
            <Button as={Link} to="/auctions" variant="outline-primary">
              View All <i className="fas fa-arrow-right ms-1"></i>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Row>
              {featuredAuctions.map((auction) => (
                <Col md={6} lg={4} key={auction.id} className="mb-4">
                  <Card className="h-100 auction-card shadow-sm border-0">
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={auction.images?.[0]?.imageUrl || 'https://via.placeholder.com/300x200'} 
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                        Featured
                      </Badge>
                      <Badge bg="danger" className="position-absolute bottom-0 start-0 m-2">
                        {formatTimeRemaining(auction.endDate)}
                      </Badge>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h6">{auction.title}</Card.Title>
                      <Card.Text className="text-muted small flex-grow-1">
                        {auction.description.substring(0, 100)}...
                      </Card.Text>
                      <div className="auction-info">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Current Bid:</span>
                          <span className="fw-bold text-success">${auction.currentPrice}</span>
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
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="step-icon mb-3">
                <i className="fas fa-search fa-3x text-primary"></i>
              </div>
              <h4>Browse & Discover</h4>
              <p className="text-muted">
                Explore thousands of unique items across various categories.
              </p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="step-icon mb-3">
                <i className="fas fa-hand-paper fa-3x text-primary"></i>
              </div>
              <h4>Place Your Bid</h4>
              <p className="text-muted">
                Bid on items you love and track your progress in real-time.
              </p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="step-icon mb-3">
                <i className="fas fa-trophy fa-3x text-primary"></i>
              </div>
              <h4>Win & Enjoy</h4>
              <p className="text-muted">
                Win auctions and get your items delivered safely to your door.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
