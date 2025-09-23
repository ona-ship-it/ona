// Mock declarations must come before imports
jest.mock('@/components/Navigation', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-navigation">Mock Navigation</div>
}));

jest.mock('@/components/OnaguiSymbol', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-onagui-symbol">Mock Symbol</div>
}));

// Regular imports
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders the home page with navigation', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    act(() => {
      root.render(<Home />);
    });
    
    expect(container.querySelector('[data-testid="mock-navigation"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="mock-onagui-symbol"]')).not.toBeNull();
    
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});

jest.mock('@/components/PageTitle', () => {
  return function MockPageTitle() {
    return <div data-testid="mock-page-title">ONAGUI</div>;
  };
});

describe('Home Page', () => {
  it('renders navigation component', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    
    act(() => {
      root.render(<Home />);
    });

    expect(container.querySelector('[data-testid="mock-navigation"]')).not.toBeNull();
    
    act(() => {
      root.unmount();
    });
  });
});