import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5104/api');
        
        // Try using fetch as fallback
        try {
          const data = await adminService.getDashboardData();
          console.log('Dashboard data received:', data);
          setDashboardData(data);
          setError('');
        } catch (axiosError) {
          console.error('Axios error, trying fetch...', axiosError);
          // Fallback to fetch
          const response = await fetch('http://localhost:5104/api/admin/dashboard');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Dashboard data received via fetch:', data);
          setDashboardData(data);
          setError('');
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
        console.error('Error details:', err.response || err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">📊 Admin Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white h-100 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-users fa-2x mb-2"></i>
              <h5 className="card-title">Total Users</h5>
              <h2 className="display-4 mb-0">{dashboardData?.totalUsers || 0}</h2>
              <small className="d-block mt-2">
                <i className="fas fa-shopping-cart"></i> Buyers: {dashboardData?.totalBuyers || 0} | 
                <i className="fas fa-store ms-2"></i> Sellers: {dashboardData?.totalSellers || 0}
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white h-100 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-gavel fa-2x mb-2"></i>
              <h5 className="card-title">Active Auctions</h5>
              <h2 className="display-4 mb-0">{dashboardData?.activeAuctions || 0}</h2>
              <small className="d-block mt-2">Total: {dashboardData?.totalAuctions || 0} auctions</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white h-100 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-hand-holding-usd fa-2x mb-2"></i>
              <h5 className="card-title">Total Bids</h5>
              <h2 className="display-4 mb-0">{dashboardData?.totalBids || 0}</h2>
              <small className="d-block mt-2">Completed: {dashboardData?.completedAuctions || 0}</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white h-100 shadow-sm">
            <div className="card-body text-center">
              <i className="fas fa-dollar-sign fa-2x mb-2"></i>
              <h5 className="card-title">Total Revenue</h5>
              <h2 className="display-4 mb-0">${dashboardData?.totalRevenue?.toFixed(2) || '0.00'}</h2>
              <small className="d-block mt-2">
                <i className="fas fa-user-check"></i> Active: {dashboardData?.activeUsers || 0} users
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-3 mb-4">
        {/* User Distribution Pie Chart */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="fas fa-chart-pie me-2"></i>User Distribution by Role</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Buyers', value: dashboardData?.totalBuyers || 0 },
                      { name: 'Sellers', value: dashboardData?.totalSellers || 0 },
                      { name: 'Admins', value: dashboardData?.totalAdmins || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Auction Status Bar Chart */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="fas fa-chart-bar me-2"></i>Auction Statistics</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Active', count: dashboardData?.activeAuctions || 0, fill: '#28a745' },
                    { name: 'Completed', count: dashboardData?.completedAuctions || 0, fill: '#17a2b8' },
                    { name: 'Total Bids', count: dashboardData?.totalBids || 0, fill: '#ffc107' }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8">
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Activity Status */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="fas fa-chart-line me-2"></i>User Activity Status</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active Users', value: dashboardData?.activeUsers || 0 },
                      { name: 'Inactive Users', value: dashboardData?.inactiveUsers || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#28a745" />
                    <Cell fill="#dc3545" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Health Chart */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0"><i className="fas fa-heartbeat me-2"></i>System Health Overview</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Database Records', value: dashboardData?.systemHealth?.databaseSize || 0 },
                    { name: 'Active Sessions', value: dashboardData?.systemHealth?.activeSessions || 0 },
                    { name: 'Memory Usage %', value: dashboardData?.systemHealth?.memoryUsage || 0 },
                    { name: 'CPU Usage %', value: dashboardData?.systemHealth?.cpuUsage || 0 }
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ffc107" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center mt-3">
                <span className={`badge bg-${dashboardData?.systemHealth?.status === 'Healthy' ? 'success' : 'danger'} fs-6`}>
                  System Status: {dashboardData?.systemHealth?.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0"><i className="fas fa-users me-2"></i>Recent Users</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-light">
                <tr>
                  <th><i className="fas fa-user me-1"></i>Username</th>
                  <th><i className="fas fa-id-card me-1"></i>Full Name</th>
                  <th><i className="fas fa-envelope me-1"></i>Email</th>
                  <th><i className="fas fa-user-tag me-1"></i>Role</th>
                  <th><i className="fas fa-calendar-plus me-1"></i>Created Date</th>
                  <th><i className="fas fa-sign-in-alt me-1"></i>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentUsers?.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.username}</strong></td>
                    <td>{user.fullName}</td>
                    <td><small>{user.email}</small></td>
                    <td>
                      <span className={`badge ${user.role === 2 ? 'bg-danger' : user.role === 1 ? 'bg-success' : 'bg-info'}`}>
                        {user.role === 2 ? '👑 Admin' : user.role === 1 ? '🏪 Seller' : '🛒 Buyer'}
                      </span>
                    </td>
                    <td><small>{new Date(user.createdDate).toLocaleDateString()}</small></td>
                    <td><small>{new Date(user.lastLoginDate).toLocaleString()}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0"><i className="fas fa-history me-2"></i>Recent Activities</h5>
        </div>
        <div className="card-body">
          <div className="list-group list-group-flush">
            {dashboardData?.recentActivities?.slice(0, 8).map((activity, index) => (
              <div key={index} className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">
                    <i className={`fas fa-${activity.icon} me-2 text-${activity.color}`}></i>
                    {activity.type}
                  </div>
                  <small className="text-muted">{activity.description}</small>
                </div>
                <span className="badge bg-secondary rounded-pill">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;