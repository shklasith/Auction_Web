import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const AdminDashboardSimple = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from: http://localhost:5104/api/admin/dashboard');
      const response = await fetch('http://localhost:5104/api/admin/dashboard');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Data received:', result);
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5">
        <h1>Loading...</h1>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          <h2>Error!</h2>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🎯 Simple Admin Dashboard</h1>
          <p className="text-muted">No login required - Real-time statistics</p>
        </div>
        <Button variant="primary" onClick={fetchData} disabled={loading}>
          🔄 Refresh
        </Button>
      </div>
      
      <Row className="mt-4">
        <Col md={3} className="mb-3">
          <Card className="bg-primary text-white h-100 shadow">
            <Card.Body className="text-center">
              <div className="display-4">{data?.totalUsers || 0}</div>
              <p className="mb-0">👥 Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="bg-success text-white h-100 shadow">
            <Card.Body className="text-center">
              <div className="display-4">{data?.activeAuctions || 0}</div>
              <p className="mb-0">🔨 Active Auctions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="bg-warning text-white h-100 shadow">
            <Card.Body className="text-center">
              <div className="display-4">{data?.totalBids || 0}</div>
              <p className="mb-0">💰 Total Bids</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="bg-info text-white h-100 shadow">
            <Card.Body className="text-center">
              <div className="display-4">${data?.totalRevenue?.toFixed(2) || 0}</div>
              <p className="mb-0">💵 Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 shadow">
        <Card.Header>
          <h3 className="mb-0">📊 Complete Dashboard Data</h3>
        </Card.Header>
        <Card.Body>
          <pre style={{ maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboardSimple;
