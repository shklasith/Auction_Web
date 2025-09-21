import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5><i className="fas fa-gavel me-2"></i>AuctionHub</h5>
            <p className="text-muted">
              Your trusted online auction platform for buying and selling unique items.
            </p>
          </Col>
          <Col md={2}>
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/auctions" className="text-muted text-decoration-none">Browse Auctions</a></li>
              <li><a href="/create-auction" className="text-muted text-decoration-none">Sell Item</a></li>
              <li><a href="/how-it-works" className="text-muted text-decoration-none">How It Works</a></li>
            </ul>
          </Col>
          <Col md={2}>
            <h6>Support</h6>
            <ul className="list-unstyled">
              <li><a href="/help" className="text-muted text-decoration-none">Help Center</a></li>
              <li><a href="/contact" className="text-muted text-decoration-none">Contact Us</a></li>
              <li><a href="/terms" className="text-muted text-decoration-none">Terms of Service</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6>Stay Connected</h6>
            <div className="d-flex gap-3 mb-3">
              <a href="#" className="text-muted"><i className="fab fa-facebook-f fs-4"></i></a>
              <a href="#" className="text-muted"><i className="fab fa-twitter fs-4"></i></a>
              <a href="#" className="text-muted"><i className="fab fa-instagram fs-4"></i></a>
              <a href="#" className="text-muted"><i className="fab fa-linkedin fs-4"></i></a>
            </div>
            <p className="text-muted small">
              © 2025 AuctionHub. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
