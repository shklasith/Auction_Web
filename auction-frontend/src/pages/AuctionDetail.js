import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BiddingInterface from '../components/BiddingInterface';

const AuctionDetail = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Mock current user - in production, get from authentication context
    const currentUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
    };

    useEffect(() => {
        loadAuction();
    }, [id]);

    const loadAuction = async () => {
        try {
            setLoading(true);
            // In production, fetch from your API
            // const response = await fetch(`/api/auctions/${id}`);
            // const auctionData = await response.json();
            
            // Mock auction data for demonstration
            const auctionData = {
                id: parseInt(id),
                title: "Vintage Camera Collection",
                description: "A rare collection of vintage cameras from the 1950s-1970s",
                currentPrice: 150.00,
                startingPrice: 100.00,
                bidCount: 3,
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started 24 hours ago
                viewCount: 45,
                watchlistCount: 8,
                autoExtend: true,
                autoExtendMinutes: 5,
                category: "Electronics",
                condition: "Used - Good",
                buyNowPrice: 500.00,
                seller: {
                    id: 2,
                    name: "Camera Collector",
                    rating: 4.8
                },
                images: [
                    {
                        imageUrl: "https://via.placeholder.com/600x400/4a90e2/ffffff?text=Vintage+Camera+1",
                        alt: "Main camera image"
                    },
                    {
                        imageUrl: "https://via.placeholder.com/600x400/50c878/ffffff?text=Vintage+Camera+2",
                        alt: "Camera detail view"
                    }
                ]
            };
            
            setAuction(auctionData);
        } catch (err) {
            setError('Failed to load auction details');
            console.error('Error loading auction:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading auction details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error Loading Auction</h4>
                    <p className="mb-3">{error}</p>
                    <button className="btn btn-primary" onClick={loadAuction}>
                        <i className="fas fa-redo me-2"></i>Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning text-center" role="alert">
                    <h4 className="alert-heading">Auction Not Found</h4>
                    <p className="mb-0">The auction you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="row g-4">
                {/* Left Column - Images and Description */}
                <div className="col-lg-8">
                    {/* Auction Images */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div id="auctionCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner">
                                {auction.images.map((image, index) => (
                                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <img 
                                            src={`https://source.unsplash.com/featured/?auction,${auction.id},${index}`} 
                                            className="d-block w-100" 
                                            alt={image.alt}
                                            style={{ height: '400px', objectFit: 'cover', borderRadius: '0.375rem' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {auction.images.length > 1 && (
                                <>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#auctionCarousel" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon"></span>
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#auctionCarousel" data-bs-slide="next">
                                        <span className="carousel-control-next-icon"></span>
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </>
                            )}
                        </div>
                        {auction.images.length > 1 && (
                            <div className="carousel-indicators position-relative mt-3 mb-0">
                                {auction.images.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        data-bs-target="#auctionCarousel"
                                        data-bs-slide-to={index}
                                        className={index === 0 ? "active" : ""}
                                    ></button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auction Description */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                                <div className="mb-2 mb-md-0">
                                    <h1 className="h3 mb-2">{auction.title}</h1>
                                    <div className="d-flex flex-wrap gap-2">
                                        <span className="badge bg-primary">{auction.category}</span>
                                        <span className="badge bg-secondary">{auction.condition}</span>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="text-muted small">Item #{auction.id}</div>
                                    <div className="text-muted small">{auction.viewCount} views</div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3">Description</h5>
                                <p className="text-muted lh-lg">{auction.description}</p>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <span className="fw-medium">Category:</span>
                                        <span className="text-muted">{auction.category}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <span className="fw-medium">Condition:</span>
                                        <span className="text-muted">{auction.condition}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="fw-medium">Starting Price:</span>
                                        <span className="text-muted">${auction.startingPrice}</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <span className="fw-medium">Total Bids:</span>
                                        <span className="text-muted">{auction.bidCount}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <span className="fw-medium">Watchlist:</span>
                                        <span className="text-muted">{auction.watchlistCount} users</span>
                                    </div>
                                    {auction.buyNowPrice && (
                                        <div className="d-flex justify-content-between align-items-center py-2">
                                            <span className="fw-medium">Buy Now:</span>
                                            <span className="text-success fw-bold">${auction.buyNowPrice}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-top">
                                <h6 className="fw-bold mb-3">Seller Information</h6>
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-user text-white"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{auction.seller.name}</h6>
                                        <div className="d-flex align-items-center">
                                            <span className="badge bg-warning text-dark me-2">
                                                <i className="fas fa-star me-1"></i>{auction.seller.rating}
                                            </span>
                                            <small className="text-muted">Trusted Seller</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Real-time Bidding Interface */}
                <div className="col-lg-4">
                    <div className="sticky-top" style={{ top: '1rem' }}>
                        <BiddingInterface auction={auction} currentUser={currentUser} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionDetail;
