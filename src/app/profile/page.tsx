'use client'

import React, { useState } from 'react'
import { Check, Twitter, Instagram, Music2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('giveaways')

  const sections = [
    { id: 'giveaways', label: 'Giveaways' },
    { id: 'raffles', label: 'Raffles' },
    { id: 'wins', label: 'Wins' },
    { id: 'created', label: 'Created' },
  ]

  const defaultImage = 'https://images.unsplash.com/photo-1696446702403-69e5f8ab97ec?w=800&h=500&fit=crop'

  return (
    <>
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-header">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
            alt="Profile" 
            className="avatar"
          />
          <div className="profile-info">
            <div className="profile-name">
              <h1>Tech King</h1>
              <div className="verified-badge">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>
            <p className="bio">
              Verified creator • 500+ giveaways • $2M+ distributed
            </p>
            
            {/* Social Links */}
            <div className="social-links">
              <a href="#" className="social-link">
                <Twitter size={16} />
                <span>Twitter</span>
              </a>
              <a href="#" className="social-link">
                <Instagram size={16} />
                <span>Instagram</span>
              </a>
              <a href="#" className="social-link">
                <Music2 size={16} />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">547</div>
            <div className="stat-label">Giveaways</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">1,243</div>
            <div className="stat-label">Winners</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">98%</div>
            <div className="stat-label">Score</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        {sections.map(section => (
          <button
            key={section.id}
            className={`tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="container">
        <div className="grid grid-cols-1 gap-6 p-4">
          {activeSection === 'giveaways' && (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              No giveaways yet
            </div>
          )}
          
          {activeSection === 'raffles' && (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              No raffles yet
            </div>
          )}
          
          {activeSection === 'wins' && (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              No wins yet
            </div>
          )}
          
          {activeSection === 'created' && (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              No created items yet
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-info {
          flex: 1;
        }
        
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </>
  )
}
