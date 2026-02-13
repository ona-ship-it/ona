// src/app/marketplace/page.tsx
import Link from 'next/link';

export default function MarketplacePage() {
  return (
    <div className="construction-page">
      <div className="construction-content">
        {/* Animated Construction Icon */}
        <div className="icon-wrapper">
          <div className="icon">🏗️</div>
          <div className="glow"></div>
        </div>
        
        {/* Title */}
        <h1 className="title">Marketplace Coming Soon</h1>
        
        {/* Description */}
        <p className="description">
          We're building something amazing! The ONAGUI Marketplace 
          will let you buy and sell items directly with <strong>crypto payments</strong>.
        </p>
        
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <span className="progress-text">Development in Progress...</span>
        </div>
        
        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Crypto Payments</h3>
            <p>Buy & sell with USDC, ETH, and more</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Escrow Protection</h3>
            <p>Secure transactions for both parties</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Seller Ratings</h3>
            <p>Trust system for verified sellers</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Launching Soon</h3>
            <p>Be the first to know when we launch</p>
          </div>
        </div>
        
        {/* CTA Card */}
        <div className="cta-card">
          <h3>Get Notified</h3>
          <p>Want early access when we launch?</p>
          <div className="email-form">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="email-input"
            />
            <button className="notify-btn">
              Notify Me 🔔
            </button>
          </div>
        </div>
        
        {/* Back Link */}
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
      </div>

      <style jsx>{`
        .construction-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a1929 0%, #1e293b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* Animated Background */
        .construction-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 212, 212, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: moveGrid 20s linear infinite;
        }

        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .construction-content {
          max-width: 800px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        /* Icon Animation */
        .icon-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .icon {
          font-size: 6rem;
          animation: bounce 2s ease-in-out infinite;
        }

        .glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(0, 212, 212, 0.3), transparent 70%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }

        /* Typography */
        .title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #00D4D4 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .description {
          font-size: 1.25rem;
          color: #94a3b8;
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .description strong {
          color: #00D4D4;
          font-weight: 700;
        }

        /* Progress Bar */
        .progress-section {
          margin-bottom: 4rem;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: rgba(30, 41, 59, 0.8);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 1px solid rgba(0, 212, 212, 0.2);
        }

        .progress-fill {
          height: 100%;
          width: 45%;
          background: linear-gradient(90deg, #00D4D4 0%, #10b981 100%);
          border-radius: 10px;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .progress-text {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 212, 212, 0.2);
          border-radius: 1rem;
          padding: 2rem 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 212, 212, 0.5);
          box-shadow: 0 10px 30px rgba(0, 212, 212, 0.2);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          color: #fff;
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: #94a3b8;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* CTA Card */
        .cta-card {
          background: linear-gradient(135deg, rgba(0, 212, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
          border: 2px solid rgba(0, 212, 212, 0.3);
          border-radius: 1.5rem;
          padding: 2.5rem 2rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        }

        .cta-card h3 {
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .cta-card p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }

        .email-form {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        .email-input {
          width: 100%;
          padding: 1rem 1.5rem;
          background: rgba(10, 25, 41, 0.8);
          border: 1px solid rgba(0, 212, 212, 0.3);
          border-radius: 0.75rem;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .email-input:focus {
          outline: none;
          border-color: #00D4D4;
          box-shadow: 0 0 0 3px rgba(0, 212, 212, 0.1);
        }

        .email-input::placeholder {
          color: #64748b;
        }

        .notify-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #00D4D4 0%, #10b981 100%);
          color: #0a1929;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .notify-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 212, 212, 0.4);
        }

        .notify-btn:active {
          transform: translateY(0);
        }

        /* Back Link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #00D4D4;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          gap: 0.75rem;
          color: #10b981;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .title {
            font-size: 2rem;
          }

          .icon {
            font-size: 4rem;
          }

          .description {
            font-size: 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .email-form {
            flex-direction: column;
          }
        }

        @media (min-width: 640px) {
          .email-form {
            flex-direction: row;
          }
          
          .email-input {
            flex: 1;
          }
          
          .notify-btn {
            width: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}