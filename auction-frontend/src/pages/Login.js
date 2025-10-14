import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'Administrator') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
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
          <Col md={6} lg={5}>
            <div className="auth-card">
              <div className="p-5">
                <div className="auth-header">
                  <div className="auth-icon">
                    <i className="fas fa-gavel"></i>
                  </div>
                  <h2>Welcome Back</h2>
                  <p>Sign in to continue to AuctionHub</p>
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
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      <i className="fas fa-user"></i>
                      Username or Email
                    </Form.Label>
                    <div className="input-icon">
                      <i className="fas fa-envelope"></i>
                      <Form.Control
                        type="text"
                        name="usernameOrEmail"
                        placeholder="Enter your username or email"
                        value={formData.usernameOrEmail}
                        onChange={handleChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">
                      <i className="fas fa-lock"></i>
                      Password
                    </Form.Label>
                    <div className="input-icon">
                      <i className="fas fa-key"></i>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
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
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Group className="remember-me mb-0">
                      <Form.Check
                        type="checkbox"
                        name="rememberMe"
                        label="Remember me"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Link to="/forgot-password" className="text-decoration-none" style={{ color: '#667eea', fontSize: '0.9rem' }}>
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="auth-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="ms-2">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                <div className="auth-footer">
                  <p className="mb-0" style={{ color: '#6c757d' }}>
                    Don't have an account?{' '}
                    <Link to="/register">
                      Create one now
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

export default Login;
