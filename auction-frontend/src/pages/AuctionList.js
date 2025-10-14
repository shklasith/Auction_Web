import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Pagination } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      
                  const response = await axios.get(`http://localhost:5103/api/Auctions?${params}`);
      let auctionData = response.data;
      
      // Apply search filter
      if (filters.search) {
        auctionData = auctionData.filter(auction =>
          auction.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          auction.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'ending':
          auctionData.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
          break;
        case 'price_low':
          auctionData.sort((a, b) => a.currentPrice - b.currentPrice);
          break;
        case 'price_high':
          auctionData.sort((a, b) => b.currentPrice - a.currentPrice);
          break;
        case 'popular':
          auctionData.sort((a, b) => b.bidCount - a.bidCount);
          break;
        default:
          auctionData.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      }
      
      setAuctions(auctionData);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
                  const response = await axios.get('http://localhost:5103/api/Auctions/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
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

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>All Auctions</h1>
        <Button as={Link} to="/create-auction" variant="success">
          <i className="fas fa-plus me-2"></i>Create Auction
        </Button>
      </div>

      <Row>
        {/* Filters Sidebar */}
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0"><i className="fas fa-filter me-2"></i>Filters</h5>
            </Card.Header>
            <Card.Body>
              {/* Search */}
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search auctions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>

              {/* Category Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Sort By */}
              <Form.Group className="mb-3">
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="ending">Ending Soon</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </Form.Select>
              </Form.Group>

              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setFilters({ category: '', search: '', sortBy: 'newest' });
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Auction Grid */}
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">
              {auctions.length} auction{auctions.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h4>No auctions found</h4>
              <p className="text-muted">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <Row>
              {auctions.map((auction) => (
                <Col md={6} lg={4} key={auction.id} className="mb-4">
                  <Card className="h-100 auction-card shadow-sm border-0">
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={auction.images?.[0]?.imageUrl || 'https://via.placeholder.com/300x200'}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {auction.isFeatured && (
                        <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                          Featured
                        </Badge>
                      )}
                      <Badge 
                        bg={formatTimeRemaining(auction.endDate) === 'Ended' ? 'secondary' : 'danger'} 
                        className="position-absolute bottom-0 start-0 m-2"
                      >
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
                        {auction.buyNowPrice && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">Buy Now:</span>
                            <span className="fw-bold text-primary">${auction.buyNowPrice}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted small">
                            <i className="fas fa-hand-paper me-1"></i>{auction.bidCount} bids
                          </span>
                          <span className="text-muted small">
                            <i className="fas fa-eye me-1"></i>{auction.viewCount} views
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button 
                            as={Link} 
                            to={`/auction/${auction.id}`} 
                            variant="primary" 
                            className="flex-grow-1"
                          >
                            View Details
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <i className="fas fa-heart"></i>
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AuctionList;
