import React from 'react';
import { render } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Component', () => {
  it('renders the main heading', () => {
    const { getByText } = render(<Home />);
    const mainHeading = getByText(/Welcome to Onagui/i);
    expect(mainHeading).toBeDefined();
  });
});