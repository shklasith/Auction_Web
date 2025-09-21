import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, Badge, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalAuctions: 12,
    activeBids: 8,
    wonAuctions: 15,
    totalSales: 23,
    rating: 4.8,
    memberSince: '2020-03-15'
  });

  // Mock data for user's auctions and bids
  const userAuctions = [
    {
      id: 1,
      title: "Vintage Camera Collection",
      currentPrice: 125.50,
      bidCount: 8,
      endDate: "2025-01-10T15:30:00Z",
      status: "Active"
    },
    {
      id: 2,
      title: "Designer Watch",
      currentPrice: 450.00,
      bidCount: 12,
      endDate: "2025-01-08T20:00:00Z",
      status: "Active"
    }
  ];

  const userBids = [
    {
      id: 1,
      auctionTitle: "Antique Wooden Desk",
      bidAmount: 275.00,
      currentPrice: 275.00,
      status: "Winning",
      endDate: "2025-01-12T18:00:00Z"
    },
    {
      id: 2,
      auctionTitle: "Rare Book Collection",
      bidAmount: 150.00,
      currentPrice: 180.00,
      status: "Outbid",
      endDate: "2025-01-09T14:30:00Z"
    }
  ];

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
    <Container className="py-4">
      {/* Profile Header */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3} className="text-center">
              <div className="profile-avatar mb-3">
                <img
                  src="https://via.placeholder.com/150x150"
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
              </div>
              <Button variant="outline-primary" size="sm">
                <i className="fas fa-camera me-1"></i>Change Photo
              </Button>
            </Col>
            <Col md={9}>
              <h2>John Doe</h2>
              <p className="text-muted mb-3">
                <i className="fas fa-envelope me-2"></i>john.doe@email.com
              </p>
              
              <Row>
                <Col sm={6} md={3} className="text-center mb-3">
                  <h4 className="text-primary mb-0">{userStats.rating}</h4>
                  <small className="text-muted">
                    <i className="fas fa-star text-warning"></i> Rating
                  </small>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <h4 className="text-primary mb-0">{userStats.totalSales}</h4>
                  <small className="text-muted">Sales</small>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <h4 className="text-primary mb-0">{userStats.wonAuctions}</h4>
                  <small className="text-muted">Won Auctions</small>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <h4 className="text-primary mb-0">
                    {new Date(userStats.memberSince).getFullYear()}
                  </h4>
                  <small className="text-muted">Member Since</small>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Profile Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="overview" title={<span><i className="fas fa-chart-line me-2"></i>Overview</span>}>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0"><i className="fas fa-gavel me-2"></i>My Active Auctions</h5>
                </Card.Header>
                <Card.Body>
                  {userAuctions.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-gavel fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No active auctions</p>
                      <Button as={Link} to="/create-auction" variant="primary">
                        Create Auction
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {userAuctions.slice(0, 3).map(auction => (
                        <div key={auction.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <h6 className="mb-1">{auction.title}</h6>
                            <small className="text-muted">
                              ${auction.currentPrice} • {auction.bidCount} bids
                            </small>
                          </div>
                          <Badge bg={auction.status === 'Active' ? 'success' : 'secondary'}>
                            {auction.status}
                          </Badge>
                        </div>
                      ))}
                      <div className="text-center mt-3">
                        <Button variant="outline-primary" size="sm">
                          View All Auctions
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0"><i className="fas fa-hand-paper me-2"></i>Recent Bids</h5>
                </Card.Header>
                <Card.Body>
                  {userBids.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-hand-paper fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No recent bids</p>
                      <Button as={Link} to="/auctions" variant="primary">
                        Browse Auctions
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {userBids.slice(0, 3).map(bid => (
                        <div key={bid.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <h6 className="mb-1">{bid.auctionTitle}</h6>
                            <small className="text-muted">
                              Bid: ${bid.bidAmount} • Current: ${bid.currentPrice}
                            </small>
                          </div>
                          <Badge bg={
                            bid.status === 'Winning' ? 'success' :
                            bid.status === 'Outbid' ? 'danger' : 'secondary'
                          }>
                            {bid.status}
                          </Badge>
                        </div>
                      ))}
                      <div className="text-center mt-3">
                        <Button variant="outline-primary" size="sm">
                          View All Bids
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="auctions" title={<span><i className="fas fa-gavel me-2"></i>My Auctions</span>}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Auctions</h5>
              <Button as={Link} to="/create-auction" variant="success">
                <i className="fas fa-plus me-2"></i>Create New Auction
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Auction Title</th>
                    <th>Current Price</th>
                    <th>Bids</th>
                    <th>Time Remaining</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userAuctions.map(auction => (
                    <tr key={auction.id}>
                      <td>
                        <Link to={`/auction/${auction.id}`} className="text-decoration-none">
                          {auction.title}
                        </Link>
                      </td>
                      <td className="text-success fw-bold">${auction.currentPrice}</td>
                      <td>{auction.bidCount}</td>
                      <td>{formatTimeRemaining(auction.endDate)}</td>
                      <td>
                        <Badge bg={auction.status === 'Active' ? 'success' : 'secondary'}>
                          {auction.status}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="bids" title={<span><i className="fas fa-hand-paper me-2"></i>My Bids</span>}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">My Bids</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Auction</th>
                    <th>My Bid</th>
                    <th>Current Price</th>
                    <th>Time Remaining</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userBids.map(bid => (
                    <tr key={bid.id}>
                      <td>
                        <Link to={`/auction/${bid.id}`} className="text-decoration-none">
                          {bid.auctionTitle}
                        </Link>
                      </td>
                      <td className="fw-bold">${bid.bidAmount}</td>
                      <td className="text-success fw-bold">${bid.currentPrice}</td>
                      <td>{formatTimeRemaining(bid.endDate)}</td>
                      <td>
                        <Badge bg={
                          bid.status === 'Winning' ? 'success' :
                          bid.status === 'Outbid' ? 'danger' : 'secondary'
                        }>
                          {bid.status}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          as={Link} 
                          to={`/auction/${bid.id}`}
                          variant="outline-primary" 
                          size="sm"
                        >
                          View Auction
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="settings" title={<span><i className="fas fa-cog me-2"></i>Settings</span>}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Account Settings</h5>
            </Card.Header>
            <Card.Body>
              <div className="settings-section">
                <h6>Profile Information</h6>
                <Button variant="outline-primary" className="mb-3">
                  <i className="fas fa-edit me-2"></i>Edit Profile
                </Button>
                
                <h6>Notification Preferences</h6>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <label className="form-check-label">
                    Email notifications for bid updates
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <label className="form-check-label">
                    SMS notifications for winning bids
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" />
                  <label className="form-check-label">
                    Marketing emails
                  </label>
                </div>
                
                <h6>Security</h6>
                <Button variant="outline-warning" className="me-2 mb-2">
                  <i className="fas fa-key me-2"></i>Change Password
                </Button>
                <Button variant="outline-info" className="mb-2">
                  <i className="fas fa-shield-alt me-2"></i>Two-Factor Authentication
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Profile;
