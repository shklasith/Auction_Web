import React, { useState } from 'react';
import { Navbar, Nav, Container, Form, Button, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm navbar-custom" fixed="top">
      <Container fluid className="px-3 px-lg-4">
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center navbar-brand-custom">
          <i className="fas fa-gavel me-2"></i>
          <span>AuctionHub</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-lg-center">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              <i className="fas fa-home me-1"></i>
              <span>Home</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/auctions" className="nav-link-custom">
              <i className="fas fa-list me-1"></i>
              <span>All Auctions</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/create-auction" className="nav-link-custom">
              <i className="fas fa-plus me-1"></i>
              <span>Sell Item</span>
            </Nav.Link>
          </Nav>
          
          <div className="d-flex align-items-center flex-column flex-lg-row gap-2 gap-lg-3">
            <Form className="d-flex search-form-custom" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Search auctions..."
                className="search-input-custom"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline-light" type="submit" className="search-btn-custom">
                <i className="fas fa-search"></i>
              </Button>
            </Form>
            
            <div className="d-flex align-items-center gap-2">
              <Nav.Link as={Link} to="/watchlist" className="position-relative nav-link-custom watchlist-nav-item">
                <i className="fas fa-heart me-1"></i>
                <span>Watchlist</span>
                <Badge bg="danger" className="position-absolute notification-badge">
                  3
                </Badge>
              </Nav.Link>
              
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic" className="dropdown-toggle-custom">
                  <i className="fas fa-user me-1"></i>
                  <span>Account</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-custom">
                  <Dropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                    <i className="fas fa-user-circle me-2"></i>My Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-auctions" className="dropdown-item-custom">
                    <i className="fas fa-gavel me-2"></i>My Auctions
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-bids" className="dropdown-item-custom">
                    <i className="fas fa-hand-paper me-2"></i>My Bids
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="#logout" className="dropdown-item-custom">
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
