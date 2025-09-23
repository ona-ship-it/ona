// Import statements
import React from 'react';
// import { fireEvent } from '@testing-library/react'; // This import will be removed
import { render, screen } from '@testing-library/react';
import Home from '../../pages/Home';

// Your test cases here

test('renders Home page', () => {
    render(<Home />);
    const linkElement = screen.getByText(/home page/i);
    expect(linkElement).toBeInTheDocument();
});
