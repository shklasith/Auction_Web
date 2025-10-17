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

  // Sample auctions data
  const sampleAuctions = [
    {
      id: 1,
      title: "Vintage Rolex Submariner Watch",
      description: "Rare 1960s Rolex Submariner in excellent condition. Comes with original box and papers. A true collector's piece with timeless design.",
      currentPrice: 8500,
      buyNowPrice: 12000,
      startingPrice: 5000,
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Watches",
      bidCount: 23,
      viewCount: 456,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500" }]
    },
    {
      id: 2,
      title: "Apple MacBook Pro 16-inch M3 Max",
      description: "Brand new, sealed MacBook Pro with M3 Max chip, 64GB RAM, 2TB SSD. Perfect for professionals and creators.",
      currentPrice: 3200,
      buyNowPrice: 4000,
      startingPrice: 2500,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Electronics",
      bidCount: 45,
      viewCount: 892,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500" }]
    },
    {
      id: 3,
      title: "Vintage Gibson Les Paul Electric Guitar",
      description: "1959 Gibson Les Paul Standard in Sunburst finish. Professionally restored and maintained. Legendary tone and playability.",
      currentPrice: 15000,
      buyNowPrice: 22000,
      startingPrice: 10000,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Musical Instruments",
      bidCount: 67,
      viewCount: 1234,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?w=500" }]
    },
    {
      id: 4,
      title: "Rare Pokémon Card Collection",
      description: "First edition Charizard and complete base set. All cards graded PSA 9 or higher. Perfect for serious collectors.",
      currentPrice: 5600,
      buyNowPrice: 8500,
      startingPrice: 4000,
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Collectibles",
      bidCount: 34,
      viewCount: 678,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=500" }]
    },
    {
      id: 5,
      title: "Signed Michael Jordan Basketball",
      description: "Official NBA basketball signed by Michael Jordan. Comes with certificate of authenticity. Perfect display piece.",
      currentPrice: 1200,
      buyNowPrice: 2000,
      startingPrice: 800,
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Sports Memorabilia",
      bidCount: 19,
      viewCount: 342,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500" }]
    },
    {
      id: 6,
      title: "Canon EOS R5 Mirrorless Camera",
      description: "Professional full-frame mirrorless camera with 45MP sensor. Includes RF 24-70mm f/2.8 lens. Mint condition with low shutter count.",
      currentPrice: 2800,
      buyNowPrice: 3800,
      startingPrice: 2200,
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Electronics",
      bidCount: 28,
      viewCount: 523,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1606982261825-2e81d2ba5a1e?w=500" }]
    },
    {
      id: 7,
      title: "Herman Miller Aeron Chair",
      description: "Size B ergonomic office chair in graphite. Fully loaded with all features. Like new condition, barely used.",
      currentPrice: 650,
      buyNowPrice: 900,
      startingPrice: 500,
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Furniture",
      bidCount: 12,
      viewCount: 287,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500" }]
    },
    {
      id: 8,
      title: "First Edition Harry Potter Book Set",
      description: "Complete set of UK first edition Harry Potter books. All in excellent condition with dust jackets. A must-have for collectors.",
      currentPrice: 3200,
      buyNowPrice: 5000,
      startingPrice: 2500,
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Books",
      bidCount: 41,
      viewCount: 789,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=500" }]
    },
    {
      id: 9,
      title: "PlayStation 5 Console Bundle",
      description: "PS5 disc edition with extra controller, charging station, and 5 popular games. All items like new in original packaging.",
      currentPrice: 580,
      buyNowPrice: 750,
      startingPrice: 450,
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Electronics",
      bidCount: 56,
      viewCount: 934,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500" }]
    },
    {
      id: 10,
      title: "Original Pablo Picasso Lithograph",
      description: "Authentic signed Picasso lithograph from 1960. Professionally framed and authenticated. Rare investment piece.",
      currentPrice: 25000,
      buyNowPrice: 35000,
      startingPrice: 18000,
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Art",
      bidCount: 15,
      viewCount: 456,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500" }]
    },
    {
      id: 11,
      title: "Louis Vuitton Monogram Handbag",
      description: "Authentic Louis Vuitton Speedy 30 in classic monogram canvas. Excellent condition with minimal signs of use.",
      currentPrice: 850,
      buyNowPrice: 1200,
      startingPrice: 650,
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Fashion",
      bidCount: 29,
      viewCount: 567,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" }]
    },
    {
      id: 12,
      title: "DJI Mavic 3 Pro Drone",
      description: "Professional triple-camera drone with Fly More Combo. Includes extra batteries, ND filters, and hard case. Nearly new condition.",
      currentPrice: 1800,
      buyNowPrice: 2500,
      startingPrice: 1400,
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Electronics",
      bidCount: 37,
      viewCount: 621,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500" }]
    },
    {
      id: 13,
      title: "Antique Persian Rug",
      description: "Hand-knotted wool rug from the early 20th century. Intricate design and vibrant colors. A beautiful piece of history for your home.",
      currentPrice: 2200,
      buyNowPrice: 3500,
      startingPrice: 1500,
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Home Decor",
      bidCount: 25,
      viewCount: 489,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1588979242349-9aa1c1a7f6fe?w=500" }]
    },
    {
      id: 14,
      title: "Vintage Chanel Flap Bag",
      description: "Classic black leather Chanel flap bag with gold hardware. A timeless piece of fashion history. Good condition for its age.",
      currentPrice: 3800,
      buyNowPrice: 5500,
      startingPrice: 3000,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Fashion",
      bidCount: 52,
      viewCount: 891,
      isFeatured: true,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1590664863685-a9999b6f7a77?w=500" }]
    },
    {
      id: 15,
      title: "Trek Madone SLR 9 Road Bike",
      description: "Top-of-the-line carbon road bike with Shimano Dura-Ace Di2 electronic shifting. Incredibly lightweight and aerodynamic. Size 56cm.",
      currentPrice: 6500,
      buyNowPrice: 9000,
      startingPrice: 5000,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Sporting Goods",
      bidCount: 48,
      viewCount: 754,
      isFeatured: false,
      images: [{ imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500" }]
    }

  ];

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      let auctionData = [];
      
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        
        const response = await axios.get(`https://localhost:7274/api/Auctions?${params}`);
        auctionData = response.data || [];
      } catch (apiError) {
        console.log('API not available, using sample data');
        auctionData = [];
      }
      
      // If no data from API, use sample data
      if (auctionData.length === 0) {
        auctionData = [...sampleAuctions];
        
        // Apply category filter
        if (filters.category) {
          auctionData = auctionData.filter(auction => 
            auction.category === filters.category
          );
        }
      }
      
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
      // Fallback to sample data on any error
      setAuctions(sampleAuctions);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      try {
        const response = await axios.get('https://localhost:7274/api/Auctions/categories');
        setCategories(response.data || []);
      } catch (apiError) {
        // Use categories from sample data
        const uniqueCategories = [...new Set(sampleAuctions.map(a => a.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to sample categories
      setCategories(['Electronics', 'Watches', 'Musical Instruments', 'Collectibles', 'Sports Memorabilia', 'Furniture', 'Books', 'Art', 'Fashion']);
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
                        src={auction.images && auction.images.length > 0 ? auction.images[0].imageUrl : 'https://via.placeholder.com/300x200.png?text=No+Image'}
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
