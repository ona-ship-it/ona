"use client";

import React from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export type CommissionTotals = {
  totalEarned: number;
  paidOut: number;
  pending: number;
};

export type CommissionHistoryItem = {
  id: string;
  title: string;
  amount: number;
  status: string;
};

type Props = {
  totals: CommissionTotals;
  history: CommissionHistoryItem[];
};

const CreatorCommissionDisplay = ({ totals, history }: Props) => {
  const formatAmount = (value: number) =>
    value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(2)}`;

  if (totals.totalEarned === 0 && history.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%)',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      borderRadius: '20px',
      padding: '28px',
      backdropFilter: 'blur(10px)',
    }}>
      <h3 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '20px',
        fontWeight: 700,
        color: '#fff',
        marginBottom: '20px',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <DollarSign size={20} color="#00ff88" />
        CREATOR COMMISSIONS
      </h3>

      {/* Totals row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'rgba(0, 255, 136, 0.08)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <TrendingUp size={14} color="#00ff88" />
            <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Earned</span>
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '28px', fontWeight: 700, color: '#00ff88' }}>
            {formatAmount(totals.totalEarned)}
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 255, 136, 0.04)',
          border: '1px solid rgba(0, 255, 136, 0.12)',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <CheckCircle size={14} color="#4ade80" />
            <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Paid Out</span>
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '28px', fontWeight: 700, color: '#4ade80' }}>
            {formatAmount(totals.paidOut)}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 136, 0, 0.05)',
          border: '1px solid rgba(255, 136, 0, 0.15)',
          borderRadius: '14px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <Clock size={14} color="#ff8800" />
            <span style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Pending</span>
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '28px', fontWeight: 700, color: '#ff8800' }}>
            {formatAmount(totals.pending)}
          </div>
        </div>
      </div>

      {/* History list */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '12px' }}>
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(15, 20, 25, 0.6)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 255, 136, 0.06)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.title}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: item.status === 'paid' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 136, 0, 0.1)',
                    color: item.status === 'paid' ? '#00ff88' : '#ff8800',
                    border: `1px solid ${item.status === 'paid' ? 'rgba(0,255,136,0.2)' : 'rgba(255,136,0,0.2)'}`,
                  }}>
                    {item.status}
                  </span>
                  <span style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#00ff88',
                    minWidth: '60px',
                    textAlign: 'right',
                  }}>
                    {formatAmount(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCommissionDisplay;
