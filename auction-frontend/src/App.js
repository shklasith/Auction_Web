import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import AuctionList from './pages/AuctionList';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import CategoryPage from './pages/CategoryPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdminDashboardSimple from './pages/admin/AdminDashboardSimple';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auctions" element={<AuctionList />} />
              <Route path="/auction/:id" element={<AuctionDetail />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/watchlist" 
                element={
                  <PrivateRoute>
                    <Watchlist />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/create-auction" 
                element={
                  <PrivateRoute requiredRole={['Seller', 'Administrator']}>
                    <CreateAuction />
                  </PrivateRoute>
                } 
              />

              {/* Admin Routes - No authentication required */}
              <Route 
                path="/admin/dashboard" 
                element={<AdminDashboard />} 
              />
              <Route 
                path="/admin/dashboard-test" 
                element={<AdminDashboardSimple />} 
              />
              <Route 
                path="/admin/profile" 
                element={<AdminProfile />} 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
