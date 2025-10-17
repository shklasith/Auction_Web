import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Tab, Tabs, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    profileImage: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    if (user) {
      setEditFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        profileImage: null
      });
    }
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      setEditFormData({ ...editFormData, profileImage: files[0] });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('fullName', editFormData.fullName);
    formData.append('email', editFormData.email);
    formData.append('phoneNumber', editFormData.phoneNumber || '');
    formData.append('address', editFormData.address || '');
    if (editFormData.profileImage) {
      formData.append('profileImage', editFormData.profileImage);
    }

    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setShowEditModal(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } else {
      setMessage({ type: 'danger', text: result.message || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setMessage({ type: 'danger', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    const result = await authService.changePassword(passwordData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } else {
      setMessage({ type: 'danger', text: result.message || 'Failed to change password' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="fas fa-user-lock"></i>
          </div>
          <h4>Access Required</h4>
          <p>Please log in to view your profile</p>
          <Link to="/login" className="auth-btn d-inline-block">
            <i className="fas fa-sign-in-alt me-2"></i>
            Login
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="profile-page">
      <Container className="py-4">
        {/* Modern Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <Row className="align-items-center">
              <Col lg={3} className="profile-avatar-container">
                <div className="profile-avatar">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="profile-avatar-image"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <div className="profile-online-badge"></div>
                </div>
                <Button 
                  className="profile-action-btn"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="fas fa-edit me-2"></i>
                  Edit Profile
                </Button>
              </Col>
              
              <Col lg={9} className="profile-info mt-4 mt-lg-0">
                <h1 className="profile-name">{user.fullName}</h1>
                <p className="profile-username">
                  <i className="fas fa-at me-2"></i>
                  {user.username}
                </p>
                <p className="profile-email">
                  <i className="fas fa-envelope me-2"></i>
                  {user.email}
                </p>
                
                <Badge className="profile-role-badge">
                  <i className={`fas fa-${
                    (user.role === 'Administrator' || user.role === 2) ? 'crown' : 
                    (user.role === 'Seller' || user.role === 1) ? 'gavel' : 
                    'shopping-cart'
                  } me-2`}></i>
                  {user.role === 0 ? 'Buyer' : user.role === 1 ? 'Seller' : user.role === 2 ? 'Administrator' : user.role}
                </Badge>
                
                <div className="profile-stats mt-4">
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">
                      <i className="fas fa-star text-warning"></i> {user.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="profile-stat-label">Rating</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{user.totalSales || 0}</span>
                    <span className="profile-stat-label">Total Sales</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">
                      <i className="fas fa-calendar-alt me-2"></i>
                      {formatDate(user.createdDate)}
                    </span>
                    <span className="profile-stat-label">Member Since</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">
                      <i className="fas fa-clock me-2"></i>
                      {formatDate(user.lastLoginDate)}
                    </span>
                    <span className="profile-stat-label">Last Login</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content-card">
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => setActiveTab(k)} 
            className="profile-tabs"
          >
            <Tab eventKey="overview" title={<><i className="fas fa-user-circle me-2"></i>Overview</>}>
              <div className="profile-tab-content">
                <Row>
                  <Col lg={6}>
                    <div className="info-section">
                      <h4 className="info-section-title">
                        <i className="fas fa-id-card"></i>
                        Personal Information
                      </h4>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-user"></i>
                          Full Name
                        </span>
                        <span className="info-value">{user.fullName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-envelope"></i>
                          Email
                        </span>
                        <span className="info-value">{user.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-phone"></i>
                          Phone
                        </span>
                        <span className="info-value">{user.phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          <i className="fas fa-map-marker-alt"></i>
                          Address
                        </span>
                        <span className="info-value">{user.address || 'Not provided'}</span>
                      </div>
                    </div>
                  </Col>
                  
                  <Col lg={6}>
                    <div className="info-section">
                      <h4 className="info-section-title">
                        <i className="fas fa-cog"></i>
                        Account Settings
                      </h4>
                      <div className="profile-settings-grid">
                        <button 
                          className="settings-action-btn"
                          onClick={() => setShowEditModal(true)}
                        >
                          <span>
                            <i className="fas fa-user-edit me-2"></i>
                            Edit Profile Information
                          </span>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                        <button 
                          className="settings-action-btn"
                          onClick={() => setShowPasswordModal(true)}
                        >
                          <span>
                            <i className="fas fa-key me-2"></i>
                            Change Password
                          </span>
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab eventKey="auctions" title={<><i className="fas fa-gavel me-2"></i>My Auctions</>}>
              <div className="profile-tab-content">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-gavel"></i>
                  </div>
                  <h4>No Auctions Yet</h4>
                  <p>You haven't created any auctions yet</p>
                  {(user.role === 'Seller' || user.role === 1 || user.role === 'Administrator' || user.role === 2) && (
                    <Link to="/create-auction" className="auth-btn d-inline-block">
                      <i className="fas fa-plus-circle me-2"></i>
                      Create Auction
                    </Link>
                  )}
                </div>
              </div>
            </Tab>

            <Tab eventKey="bids" title={<><i className="fas fa-hand-holding-usd me-2"></i>My Bids</>}>
              <div className="profile-tab-content">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-hand-holding-usd"></i>
                  </div>
                  <h4>No Bids Placed</h4>
                  <p>You haven't placed any bids yet</p>
                  <Link to="/auctions" className="auth-btn d-inline-block">
                    <i className="fas fa-search me-2"></i>
                    Browse Auctions
                  </Link>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </Container>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-edit me-2"></i>
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message.text && (
            <Alert variant={message.type} className={`alert-modern alert-${message.type === 'success' ? 'success' : 'danger'}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
              {message.text}
            </Alert>
          )}
          <Form onSubmit={handleUpdateProfile}>
            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-user"></i>
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={editFormData.fullName}
                onChange={handleEditChange}
                required
                className="profile-form-control"
              />
            </Form.Group>

            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-envelope"></i>
                Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                required
                className="profile-form-control"
              />
            </Form.Group>

            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-phone"></i>
                Phone Number
              </Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={handleEditChange}
                className="profile-form-control"
              />
            </Form.Group>

            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-map-marker-alt"></i>
                Address
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={editFormData.address}
                onChange={handleEditChange}
                className="profile-form-control"
              />
            </Form.Group>

            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-image"></i>
                Profile Image
              </Form.Label>
              <Form.Control
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleEditChange}
                className="profile-form-control"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowEditModal(false)}
                className="profile-modal-btn profile-modal-btn-secondary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="profile-modal-btn profile-modal-btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-key me-2"></i>
            Change Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message.text && (
            <Alert variant={message.type} className={`alert-modern alert-${message.type === 'success' ? 'success' : 'danger'}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
              {message.text}
            </Alert>
          )}
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-lock"></i>
                Current Password
              </Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="profile-form-control"
              />
            </Form.Group>

            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-key"></i>
                New Password
              </Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
                className="profile-form-control"
              />
            </Form.Group>

            <Form.Group className="profile-form-group">
              <Form.Label className="profile-form-label">
                <i className="fas fa-check-circle"></i>
                Confirm New Password
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
                className="profile-form-control"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowPasswordModal(false)}
                className="profile-modal-btn profile-modal-btn-secondary"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="profile-modal-btn profile-modal-btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Changing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Profile;
