"use client";

import React from 'react';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export interface CommissionTotals {
  totalEarned: number;
  paidOut: number;
  pending: number;
}

export interface CommissionHistoryItem {
  id: string;
  title: string;
  amount: number;
  status: 'paid' | 'pending';
}

interface CreatorCommissionDisplayProps {
  totals: CommissionTotals;
  history: CommissionHistoryItem[];
}

const CreatorCommissionDisplay: React.FC<CreatorCommissionDisplayProps> = ({
  totals,
  history,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalEarned = totals.totalEarned;
  const paidOut = totals.paidOut;
  const pending = totals.pending;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 26, 32, 0.8) 0%, rgba(15, 20, 25, 0.9) 100%)',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <DollarSign size={20} color="#0f1419" />
        </div>
        <div>
          <h3 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
          }}>
            Creator Commissions
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#a0aec0',
            margin: '4px 0 0 0',
          }}>
            Earnings from your giveaways (10% commission)
          </p>
        </div>
      </div>

      {/* Commission Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '28px',
            fontWeight: '700',
            color: '#00ff88',
            marginBottom: '4px',
          }}>
            {formatCurrency(totalEarned)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0aec0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Total Earned
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 255, 170, 0.05)',
          border: '1px solid rgba(0, 255, 170, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '28px',
            fontWeight: '700',
            color: '#00ffaa',
            marginBottom: '4px',
          }}>
            {formatCurrency(paidOut)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0aec0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Paid Out
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 136, 0, 0.05)',
          border: '1px solid rgba(255, 136, 0, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '28px',
            fontWeight: '700',
            color: '#ff8800',
            marginBottom: '4px',
          }}>
            {formatCurrency(pending)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#a0aec0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Pending
          </div>
        </div>
      </div>

      {/* Commission History */}
      {history.length > 0 && (
        <div>
          <h4 style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <TrendingUp size={20} />
            Recent Commissions
          </h4>

          <div style={{
            display: 'grid',
            gap: '12px',
          }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 20, 25, 0.5)',
                  border: '1px solid rgba(0, 255, 136, 0.1)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '2px',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#a0aec0',
                  }}>
                    Commission earned
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: item.status === 'paid' ? '#00ff88' : '#ff8800',
                  }}>
                    +{formatCurrency(item.amount)}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: item.status === 'paid' ? '#00ff88' : '#ff8800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {item.status === 'paid' ? (
                      <>
                        <CheckCircle size={14} />
                        Paid
                      </>
                    ) : (
                      <>
                        <Clock size={14} />
                        Pending
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#718096',
        }}>
          <DollarSign size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
          }}>
            No commissions yet
          </div>
          <div style={{
            fontSize: '14px',
            color: '#a0aec0',
          }}>
            Create your first giveaway to start earning commissions
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCommissionDisplay;