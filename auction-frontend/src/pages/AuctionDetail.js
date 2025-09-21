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
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading auction details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={loadAuction}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    Auction not found
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Left Column - Images and Description */}
                <div className="col-lg-8">
                    {/* Auction Images */}
                    <div className="card mb-4">
                        <div id="auctionCarousel" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-inner">
                                {auction.images.map((image, index) => (
                                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <img 
                                            src={image.imageUrl} 
                                            className="d-block w-100" 
                                            alt={image.alt}
                                            style={{ height: '400px', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {auction.images.length > 1 && (
                                <>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#auctionCarousel" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon"></span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#auctionCarousel" data-bs-slide="next">
                                        <span className="carousel-control-next-icon"></span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Auction Description */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="mb-0">{auction.title}</h2>
                        </div>
                        <div className="card-body">
                            <p className="card-text">{auction.description}</p>
                            
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <strong>Category:</strong> {auction.category}
                                </div>
                                <div className="col-md-6">
                                    <strong>Condition:</strong> {auction.condition}
                                </div>
                            </div>
                            
                            <div className="mt-3">
                                <strong>Seller:</strong> {auction.seller.name} 
                                <span className="badge bg-warning ms-2">★ {auction.seller.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Real-time Bidding Interface */}
                <div className="col-lg-4">
                    <BiddingInterface auction={auction} currentUser={currentUser} />
                </div>
            </div>
        </div>
    );
};

export default AuctionDetail;
