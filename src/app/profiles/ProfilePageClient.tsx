"use client";

import React, { useState } from 'react';
import { 
  Users, Trophy, Heart, TrendingUp, Clock, Share2, 
  ExternalLink, Check, Flame, Star, Gift, Ticket,
  Instagram, Twitter, Music2, Calendar, Eye, MessageCircle,
  Award, DollarSign, Target, Zap
} from 'lucide-react';

const ProfilePageClient = () => {
  const [activeSection, setActiveSection] = useState('live');

  // Profile data
  const profile = {
    username: "TechKing",
    displayName: "Tech King | Giveaway Master",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
    bio: "Verified creator giving back to the community. 500+ giveaways hosted, $2M+ in prizes distributed.",
    verified: true,
    joinDate: "Jan 2023",
    location: "Los Angeles, CA",
    stats: {
      totalGiveaways: 547,
      totalWinners: 1243,
      totalValue: "2.3M",
      followers: 125400,
      credibilityScore: 98
    },
    social: {
      twitter: "@techking",
      instagram: "@techking.official",
      tiktok: "@techkingofficial"
    }
  };

  // Current live posts
  const livePosts = [
    {
      id: 1,
      type: "giveaway",
      title: "iPhone 15 Pro Max Giveaway",
      image: "https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=600&h=400&fit=crop",
      prize: "$1,299",
      entries: 15432,
      timeLeft: "2d 14h",
      status: "live",
      views: 45200
    },
    {
      id: 2,
      type: "raffle",
      title: "MacBook Pro M3 Raffle",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
      prize: "$2,499",
      tickets: 2500,
      soldTickets: 1847,
      timeLeft: "5d 8h",
      status: "live",
      views: 32100
    },
    {
      id: 3,
      type: "giveaway",
      title: "PlayStation 5 Bundle",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop",
      prize: "$650",
      entries: 8921,
      timeLeft: "1d 4h",
      status: "live",
      views: 28400
    }
  ];

  // History of past posts
  const historyPosts = [
    {
      id: 1,
      type: "giveaway",
      title: "Gaming PC RTX 4090 Giveaway",
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=400&fit=crop",
      prize: "$3,500",
      entries: 23456,
      winner: "@luckyuser123",
      endDate: "Feb 1, 2026",
      status: "completed"
    },
    {
      id: 2,
      type: "raffle",
      title: "Tesla Model 3 Raffle",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop",
      prize: "$45,000",
      tickets: 5000,
      winner: "@teslaowner2026",
      endDate: "Jan 28, 2026",
      status: "completed"
    },
    {
      id: 3,
      type: "giveaway",
      title: "AirPods Pro 2 Giveaway",
      image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=400&fit=crop",
      prize: "$299",
      entries: 12340,
      winner: "@musiclover",
      endDate: "Jan 25, 2026",
      status: "completed"
    }
  ];

  // Most popular posts
  const popularPosts = [
    {
      id: 1,
      type: "giveaway",
      title: "Tesla Cybertruck Giveaway",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop",
      prize: "$80,000",
      entries: 156789,
      views: 2340000,
      engagement: "94%",
      status: "completed"
    },
    {
      id: 2,
      type: "raffle",
      title: "$100K Cash Raffle",
      image: "https://images.unsplash.com/photo-1634704784915-aacf363b021f?w=600&h=400&fit=crop",
      prize: "$100,000",
      tickets: 10000,
      views: 1850000,
      engagement: "91%",
      status: "completed"
    },
    {
      id: 3,
      type: "giveaway",
      title: "Dream Gaming Setup",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=400&fit=crop",
      prize: "$15,000",
      entries: 98456,
      views: 1200000,
      engagement: "88%",
      status: "completed"
    }
  ];

  // Recent winners
  const recentWinners = [
    {
      id: 1,
      username: "luckyuser123",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      prize: "Gaming PC RTX 4090",
      value: "$3,500",
      date: "Feb 1, 2026",
      verified: true
    },
    {
      id: 2,
      username: "teslaowner2026",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      prize: "Tesla Model 3",
      value: "$45,000",
      date: "Jan 28, 2026",
      verified: true
    },
    {
      id: 3,
      username: "musiclover",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      prize: "AirPods Pro 2",
      value: "$299",
      date: "Jan 25, 2026",
      verified: true
    },
    {
      id: 4,
      username: "gamergirl2024",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      prize: "PlayStation 5 Bundle",
      value: "$650",
      date: "Jan 20, 2026",
      verified: false
    }
  ];

  // Supported fundraises
  const supportedFundraises = [
    {
      id: 1,
      title: "Clean Water for Africa",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
      raised: "45,000",
      goal: "100,000",
      donors: 1234,
      contribution: "5,000",
      date: "Jan 2026"
    },
    {
      id: 2,
      title: "Animal Shelter Support",
      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop",
      raised: "12,500",
      goal: "25,000",
      donors: 543,
      contribution: "2,500",
      date: "Dec 2025"
    },
    {
      id: 3,
      title: "Medical Aid for Children",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
      raised: "67,000",
      goal: "80,000",
      donors: 2156,
      contribution: "3,000",
      date: "Nov 2025"
    }
  ];

  return (
    <div className="profile-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .profile-container {
          min-height: 100vh;
          background: #0f1419;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 136, 0, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.03) 2px, rgba(0, 255, 136, 0.03) 4px);
          font-family: 'Barlow', sans-serif;
          color: #fff;
          padding: 32px 24px;
        }

        .profile-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Hero Section */
        .profile-hero {
          background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 24px;
          padding: 48px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .profile-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-content {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 32px;
          align-items: start;
          position: relative;
          z-index: 1;
        }

        .avatar-section {
          position: relative;
        }

        .avatar-wrapper {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 4px solid #00ff88;
          padding: 6px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 170, 0.2));
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.4);
          animation: avatarGlow 3s ease-in-out infinite;
        }

        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.4); }
          50% { box-shadow: 0 0 60px rgba(0, 255, 136, 0.6); }
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .verified-badge-large {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 40px;
          height: 40px;
          background: #00ff88;
          border: 3px solid #0f1419;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
        }

        .profile-info {
          flex: 1;
        }

        .username-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .display-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
        }

        .credibility-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 170, 0.2));
          border: 2px solid #00ff88;
          padding: 8px 16px;
          border-radius: 20px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }

        .bio-text {
          font-size: 16px;
          color: #a0aec0;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .profile-meta {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #718096;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .social-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 10px 20px;
          border-radius: 10px;
          color: #00ff88;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
        }

        .social-btn.twitter { color: #1DA1F2; border-color: rgba(29, 161, 242, 0.3); }
        .social-btn.instagram { color: #E4405F; border-color: rgba(228, 64, 95, 0.3); }
        .social-btn.tiktok { color: #00f2ea; border-color: rgba(0, 242, 234, 0.3); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
        }

        .stat-card {
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-value {
          font-family: 'Rajdhani', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Navigation Tabs */
        .section-nav {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          border-bottom: 2px solid rgba(0, 255, 136, 0.1);
          padding-bottom: 0;
          overflow-x: auto;
        }

        .nav-tab {
          background: transparent;
          border: none;
          color: #718096;
          padding: 16px 24px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }

        .nav-tab:hover {
          color: #00ff88;
        }

        .nav-tab.active {
          color: #00ff88;
          border-bottom-color: #00ff88;
          box-shadow: 0 2px 15px rgba(0, 255, 136, 0.3);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .content-card {
          background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .content-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 255, 136, 0.4);
          box-shadow: 0 12px 40px rgba(0, 255, 136, 0.2);
        }

        .card-image {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .content-card:hover .card-image img {
          transform: scale(1.05);
        }

        .status-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #00ff88 0%, #00ffaa 100%);
          color: #0f1419;
          padding: 6px 12px;
          border-radius: 20px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        .status-badge.completed {
          background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
          color: #fff;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .card-stats-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(15, 20, 25, 0.95) 0%, transparent 100%);
          padding: 12px;
          display: flex;
          justify-content: space-between;
        }

        .overlay-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
        }

        .card-body {
          padding: 20px;
        }

        .card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .prize-display {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ff8800;
          font-family: 'Rajdhani', sans-serif;
          font-size: 24px;
          font-weight: 700;
        }

        .card-info {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #718096;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .winner-info {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
        }

        .winner-name {
          color: #00ff88;
          font-weight: 600;
        }

        /* Winners Section */
        .winners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .winner-card {
          background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          transition: all 0.3s ease;
        }

        .winner-card:hover {
          border-color: rgba(0, 255, 136, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 136, 0.15);
        }

        .winner-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid #00ff88;
          object-fit: cover;
        }

        .winner-details {
          flex: 1;
        }

        .winner-username {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 4px;
        }

        .winner-prize {
          font-size: 14px;
          color: #a0aec0;
          margin-bottom: 4px;
        }

        .winner-value {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #ff8800;
        }

        .winner-date {
          font-size: 12px;
          color: #718096;
        }

        /* Fundraise Section */
        .fundraise-card {
          background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .fundraise-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 255, 136, 0.4);
          box-shadow: 0 12px 40px rgba(0, 255, 136, 0.2);
        }

        .fundraise-progress {
          padding: 20px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .raised-amount {
          font-family: 'Rajdhani', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #00ff88;
        }

        .goal-amount {
          font-size: 14px;
          color: #718096;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(0, 255, 136, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar-inner {
          height: 100%;
          background: linear-gradient(90deg, #00ff88 0%, #00ffaa 100%);
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
          transition: width 0.5s ease;
        }

        .contribution-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 136, 0, 0.1);
          border: 1px solid rgba(255, 136, 0, 0.3);
          padding: 8px 16px;
          border-radius: 20px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: #ff8800;
        }

        @media (max-width: 768px) {
          .profile-hero {
            padding: 24px;
          }

          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .avatar-section {
            margin: 0 auto;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .section-nav {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="profile-wrapper">
        {/* Hero Section */}
        <div className="profile-hero">
          <div className="hero-content">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img src={profile.avatar} alt={profile.username} className="avatar-img" />
                {profile.verified && (
                  <div className="verified-badge-large">
                    <Zap size={20} fill="#0f1419" stroke="#0f1419" />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-info">
              <div className="username-row">
                <h1 className="display-name">{profile.displayName}</h1>
                <div className="credibility-badge">
                  <Award size={18} />
                  <span>{profile.stats.credibilityScore}% CREDIBLE</span>
                </div>
              </div>

              <p className="bio-text">{profile.bio}</p>

              <div className="profile-meta">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>Joined {profile.joinDate}</span>
                </div>
                <div className="meta-item">
                  <Target size={14} />
                  <span>{profile.location}</span>
                </div>
              </div>

              <div className="social-links">
                {profile.social.twitter && (
                  <a href="#" className="social-btn twitter">
                    <Twitter size={16} />
                    <span>{profile.social.twitter}</span>
                  </a>
                )}
                {profile.social.instagram && (
                  <a href="#" className="social-btn instagram">
                    <Instagram size={16} />
                    <span>{profile.social.instagram}</span>
                  </a>
                )}
                {profile.social.tiktok && (
                  <a href="#" className="social-btn tiktok">
                    <Music2 size={16} />
                    <span>{profile.social.tiktok}</span>
                  </a>
                )}
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{profile.stats.totalGiveaways}</div>
                  <div className="stat-label">Giveaways</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{profile.stats.totalWinners}</div>
                  <div className="stat-label">Winners</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">${profile.stats.totalValue}</div>
                  <div className="stat-label">Total Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{(profile.stats.followers / 1000).toFixed(1)}K</div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{profile.stats.credibilityScore}%</div>
                  <div className="stat-label">Trust Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="section-nav">
          <button 
            className={`nav-tab ${activeSection === 'live' ? 'active' : ''}`}
            onClick={() => setActiveSection('live')}
          >
            🔴 Live Now
          </button>
          <button 
            className={`nav-tab ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSection('history')}
          >
            📜 History
          </button>
          <button 
            className={`nav-tab ${activeSection === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveSection('popular')}
          >
            🔥 Most Popular
          </button>
          <button 
            className={`nav-tab ${activeSection === 'winners' ? 'active' : ''}`}
            onClick={() => setActiveSection('winners')}
          >
            🏆 Winners
          </button>
          <button 
            className={`nav-tab ${activeSection === 'fundraise' ? 'active' : ''}`}
            onClick={() => setActiveSection('fundraise')}
          >
            ❤️ Supported Causes
          </button>
        </div>

        {/* Live Posts Section */}
        {activeSection === 'live' && (
          <div className="content-grid">
            {livePosts.map(post => (
              <div key={post.id} className="content-card">
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="status-badge">
                    <Flame size={12} />
                    <span>LIVE</span>
                  </div>
                  <div className="card-stats-overlay">
                    <div className="overlay-stat">
                      <Eye size={14} />
                      <span>{(post.views / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="overlay-stat">
                      <Clock size={14} />
                      <span>{post.timeLeft}</span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-meta">
                    <div className="prize-display">
                      <Trophy size={20} />
                      <span>{post.prize}</span>
                    </div>
                  </div>
                  <div className="card-info">
                    {post.entries && (
                      <div className="info-item">
                        <Users size={14} />
                        <span>{post.entries.toLocaleString()} entries</span>
                      </div>
                    )}
                    {post.tickets && (
                      <div className="info-item">
                        <Ticket size={14} />
                        <span>{post.soldTickets}/{post.tickets}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Section */}
        {activeSection === 'history' && (
          <div className="content-grid">
            {historyPosts.map(post => (
              <div key={post.id} className="content-card">
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="status-badge completed">
                    <Check size={12} />
                    <span>COMPLETED</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-meta">
                    <div className="prize-display">
                      <Trophy size={20} />
                      <span>{post.prize}</span>
                    </div>
                  </div>
                  <div className="card-info">
                    {post.entries && (
                      <div className="info-item">
                        <Users size={14} />
                        <span>{post.entries.toLocaleString()} entries</span>
                      </div>
                    )}
                    <div className="info-item">
                      <Calendar size={14} />
                      <span>{post.endDate}</span>
                    </div>
                  </div>
                  <div className="winner-info">
                    <span className="winner-name">Winner: {post.winner}</span>
                    <Check size={16} color="#00ff88" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popular Posts Section */}
        {activeSection === 'popular' && (
          <div className="content-grid">
            {popularPosts.map(post => (
              <div key={post.id} className="content-card">
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="status-badge completed">
                    <TrendingUp size={12} />
                    <span>TOP POST</span>
                  </div>
                  <div className="card-stats-overlay">
                    <div className="overlay-stat">
                      <Eye size={14} />
                      <span>{(post.views / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="overlay-stat">
                      <MessageCircle size={14} />
                      <span>{post.engagement}</span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-meta">
                    <div className="prize-display">
                      <Trophy size={20} />
                      <span>{post.prize}</span>
                    </div>
                  </div>
                  <div className="card-info">
                    {post.entries && (
                      <div className="info-item">
                        <Users size={14} />
                        <span>{post.entries.toLocaleString()} entries</span>
                      </div>
                    )}
                    {post.tickets && (
                      <div className="info-item">
                        <Ticket size={14} />
                        <span>{post.tickets.toLocaleString()} tickets</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Winners Section */}
        {activeSection === 'winners' && (
          <div className="winners-grid">
            {recentWinners.map(winner => (
              <div key={winner.id} className="winner-card">
                <img src={winner.avatar} alt={winner.username} className="winner-avatar" />
                <div className="winner-details">
                  <div className="winner-username">
                    @{winner.username}
                    {winner.verified && <Zap size={14} fill="#00ff88" stroke="#00ff88" style={{ marginLeft: '6px' }} />}
                  </div>
                  <div className="winner-prize">{winner.prize}</div>
                  <div className="winner-value">{winner.value}</div>
                  <div className="winner-date">{winner.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fundraise Section */}
        {activeSection === 'fundraise' && (
          <div className="content-grid">
            {supportedFundraises.map(fundraise => {
              const progress = (parseFloat(fundraise.raised.replace(/,/g, '')) / parseFloat(fundraise.goal.replace(/,/g, ''))) * 100;
              return (
                <div key={fundraise.id} className="fundraise-card">
                  <div className="card-image">
                    <img src={fundraise.image} alt={fundraise.title} />
                  </div>
                  <div className="fundraise-progress">
                    <h3 className="card-title">{fundraise.title}</h3>
                    <div className="progress-header">
                      <div>
                        <div className="raised-amount">${fundraise.raised}</div>
                        <div className="goal-amount">of ${fundraise.goal} goal</div>
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="card-info">
                      <div className="info-item">
                        <Users size={14} />
                        <span>{fundraise.donors.toLocaleString()} donors</span>
                      </div>
                      <div className="info-item">
                        <Calendar size={14} />
                        <span>{fundraise.date}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div className="contribution-badge">
                        <Heart size={16} />
                        <span>Contributed ${fundraise.contribution}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePageClient;
