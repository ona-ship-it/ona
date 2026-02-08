'use client'

import React, { useState } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-layout">
      <Header 
        onMenuClick={() => setMenuOpen(!menuOpen)}
        menuOpen={menuOpen}
      />
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
