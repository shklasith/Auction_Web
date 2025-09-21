// Real-time bidding functionality using SignalR
class BiddingClient {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.currentAuctionId = null;
        this.callbacks = {
            onBidUpdate: [],
            onCountdownUpdate: [],
            onAuctionEnding: [],
            onAuctionEnded: [],
            onAuctionExtended: [],
            onLiveUpdate: []
        };
    }

    async initialize() {
        try {
            // Initialize SignalR connection
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/biddingHub")
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .build();

            // Set up event handlers
            this.setupEventHandlers();

            // Start the connection
            await this.connection.start();
            this.isConnected = true;
            console.log("SignalR Connected for real-time bidding");
        } catch (error) {
            console.error("Error connecting to SignalR hub:", error);
        }
    }

    setupEventHandlers() {
        // Bid update notifications
        this.connection.on("BidUpdate", (bidUpdate) => {
            this.callbacks.onBidUpdate.forEach(callback => callback(bidUpdate));
            this.updateBidDisplay(bidUpdate);
        });

        // Countdown timer updates
        this.connection.on("CountdownUpdate", (countdown) => {
            this.callbacks.onCountdownUpdate.forEach(callback => callback(countdown));
            this.updateCountdown(countdown);
        });

        // Auction ending notifications
        this.connection.on("AuctionEnding", (notification) => {
            this.callbacks.onAuctionEnding.forEach(callback => callback(notification));
            this.showEndingNotification(notification);
        });

        // Auction ended notifications
        this.connection.on("AuctionEnded", (result) => {
            this.callbacks.onAuctionEnded.forEach(callback => callback(result));
            this.handleAuctionEnd(result);
        });

        // Auction extension notifications
        this.connection.on("AuctionExtended", (extension) => {
            this.callbacks.onAuctionExtended.forEach(callback => callback(extension));
            this.showExtensionNotification(extension);
        });

        // Live updates
        this.connection.on("LiveUpdate", (update) => {
            this.callbacks.onLiveUpdate.forEach(callback => callback(update));
            this.updateLiveData(update);
        });

        // Connection events
        this.connection.onreconnecting((error) => {
            console.log("SignalR reconnecting:", error);
            this.showConnectionStatus("Reconnecting...", "warning");
        });

        this.connection.onreconnected((connectionId) => {
            console.log("SignalR reconnected:", connectionId);
            this.showConnectionStatus("Connected", "success");
            if (this.currentAuctionId) {
                this.joinAuction(this.currentAuctionId);
            }
        });

        this.connection.onclose((error) => {
            console.log("SignalR disconnected:", error);
            this.isConnected = false;
            this.showConnectionStatus("Disconnected", "error");
        });
    }

    async joinAuction(auctionId) {
        if (this.isConnected) {
            this.currentAuctionId = auctionId;
            await this.connection.invoke("JoinAuctionGroup", auctionId.toString());
            console.log(`Joined auction ${auctionId} group`);
        }
    }

    async leaveAuction(auctionId) {
        if (this.isConnected && auctionId) {
            await this.connection.invoke("LeaveAuctionGroup", auctionId.toString());
            this.currentAuctionId = null;
            console.log(`Left auction ${auctionId} group`);
        }
    }

    // Event subscription methods
    onBidUpdate(callback) {
        this.callbacks.onBidUpdate.push(callback);
    }

    onCountdownUpdate(callback) {
        this.callbacks.onCountdownUpdate.push(callback);
    }

    onAuctionEnding(callback) {
        this.callbacks.onAuctionEnding.push(callback);
    }

    onAuctionEnded(callback) {
        this.callbacks.onAuctionEnded.push(callback);
    }

    onAuctionExtended(callback) {
        this.callbacks.onAuctionExtended.push(callback);
    }

    onLiveUpdate(callback) {
        this.callbacks.onLiveUpdate.push(callback);
    }

    // UI update methods
    updateBidDisplay(bidUpdate) {
        const currentPriceElement = document.getElementById('current-price');
        const bidCountElement = document.getElementById('bid-count');
        const nextMinBidElement = document.getElementById('next-min-bid');
        const lastBidderElement = document.getElementById('last-bidder');

        if (currentPriceElement) {
            currentPriceElement.textContent = `$${bidUpdate.HighestBid.toFixed(2)}`;
            currentPriceElement.classList.add('bid-update-animation');
            setTimeout(() => currentPriceElement.classList.remove('bid-update-animation'), 1000);
        }

        if (bidCountElement) {
            bidCountElement.textContent = bidUpdate.BidCount;
        }

        if (nextMinBidElement) {
            nextMinBidElement.textContent = `$${bidUpdate.NextMinimumBid.toFixed(2)}`;
            const bidInput = document.getElementById('bid-amount');
            if (bidInput) {
                bidInput.min = bidUpdate.NextMinimumBid;
                bidInput.value = bidUpdate.NextMinimumBid.toFixed(2);
            }
        }

        if (lastBidderElement) {
            lastBidderElement.textContent = bidUpdate.BidderName;
        }

        // Add bid to history if element exists
        this.addBidToHistory(bidUpdate);

        // Show bid notification
        this.showBidNotification(bidUpdate);
    }

    updateCountdown(countdown) {
        const timerElement = document.getElementById('auction-timer');
        if (timerElement) {
            const timeString = this.formatTimeRemaining(countdown.TimeRemaining);
            timerElement.textContent = timeString;
            
            if (countdown.IsEnding) {
                timerElement.classList.add('ending-soon');
            }
        }
    }

    formatTimeRemaining(timeSpan) {
        const totalSeconds = Math.floor(timeSpan / 10000000); // Convert from .NET ticks
        
        if (totalSeconds <= 0) {
            return "ENDED";
        }

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
    }

    showEndingNotification(notification) {
        this.showNotification(notification.Message, 'warning', 5000);
        
        // Add urgency effects
        const timerElement = document.getElementById('auction-timer');
        if (timerElement) {
            timerElement.classList.add('pulse-animation');
        }
    }

    handleAuctionEnd(result) {
        const timerElement = document.getElementById('auction-timer');
        const bidButton = document.getElementById('place-bid-btn');
        
        if (timerElement) {
            timerElement.textContent = "ENDED";
            timerElement.classList.add('ended');
        }

        if (bidButton) {
            bidButton.disabled = true;
            bidButton.textContent = "Auction Ended";
        }

        let message = "Auction has ended!";
        if (result.WinningBid) {
            message += ` Winning bid: $${result.WinningBid.toFixed(2)} by ${result.WinnerName}`;
        }

        this.showNotification(message, 'info', 10000);
    }

    showExtensionNotification(extension) {
        const message = `Auction extended by ${extension.ExtensionMinutes} minutes due to recent bidding activity!`;
        this.showNotification(message, 'info', 5000);
    }

    updateLiveData(update) {
        const viewCountElement = document.getElementById('view-count');
        const watchlistCountElement = document.getElementById('watchlist-count');

        if (viewCountElement) {
            viewCountElement.textContent = update.ViewCount;
        }

        if (watchlistCountElement) {
            watchlistCountElement.textContent = update.WatchlistCount;
        }
    }

    addBidToHistory(bidUpdate) {
        const historyContainer = document.getElementById('bid-history');
        if (!historyContainer) return;

        const bidItem = document.createElement('div');
        bidItem.className = 'bid-history-item new-bid';
        bidItem.innerHTML = `
            <div class="bid-amount">$${bidUpdate.HighestBid.toFixed(2)}</div>
            <div class="bid-details">
                <span class="bidder">${bidUpdate.BidderName}</span>
                <span class="bid-time">${new Date(bidUpdate.BidTime).toLocaleTimeString()}</span>
            </div>
        `;

        historyContainer.insertBefore(bidItem, historyContainer.firstChild);

        // Remove animation class after animation completes
        setTimeout(() => bidItem.classList.remove('new-bid'), 1000);

        // Keep only last 10 bids visible
        const items = historyContainer.children;
        if (items.length > 10) {
            historyContainer.removeChild(items[items.length - 1]);
        }
    }

    showBidNotification(bidUpdate) {
        const message = `New bid: $${bidUpdate.HighestBid.toFixed(2)} by ${bidUpdate.BidderName}`;
        this.showNotification(message, 'success', 3000);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        const container = document.getElementById('notifications') || document.body;
        container.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    showConnectionStatus(status, type) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `connection-status ${type}`;
        }
    }

    // Bidding API methods
    async placeBid(auctionId, amount, bidderId) {
        try {
            const response = await fetch('/api/bidding/place-bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auctionId: auctionId,
                    amount: amount,
                    bidderId: bidderId
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to place bid');
            }

            return result;
        } catch (error) {
            console.error('Error placing bid:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    async getNextMinimumBid(auctionId) {
        try {
            const response = await fetch(`/api/bidding/${auctionId}/next-minimum-bid`);
            return await response.json();
        } catch (error) {
            console.error('Error getting next minimum bid:', error);
            return 0;
        }
    }

    async validateBid(auctionId, amount, bidderId) {
        try {
            const response = await fetch('/api/bidding/validate-bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auctionId: auctionId,
                    amount: amount,
                    bidderId: bidderId
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Error validating bid:', error);
            return false;
        }
    }
}

// Global instance
window.biddingClient = new BiddingClient();
