import React from 'react';
import { render } from '@testing-library/react';
import Home from '../../pages/Home';

describe('Home Component', () => {
  it('renders the main heading', () => {
    const { getByText } = render(<Home />);
    const mainHeading = getByText(/expected main heading/i);
    expect(mainHeading).toBeInTheDocument();
  });
});