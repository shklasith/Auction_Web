import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Tab, Tabs, Badge, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import '../../styles/admin/AdminProfile.css';

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    profileImage: null
  });

  useEffect(() => {
    if (!user || user.role !== 'Administrator') {
      navigate('/');
      return;
    }
    loadAdminProfile();
    loadActivityLog();
  }, [user, navigate]);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const profile = await adminService.getAdminProfile();
      setAdminProfile(profile);
      setEditFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        profileImage: null
      });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to load profile' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLog = async () => {
    try {
      const activities = await adminService.getActivityLog(30);
      setActivityLog(activities);
    } catch (err) {
      console.error('Failed to load activity log:', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      setEditFormData({ ...editFormData, profileImage: files[0] });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', editFormData.fullName);
      formData.append('email', editFormData.email);
      formData.append('phoneNumber', editFormData.phoneNumber || '');
      formData.append('address', editFormData.address || '');
      if (editFormData.profileImage) {
        formData.append('profileImage', editFormData.profileImage);
      }

      await adminService.updateAdminProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      loadAdminProfile();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to update profile' });
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container className="admin-profile py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-profile py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <i className="fas fa-user-shield me-2"></i>Admin Profile
          </h2>
          <p className="text-muted">Manage your administrator profile and settings</p>
        </Col>
      </Row>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="profile-sidebar">
            <Card.Body className="text-center">
              <div className="profile-image-wrapper mb-3">
                <img
                  src={adminProfile?.profileImage || '/default-avatar.png'}
                  alt={adminProfile?.fullName}
                  className="rounded-circle profile-image"
                />
                <Badge bg="danger" className="admin-badge">
                  <i className="fas fa-shield-alt me-1"></i>Admin
                </Badge>
              </div>
              <h4>{adminProfile?.fullName}</h4>
              <p className="text-muted">@{adminProfile?.username}</p>
              <p className="text-muted mb-3">{adminProfile?.email}</p>

              <div className="profile-stats">
                <Row className="text-center">
                  <Col xs={6} className="mb-3">
                    <div className="stat-box">
                      <h5>{adminProfile?.totalManagedUsers || 0}</h5>
                      <small className="text-muted">Users Managed</small>
                    </div>
                  </Col>
                  <Col xs={6} className="mb-3">
                    <div className="stat-box">
                      <h5>{adminProfile?.totalManagedAuctions || 0}</h5>
                      <small className="text-muted">Auctions</small>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="profile-info mt-3">
                <p className="mb-2">
                  <i className="fas fa-calendar me-2 text-muted"></i>
                  <small>Joined: {new Date(adminProfile?.createdDate).toLocaleDateString()}</small>
                </p>
                <p className="mb-2">
                  <i className="fas fa-clock me-2 text-muted"></i>
                  <small>Last Login: {adminProfile?.lastLoginDate ? new Date(adminProfile.lastLoginDate).toLocaleString() : 'N/A'}</small>
                </p>
                <p className="mb-0">
                  <i className="fas fa-tasks me-2 text-muted"></i>
                  <small>Last Action: {adminProfile?.lastAdminActionDate ? new Date(adminProfile.lastAdminActionDate).toLocaleString() : 'N/A'}</small>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="overview" title={<><i className="fas fa-info-circle me-2"></i>Overview</>}>
                  <h5 className="mb-3">Admin Statistics</h5>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Card className="stat-card-small bg-light">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Users Created Today</h6>
                          <h3 className="mb-0">{adminProfile?.statistics?.usersCreatedToday || 0}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Card className="stat-card-small bg-light">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Auctions Created Today</h6>
                          <h3 className="mb-0">{adminProfile?.statistics?.auctionsCreatedToday || 0}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Card className="stat-card-small bg-light">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Bids Placed Today</h6>
                          <h3 className="mb-0">{adminProfile?.statistics?.bidsPlacedToday || 0}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Card className="stat-card-small bg-light">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Revenue Today</h6>
                          <h3 className="mb-0">${adminProfile?.statistics?.totalRevenueToday?.toFixed(2) || '0.00'}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab>

                <Tab eventKey="edit" title={<><i className="fas fa-edit me-2"></i>Edit Profile</>}>
                  <h5 className="mb-3">Update Profile Information</h5>
                  <Form onSubmit={handleUpdateProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={editFormData.phoneNumber}
                        onChange={handleEditChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Profile Image</Form.Label>
                      <Form.Control
                        type="file"
                        name="profileImage"
                        onChange={handleEditChange}
                        accept="image/*"
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary">
                      <i className="fas fa-save me-2"></i>Update Profile
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="activity" title={<><i className="fas fa-history me-2"></i>Activity Log</>}>
                  <h5 className="mb-3">Recent Admin Activities</h5>
                  {activityLog.length > 0 ? (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Description</th>
                          <th>IP Address</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLog.map((activity) => (
                          <tr key={activity.id}>
                            <td>
                              <Badge bg="primary">{activity.action}</Badge>
                            </td>
                            <td>{activity.description}</td>
                            <td>
                              <small className="text-muted">{activity.ipAddress || 'N/A'}</small>
                            </td>
                            <td>
                              <small>{new Date(activity.timestamp).toLocaleString()}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted text-center">No activity logged yet</p>
                  )}
                </Tab>

                <Tab eventKey="security" title={<><i className="fas fa-lock me-2"></i>Security</>}>
                  <h5 className="mb-3">Security Settings</h5>
                  <div className="security-info">
                    <Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      Security features like password change and 2FA will be available in the next update.
                    </Alert>
                    <Button variant="outline-primary" className="me-2">
                      <i className="fas fa-key me-2"></i>Change Password
                    </Button>
                    <Button variant="outline-success">
                      <i className="fas fa-mobile-alt me-2"></i>Enable 2FA
                    </Button>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminProfile;

