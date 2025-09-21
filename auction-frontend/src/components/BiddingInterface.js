import React, { useState, useEffect, useRef } from 'react';
import BiddingService from '../services/BiddingService';
import './BiddingInterface.css';

const BiddingInterface = ({ auction, currentUser }) => {
    const [currentPrice, setCurrentPrice] = useState(auction.currentPrice || auction.startingPrice);
    const [bidCount, setBidCount] = useState(auction.bidCount || 0);
    const [nextMinBid, setNextMinBid] = useState(0);
    const [bidAmount, setBidAmount] = useState('');
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isEnding, setIsEnding] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [bidHistory, setBidHistory] = useState([]);
    const [isPlacingBid, setIsPlacingBid] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [viewCount, setViewCount] = useState(auction.viewCount || 0);
    const [watchlistCount, setWatchlistCount] = useState(auction.watchlistCount || 0);
    const [lastBidder, setLastBidder] = useState('');
    const [auctionEnded, setAuctionEnded] = useState(false);

    const biddingService = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        initializeBidding();
        startCountdownTimer();

        return () => {
            if (biddingService.current) {
                biddingService.current.leaveAuction(auction.id);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [auction.id]);

    const initializeBidding = async () => {
        try {
            biddingService.current = new BiddingService();
            const connected = await biddingService.current.initialize();
            
            if (connected) {
                setConnectionStatus('connected');
                await biddingService.current.joinAuction(auction.id);
                
                // Set up event listeners
                biddingService.current.on('bidUpdate', handleBidUpdate);
                biddingService.current.on('countdownUpdate', handleCountdownUpdate);
                biddingService.current.on('auctionEnding', handleAuctionEnding);
                biddingService.current.on('auctionEnded', handleAuctionEnded);
                biddingService.current.on('auctionExtended', handleAuctionExtended);
                biddingService.current.on('liveUpdate', handleLiveUpdate);
                biddingService.current.on('connectionStateChanged', setConnectionStatus);

                // Load initial data
                await loadInitialData();
            } else {
                setConnectionStatus('error');
                showNotification('Failed to connect to real-time bidding', 'error');
            }
        } catch (error) {
            console.error('Error initializing bidding:', error);
            setConnectionStatus('error');
            showNotification('Connection error', 'error');
        }
    };

    const loadInitialData = async () => {
        try {
            const minBid = await biddingService.current.getNextMinimumBid(auction.id);
            setNextMinBid(minBid);
            setBidAmount(minBid.toFixed(2));

            const bids = await biddingService.current.getAuctionBids(auction.id);
            setBidHistory(bids.slice(0, 10)); // Show last 10 bids
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const handleBidUpdate = (bidUpdate) => {
        setCurrentPrice(bidUpdate.HighestBid);
        setBidCount(bidUpdate.BidCount);
        setNextMinBid(bidUpdate.NextMinimumBid);
        setBidAmount(bidUpdate.NextMinimumBid.toFixed(2));
        setLastBidder(bidUpdate.BidderName);

        // Add to bid history
        const newBid = {
            id: Date.now(),
            amount: bidUpdate.HighestBid,
            bidderName: bidUpdate.BidderName,
            bidTime: new Date(bidUpdate.BidTime),
            isWinning: true
        };

        setBidHistory(prev => [newBid, ...prev.slice(0, 9)]);
        showNotification(`New bid: $${bidUpdate.HighestBid.toFixed(2)} by ${bidUpdate.BidderName}`, 'success');
    };

    const handleCountdownUpdate = (countdown) => {
        setTimeRemaining(formatTimeRemaining(countdown.TimeRemaining));
        setIsEnding(countdown.IsEnding);
    };

    const handleAuctionEnding = (notification) => {
        showNotification(notification.Message, 'warning');
        setIsEnding(true);
    };

    const handleAuctionEnded = (result) => {
        setAuctionEnded(true);
        setTimeRemaining('ENDED');
        
        let message = 'Auction has ended!';
        if (result.WinningBid) {
            message += ` Winning bid: $${result.WinningBid.toFixed(2)} by ${result.WinnerName}`;
        }
        showNotification(message, 'info');
    };

    const handleAuctionExtended = (extension) => {
        showNotification(`Auction extended by ${extension.ExtensionMinutes} minutes!`, 'info');
    };

    const handleLiveUpdate = (update) => {
        setViewCount(update.ViewCount);
        setWatchlistCount(update.WatchlistCount);
    };

    const startCountdownTimer = () => {
        timerRef.current = setInterval(() => {
            const now = new Date();
            const endTime = new Date(auction.endDate);
            const remaining = endTime - now;

            if (remaining <= 0) {
                setTimeRemaining('ENDED');
                setAuctionEnded(true);
                clearInterval(timerRef.current);
                return;
            }

            setTimeRemaining(formatTimeRemaining(remaining * 10000)); // Convert to .NET ticks
            setIsEnding(remaining <= 15 * 60 * 1000); // 15 minutes
        }, 1000);
    };

    const formatTimeRemaining = (ticks) => {
        const totalSeconds = Math.floor(ticks / 10000000);
        
        if (totalSeconds <= 0) return "ENDED";

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    };

    const placeBid = async () => {
        if (!currentUser) {
            showNotification('Please log in to place a bid', 'error');
            return;
        }

        const amount = parseFloat(bidAmount);
        if (!amount || amount < nextMinBid) {
            showNotification(`Bid must be at least $${nextMinBid.toFixed(2)}`, 'error');
            return;
        }

        setIsPlacingBid(true);
        try {
            const result = await biddingService.current.placeBid(auction.id, amount, currentUser.id);
            
            if (result.status === 0) { // Success
                showNotification('Bid placed successfully!', 'success');
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Failed to place bid', 'error');
        } finally {
            setIsPlacingBid(false);
        }
    };

    const setQuickBid = (increment) => {
        const newAmount = nextMinBid + increment;
        setBidAmount(newAmount.toFixed(2));
    };

    const showNotification = (message, type) => {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    return (
        <div className="bidding-interface">
            {/* Connection Status */}
            <div className={`connection-status ${connectionStatus}`}>
                {connectionStatus === 'connected' && '🟢 Connected'}
                {connectionStatus === 'reconnecting' && '🟡 Reconnecting...'}
                {connectionStatus === 'disconnected' && '🔴 Disconnected'}
                {connectionStatus === 'error' && '❌ Connection Error'}
            </div>

            {/* Bidding Container */}
            <div className="bidding-container">
                {/* Auction Timer */}
                <div className={`auction-timer ${isEnding ? 'ending-soon' : ''} ${auctionEnded ? 'ended' : ''}`}>
                    {timeRemaining}
                </div>

                {/* Current Price */}
                <div className="current-price">
                    ${currentPrice.toFixed(2)}
                </div>

                {/* Auction Stats */}
                <div className="auction-stats">
                    <div className="stat-card">
                        <span className="stat-value">{bidCount}</span>
                        <div className="stat-label">Bids</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{viewCount}</span>
                        <div className="stat-label">Views</div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{watchlistCount}</span>
                        <div className="stat-label">Watching</div>
                    </div>
                </div>

                {/* Auto-extend indicator */}
                {auction.autoExtend && (
                    <div className="auto-extend-indicator">
                        ⏰ Auto-extend enabled: Auction will be extended if bids are placed in the final minutes
                    </div>
                )}

                {/* Bid Input Section */}
                {!auctionEnded && (
                    <div className="bid-input-section">
                        <div className="bid-info">
                            Next minimum bid: ${nextMinBid.toFixed(2)}
                        </div>
                        
                        {/* Quick Bid Buttons */}
                        <div className="quick-bid-buttons">
                            <button className="quick-bid-btn" onClick={() => setQuickBid(5)}>+$5</button>
                            <button className="quick-bid-btn" onClick={() => setQuickBid(10)}>+$10</button>
                            <button className="quick-bid-btn" onClick={() => setQuickBid(25)}>+$25</button>
                            <button className="quick-bid-btn" onClick={() => setQuickBid(50)}>+$50</button>
                        </div>

                        <div className="bid-input-group">
                            <input
                                type="number"
                                className="bid-amount-input"
                                placeholder="Enter bid amount"
                                min={nextMinBid}
                                step="0.01"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                            />
                            <button
                                className="place-bid-btn"
                                onClick={placeBid}
                                disabled={isPlacingBid || auctionEnded}
                            >
                                {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
                            </button>
                        </div>

                        <div className="bid-info">
                            <small>By placing a bid, you agree to the terms and conditions.</small>
                        </div>
                    </div>
                )}
            </div>

            {/* Bid History */}
            <div className="bidding-container">
                <h5>Bid History</h5>
                <div className="bid-history">
                    {bidHistory.length === 0 ? (
                        <div className="bid-history-item">
                            <div className="bid-amount">${auction.startingPrice.toFixed(2)}</div>
                            <div className="bid-details">
                                <span className="bidder">Starting Price</span>
                                <span className="bid-time">-</span>
                            </div>
                        </div>
                    ) : (
                        bidHistory.map((bid) => (
                            <div key={bid.id} className="bid-history-item">
                                <div className="bid-amount">${bid.amount.toFixed(2)}</div>
                                <div className="bid-details">
                                    <span className="bidder">{bid.bidderName}</span>
                                    <span className="bid-time">
                                        {bid.bidTime.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Current High Bidder */}
            <div className="bidding-container">
                <h6>Current High Bidder</h6>
                <div>{lastBidder || 'No bids yet'}</div>
            </div>

            {/* Notifications */}
            <div className="notifications">
                {notifications.map((notification) => (
                    <div key={notification.id} className={`notification notification-${notification.type}`}>
                        {notification.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BiddingInterface;
