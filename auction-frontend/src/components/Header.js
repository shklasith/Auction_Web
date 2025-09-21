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
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="fas fa-gavel me-2"></i>
          AuctionHub
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <i className="fas fa-home me-1"></i>Home
            </Nav.Link>
            <Nav.Link as={Link} to="/auctions">
              <i className="fas fa-list me-1"></i>All Auctions
            </Nav.Link>
            <Nav.Link as={Link} to="/create-auction">
              <i className="fas fa-plus me-1"></i>Sell Item
            </Nav.Link>
          </Nav>
          
          <Form className="d-flex me-3" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search auctions..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '300px' }}
            />
            <Button variant="outline-light" type="submit">
              <i className="fas fa-search"></i>
            </Button>
          </Form>
          
          <Nav>
            <Nav.Link as={Link} to="/watchlist" className="position-relative">
              <i className="fas fa-heart me-1"></i>
              Watchlist
              <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
                3
              </Badge>
            </Nav.Link>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                <i className="fas fa-user me-1"></i>
                Account
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">
                  <i className="fas fa-user-circle me-2"></i>My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/my-auctions">
                  <i className="fas fa-gavel me-2"></i>My Auctions
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/my-bids">
                  <i className="fas fa-hand-paper me-2"></i>My Bids
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#logout">
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
