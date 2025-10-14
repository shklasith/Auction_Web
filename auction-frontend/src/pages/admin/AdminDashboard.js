import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Administrator') {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="admin-dashboard py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="admin-dashboard py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            <i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard
          </h2>
          <p className="text-muted">Welcome back, {user?.fullName || user?.username}</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Total Users</h6>
                  <h3 className="mb-0">{dashboardData?.totalUsers || 0}</h3>
                  <small>{dashboardData?.activeUsers || 0} active</small>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Active Auctions</h6>
                  <h3 className="mb-0">{dashboardData?.activeAuctions || 0}</h3>
                  <small>{dashboardData?.totalAuctions || 0} total</small>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-gavel fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Total Bids</h6>
                  <h3 className="mb-0">{dashboardData?.totalBids || 0}</h3>
                  <small>All time</small>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-hand-holding-usd fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1">Total Revenue</h6>
                  <h3 className="mb-0">${dashboardData?.totalRevenue?.toFixed(2) || 0}</h3>
                  <small>All time</small>
                </div>
                <div className="stat-icon">
                  <i className="fas fa-dollar-sign fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Distribution */}
      <Row className="mb-4">
        <Col lg={4} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>User Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="user-stats">
                <div className="stat-item d-flex justify-content-between mb-3">
                  <span><i className="fas fa-user-tie text-danger me-2"></i>Administrators</span>
                  <strong>{dashboardData?.totalAdmins || 0}</strong>
                </div>
                <div className="stat-item d-flex justify-content-between mb-3">
                  <span><i className="fas fa-shopping-bag text-success me-2"></i>Sellers</span>
                  <strong>{dashboardData?.totalSellers || 0}</strong>
                </div>
                <div className="stat-item d-flex justify-content-between mb-3">
                  <span><i className="fas fa-shopping-cart text-primary me-2"></i>Buyers</span>
                  <strong>{dashboardData?.totalBuyers || 0}</strong>
                </div>
                <div className="stat-item d-flex justify-content-between">
                  <span><i className="fas fa-user-slash text-secondary me-2"></i>Inactive Users</span>
                  <strong>{dashboardData?.inactiveUsers || 0}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* System Health */}
        <Col lg={4} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-heartbeat me-2"></i>System Health
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="system-health">
                <div className="health-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Status</span>
                    <Badge bg="success">{dashboardData?.systemHealth?.status || 'Healthy'}</Badge>
                  </div>
                </div>
                <div className="health-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Active Sessions</span>
                    <strong>{dashboardData?.systemHealth?.activeSessions || 0}</strong>
                  </div>
                </div>
                <div className="health-item mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Database Records</span>
                    <strong>{dashboardData?.systemHealth?.databaseSize || 0}</strong>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/admin/users')}
                >
                  <i className="fas fa-users me-2"></i>Manage Users
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => navigate('/admin/auctions')}
                >
                  <i className="fas fa-gavel me-2"></i>Manage Auctions
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => navigate('/admin/profile')}
                >
                  <i className="fas fa-user-cog me-2"></i>My Profile
                </button>
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => navigate('/admin/reports')}
                >
                  <i className="fas fa-chart-bar me-2"></i>View Reports
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities and Users */}
      <Row>
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>Recent Activities
              </h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <div className="activity-list">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item d-flex align-items-start mb-3">
                      <div className={`activity-icon bg-${activity.color} text-white me-3`}>
                        <i className={`fas fa-${activity.icon}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0">{activity.description}</p>
                        <small className="text-muted">
                          {new Date(activity.timestamp).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No recent activities</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>Recent Users
              </h5>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => navigate('/admin/users')}
              >
                View All
              </button>
            </Card.Header>
            <Card.Body>
              {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentUsers.slice(0, 5).map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={user.profileImage || '/default-avatar.png'}
                              alt={user.fullName}
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                            />
                            <div>
                              <div>{user.fullName}</div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={
                            user.role === 'Administrator' ? 'danger' :
                            user.role === 'Seller' ? 'success' : 'primary'
                          }>
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          <small>{new Date(user.createdDate).toLocaleDateString()}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center">No recent users</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;

