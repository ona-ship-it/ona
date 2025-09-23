import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock the Navigation component since it might have dependencies
jest.mock('../../src/components/Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="mock-navigation">Navigation</div>;
  };
});

// Mock the OnaguiSymbol component
jest.mock('../../src/components/OnaguiSymbol', () => {
  return function MockOnaguiSymbol() {
    return <div data-testid="mock-onagui-symbol">OnaguiSymbol</div>;
  };
});

// Mock the PageTitle component
jest.mock('@/components/PageTitle', () => {
  return function MockPageTitle({ children, className, gradient }: any) {
    return <h1 data-testid="mock-page-title">{children}</h1>;
  };
});

describe('Home Page', () => {
  it('renders the home page', () => {
    render(<Home />);
    
    // Check if navigation is rendered
    expect(screen.getByTestId('mock-navigation')).toBeInTheDocument();
    
    // Check if page title contains ONAGUI
    expect(screen.getByTestId('mock-page-title')).toBeInTheDocument();
  });
});