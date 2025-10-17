import React, { useState, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

class BiddingService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.callbacks = new Map();
    }

    async initialize() {
        try {
            this.connection = new signalR.HubConnectionBuilder()
                                .withUrl('http://localhost:5104/biddingHub')
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .build();

            this.setupEventHandlers();
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR Connected for real-time bidding');
            return true;
        } catch (error) {
            console.error('Error connecting to SignalR hub:', error);
            return false;
        }
    }

    setupEventHandlers() {
        this.connection.on('BidUpdate', (bidUpdate) => {
            this.emit('bidUpdate', bidUpdate);
        });

        this.connection.on('CountdownUpdate', (countdown) => {
            this.emit('countdownUpdate', countdown);
        });

        this.connection.on('AuctionEnding', (notification) => {
            this.emit('auctionEnding', notification);
        });

        this.connection.on('AuctionEnded', (result) => {
            this.emit('auctionEnded', result);
        });

        this.connection.on('AuctionExtended', (extension) => {
            this.emit('auctionExtended', extension);
        });

        this.connection.on('LiveUpdate', (update) => {
            this.emit('liveUpdate', update);
        });

        this.connection.onreconnecting(() => {
            this.emit('connectionStateChanged', 'reconnecting');
        });

        this.connection.onreconnected(() => {
            this.emit('connectionStateChanged', 'connected');
        });

        this.connection.onclose(() => {
            this.isConnected = false;
            this.emit('connectionStateChanged', 'disconnected');
        });
    }

    async joinAuction(auctionId) {
        if (this.isConnected) {
            await this.connection.invoke('JoinAuctionGroup', auctionId.toString());
        }
    }

    async leaveAuction(auctionId) {
        if (this.isConnected && auctionId) {
            await this.connection.invoke('LeaveAuctionGroup', auctionId.toString());
        }
    }

    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }

    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => callback(data));
        }
    }

    async placeBid(auctionId, amount, bidderId) {
                const response = await fetch('http://localhost:5104/api/bidding/place-bid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auctionId,
                amount,
                bidderId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to place bid');
        }

        return await response.json();
    }

    async getNextMinimumBid(auctionId) {
                const response = await fetch(`http://localhost:5104/api/bidding/${auctionId}/next-minimum-bid`);
        return await response.json();
    }

    async getAuctionBids(auctionId) {
                const response = await fetch(`http://localhost:5104/api/bidding/${auctionId}/bids`);
        return await response.json();
    }
}

export default BiddingService;
