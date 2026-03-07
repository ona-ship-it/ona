/* ============================================================================
   ONAGUI — Raffle Card Styles
   Green accent (#067a0d) to distinguish from giveaway cards (cyan/blue)
   Import this in your layout.tsx or globals.css
   ============================================================================ */

/* === RAFFLE CARD CONTAINER === */
.raffle-card {
  background: linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%);
  border: 1px solid rgba(6, 122, 13, 0.15);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  cursor: pointer;
  text-decoration: none;
  display: block;
}

.raffle-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(6, 122, 13, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.raffle-card:hover::before { opacity: 1; }

.raffle-card:hover {
  transform: translateY(-8px);
  border-color: rgba(6, 122, 13, 0.5);
  box-shadow: 0 16px 48px rgba(6, 122, 13, 0.2);
}

/* === IMAGE SECTION === */
.raffle-card-image-wrapper {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.raffle-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.raffle-card:hover .raffle-card-image {
  transform: scale(1.08);
}

.raffle-card-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  transition: transform 0.5s ease;
}

.raffle-card:hover .raffle-card-image-placeholder {
  transform: scale(1.08);
}

.raffle-card-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 55%;
  background: linear-gradient(to top, rgba(15, 20, 25, 0.95) 0%, transparent 100%);
}

/* === RAFFLE BADGE === */
.raffle-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #067a0d 0%, #059669 100%);
  color: #fff;
  padding: 3px 10px;
  border-radius: 14px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.7px;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(6, 122, 13, 0.4);
}

/* === VERIFIED ICON === */
.raffle-verified {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(15, 20, 25, 0.8);
  border: 2px solid #067a0d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  backdrop-filter: blur(10px);
}

/* === TIME REMAINING BADGE === */
.raffle-time-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(15, 20, 25, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 8px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 3px;
  z-index: 2;
}

/* === PHOTO DOTS === */
.raffle-photo-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 3;
}

.raffle-photo-dot {
  height: 5px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.raffle-photo-dot.active {
  width: 12px;
  background: #fff;
}

.raffle-photo-dot.inactive {
  width: 5px;
  background: rgba(255, 255, 255, 0.4);
}

/* === CARD BODY === */
.raffle-card-body {
  padding: 12px 14px 14px;
}

/* === ACTIONS ROW (Like + Save) === */
.raffle-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 6px;
}

.raffle-actions-row button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #718096;
  transition: color 0.2s;
}

.raffle-actions-row button:hover {
  color: #22d3ee;
}

/* === CREATOR ROW === */
.raffle-creator-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-bottom: 4px;
}

.raffle-creator-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.raffle-creator-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(6, 122, 13, 0.4);
}

.raffle-creator-avatar-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #067a0d, #059669);
  border: 1.5px solid rgba(6, 122, 13, 0.4);
}

.raffle-subs-badge {
  font-size: 6px;
  font-weight: 700;
  color: #067a0d;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* === TITLE === */
.raffle-card-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #067a0d;
  line-height: 1.2;
  margin: 0;
}

/* === HOST === */
.raffle-host {
  font-size: 8px;
  color: #fff;
  margin-top: 1px;
}

.raffle-host-name {
  color: #fd8312;
  font-weight: 600;
}

/* === PRICE === */
.raffle-price {
  text-align: center;
  margin: 10px 0;
  font-family: 'Rajdhani', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #067a0d;
}

/* === PROGRESS BAR === */
.raffle-progress-wrapper {
  margin-bottom: 8px;
}

.raffle-progress-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
  font-size: 8px;
}

.raffle-progress-sold {
  color: #64748b;
}

.raffle-progress-pct {
  font-weight: 700;
}

.raffle-progress-pct.low { color: #067a0d; }
.raffle-progress-pct.mid { color: #fd8312; }
.raffle-progress-pct.high { color: #ef4444; }

.raffle-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.raffle-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.raffle-progress-fill.low {
  background: linear-gradient(90deg, #067a0d, #059669);
}

.raffle-progress-fill.mid {
  background: linear-gradient(90deg, #fd8312, #f59e0b);
}

.raffle-progress-fill.high {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* === ODDS === */
.raffle-odds {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 4px 8px;
  background: rgba(6, 122, 13, 0.06);
  border-radius: 6px;
}

.raffle-odds-label {
  font-size: 8px;
  color: #64748b;
}

.raffle-odds-value {
  font-size: 9px;
  font-weight: 700;
  color: #22d3ee;
}

/* === BUY BUTTON === */
.raffle-buy-btn {
  width: 100%;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #2be937 0%, #067a0d 100%);
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(6, 122, 13, 0.3);
}

.raffle-buy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(6, 122, 13, 0.5);
}

/* === NOTE === */
.raffle-note {
  font-size: 8px;
  color: #64748b;
  text-align: center;
  margin-top: 3px;
}
