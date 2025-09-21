import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock watchlist data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWatchlistItems([
        {
          id: 1,
          auctionId: 1,
          title: "Vintage Camera Collection",
          currentPrice: 125.50,
          startingPrice: 50.00,
          buyNowPrice: 300.00,
          bidCount: 8,
          endDate: "2025-01-10T15:30:00Z",
          imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&w=400",
          category: "Electronics",
          addedDate: "2025-01-05T10:00:00Z"
        },
        {
          id: 2,
          auctionId: 3,
          title: "Antique Wooden Desk",
          currentPrice: 275.00,
          startingPrice: 100.00,
          bidCount: 5,
          endDate: "2025-01-12T18:00:00Z",
          imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400",
          category: "Furniture",
          addedDate: "2025-01-04T14:30:00Z"
        },
        {
          id: 3,
          auctionId: 4,
          title: "Rare Art Painting",
          currentPrice: 850.00,
          startingPrice: 500.00,
          buyNowPrice: 1200.00,
          bidCount: 15,
          endDate: "2025-01-08T20:00:00Z",
          imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&w=400",
          category: "Art",
          addedDate: "2025-01-03T09:15:00Z"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const removeFromWatchlist = (itemId) => {
    setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
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

  const calculatePriceIncrease = (current, starting) => {
    const increase = ((current - starting) / starting) * 100;
    return increase.toFixed(1);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1><i className="fas fa-heart text-danger me-2"></i>My Watchlist</h1>
          <p className="text-muted">Keep track of auctions you're interested in</p>
        </div>
        <Button as={Link} to="/auctions" variant="primary">
          <i className="fas fa-search me-2"></i>Browse More Auctions
        </Button>
      </div>

      {watchlistItems.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-heart fa-4x text-muted mb-4"></i>
          <h3>Your watchlist is empty</h3>
          <p className="text-muted mb-4">
            Start adding auctions to your watchlist to keep track of items you're interested in.
          </p>
          <Button as={Link} to="/auctions" variant="primary" size="lg">
            <i className="fas fa-search me-2"></i>Browse Auctions
          </Button>
        </div>
      ) : (
        <>
          <Alert variant="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            You have {watchlistItems.length} item{watchlistItems.length !== 1 ? 's' : ''} in your watchlist. 
            We'll notify you when these auctions are ending soon!
          </Alert>

          <Row>
            {watchlistItems.map((item) => (
              <Col md={6} lg={4} key={item.id} className="mb-4">
                <Card className="h-100 watchlist-card shadow-sm border-0">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={item.imageUrl}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Badge 
                      bg={formatTimeRemaining(item.endDate) === 'Ended' ? 'secondary' : 'danger'} 
                      className="position-absolute bottom-0 start-0 m-2"
                    >
                      <i className="fas fa-clock me-1"></i>
                      {formatTimeRemaining(item.endDate)}
                    </Badge>
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => removeFromWatchlist(item.id)}
                      title="Remove from watchlist"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                  
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <Badge bg="secondary" className="me-2">{item.category}</Badge>
                      <small className="text-muted">
                        Added {new Date(item.addedDate).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <Card.Title className="h6">{item.title}</Card.Title>
                    
                    <div className="auction-pricing mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Current Bid:</span>
                        <div className="text-end">
                          <span className="fw-bold text-success fs-5">${item.currentPrice}</span>
                          <div className="text-success small">
                            <i className="fas fa-arrow-up me-1"></i>
                            +{calculatePriceIncrease(item.currentPrice, item.startingPrice)}%
                          </div>
                        </div>
                      </div>
                      
                      {item.buyNowPrice && (
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Buy Now:</span>
                          <span className="fw-bold text-primary">${item.buyNowPrice}</span>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                          <i className="fas fa-hand-paper me-1"></i>{item.bidCount} bids
                        </span>
                        <span className="text-muted small">
                          Started at ${item.startingPrice}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-grid gap-2">
                        <Button 
                          as={Link} 
                          to={`/auction/${item.auctionId}`} 
                          variant="primary"
                        >
                          <i className="fas fa-eye me-2"></i>View Auction
                        </Button>
                        
                        {formatTimeRemaining(item.endDate) !== 'Ended' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => {
                              // Navigate to auction detail page with bid modal open
                              window.location.href = `/auction/${item.auctionId}#bid`;
                            }}
                          >
                            <i className="fas fa-hand-paper me-2"></i>Place Bid
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Watchlist Stats */}
          <Card className="mt-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0"><i className="fas fa-chart-bar me-2"></i>Watchlist Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <h4 className="text-primary mb-1">{watchlistItems.length}</h4>
                  <small className="text-muted">Items Watched</small>
                </Col>
                <Col md={3}>
                  <h4 className="text-success mb-1">
                    {watchlistItems.filter(item => formatTimeRemaining(item.endDate) !== 'Ended').length}
                  </h4>
                  <small className="text-muted">Active Auctions</small>
                </Col>
                <Col md={3}>
                  <h4 className="text-warning mb-1">
                    {watchlistItems.filter(item => {
                      const timeRemaining = formatTimeRemaining(item.endDate);
                      return timeRemaining.includes('h') && !timeRemaining.includes('d');
                    }).length}
                  </h4>
                  <small className="text-muted">Ending Soon</small>
                </Col>
                <Col md={3}>
                  <h4 className="text-info mb-1">
                    ${watchlistItems.reduce((total, item) => total + item.currentPrice, 0).toFixed(2)}
                  </h4>
                  <small className="text-muted">Total Value</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Watchlist;
