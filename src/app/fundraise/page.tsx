'use client'

import React, { useState } from 'react'

export default function FundraisePage() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'charity', label: 'Charity' },
    { id: 'medical', label: 'Medical' },
    { id: 'education', label: 'Education' },
  ]

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '1.5rem 1.25rem',
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
        }}>
          Fundraise
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          Support meaningful causes
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="container">
        <div style={{
          padding: '3rem 1rem',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          Fundraise campaigns coming soon...
        </div>
      </div>
    </>
  )
}
