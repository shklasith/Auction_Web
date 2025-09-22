import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-white mb-3">
              <i className="fas fa-gavel me-2 text-primary"></i>AuctionHub
            </h5>
            <p className="text-light opacity-75 mb-0">
              Your trusted online auction platform for buying and selling unique items.
            </p>
          </Col>
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/auctions" className="text-light text-decoration-none footer-link">
                  Browse Auctions
                </a>
              </li>
              <li className="mb-2">
                <a href="/create-auction" className="text-light text-decoration-none footer-link">
                  Sell Item
                </a>
              </li>
              <li className="mb-2">
                <a href="/how-it-works" className="text-light text-decoration-none footer-link">
                  How It Works
                </a>
              </li>
            </ul>
          </Col>
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="text-white mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/help" className="text-light text-decoration-none footer-link">
                  Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="text-light text-decoration-none footer-link">
                  Contact Us
                </a>
              </li>
              <li className="mb-2">
                <a href="/terms" className="text-light text-decoration-none footer-link">
                  Terms of Service
                </a>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h6 className="text-white mb-3">Stay Connected</h6>
            <div className="d-flex gap-3 mb-4">
              <a href="#" className="text-light footer-social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f fs-4"></i>
              </a>
              <a href="#" className="text-light footer-social-link" aria-label="Twitter">
                <i className="fab fa-twitter fs-4"></i>
              </a>
              <a href="#" className="text-light footer-social-link" aria-label="Instagram">
                <i className="fab fa-instagram fs-4"></i>
              </a>
              <a href="#" className="text-light footer-social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin fs-4"></i>
              </a>
            </div>
            <div className="border-top border-secondary pt-3">
              <p className="text-light opacity-75 small mb-0">
                © 2025 AuctionHub. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
