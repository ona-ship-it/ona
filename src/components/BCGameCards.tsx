'use client'

import React, { useState } from 'react';
import { Zap, Clock, Users, Ticket, Trophy, ShoppingCart, Star, TrendingUp, Flame } from 'lucide-react';

const ONAGUIBCGameCards = () => {
  const [activeTab, setActiveTab] = useState('giveaways');

  const giveaways = [
    {
      id: 1,
      title: "iPhone 15 Pro Max",
      subtitle: "Latest flagship device",
      image: "https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=800&h=500&fit=crop",
      host: "TechWorld",
      prize: "1,299",
      entries: 12453,
      maxEntries: 20000,
      timeLeft: "2d 14h",
      hot: true,
      verified: true
    },
    {
      id: 2,
      title: "PS5 Console Bundle",
      subtitle: "Gaming setup complete",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=500&fit=crop",
      host: "GamingHub",
      prize: "650",
      entries: 8921,
      maxEntries: 15000,
      timeLeft: "5d 8h",
      hot: false,
      verified: true
    },
    {
      id: 3,
      title: "MacBook Pro M3 Max",
      subtitle: "Professional powerhouse",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop",
      host: "AppleStore",
      prize: "2,499",
      entries: 15677,
      maxEntries: 25000,
      timeLeft: "1d 4h",
      hot: true,
      verified: true
    },
    {
      id: 4,
      title: "AirPods Pro 2",
      subtitle: "Premium audio experience",
      image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&h=500&fit=crop",
      host: "AudioTech",
      prize: "299",
      entries: 6234,
      maxEntries: 10000,
      timeLeft: "3d 12h",
      hot: false,
      verified: false
    }
  ];

  const raffles = [
    {
      id: 1,
      title: "Tesla Model 3 2024",
      subtitle: "Electric luxury vehicle",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop",
      host: "LuxuryRaffles",
      ticketPrice: "25",
      totalTickets: 5000,
      soldTickets: 3842,
      prize: "45,000",
      timeLeft: "7d 2h",
      hot: true,
      verified: true
    },
    {
      id: 2,
      title: "Rolex Submariner",
      subtitle: "Iconic luxury watch",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=500&fit=crop",
      host: "WatchCollective",
      ticketPrice: "50",
      totalTickets: 1000,
      soldTickets: 847,
      prize: "12,000",
      timeLeft: "4d 18h",
      hot: false,
      verified: true
    },
    {
      id: 3,
      title: "Gaming PC RTX 4090",
      subtitle: "Ultimate gaming rig",
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=500&fit=crop",
      host: "PCMasterRace",
      ticketPrice: "10",
      totalTickets: 3000,
      soldTickets: 2156,
      prize: "3,500",
      timeLeft: "2d 6h",
      hot: true,
      verified: true
    },
    {
      id: 4,
      title: "Bali Resort Package",
      subtitle: "7 days luxury vacation",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
      host: "TravelDreams",
      ticketPrice: "15",
      totalTickets: 2000,
      soldTickets: 1523,
      prize: "5,000",
      timeLeft: "10d 4h",
      hot: false,
      verified: false
    }
  ];

  const marketplace = [
    {
      id: 1,
      title: "Air Jordan 1 Retro",
      subtitle: "Limited edition sneakers",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop",
      seller: "SneakerVault",
      price: "189",
      condition: "New",
      rating: 4.8,
      reviews: 234,
      trending: true,
      verified: true
    },
    {
      id: 2,
      title: "Canon EOS R5",
      subtitle: "Professional camera body",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=500&fit=crop",
      seller: "PhotoPro",
      price: "2,899",
      condition: "Like New",
      rating: 4.9,
      reviews: 156,
      trending: false,
      verified: true
    },
    {
      id: 3,
      title: "Supreme Box Logo",
      subtitle: "FW23 collection hoodie",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=500&fit=crop",
      seller: "StreetWear",
      price: "650",
      condition: "New",
      rating: 4.7,
      reviews: 89,
      trending: true,
      verified: true
    },
    {
      id: 4,
      title: "DJI Mavic 3 Pro",
      subtitle: "Cinema drone bundle",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=500&fit=crop",
      seller: "DroneHub",
      price: "1,599",
      condition: "Excellent",
      rating: 4.6,
      reviews: 67,
      trending: false,
      verified: false
    }
  ];

  const GiveawayCard = ({ item }: { item: typeof giveaways[0] }) => {
    const progress = (item.entries / item.maxEntries) * 100;
    
    return (
      <div className="bc-card">
        {item.hot && (
          <div className="hot-badge">
            <Flame size={14} />
            <span>HOT</span>
          </div>
        )}
        
        <div className="bc-card-image">
          <img src={item.image} alt={item.title} />
          <div className="image-overlay"></div>
          {item.verified && (
            <div className="verified-icon">
              <Zap size={16} fill="#00ff88" stroke="#00ff88" />
            </div>
          )}
        </div>

        <div className="bc-card-body">
          <div className="card-header-row">
            <div className="time-badge">
              <Clock size={12} />
              <span>{item.timeLeft}</span>
            </div>
            <div className="entries-badge">
              <Users size={12} />
              <span>{item.entries.toLocaleString()}</span>
            </div>
          </div>

          <h3 className="bc-card-title">{item.title}</h3>
          <p className="bc-card-subtitle">{item.subtitle}</p>
          
          <div className="host-info">
            <span>by</span>
            <span className="host-name">{item.host}</span>
          </div>

          <div className="progress-wrapper">
            <div className="progress-track">
              <div className="progress-glow" style={{ width: `${progress}%` }}></div>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-labels">
              <span>{Math.round(progress)}%</span>
              <span className="max-entries">{item.maxEntries.toLocaleString()} max</span>
            </div>
          </div>

          <div className="card-footer">
            <div className="prize-display">
              <Trophy size={18} />
              <div className="prize-amount">
                <span className="currency">$</span>
                <span className="value">{item.prize}</span>
              </div>
            </div>
            <button className="action-btn primary">
              <span>ENTER NOW</span>
              <div className="btn-glow"></div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RaffleCard = ({ item }: { item: typeof raffles[0] }) => {
    const progress = (item.soldTickets / item.totalTickets) * 100;
    
    return (
      <div className="bc-card">
        {item.hot && (
          <div className="hot-badge">
            <Flame size={14} />
            <span>HOT</span>
          </div>
        )}
        
        <div className="bc-card-image">
          <img src={item.image} alt={item.title} />
          <div className="image-overlay"></div>
          {item.verified && (
            <div className="verified-icon">
              <Zap size={16} fill="#00ff88" stroke="#00ff88" />
            </div>
          )}
        </div>

        <div className="bc-card-body">
          <div className="card-header-row">
            <div className="time-badge">
              <Clock size={12} />
              <span>{item.timeLeft}</span>
            </div>
            <div className="ticket-badge">
              <Ticket size={12} />
              <span>${item.ticketPrice}</span>
            </div>
          </div>

          <h3 className="bc-card-title">{item.title}</h3>
          <p className="bc-card-subtitle">{item.subtitle}</p>
          
          <div className="host-info">
            <span>by</span>
            <span className="host-name">{item.host}</span>
          </div>

          <div className="tickets-sold">
            <div className="tickets-info">
              <span className="sold-count">{item.soldTickets.toLocaleString()}</span>
              <span className="tickets-sep">/</span>
              <span className="total-count">{item.totalTickets.toLocaleString()}</span>
              <span className="tickets-label">tickets sold</span>
            </div>
          </div>

          <div className="progress-wrapper">
            <div className="progress-track">
              <div className="progress-glow" style={{ width: `${progress}%` }}></div>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="card-footer">
            <div className="prize-display">
              <Trophy size={18} />
              <div className="prize-amount">
                <span className="currency">$</span>
                <span className="value">{item.prize}</span>
              </div>
            </div>
            <button className="action-btn primary">
              <span>BUY TICKETS</span>
              <div className="btn-glow"></div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MarketplaceCard = ({ item }: { item: typeof marketplace[0] }) => (
    <div className="bc-card">
      {item.trending && (
        <div className="trending-badge">
          <TrendingUp size={14} />
          <span>TRENDING</span>
        </div>
      )}
      
      <div className="bc-card-image">
        <img src={item.image} alt={item.title} />
        <div className="image-overlay"></div>
        {item.verified && (
          <div className="verified-icon">
            <Zap size={16} fill="#00ff88" stroke="#00ff88" />
          </div>
        )}
        <div className="condition-tag">{item.condition}</div>
      </div>

      <div className="bc-card-body">
        <div className="card-header-row">
          <div className="rating-display">
            <Star size={12} fill="#ff8800" stroke="none" />
            <span>{item.rating}</span>
            <span className="reviews">({item.reviews})</span>
          </div>
        </div>

        <h3 className="bc-card-title">{item.title}</h3>
        <p className="bc-card-subtitle">{item.subtitle}</p>
        
        <div className="host-info">
          <span>by</span>
          <span className="host-name">{item.seller}</span>
        </div>

        <div className="card-footer marketplace">
          <div className="price-display-large">
            <span className="currency">$</span>
            <span className="value">{item.price}</span>
          </div>
          <button className="action-btn secondary">
            <ShoppingCart size={16} />
            <span>BUY NOW</span>
            <div className="btn-glow"></div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .bc-container {
          min-height: 100vh;
          background: #0f1419;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 136, 0, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.03) 2px, rgba(0, 255, 136, 0.03) 4px);
          font-family: 'Barlow', sans-serif;
          padding: 32px 24px;
          position: relative;
        }

        .bc-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.03) 0%, transparent 70%);
          pointer-events: none;
          animation: pulseGlow 8s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }

        .logo {
          font-family: 'Rajdhani', sans-serif;
          font-size: 56px;
          font-weight: 700;
          background: linear-gradient(135deg, #00ff88 0%, #00ffaa 50%, #00ffcc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 8px;
          filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.5));
          animation: logoGlow 3s ease-in-out infinite;
        }

        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(0, 255, 136, 0.8)); }
        }

        .tagline {
          font-size: 16px;
          color: #718096;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 500;
        }

        .tabs-container {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
          flex-wrap: wrap;
        }

        .tab-btn {
          background: rgba(15, 20, 25, 0.6);
          border: 2px solid rgba(0, 255, 136, 0.2);
          color: #718096;
          padding: 14px 32px;
          border-radius: 12px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .tab-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .tab-btn:hover::before {
          left: 100%;
        }

        .tab-btn:hover {
          border-color: rgba(0, 255, 136, 0.5);
          color: #00ff88;
          transform: translateY(-2px);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 170, 0.2) 100%);
          border-color: #00ff88;
          color: #00ff88;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .bc-card {
          background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          backdrop-filter: blur(10px);
          cursor: pointer;
        }

        .bc-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .bc-card:hover::before {
          opacity: 1;
        }

        .bc-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 255, 136, 0.5);
          box-shadow: 0 20px 60px rgba(0, 255, 136, 0.2), 0 0 40px rgba(0, 255, 136, 0.1);
        }

        .hot-badge, .trending-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ff4400 0%, #ff8800 100%);
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          z-index: 2;
          box-shadow: 0 4px 15px rgba(255, 68, 0, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .bc-card-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }

        .bc-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .bc-card:hover .bc-card-image img {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, rgba(15, 20, 25, 0.95) 0%, transparent 100%);
        }

        .verified-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          background: rgba(15, 20, 25, 0.8);
          border: 2px solid #00ff88;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
          animation: verifiedPulse 2s ease-in-out infinite;
        }

        @keyframes verifiedPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
          50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.8); }
        }

        .condition-tag {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(255, 136, 0, 0.9);
          color: #0f1419;
          padding: 6px 14px;
          border-radius: 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          z-index: 2;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(255, 136, 0, 0.3);
        }

        .bc-card-body {
          padding: 24px;
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .time-badge, .entries-badge, .ticket-badge, .rating-display {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #00ff88;
        }

        .rating-display {
          background: rgba(255, 136, 0, 0.1);
          border-color: rgba(255, 136, 0, 0.3);
          color: #ff8800;
        }

        .reviews {
          color: #718096;
          font-size: 11px;
        }

        .bc-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
          line-height: 1.3;
          letter-spacing: 0.5px;
        }

        .bc-card-subtitle {
          font-size: 14px;
          color: #718096;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .host-info {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #718096;
        }

        .host-name {
          color: #00ff88;
          font-weight: 600;
        }

        .tickets-sold {
          margin-bottom: 12px;
        }

        .tickets-info {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-family: 'Rajdhani', sans-serif;
        }

        .sold-count {
          font-size: 24px;
          font-weight: 700;
          color: #00ff88;
        }

        .tickets-sep {
          font-size: 20px;
          color: #718096;
        }

        .total-count {
          font-size: 20px;
          font-weight: 600;
          color: #718096;
        }

        .tickets-label {
          font-size: 13px;
          color: #718096;
          margin-left: 8px;
        }

        .progress-wrapper {
          margin-bottom: 20px;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(0, 255, 136, 0.1);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(0, 255, 136, 0.3);
          filter: blur(8px);
          transition: width 0.5s ease;
        }

        .progress-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #00ff88 0%, #00ffaa 100%);
          border-radius: 10px;
          transition: width 0.5s ease;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: #00ff88;
        }

        .max-entries {
          color: #718096;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 255, 136, 0.1);
        }

        .card-footer.marketplace {
          flex-direction: column;
          align-items: stretch;
        }

        .prize-display {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .prize-display svg {
          color: #ff8800;
          filter: drop-shadow(0 0 8px rgba(255, 136, 0, 0.6));
        }

        .prize-amount, .price-display-large {
          display: flex;
          align-items: baseline;
          font-family: 'Rajdhani', sans-serif;
          gap: 2px;
        }

        .prize-amount .currency, .price-display-large .currency {
          font-size: 16px;
          color: #ff8800;
          font-weight: 600;
        }

        .prize-amount .value {
          font-size: 28px;
          font-weight: 700;
          color: #ff8800;
        }

        .price-display-large {
          justify-content: center;
          margin-bottom: 12px;
        }

        .price-display-large .currency {
          font-size: 24px;
        }

        .price-display-large .value {
          font-size: 40px;
          font-weight: 700;
          color: #ff8800;
        }

        .action-btn {
          position: relative;
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #00ff88 0%, #00ffaa 100%);
          color: #0f1419;
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }

        .action-btn.secondary {
          background: linear-gradient(135deg, #ff8800 0%, #ffaa00 100%);
          color: #0f1419;
          box-shadow: 0 4px 20px rgba(255, 136, 0, 0.3);
          width: 100%;
        }

        .btn-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .action-btn:hover .btn-glow {
          left: 100%;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.primary:hover {
          box-shadow: 0 8px 30px rgba(0, 255, 136, 0.5);
        }

        .action-btn.secondary:hover {
          box-shadow: 0 8px 30px rgba(255, 136, 0, 0.5);
        }

        @media (max-width: 768px) {
          .bc-container {
            padding: 24px 16px;
          }

          .logo {
            font-size: 40px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .tabs-container {
            gap: 12px;
          }

          .tab-btn {
            padding: 12px 24px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="bc-container">
        <div className="header">
          <h1 className="logo">ONAGUI</h1>
          <p className="tagline">Your best chance to win</p>
        </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'giveaways' ? 'active' : ''}`}
          onClick={() => setActiveTab('giveaways')}
        >
          Giveaways
        </button>
        <button 
          className={`tab-btn ${activeTab === 'raffles' ? 'active' : ''}`}
          onClick={() => setActiveTab('raffles')}
        >
          Raffles
        </button>
        <button 
          className={`tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
      </div>

      <div className="cards-grid">
        {activeTab === 'giveaways' && giveaways.map(item => (
          <GiveawayCard key={item.id} item={item} />
        ))}
        {activeTab === 'raffles' && raffles.map(item => (
          <RaffleCard key={item.id} item={item} />
        ))}
        {activeTab === 'marketplace' && marketplace.map(item => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ONAGUIBCGameCards;
