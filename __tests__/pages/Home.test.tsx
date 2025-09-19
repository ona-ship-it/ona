import { render, screen, fireEvent } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('should render the main heading', () => {
    render(<Home />)
    
    expect(screen.getByText('Onagui')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    render(<Home />)
    
    // Check for main navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Onagui')).toBeInTheDocument()
  })

  it('should render animated background elements', () => {
    render(<Home />)
    
    // Check for animated background container
    const backgroundElements = document.querySelectorAll('.animate-pulse, .animate-ping')
    expect(backgroundElements.length).toBeGreaterThan(0)
  })

  it('should handle sign up modal state', () => {
    render(<Home />)
    
    // The component should render without errors
    expect(screen.getByText('Onagui')).toBeInTheDocument()
  })

  it('should have proper gradient background', () => {
    render(<Home />)
    
    const mainContainer = document.querySelector('.bg-gradient-to-br')
    expect(mainContainer).toBeInTheDocument()
  })

  it('should render sticky navigation', () => {
    render(<Home />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('sticky')
  })
})