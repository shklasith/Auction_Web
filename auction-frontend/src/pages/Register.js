import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'Buyer',
    phoneNumber: '',
    address: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
    } else if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 10 && /[0-9]/.test(password)) {
      setPasswordStrength('medium');
    } else if (password.length >= 10 && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/');
      } else {
        setErrors(result.errors || [result.message]);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <Row className="justify-content-center">
          <Col md={9} lg={8}>
            <div className="auth-card">
              <div className="p-5">
                <div className="auth-header">
                  <div className="auth-icon">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <h2>Create Account</h2>
                  <p>Join AuctionHub and start bidding today</p>
                </div>

                {errors.length > 0 && (
                  <Alert variant="danger" className="alert-modern alert-danger">
                    {errors.map((error, index) => (
                      <div key={index}>
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {error}
                      </div>
                    ))}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          <i className="fas fa-user"></i>
                          Username *
                        </Form.Label>
                        <div className="input-icon">
                          <i className="fas fa-at"></i>
                          <Form.Control
                            type="text"
                            name="username"
                            placeholder="Choose a unique username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="form-control"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          <i className="fas fa-envelope"></i>
                          Email *
                        </Form.Label>
                        <div className="input-icon">
                          <i className="fas fa-envelope"></i>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-control"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      <i className="fas fa-id-card"></i>
                      Full Name *
                    </Form.Label>
                    <div className="input-icon">
                      <i className="fas fa-user-circle"></i>
                      <Form.Control
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          <i className="fas fa-lock"></i>
                          Password *
                        </Form.Label>
                        <div className="input-icon">
                          <i className="fas fa-key"></i>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                            className="form-control"
                          />
                          <span 
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                          </span>
                        </div>
                        {passwordStrength && (
                          <div className="password-strength">
                            <div className={`password-strength-bar ${passwordStrength}`}></div>
                          </div>
                        )}
                        <small className="form-text">
                          Minimum 6 characters, use numbers and symbols for stronger password
                        </small>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          <i className="fas fa-check-circle"></i>
                          Confirm Password *
                        </Form.Label>
                        <div className="input-icon">
                          <i className="fas fa-key"></i>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="form-control"
                          />
                          <span 
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <i className={`fas fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                          </span>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      <i className="fas fa-user-tag"></i>
                      Account Type *
                    </Form.Label>
                    <div className="role-selector">
                      <div 
                        className={`role-option ${formData.role === 'Buyer' ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'Buyer' })}
                      >
                        <input 
                          type="radio" 
                          name="role" 
                          value="Buyer" 
                          checked={formData.role === 'Buyer'}
                          onChange={handleChange}
                        />
                        <i className="fas fa-shopping-cart"></i>
                        <h5>Buyer</h5>
                        <p>Browse and bid on auctions</p>
                      </div>
                      <div 
                        className={`role-option ${formData.role === 'Seller' ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, role: 'Seller' })}
                      >
                        <input 
                          type="radio" 
                          name="role" 
                          value="Seller" 
                          checked={formData.role === 'Seller'}
                          onChange={handleChange}
                        />
                        <i className="fas fa-gavel"></i>
                        <h5>Seller</h5>
                        <p>Create and manage auctions</p>
                      </div>
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          <i className="fas fa-phone"></i>
                          Phone Number
                        </Form.Label>
                        <div className="input-icon">
                          <i className="fas fa-mobile-alt"></i>
                          <Form.Control
                            type="tel"
                            name="phoneNumber"
                            placeholder="Enter phone number (optional)"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="form-group">
                        <Form.Label className="form-label">
                          <i className="fas fa-map-marker-alt"></i>
                          Address
                        </Form.Label>
                        <div className="input-icon">
                          <i className="fas fa-home"></i>
                          <Form.Control
                            type="text"
                            name="address"
                            placeholder="Enter your address (optional)"
                            value={formData.address}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    className="auth-btn mt-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="ms-2">Creating account...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                <div className="auth-footer">
                  <p className="mb-0" style={{ color: '#6c757d' }}>
                    Already have an account?{' '}
                    <Link to="/login">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="text-white text-decoration-none">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Home
              </Link>
            </div>
          </Col>
        </Row>
      </Container>

      {loading && (
        <div className="auth-loading">
          <div className="auth-loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Register;
