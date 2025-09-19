import { render, screen, fireEvent } from '@testing-library/react'
import Giveaways from '@/app/giveaways/page'

describe('Giveaways Page', () => {
  it('should render the main heading', () => {
    render(<Giveaways />)
    
    expect(screen.getByText('Giveaways')).toBeInTheDocument()
  })

  it('should render giveaway cards', () => {
    render(<Giveaways />)
    
    // Check for giveaway entries
    expect(screen.getByText('$300 Weekend Special')).toBeInTheDocument()
    expect(screen.getByText('$750 Premium Raffle')).toBeInTheDocument()
  })

  it('should display prize amounts', () => {
    render(<Giveaways />)
    
    expect(screen.getByText('$300')).toBeInTheDocument()
    expect(screen.getByText('$750')).toBeInTheDocument()
  })

  it('should show entry counts', () => {
    render(<Giveaways />)
    
    // Look for entry count patterns
    const entryElements = screen.getAllByText(/\d+ entries/)
    expect(entryElements.length).toBeGreaterThan(0)
  })

  it('should display time remaining', () => {
    render(<Giveaways />)
    
    // Look for time patterns like "2d 5h"
    expect(screen.getByText('2d 5h')).toBeInTheDocument()
    expect(screen.getByText('1d 12h')).toBeInTheDocument()
  })

  it('should show host information', () => {
    render(<Giveaways />)
    
    const hostElements = screen.getAllByText('ONAGUI')
    expect(hostElements.length).toBeGreaterThan(0)
  })

  it('should render navigation arrows for carousels', () => {
    render(<Giveaways />)
    
    // Check for chevron icons (navigation arrows)
    const leftArrows = document.querySelectorAll('[data-testid*="chevron-left"], .ChevronLeftIcon')
    const rightArrows = document.querySelectorAll('[data-testid*="chevron-right"], .ChevronRightIcon')
    
    // Should have navigation elements
    expect(leftArrows.length + rightArrows.length).toBeGreaterThan(0)
  })

  it('should handle carousel navigation', () => {
    render(<Giveaways />)
    
    // The component should render without errors when interacting with navigation
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Test clicking a button doesn't crash
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
    }
  })
})